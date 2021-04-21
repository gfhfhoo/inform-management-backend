import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { PaginateModel } from "mongoose";
import { Group, GroupDocument } from "./schema/group.schema";
import { UtilsService } from "../../utils/utils.service";
import { RedisService } from "../../redis/redis.service";
import { ResponseError } from "../../error/custom.error";
import { HttpCode } from "../../enum/httpCode.enum";

@Injectable()
export class GroupService {
  constructor(@InjectModel(Group.name) private readonly groupModel: PaginateModel<GroupDocument>,
              private readonly utils: UtilsService,
              private readonly redis: RedisService) {
  }

  async isExisted(id: number): Promise<boolean> {
    const res = await this.groupModel.findOne({
      groupId: id
    });
    return res != null;
  }

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

  async getMyGroups(stuId: number): Promise<object[]> {
    const data = [];
    const groups = [];
    this.groupModel.find({
      members: { $elemMatch: { $eq: stuId } }
    }).exec((err, data) => {
      if (err) return null;
      return data;
    });
    data.map((value => {
      groups.push({
        groupId: value.groupId,
        name: value.name
      });
    }));
    return groups;
  }

  async getGroupDetail(groupId: number): Promise<Group> {
    return this.groupModel.findOne({
      groupId: groupId
    });
  }

  async enterGroupByCode(code: string, stuId: number): Promise<boolean> {
    const res = (await this.redis.get(code))["groupId"];
    if (res) {
      const group = await this.groupModel.findOne({
        groupId: res
      });
      group.members.push(stuId);
      await this.groupModel.updateOne({
        groupId: res
      }, group);
      return true;
    } else return false;
  }

  async insert(group: Group, stuId: number) {
    group.creator = stuId;
    group.members.push(stuId);
    return new this.groupModel(group).save().catch(() => {
      throw new BadRequestException();
    });
  }
}