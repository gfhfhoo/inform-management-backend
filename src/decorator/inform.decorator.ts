import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Inform } from "../domain/inform/schema/inform.schema";

export const inform = createParamDecorator(
  (data: Inform, ctx: ExecutionContext) => {
    const obj = ctx.switchToHttp().getRequest().body;
    return new Inform(obj);
  }
);