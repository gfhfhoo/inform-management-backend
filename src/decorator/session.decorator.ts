import { BadRequestException, createParamDecorator, ExecutionContext } from "@nestjs/common";
import * as crypto from "crypto-js";

export const session = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const session = req.headers["session"] as string;
    if (session == null || session == "") throw new BadRequestException("没有Session会话！");
    else return session;
  }
);

export const stuId = createParamDecorator(
  (data: number, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const session = req.headers["session"] as string;
    if (session == null || session == "") throw new BadRequestException("没有Session会话！");
    const payload = session.split(".")[1];
    const obj = crypto.enc.Base64.parse(payload).toString(crypto.enc.Utf8);
    if (obj == null) throw new BadRequestException("Session信息解析不全！");
    return obj["stuId"];
  }
);