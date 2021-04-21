import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Group } from "../domain/group/schema/group.schema";

export const group = createParamDecorator(
  (data: Group, ctx: ExecutionContext) => {
    const obj = ctx.switchToHttp().getRequest().body;
    return new Group(obj);
  }
);