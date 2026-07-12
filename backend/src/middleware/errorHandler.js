/**
 * ============================================================
 * AssetFlow — Global Error Handler Middleware
 * ============================================================
 * Catches unhandled errors and returns a consistent JSON envelope.
 * Mount this LAST in Express middleware chain.
 * ============================================================
 */

function errorHandler(err, req, res, _next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    data: null,
    error: statusCode === 500
      ? 'Internal server error'
      : err.message,
  });
}

module.exports = errorHandler;
