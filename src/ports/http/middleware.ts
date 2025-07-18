import { Request, Response, NextFunction } from 'express';
import { Context } from '../../types';

// Extend Express Request to include context
declare global {
  namespace Express {
    interface Request {
      context: Context;
    }
  }
}

/**
 * Middleware to create and attach context to requests
 */
export function contextMiddleware(req: Request, res: Response, next: NextFunction): void {
  req.context = {
    userId: req.headers['x-user-id'] as string,
    sessionId: req.params.id || req.body.sessionId,
    timestamp: new Date()
  };
  next();
}

/**
 * Request logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
}

/**
 * Middleware for request validation
 */
export function validateRequest(requiredFields: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];
    
    for (const field of requiredFields) {
      if (!req.body[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }
    
    if (errors.length > 0) {
      res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
      return;
    }
    
    next();
  };
}

/**
 * Middleware for validating session ID parameter
 */
export function validateSessionId(req: Request, res: Response, next: NextFunction): void {
  const sessionId = req.params.id;
  
  if (!sessionId || typeof sessionId !== 'string' || sessionId.trim().length === 0) {
    res.status(400).json({
      error: 'Invalid session ID',
      details: 'Session ID must be a non-empty string'
    });
    return;
  }
  
  next();
}

/**
 * Error handling middleware
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  console.error('API Error:', err);
  
  // Handle specific error types
  if (err.message.includes('not found')) {
    res.status(404).json({
      error: 'Resource not found',
      message: err.message
    });
    return;
  }
  
  if (err.message.includes('Validation')) {
    res.status(400).json({
      error: 'Validation error',
      message: err.message
    });
    return;
  }
  
  // Default server error
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
}

/**
 * 404 handler
 */
export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`
  });
}