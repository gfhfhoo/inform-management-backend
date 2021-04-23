import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { HttpCode } from "../enum/httpCode.enum";
import { ResponseError } from "../error/custom.error";
import { CLogger } from "../logger/logger.service";

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
    let errCode = null;
    try {
      errCode = exception.getStatus();
    } catch (e) {
      // 当发现是服务器内部错误时
      errCode = HttpCode.ERROR;
    }
    const errMessage = () => {
      if (exception instanceof ResponseError) {
        const jsonErrMsg = exception.getJsonErrMsg();
        if (jsonErrMsg) return jsonErrMsg;
        else return exception.message;
      } else {
        errCode = HttpCode.ERROR;
        return "请求错误或内部服务器错误";
      }
    };

    const data: ErrorResponse = {
      code: errCode,
      description: HttpCode[errCode],
      errMsg: errMessage()
    };
    response
      .status(HttpStatus.OK)
      .json(data);
  }
}