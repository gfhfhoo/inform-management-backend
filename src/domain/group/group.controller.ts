import { Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { GroupService } from "./group.service";
import { Group } from "./schema/group.schema";
import { group } from "../../decorator/group.decorator";
import { api } from "../../decorator/api.decorator";
import { stuId } from "src/decorator/session.decorator";
import { JwtAuthGuard } from "../../authorization/jwt-auth.guard";
import { UserService } from "../user/user.service";


@Controller()
export class GroupController {
  constructor(private readonly groupService: GroupService,
              private readonly userService: UserService) {
  }

  @api({
    desc: "进行返回前的包装",
    checked: true
  })
  private async wrap(source: any) {
    if (source.length == 0) return source;
    let rt1: any[] = [];
    let rt2: any[] = [];
    source.map(d => {
      rt1.push(this.userService.standardizeStuId(d._doc.members));
      rt2.push(this.userService.standardizeStuId(d._doc.admins));
    });
    rt1 = await Promise.all(rt1);
    rt2 = await Promise.all(rt2);
    source = source.map((d, i) => ({
      ...d._doc,
      createTime: this.groupService.standardizeTime(d._doc.createTime),
      members: rt1[i],
      admins: rt2[i]
    }));
    return source;
  }

  //TESTED
  @api({
    desc: "创建群组",
    checked: true
  })
  @UseGuards(JwtAuthGuard)
  @Post("createGroup")
  async createGroup(@group() group: Group,
                    @stuId() stuId: number) {
    await this.groupService.insert(group, stuId);
  }

  @api({
    desc: "获取我的群组"
  })
  @UseGuards(JwtAuthGuard)
  @Get("getMyGroup")
  async getMyGroup(@stuId() stuId: number) {
    const res = await this.groupService.getMyGroups(stuId);
    return this.wrap(res);
  }

  @api({
    desc: "获取群组信息"
  })
  @UseGuards(JwtAuthGuard)
  @Get("getGroupDetail")
  async getGroupDetail(@Query("groupId") groupId: number) {
    const res = await this.groupService.getGroupDetail(groupId);
    return this.wrap([res]);
  }

  //TESTED
  @api({
    desc: "获取群组邀请码，在一段时间内，一个群的邀请码唯一"
  })
  @UseGuards(JwtAuthGuard)
  @Get("getFriendCode")
  async getFriendCode(@Query("groupId") groupId: number) {
    return await this.groupService.generateFriendCode(groupId);
  }

  @api({
    desc: "通过邀请码进入群组"
  })
  @UseGuards(JwtAuthGuard)
  @Get("enterGroupByCode")
  async enterGroupByCode(@Query("friendCode") code: string,
                         @stuId() stuId: number) {
    return await this.groupService.enterGroupByCode(code, stuId);
  }

  @api({
    desc: "添加管理员"
  })
  @UseGuards(JwtAuthGuard)
  @Get("addAdmin")
  async addAdmin(@Query("userId") newAdminStuId: number,
                 @Query("groupId") groupId: number,
                 @stuId() stuId: number) {
    return await this.groupService.addAdmin(stuId, newAdminStuId, groupId);
  }

  @api({
    desc: "获取我所管理的群组列表"
  })
  @UseGuards(JwtAuthGuard)
  @Get("getMyAdminGroup")
  async getMyAdminGroup(@stuId() stuId: number) {
    return await this.groupService.getMyAdminOfGroups(stuId);
  }

  @api({
    desc: "查看学生在群组里的权限是否为管理员"
  })
  @UseGuards(JwtAuthGuard)
  @Get("getMyRole")
  async getMyRole(@stuId() stuId: number,
                  @Query("groupId") groupId: number) {
    return await this.groupService.checkRoleByStuId(stuId, groupId);
  }

}