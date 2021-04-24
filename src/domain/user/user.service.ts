import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { UserElement, Users } from "./user.entity";
import { EntityManager } from "typeorm";
import { GroupService } from "../group/group.service";
import { ResponseError } from "../../error/custom.error";
import { RedisService } from "../../redis/redis.service";
import { logging } from "../../decorator/log.decorator";
import { CLogger } from "../../logger/logger.service";
import { AuthorService } from "../../authorization/author.service";

@Injectable()
export class UserService {
  constructor(private userRepo: EntityManager,
              private readonly redisService: RedisService,
              @Inject(forwardRef(() => AuthorService)) private readonly authorService: AuthorService,
              @Inject(forwardRef(() => GroupService)) private readonly groupService: GroupService) {
  }

  // async getRoleByOpenId(openId: string) {
  //   return this.userRepo.query(`SELECT role_id FROM user_role INNER JOIN users ON "wxid" = ${openId}`);
  // }

  async getAll() {
    return this.userRepo.query(`SELECT * FROM users`);
  }

  async getStuIdByOpenId(openId: string) {
    return this.userRepo.query(`SELECT stuId FROM users WHERE wxid = "${openId}"`);
  }

  async getGroupsByStuId(stuId: number) {
    return this.groupService.getMyGroups(stuId);
  }

  async isExistedByStuId(stuId: number) {
    return (await this.userRepo.query(`SELECT * FROM users WHERE stuId = "${stuId}"`))[0];
  }

  async getRealNameByStuId(stuId: number) {
    if (stuId == null) throw new ResponseError("请求结果失败");
    const cache = <UserElement[]>await this.redisService.get("user_cache");
    if (cache) {
      const cache_res = cache.find(x => (x.stuId == stuId));
      if (cache_res) return cache_res.realName;
    }
    await this.updateUserCache();
    const res = await this.isExistedByStuId(stuId);
    if (res == null) throw new ResponseError("请求结果失败");
    return res.realName;
  }

  @logging()
  async bindUser(jsCode: string, realName: string, stuId: number) {
    let wxid = null;
    const openId = (await this.authorService.requestWx(jsCode)).data["openid"];
    if (openId == null) throw new ResponseError("服务端向微信请求JS_CODE时发生错误，请过一会重试。");
    wxid = openId;
    const queryRes = await this.getStuIdByOpenId(wxid);
    if (queryRes.length != 0) throw new ResponseError("绑定用户时发生未知错误！可能重复进行了注册。");
    const user = {
      stuId: stuId,
      wxid: wxid,
      realName: realName
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
      t["stuId"] = student.stuId;
      t["realName"] = student.realName;
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