export const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  // Log error
  console.error(err)

  // Prisma validation error
  if (err.code === 'P2002') {
    const message = 'Duplicate field value entered'
    error = { message, statusCode: 400 }
  }

  // Prisma not found error
  if (err.code === 'P2025') {
    const message = 'Resource not found'
    error = { message, statusCode: 404 }
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token'
    error = { message, statusCode: 401 }
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired'
    error = { message, statusCode: 401 }
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  })
}
