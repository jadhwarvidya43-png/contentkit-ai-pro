'use strict';

const BASE_DELAY_MS = 1000;

/**
 * Sleeps for the given duration.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Executes an async function with provider-level fallback and per-provider exponential backoff retries.
 *
 * For each provider in providerList:
 *   1. Call executeFn(provider).
 *   2. On failure, retry up to maxRetries times with exponential backoff (1s, 2s, 4s, …).
 *   3. If all retries are exhausted, move to the next provider.
 *
 * @param {object[]} providerList – ordered array of provider objects
 * @param {function} executeFn – async (provider) => result
 * @param {number} [maxRetries=3] – retries per provider
 * @returns {Promise<any>} – the first successful result
 * @throws {Error} – if every provider exhausts all retries
 */
async function executeWithFallback(providerList, executeFn, maxRetries = 3) {
  if (!providerList || providerList.length === 0) {
    throw new Error('No providers available for fallback execution');
  }

  const allErrors = [];

  for (const provider of providerList) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await executeFn(provider);
        return result;
      } catch (err) {
        const tag = `[${provider.name} attempt ${attempt + 1}/${maxRetries + 1}]`;
        console.warn(`${tag} ${err.message}`);
        allErrors.push({ provider: provider.name, attempt: attempt + 1, error: err.message });

        if (attempt < maxRetries) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          await sleep(delay);
        }
      }
    }
    console.warn(`All retries exhausted for provider "${provider.name}", moving to next.`);
  }

  const summary = allErrors
    .map((e) => `${e.provider}#${e.attempt}: ${e.error}`)
    .join('; ');
  throw new Error(`All providers failed. Errors: ${summary}`);
}

module.exports = { executeWithFallback };
