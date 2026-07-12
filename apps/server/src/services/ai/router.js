'use strict';

const { getProvider, getAvailableProviders } = require('./providerFactory');

/**
 * Maps model name substrings to provider names.
 * Order matters – first match wins, so more specific patterns come first.
 */
const MODEL_TO_PROVIDER = [
  { pattern: 'gpt-',          provider: 'openai' },
  { pattern: 'o1',            provider: 'openai' },
  { pattern: 'o3',            provider: 'openai' },
  { pattern: 'o4',            provider: 'openai' },
  { pattern: 'claude',        provider: 'claude' },
  { pattern: 'gemini',        provider: 'gemini' },
  { pattern: 'llama',         provider: 'groq' },
  { pattern: 'mixtral',       provider: 'groq' },
  { pattern: 'groq',          provider: 'groq' },
  { pattern: 'openrouter',    provider: 'openrouter' },
];

/** Ordered fallback preference when no specific model is requested or matched. */
const FALLBACK_ORDER = ['gemini', 'openai', 'claude', 'groq', 'openrouter'];

/**
 * Selects the best available provider for the given model name.
 *
 * 1. If preferredModel matches a known pattern, try that provider.
 * 2. If that provider is unavailable, walk the fallback list.
 * 3. Returns null only when zero providers have API keys set.
 *
 * @param {string} [preferredModel] – model name like 'gpt-4o', 'claude-3.5-sonnet', etc.
 * @returns {{ provider: object, model: string }|null}
 */
function selectProvider(preferredModel) {
  const modelLower = (preferredModel || '').toLowerCase();

  // Try pattern-matched provider first
  for (const entry of MODEL_TO_PROVIDER) {
    if (modelLower.includes(entry.pattern)) {
      const matched = getProvider(entry.provider);
      if (matched && matched.isAvailable()) {
        return { provider: matched, model: preferredModel };
      }
      break; // matched pattern but provider unavailable – fall through
    }
  }

  // Fallback: walk preferred order
  for (const name of FALLBACK_ORDER) {
    const p = getProvider(name);
    if (p && p.isAvailable()) {
      return { provider: p, model: preferredModel || null };
    }
  }

  return null;
}

module.exports = { selectProvider };
