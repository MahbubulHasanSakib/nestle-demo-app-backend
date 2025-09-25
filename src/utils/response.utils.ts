export class ResponseUtils {

    static buildData(
        data: any
    ): any {
        return {
            data
        }
    }

    static buildDeletedData(
        data: any,
        statusCode?: Number,
        message?: String
    ): any {
        return {
            message: message,
            statusCode: statusCode,
            deleted: data
        };
    };

    static successResponseHandler(statusCode: number, message: string, keyOfData?: (string | null), data?: any): any {
        let responseResult: {
            status: String;
            statusCode: Number;
            message: String;
            [key: string]: any;
        } = {
            message: message,
            status: "success",
            statusCode: statusCode
        };

        if (keyOfData && data) responseResult[keyOfData] = data;
        if (!keyOfData && data) responseResult = {...responseResult, ...data};

        return responseResult;
    };

    static errorResponseHandler(statusCode: number, message: string, keyOfData?: (string | null), data?: any): any {
        let responseResult: {
            status: String;
            statusCode: Number;
            message: String;
            [key: string]: any;
        } = {
            message: message,
            status: "failed",
            statusCode: statusCode
        };

        if (keyOfData && data) responseResult[keyOfData] = data;
        if (!keyOfData && data) responseResult = {...responseResult, ...data};

        return responseResult;
    };
}

import { HttpException, HttpStatus } from '@nestjs/common';

export class EmailAlreadyExistsException extends HttpException {
  constructor() {
    super('Email Already Exists', HttpStatus.BAD_REQUEST);
  }
}
