import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import * as crypto from "crypto-js";
import { ResponseError } from "../error/custom.error";
import { HttpCode } from "../enum/httpCode.enum";

// 这里的所有装饰器配合UserGuard使用
function getSession(ctx: ExecutionContext) {
  const req = ctx.switchToHttp().getRequest();
  const session = req.headers["session"] as string;
  if (session == null || session == "") throw new ResponseError("没有Session会话！", HttpCode.NO_SESSION);
  else return session;
}

export const session = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    return getSession(ctx);
  }
);

export const stuId = createParamDecorator(
  (data: number, ctx: ExecutionContext) => {
    const session = getSession(ctx);
    const payload = session.split(".")[1];
    const obj = JSON.parse(crypto.enc.Base64.parse(payload).toString(crypto.enc.Utf8));
    if (obj == null) throw new ResponseError("Session信息解析不全！", HttpCode.REQUEST_REFUSED);
    return obj["stuId"];
  }
);