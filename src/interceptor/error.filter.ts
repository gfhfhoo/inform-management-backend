import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { HttpCode } from "../enum/httpCode.enum";
import { ResponseError } from "../error/custom.error";

interface ErrorResponse {
  code: HttpCode,
  description: string,
  errMsg: string | object
}

@Catch()
export class ErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const errCode = exception.getStatus();
    console.log(exception.message);
    const errMessage = () => {
      if (exception instanceof ResponseError) {
        const jsonErrMsg = exception.getJsonErrMsg();
        if (jsonErrMsg) return jsonErrMsg;
        else return exception.message;
      } else return "请求方法错误或内部服务器错误";
    };

    const data: ErrorResponse = {
      code: errCode,
      description: HttpCode[errCode],
      errMsg: errMessage()
    };
    response
      .status(exception instanceof ResponseError ? HttpStatus.BAD_REQUEST : HttpStatus.INTERNAL_SERVER_ERROR)
      .json(data);
  }
}