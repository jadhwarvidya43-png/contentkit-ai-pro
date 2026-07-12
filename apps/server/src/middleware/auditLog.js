const AuditLog = require('../models/AuditLog');

/**
 * Middleware to capture an audit log for mutating actions (POST, PUT, DELETE).
 * Must be placed after authentication and role verification middleware.
 */
const auditLogger = (actionDescription) => {
  return async (req, res, next) => {
    // Capture the original send to intercept successful completion
    const originalSend = res.send;

    res.send = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Record only on successful mutations
        setImmediate(async () => {
          try {
            await AuditLog.create({
              workspaceId: req.params.workspaceId || req.body.workspaceId,
              userId: req.user._id,
              action: actionDescription || `${req.method} ${req.originalUrl}`,
              ipAddress: req.ip,
              userAgent: req.headers['user-agent'],
              details: {
                params: req.params,
                query: req.query,
                method: req.method
              }
            });
          } catch (err) {
            console.error('[Audit Logger] Failed to record log:', err);
          }
        });
      }
      return originalSend.apply(res, arguments);
    };

    next();
  };
};

module.exports = { auditLogger };
