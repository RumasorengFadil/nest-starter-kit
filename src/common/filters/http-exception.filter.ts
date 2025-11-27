import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * Catch all exceptions thrown in the application
   */
  catch(exception: unknown, host: ArgumentsHost) {
    // Get HTTP context (request & response)
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determine HTTP status code
    const status =
      exception instanceof HttpException
        ? exception.getStatus() // use status from HttpException
        : HttpStatus.INTERNAL_SERVER_ERROR; // default 500

    // Get error message
    const message =
      exception instanceof HttpException
        ? exception.getResponse() // use message from HttpException
        : (exception as any)?.message || 'Internal server error'; // default message

    // Build standard error response object
    const errorResponse = {
      timestamp: new Date().toISOString(), // current time
      path: request.url, // endpoint that caused error
      method: request.method, // HTTP method
      statusCode: status, // HTTP status code
      error: message, // error message
    };

    // Log error to console
    console.error('[ERROR LOG]', errorResponse);

    // Send JSON response to client
    response.status(status).json(errorResponse);
  }
}
