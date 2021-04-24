import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Inform } from "../domain/inform/schema/inform.schema";
import { GroupElement } from "../domain/group/schema/group.schema";

export const inform = createParamDecorator(
  (data: Inform, ctx: ExecutionContext) => {
    const obj = ctx.switchToHttp().getRequest().body;
    console.log(obj);
    const groupIds: number[] = obj["relatedGroup"];
    console.log(groupIds);
    let relatedGroup: GroupElement[] = [];
    for (let groupId of groupIds) {
      relatedGroup.push({
        groupId: groupId,
        name: ""
      });
    }
    obj["relatedGroup"] = relatedGroup;
    return new Inform(obj);
  }
);