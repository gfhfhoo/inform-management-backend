import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Users } from "../domain/user/user.entity";

export const user = createParamDecorator(
  (data: Users, ctx: ExecutionContext) => {
    const obj = ctx.switchToHttp().getRequest().body;
    return new Users(obj);
  }
);