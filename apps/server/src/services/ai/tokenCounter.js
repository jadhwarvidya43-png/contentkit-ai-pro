'use strict';

const TOKENS_PER_WORD = 0.75;
const OVERHEAD_PER_MESSAGE = 4;

/**
 * Estimates token count for a string using a whitespace/punctuation heuristic.
 * English text averages ~0.75 tokens per word (GPT-family tokenizers).
 * Punctuation attached to words inflates count slightly via the split.
 */
function estimateTokens(text) {
  if (!text || typeof text !== 'string') return 0;
  const words = text.split(/[\s]+/).filter(Boolean);
  return Math.ceil(words.length / TOKENS_PER_WORD);
}

/**
 * Estimates total tokens for a chat-format messages array.
 * Adds a fixed overhead per message to account for role tags,
 * separators, and other framing tokens the model sees.
 */
function estimateTokensForMessages(messages) {
  if (!Array.isArray(messages)) return 0;
  let total = 0;
  for (const msg of messages) {
    total += OVERHEAD_PER_MESSAGE;
    total += estimateTokens(msg.content || '');
    if (msg.name) total += estimateTokens(msg.name);
  }
  total += 2; // assistant reply priming
  return total;
}

module.exports = { estimateTokens, estimateTokensForMessages };
