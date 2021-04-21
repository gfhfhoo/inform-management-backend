import { HttpException } from "@nestjs/common";
import { HttpCode } from "../enum/httpCode.enum";

export class ResponseError extends HttpException {
  private readonly jsonErrMsg = null;

  constructor(errMsg?: string | object, statusCode?: HttpCode) {
    super(errMsg || "请求服务器错误", statusCode || HttpCode.ERROR);
    if (typeof errMsg == "object") this.jsonErrMsg = errMsg;
  }

  getJsonErrMsg() {
    return this.jsonErrMsg;
  }
}