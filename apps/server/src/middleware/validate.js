'use strict';

/**
 * Request Validation Middleware — ContentKit AI Pro
 *
 * Generic schema-driven validation that works with any validation
 * approach (Joi, Zod, hand-rolled).  The schema object contains
 * optional `body`, `params`, and `query` keys — each a function
 * returning `{ valid: boolean, errors: string[] }`.
 *
 * Usage:
 *   const { validate } = require('./validate');
 *
 *   const createProjectSchema = {
 *     body: (data) => {
 *       const errors = [];
 *       if (!data.title) errors.push('title is required');
 *       return { valid: errors.length === 0, errors };
 *     },
 *   };
 *
 *   router.post('/', validate(createProjectSchema), createProject);
 */

/**
 * Factory that returns Express middleware validating the incoming request
 * against the provided schema.
 *
 * @param {Object}   schema          - Validation schema.
 * @param {Function} [schema.body]   - Validator for req.body.
 * @param {Function} [schema.params] - Validator for req.params.
 * @param {Function} [schema.query]  - Validator for req.query.
 * @returns {Function} Express middleware
 */
const validate = (schema) => {
  if (!schema || typeof schema !== 'object') {
    throw new TypeError('validate() requires a schema object');
  }

  return (req, res, next) => {
    const allErrors = [];

    const segments = ['body', 'params', 'query'];

    for (const segment of segments) {
      const validator = schema[segment];
      if (typeof validator !== 'function') continue;

      const result = validator(req[segment] || {});

      if (!result || typeof result.valid === 'undefined') {
        // Treat a malformed validator result as a server error rather
        // than silently passing — fail loud in development.
        return res.status(500).json({
          success: false,
          message: `Validation function for "${segment}" returned an invalid result.`,
        });
      }

      if (!result.valid && Array.isArray(result.errors)) {
        allErrors.push(
          ...result.errors.map((msg) => ({
            segment,
            message: msg,
          }))
        );
      }
    }

    if (allErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: allErrors,
      });
    }

    return next();
  };
};

module.exports = { validate };
