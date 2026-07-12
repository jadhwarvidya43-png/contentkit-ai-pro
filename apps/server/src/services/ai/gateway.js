'use strict';

const { compilePrompt } = require('./promptCompiler');
const { estimateTokensForMessages } = require('./tokenCounter');
const { selectProvider } = require('./router');
const { getAvailableProviders } = require('./providerFactory');
const { executeWithFallback } = require('./fallbackManager');
const { validateResponse } = require('./responseValidator');
const { calculateCost } = require('./costCalculator');
const { createSSEStream, pipeProviderStream } = require('./streamManager');
const { AICache, generateCacheKey } = require('./cache');

const cache = new AICache();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Main orchestrator for campaign generation through the AI gateway.
 *
 * @param {object} params
 * @param {string} params.sourceText – raw content to repurpose
 * @param {object} [params.brandKit] – brand context
 * @param {string} [params.model] – preferred model name
 * @param {string} [params.targetLanguage] – output language
 * @param {boolean} [params.stream] – if true, stream via SSE
 * @param {import('express').Response} [params.res] – Express response (required when stream=true)
 * @returns {Promise<object>}
 */
async function generateCampaign({ sourceText, brandKit, model, targetLanguage = 'English', stream = false, res }) {
  // 1. Compile prompt
  const { systemMessage, userMessage } = compilePrompt({
    sourceText,
    brandKit,
    targetLanguage,
  });

  const messages = [
    { role: 'system', content: systemMessage },
    { role: 'user', content: userMessage },
  ];

  // 2. Check cache (non-streaming only)
  const cacheKey = generateCacheKey(userMessage, model || 'auto');
  if (!stream) {
    const cached = cache.get(cacheKey);
    if (cached) {
      return { ...cached, metadata: { ...cached.metadata, cached: true } };
    }
  }

  // 3. Estimate input tokens
  const estimatedInputTokens = estimateTokensForMessages(messages);

  // 4. Select provider
  const selection = selectProvider(model);

  // If NO providers are available, fall back to the legacy local generator
  if (!selection) {
    console.warn('No AI providers available. Falling back to legacy aiService.');
    const legacyService = require('../aiService');
    const legacyResult = await legacyService.generateCampaign(sourceText, brandKit, model || 'local-fallback', targetLanguage);
    return {
      content: legacyResult,
      metadata: {
        model: 'local-fallback',
        provider: 'legacy',
        tokens: { input: estimatedInputTokens, output: 0, total: estimatedInputTokens },
        cost: { inputCost: 0, outputCost: 0, totalCost: 0, currency: 'USD' },
        cached: false,
      },
    };
  }

  const chosenProvider = selection.provider;
  const chosenModel = selection.model || model;

  // 5. Streaming path
  if (stream && res) {
    const sseStream = createSSEStream(res);
    try {
      const providerStream = chosenProvider.generateStream(messages, { model: chosenModel });
      const { fullContent, usage } = await pipeProviderStream(providerStream, sseStream);
      const tokens = usage || { inputTokens: estimatedInputTokens, outputTokens: 0, totalTokens: estimatedInputTokens };
      const cost = calculateCost(chosenProvider.name, chosenModel, tokens.inputTokens, tokens.outputTokens);
      return { content: fullContent, metadata: { model: chosenModel, provider: chosenProvider.name, tokens, cost, cached: false } };
    } catch (err) {
      // SSE error already sent by pipeProviderStream
      throw err;
    }
  }

  // 6. Non-streaming: use fallback manager
  const availableProviders = getAvailableProviders();
  // Put chosen provider first, then append others in their original order
  const orderedProviders = [
    chosenProvider,
    ...availableProviders.filter((p) => p.name !== chosenProvider.name),
  ];

  const result = await executeWithFallback(orderedProviders, async (provider) => {
    return provider.generate(messages, { model: chosenModel });
  }, 3);

  // 7. Validate
  const validation = validateResponse(result.content, ['analysis', 'twitter', 'linkedin', 'blog']);
  const content = validation.valid ? validation.data : result.content;

  // 8. Calculate cost
  const tokens = result.usage || { inputTokens: estimatedInputTokens, outputTokens: 0, totalTokens: estimatedInputTokens };
  const cost = calculateCost(chosenProvider.name, chosenModel, tokens.inputTokens, tokens.outputTokens);

  const output = {
    content,
    metadata: {
      model: chosenModel,
      provider: chosenProvider.name,
      tokens,
      cost,
      cached: false,
    },
  };

  // 9. Cache result
  cache.set(cacheKey, output, CACHE_TTL_MS);

  // 10. Return
  return output;
}

module.exports = { generateCampaign };
