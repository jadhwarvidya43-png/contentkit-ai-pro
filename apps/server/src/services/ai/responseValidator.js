'use strict';

/**
 * Validates a JSON string response from an AI provider.
 * Attempts to parse it, strips markdown code fences if present,
 * and verifies that all requiredKeys exist at the root level.
 */
function validateResponse(jsonString, requiredKeys = []) {
  const errors = [];

  if (!jsonString || typeof jsonString !== 'string') {
    return { valid: false, data: null, errors: ['Response is empty or not a string'] };
  }

  let cleaned = jsonString.trim();

  // Strip markdown code fences that some models wrap JSON in
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  let data;
  try {
    data = JSON.parse(cleaned);
  } catch (err) {
    return { valid: false, data: null, errors: [`JSON parse error: ${err.message}`] };
  }

  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { valid: false, data: null, errors: ['Parsed result is not a JSON object'] };
  }

  for (const key of requiredKeys) {
    if (!(key in data)) {
      errors.push(`Missing required key: "${key}"`);
    }
  }

  return {
    valid: errors.length === 0,
    data,
    errors,
  };
}

module.exports = { validateResponse };
