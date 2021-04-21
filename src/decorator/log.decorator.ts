import { CLogger } from "../logger/logger.service";
import { ResponseError } from "../error/custom.error";

export const logging = (): MethodDecorator => {
  return (target: any, key: any, descriptor: any) => {
    const func = descriptor.value;
    descriptor.value = (...args: any[]) => {
      // let isErr = false;
      const res = func.apply(target, args);
      // res.catch(err => {
      //   new CLogger()._err(err.toString(), key);
      //   isErr = true;
      // });
      // if (isErr) throw new ResponseError("sss");
    };
  };
};