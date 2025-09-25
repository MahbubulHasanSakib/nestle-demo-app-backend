import {
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

export const globalValidationPipe = new ValidationPipe({
  transform: true,
  whitelist: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
  stopAtFirstError: true,
  exceptionFactory: (errors: ValidationError[]) => {
    const message = {};
    const logError = (obj: ValidationError) => {
      if (obj.children.length > 0) {
        obj.children.map((ob) => {
          logError(ob);
        });
      } else {
        if (obj.constraints) {
          message[obj.property] =
            obj?.constraints[Object.keys(obj?.constraints)[0]];
        }
      }
    };

    errors.forEach((obj) => {
      if (obj.constraints) {
        message[obj.property] =
          obj?.constraints[Object.keys(obj?.constraints)[0]];
      }
      if (obj.children.length > 0) {
        logError(obj);
      }
    });

    throw new UnprocessableEntityException({
      message,
      statusCode: 422,
    });
  },
});
