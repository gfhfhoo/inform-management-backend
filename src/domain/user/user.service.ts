import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { Users } from "./user.entity";
import { EntityManager } from "typeorm";
import { GroupService } from "../group/group.service";
import { ResponseError } from "../../error/custom.error";
import { RedisService } from "../../redis/redis.service";
import { logging } from "../../decorator/log.decorator";
import { CLogger } from "../../logger/logger.service";

@Injectable()
export class UserService {
  constructor(private userRepo: EntityManager,
              private readonly redisService: RedisService,
              @Inject(forwardRef(() => GroupService)) private readonly groupService: GroupService) {
  }

  // async getRoleByOpenId(openId: string) {
  //   return this.userRepo.query(`SELECT role_id FROM user_role INNER JOIN users ON "wxid" = ${openId}`);
  // }

  async getAll() {
    return this.userRepo.query(`SELECT * FROM users`);
  }

  async getStuIdByOpenId(openId: string) {
    return this.userRepo.query(`SELECT stu_id FROM users WHERE wxid = "${openId}"`);
  }

  async getGroupsByStuId(stuId: number) {
    return this.groupService.getMyGroups(stuId);
  }

  async isExistedByStuId(stuId: number) {
    return (await this.userRepo.query(`SELECT * FROM users WHERE stu_id = "${stuId}"`))[0];
  }

  async getRealNameByStuId(stuId: number) {
    if (stuId == null) throw new ResponseError("请求结果失败");
    const cache = await this.redisService.get("user_cache") as object[];
    if (cache) {
      const cache_res = cache.find(x => (x["stuId"] == stuId));
      if (cache_res) return cache_res["realName"];
    }
    await this.updateUserCache();
    const res = await this.isExistedByStuId(stuId);
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
    if (queryRes.length != 0) throw new ResponseError("绑定用户时发生未知错误！可能重复进行了注册。");
    const user = {
      stu_id: stuId,
      wxid: wxid,
      real_name: realName
    } as Users;
    await this.userRepo.insert(Users, user);
    new CLogger()._info("服务器正在同步新用户.......");
    await this.updateUserCache();
  }

  async updateUserCache() {
    const students = await this.getAll();
    let mapping = [];
    for (let student of students) {
      let t = {};
      t["stuId"] = student.stu_id;
      t["realName"] = student.real_name;
      mapping.push(t);
    }
    await this.redisService.del("user_cache");
    return this.redisService.add("user_cache", mapping).then(() => {
      new CLogger()._info("服务器同步用户缓存完成！");
      return true;
    }).catch(() => {
      new CLogger()._err("服务器同步用户缓存失败！");
      return false;
    });
  }
}