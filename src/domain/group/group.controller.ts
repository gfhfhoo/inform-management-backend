import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { GroupService } from "./group.service";
import { Group } from "./schema/group.schema";
import { group } from "../../decorator/group.decorator";
import { api } from "../../decorator/api.decorator";
import { stuId } from "src/decorator/session.decorator";

@Controller()
export class GroupController {
  constructor(private readonly groupService: GroupService) {
  }

  //TESTED
  @api({
    desc: "创建群组"
  })
  @Post("createGroup")
  async createGroup(@group() group: Group,
                    @stuId() stuId: number) {
    return await this.groupService.insert(group, stuId);
  }

  @api({
    desc: "获取我的群组"
  })
  @Get("getMyGroup")
  async getMyGroup(@stuId() stuId: number) {
    return await this.groupService.getMyGroups(stuId);
  }

  @api({
    desc: "获取群组信息"
  })
  @Get("getGroupDetail")
  async getGroupDetail(@Query("groupId") groupId: number) {
    return await this.groupService.getGroupDetail(groupId);
  }

  //TESTED
  @api({
    desc: "获取群组邀请码，在一段时间内，一个群的邀请码唯一"
  })
  @Get("getFriendCode")
  async getFriendCode(@Query("groupId") groupId: number) {
    return await this.groupService.generateFriendCode(groupId);
  }

  @api({
    desc: "通过邀请码进入群组"
  })
  @Get("enterGroupByCode")
  async enterGroupByCode(@Query("friendCode") code: string,
                         @stuId() stuId: number) {
    return await this.groupService.enterGroupByCode(code, stuId);
  }

  @api({
    desc: "邀请进群"
  })
  @Get("invite")
  async invite(@Body() body: object) {
    const friendStuId = body["friendStuId"];
    // to do
  }
}