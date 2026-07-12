'use strict';

/**
 * Cost table: input and output costs in USD per 1 million tokens.
 * Keyed by provider name → model name → { input, output }.
 * A '_default' key per provider handles unlisted models.
 */
const COST_TABLE = {
  openai: {
    'gpt-4o':        { input: 2.50,   output: 10.00 },
    'gpt-4o-mini':   { input: 0.15,   output: 0.60 },
    'gpt-4-turbo':   { input: 10.00,  output: 30.00 },
    'gpt-3.5-turbo': { input: 0.50,   output: 1.50 },
    'o1':            { input: 15.00,  output: 60.00 },
    'o1-mini':       { input: 3.00,   output: 12.00 },
    'o3-mini':       { input: 1.10,   output: 4.40 },
    _default:        { input: 2.50,   output: 10.00 },
  },
  claude: {
    'claude-sonnet-4-20250514':  { input: 3.00,  output: 15.00 },
    'claude-3-5-sonnet-20241022': { input: 3.00,  output: 15.00 },
    'claude-3-5-haiku-20241022':  { input: 0.80,  output: 4.00 },
    'claude-3-opus-20240229':     { input: 15.00, output: 75.00 },
    _default:                     { input: 3.00,  output: 15.00 },
  },
  gemini: {
    'gemini-2.5-flash':  { input: 0.15,  output: 0.60 },
    'gemini-2.5-pro':    { input: 1.25,  output: 10.00 },
    'gemini-2.0-flash':  { input: 0.10,  output: 0.40 },
    'gemini-1.5-pro':    { input: 1.25,  output: 5.00 },
    'gemini-1.5-flash':  { input: 0.075, output: 0.30 },
    _default:            { input: 0.15,  output: 0.60 },
  },
  groq: {
    'llama-3.1-70b-versatile': { input: 0.59,  output: 0.79 },
    'llama-3.1-8b-instant':    { input: 0.05,  output: 0.08 },
    'mixtral-8x7b-32768':      { input: 0.24,  output: 0.24 },
    'gemma2-9b-it':            { input: 0.20,  output: 0.20 },
    _default:                  { input: 0.59,  output: 0.79 },
  },
  openrouter: {
    _default: { input: 2.50, output: 10.00 },
  },
};

/**
 * Calculates the cost for a generation call.
 *
 * @param {string} providerName – e.g. 'openai', 'claude'
 * @param {string} model – the specific model name used
 * @param {number} inputTokens – prompt/input token count
 * @param {number} outputTokens – completion/output token count
 * @returns {{ inputCost: number, outputCost: number, totalCost: number, currency: string }}
 */
function calculateCost(providerName, model, inputTokens, outputTokens) {
  const providerCosts = COST_TABLE[providerName] || COST_TABLE.openrouter;
  const modelCosts = providerCosts[model] || providerCosts._default;

  const inputCost = (inputTokens / 1_000_000) * modelCosts.input;
  const outputCost = (outputTokens / 1_000_000) * modelCosts.output;

  return {
    inputCost: parseFloat(inputCost.toFixed(6)),
    outputCost: parseFloat(outputCost.toFixed(6)),
    totalCost: parseFloat((inputCost + outputCost).toFixed(6)),
    currency: 'USD',
  };
}

module.exports = { calculateCost, COST_TABLE };
