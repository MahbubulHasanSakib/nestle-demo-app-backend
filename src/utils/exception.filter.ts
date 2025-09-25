import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
export interface IFormatExceptionMessage {
	message: string;
	code_error?: number;
}

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
	private logger: Logger;

	catch(exception: any, host: ArgumentsHost) {
			this.logger = new Logger("AllExceptionFilter");
			this.allError(exception, host);
	}

	private allError(exception: any, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();
		const request = ctx.getRequest();

		const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
		const message =
			exception instanceof HttpException
				? (exception.getResponse() as IFormatExceptionMessage)
				: { message: (exception as Error).message, code_error: null };

		const responseData = {
			...{
				statusCode: status,
				timestamp: new Date().toISOString(),
				path: request.routerPath,
			},
			message: exception instanceof HttpException && message,
		};

		response.status(status).send(responseData);
	}

}