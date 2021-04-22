import { ResponseError } from "../error/custom.error";
import { HttpCode } from "../enum/httpCode.enum";
import { CLogger } from "../logger/logger.service";
import { RuntimeException } from "@nestjs/core/errors/exceptions/runtime.exception";

interface LoggingOptions {
  isLogging?: boolean,
  errMsg?: any,
  statusCode?: HttpCode
}

const defaultOptions: LoggingOptions = {
  isLogging: true,
  errMsg: null,
  statusCode: null
};

export const logging = (options?: LoggingOptions): MethodDecorator => {
  options = { ...defaultOptions, ...options };
  return (target: any, propertyKey: any, descriptor: any) => {
    const func = descriptor.value;
    descriptor.value = async function(this: any, ...args: any[]) {
      let isErr = false;
      const res = func.apply(this, args);
      // 记录原生异常信息
      let nativeErrMsg = null;
      let nativeStatusCode = null;
      await res.catch((obj) => {
        isErr = true;
        if (obj instanceof ResponseError) {
          //　当错误抛出是我们的自定义类型时
          nativeErrMsg = obj.getErrMsg();
          nativeStatusCode = obj.getStatusCode();
        } else nativeErrMsg = obj.message; //  抛出是服务器内部错误
      });
      if (isErr) {
        // 抛出异常信息优先级：用户装饰器自定义--->手动抛出ResponseError--->系统全局Error
        if (options.errMsg) throw new ResponseError(options.errMsg, options.statusCode);
        else if (nativeErrMsg && nativeStatusCode) throw new ResponseError(nativeErrMsg, nativeStatusCode);
        else {
          new CLogger()._err(`Internal Error: ${nativeErrMsg}`, propertyKey);
          throw new RuntimeException();
        }
      } else return res;
    };
  };
};