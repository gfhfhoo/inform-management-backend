import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Inform } from "../domain/inform/schema/inform.schema";
import { GroupElement } from "../domain/group/schema/group.schema";

export const inform = createParamDecorator(
  (data: Inform, ctx: ExecutionContext) => {
    const obj = ctx.switchToHttp().getRequest().body;
    const groupIds: number[] = obj["relatedGroupId"];
    let relatedGroup: GroupElement[] = [];
    for (let groupId of groupIds) {
      relatedGroup.push({
        groupId: groupId,
        groupName: ""
      });
    }
    obj["relatedGroup"] = relatedGroup;
    return new Inform(obj);
  }
);