'use strict';

/**
 * Role-based Authorization Middleware — ContentKit AI Pro
 *
 * Verifies that the authenticated user holds one of the specified roles
 * within the target workspace.  Must be used AFTER the auth middleware
 * that populates `req.user`.
 *
 * Usage:
 *   const { requireRole } = require('./roleAuth');
 *   router.put('/:workspaceId/settings', requireRole('OWNER', 'ADMIN'), handler);
 */

const WorkspaceMember = require('../models/WorkspaceMember');

/**
 * Factory that returns Express middleware requiring the caller to hold
 * at least one of the listed workspace roles.
 *
 * @param  {...string} roles - Allowed role names (e.g. 'OWNER', 'ADMIN', 'MEMBER', 'VIEWER').
 * @returns {Function}  Express middleware
 */
const requireRole = (...roles) => {
  // Normalise to upper-case once at mount time for fast comparison.
  const allowed = new Set(roles.map((r) => r.toUpperCase()));

  return async (req, res, next) => {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.',
        });
      }

      const workspaceId =
        req.params.workspaceId || req.body.workspaceId;

      if (!workspaceId) {
        return res.status(400).json({
          success: false,
          message: 'Workspace ID is required for role authorization.',
        });
      }

      const membership = await WorkspaceMember.findOne({
        workspaceId,
        userId: req.user._id,
      }).lean();

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: 'You are not a member of this workspace.',
        });
      }

      // Compare case-insensitively so it works regardless of how roles
      // are stored in the database (lowercase, uppercase, mixed).
      const memberRole = (membership.role || '').toUpperCase();

      if (!allowed.has(memberRole)) {
        return res.status(403).json({
          success: false,
          message: `Insufficient permissions. Required role: ${[...allowed].join(' or ')}.`,
        });
      }

      // Attach membership to the request for downstream use.
      req.membership = membership;
      return next();
    } catch (err) {
      return next(err);
    }
  };
};

module.exports = { requireRole };
