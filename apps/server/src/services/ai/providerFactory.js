'use strict';

const openaiProvider = require('./providers/openaiProvider');
const claudeProvider = require('./providers/claudeProvider');
const geminiProvider = require('./providers/geminiProvider');
const groqProvider = require('./providers/groqProvider');
const openrouterProvider = require('./providers/openrouterProvider');

const providers = [
  openaiProvider,
  claudeProvider,
  geminiProvider,
  groqProvider,
  openrouterProvider,
];

const providerMap = new Map(providers.map((p) => [p.name, p]));

/**
 * Returns a provider by its registered name string.
 * @param {string} name – e.g. 'openai', 'claude', 'gemini', 'groq', 'openrouter'
 * @returns {object|null}
 */
function getProvider(name) {
  return providerMap.get(name) || null;
}

/**
 * Returns all providers whose API key env var is currently set.
 */
function getAvailableProviders() {
  return providers.filter((p) => p.isAvailable());
}

module.exports = { getProvider, getAvailableProviders };
