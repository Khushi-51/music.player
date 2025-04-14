/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({ error: true, message: messages.join(', ') });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      error: true,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} is already taken.`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: true, message: 'Invalid token. Please log in again.' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: true, message: 'Your session has expired. Please log in again.' });
  }

  // Default to 500 server error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Render error page for views
  if (req.accepts('html')) {
    return res.status(statusCode).render('error', {
      title: `Error ${statusCode}`,
      message,
      error: process.env.NODE_ENV === 'development' ? err : {}
    });
  }

  // Return JSON for API
  return res.status(statusCode).json({
    error: true,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = {
  errorHandler
};
