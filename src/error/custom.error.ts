import { HttpException } from "@nestjs/common";
import { HttpCode } from "../enum/httpCode.enum";

export class ResponseError extends HttpException {
  private readonly jsonErrMsg = null;
  private readonly errMsg = null;
  private readonly statusCode = null;

  constructor(errMsg?: string | object, statusCode?: HttpCode) {
    super(errMsg || "请求服务器错误", statusCode || HttpCode.ERROR);
    if (typeof errMsg == "object") this.jsonErrMsg = errMsg;
    this.errMsg = errMsg || "请求服务器错误";
    this.statusCode = statusCode || HttpCode.ERROR;
  }

  getJsonErrMsg() {
    return this.jsonErrMsg;
  }

  getErrMsg() {
    return this.errMsg;
  }

  getStatusCode(){
    return this.statusCode;
  }
}