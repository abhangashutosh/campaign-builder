import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { Request, Response } from 'express'
import { randomUUID } from 'crypto'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR

    const message = exception instanceof HttpException
      ? exception.message
      : 'Internal server error'

    const code = exception instanceof HttpException
      ? exception.name.replace('Exception', '').toUpperCase()
      : 'INTERNAL_SERVER_ERROR'

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        statusCode: status,
      },
      meta: {
        requestId: randomUUID(),
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    })
  }
}
