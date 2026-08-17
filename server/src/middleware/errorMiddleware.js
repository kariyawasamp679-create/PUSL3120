export function notFound(req, res, next) {
  const error = new Error(`Resource Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
}

export function errorHandler(error, req, res, next) {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = error.message || 'Internal Server Error';

  // Handle Mongoose Bad ObjectId (CastError)
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    statusCode = 404;
    message = `Resource not found with ID of ${error.value}`;
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if (error.code === 11000) {
    statusCode = 400;
    const field = Object.keys(error.keyValue || {})[0] || 'field';
    message = `Duplicate value entered for '${field}'. Please use another value.`;
  }

  // Handle Mongoose Validation Error
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors).map(val => val.message).join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : error.stack
  });
}

