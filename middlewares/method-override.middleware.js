/**
 * Method Override Middleware
 * Supports PUT and DELETE methods for browsers that don't support them
 * Example: <form method="POST" action="/resource?_method=DELETE">
 */
/**
 * Method Override Middleware
 * Supports PUT and DELETE methods for browsers that don't support them
 */
const methodOverride = (req, res, next) => {
  // Check if method is specified in query parameter
  if (req.query._method) {
    req.method = req.query._method.toUpperCase();
  }
  
  // Also check for _method in the request body (as a fallback)
  if (req.body && req.body._method) {
    req.method = req.body._method.toUpperCase();
  }
  
  next();
};

module.exports = methodOverride;