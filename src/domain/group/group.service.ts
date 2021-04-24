import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { PaginateModel } from "mongoose";
import { Group, GroupDocument, GroupElement } from "./schema/group.schema";
import { UtilsService } from "../../utils/utils.service";
import { RedisService } from "../../redis/redis.service";
import { ResponseError } from "../../error/custom.error";
import { HttpCode } from "../../enum/httpCode.enum";
import { UserService } from "../user/user.service";
import { CLogger } from "../../logger/logger.service";
import { logging } from "../../decorator/log.decorator";

@Injectable()
export class GroupService {
  constructor(@InjectModel(Group.name) private readonly groupModel: PaginateModel<GroupDocument>,
              private readonly utils: UtilsService,
              private readonly redis: RedisService,
              @Inject(forwardRef(() => UserService)) private readonly userService: UserService) {
  }

  @logging()
  async getGroupElement() {
    const cache = await this.redis.get("group_cache") as object[];
    if (cache) return cache;
    else {
      await this.updateGroupCache();
      return this.redis.get("group_cache");
    }
  }

  @logging()
  async isExisted(id: number): Promise<boolean> {
    const res = await this.getGroupDetail(id);
    return res != null;
  }

  @logging()
  async isNumberExisted(stuId: number, groupId: number): Promise<boolean> {
    const res = await this.getGroupDetail(groupId);
    return res.members.includes(stuId);
  }

  @logging()
  async generateFriendCode(id: number): Promise<string> {
    // check if groupId available
    if (await this.isExisted(id)) {
      const queryRes = await this.redis.get("G" + id);
      if (queryRes != undefined) return queryRes["friendCode"];
      const code = await this.utils.nextFriendCode();
      await this.redis.add(code, {
        groupId: id
      }, 259200);
      return code;
    } else throw new ResponseError("群组ID非法", HttpCode.REQUEST_REFUSED);
  };

  @logging()
  async getMyGroups(stuId: number): Promise<object[]> {
    let res = [];
    const groups: any[] = await new Promise(((resolve, reject) => {
      this.groupModel.find({
        members: { $elemMatch: { $eq: stuId } }
      }).exec((err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    }));
    groups.map((value => {
      res.push(<GroupElement>{
        groupId: value.groupId,
        name: value.name
      });
    }));
    return res;
  }

  @logging()
  async getGroupDetail(groupId: number): Promise<Group> {
    return this.groupModel.findOne({
      groupId: groupId
    });
  }

  @logging()
  async enterGroupByCode(code: string, stuId: number): Promise<boolean> {
    if (!code) throw new ResponseError("邀请码不存在！", HttpCode.NO_SESSION);
    const res = (<GroupElement>await this.redis.get(code));
    if (res) {
      const group = await this.groupModel.findOne({
        groupId: res.groupId
      });
      if (!group.members.find(x => (x == stuId))) group.members.push(stuId); // 确保添加的用户不在群组里
      else throw new ResponseError("非法请求！");
      await this.groupModel.updateOne({
        groupId: res.groupId
      }, group);
      return null;
    } else throw new ResponseError("邀请码有误！");
  }

  @logging()
  async insert(group: Group, stuId: number) {
    group.creator = stuId;
    group.admins.push(Number(stuId));
    group.creatorName = await this.userService.getRealNameByStuId(stuId);
    group.members.push(Number(stuId));
    return new this.groupModel(group).save();
  }

  async updateGroupCache() {
    const queryRes = await this.groupModel.find();
    let mapping: GroupElement[] = [];
    for (let group of queryRes) {
      mapping.push({
        groupId: group.groupId,
        name: group.name
      });
    }
    await this.redis.del("group_cache");
    return this.redis.add("group_cache", mapping).then(() => {
      new CLogger()._info("服务器同步群组缓存完成！");
      return true;
    }).catch(() => {
      new CLogger()._err("服务器同步群组缓存失败！");
      return false;
    });
  }

  async checkRoleByStuId(stuId: number, groupId: number) {
    let queryRes = await this.getGroupDetail(groupId);
    const roleList = queryRes.admins;
    // console.log("-->", stuId, roleList);
    return roleList.includes(stuId);
  }

  async getMyAdminOfGroups(stuId: number) {
    const groups: any[] = await new Promise(((resolve, reject) => {
      this.groupModel.find({
        admins: { $elemMatch: { $eq: stuId } }
      }).exec((err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    }));
    return groups.map(value => {
      return <GroupElement>{
        groupId: value.groupId,
        name: value.name
      };
    });
  }

  @logging()
  async addAdmin(operator: number, acceptor: number, groupId: number) {
    const val1 = await this.checkRoleByStuId(operator, groupId); //检查操作人是否有权限
    const val2 = !(await this.checkRoleByStuId(acceptor, groupId))
      && (await this.userService.isExistedByStuId(acceptor) != null)
      && await this.isNumberExisted(acceptor, groupId); //确保被添加人不在群组权限列表且存在
    if (val1 && val2) {// 两者条件满足开始寻找群组
      const group = await this.groupModel.findOne({
        groupId: groupId
      });
      group.admins.push(Number(acceptor));// 压入
      await this.groupModel.updateOne({// 更新
        groupId: groupId
      }, group);
    } else throw new ResponseError("请求拒绝，可能用户无操作权限、用户已在权限列表或所添加的ID不存在", HttpCode.REQUEST_REFUSED);
  }
}