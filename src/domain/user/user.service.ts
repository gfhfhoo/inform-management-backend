import { Injectable } from "@nestjs/common";
import { Users } from "./user.entity";
import { EntityManager } from "typeorm";
import { GroupService } from "../group/group.service";
import { ResponseError } from "../../error/custom.error";
import { RedisService } from "../../redis/redis.service";
import { logging } from "../../decorator/log.decorator";

@Injectable()
export class UserService {
  constructor(private userRepo: EntityManager,
              private readonly redisService: RedisService,
              private readonly groupService: GroupService) {
  }

  // async getRoleByOpenId(openId: string) {
  //   return this.userRepo.query(`SELECT role_id FROM user_role INNER JOIN users ON "wxid" = ${openId}`);
  // }

  async getStuIdByOpenId(openId: string) {
    return this.userRepo.query(`SELECT stu_id FROM users WHERE wxid = "${openId}"`);
  }

  async getGroupsByStuId(stuId: number) {
    return this.groupService.getMyGroups(stuId);
  }

  async getRealNameByStuId(stuId: number) {
    let res = await this.userRepo.query(`SELECT * FROM users WHERE stu_id = "${stuId}"`);
    if (res == null) throw new ResponseError("请求结果失败");
    return res.real_name;
  }

  @logging()
  async bindUser(session: string, realName: string, stuId: number) {
    let wxid = null;
    try {
      wxid = (await this.redisService.get(session))["openId"];
    } catch (e) {
      throw new ResponseError("该Session不包含用户唯一ID信息！是否已经注册过？");
    }
    const queryRes = await this.getStuIdByOpenId(wxid);
    console.log(queryRes);
    if (queryRes.length != 0) throw new ResponseError("绑定用户时发生未知错误！可能重复进行了注册。");
    const user = {
      stu_id: stuId,
      wxid: wxid,
      real_name: realName
    } as Users;
    await this.userRepo.insert(Users, user);
  }
}