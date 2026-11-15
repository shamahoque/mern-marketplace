import mongoose from 'mongoose'
import dbErrorHandler from './dbErrorHandler'

// An expected failure with a status the client should see, e.g. new HttpError(404, 'Shop not found').
export class HttpError extends Error {
  constructor (status, message) {
    super(message)
    this.status = status
  }
}

// Wraps an async handler/middleware/param callback so a rejected promise goes to errorMiddleware
// instead of being repeated as try/catch in every handler (D-02).
// `fallback` replaces any unexpected (non-HttpError) error, for handlers that hide DB details
// behind a fixed message, e.g. asyncHandler(fn, new HttpError(400, 'Could not retrieve user')).
export const asyncHandler = (fn, fallback) => (req, res, next, ...args) =>
  Promise.resolve(fn(req, res, next, ...args))
    .catch(err => next(err instanceof HttpError || !fallback ? err : fallback))

// Single place that turns errors into responses. Every error body is { error: string } (D-07).
export const errorMiddleware = (err, req, res, next) => {
  if (res.headersSent) return next(err)
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message })
  }
  if (err.name === 'UnauthorizedError') { // express-jwt
    return res.status(401).json({ error: err.name + ': ' + err.message })
  }
  if (err instanceof mongoose.Error || err.name === 'MongoError') {
    return res.status(400).json({ error: dbErrorHandler.getErrorMessage(err) })
  }
  console.log(err)
  res.status(400).json({ error: err.name + ': ' + err.message })
}
