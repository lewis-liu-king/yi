import { Request, Response, NextFunction } from 'express';

interface ErrorResponse {
  message: string;
  statusCode: number;
  stack?: string;
}

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const errorResponse: ErrorResponse = {
    message: err.message || 'Internal Server Error',
    statusCode: err.statusCode || 500,
  };

  // Only include stack in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(errorResponse.statusCode).json(errorResponse);
};

export default errorHandler;