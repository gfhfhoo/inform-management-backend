import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Inform, InformDocument } from "./schema/inform.schema";
import { PaginateModel } from "mongoose";
import { GroupService } from "../group/group.service";
import { UserService } from "../user/user.service";
import { paginate } from "../../decorator/paginate.decorator";
import { logging } from "../../decorator/log.decorator";


@Injectable()
export class InformService {
  constructor(@InjectModel(Inform.name) private readonly informModel: PaginateModel<InformDocument>,
              private readonly groupService: GroupService,
              private readonly userService: UserService) {
  }

  fn = async (groupId, date) => {
    return new Promise(resolve => {
      this.informModel.find({
        relatedGroupId: { $elemMatch: { $eq: groupId } },
        createTime: date
      }).exec((err, data) => {
        if (!err) resolve(data);
      });
    });
  };

  @logging()
  @paginate()
  async getAll(page: number = 1): Promise<Object> {
    const opts = {
      page: page,
      limit: 5
    };
    return this.informModel.paginate(this.informModel.find(), opts);
  }

  @logging()
  @paginate()
  async getByGroup(groupId: number, page: number = 1): Promise<Object> {
    const opts = {
      page: page,
      limit: 5
    };
    return this.informModel.paginate(this.informModel.find({
      relatedGroupId: { $elemMatch: { $eq: groupId } }
    }), opts);
  }

  async getByInformId(informId: number): Promise<Object> {
    // if (typeof informId == "string") informId = Number.parseInt(informId);
    let res = await this.informModel.findOne({
      informId: informId
    });
    const name = await this.userService.getRealNameByStuId(res.creator);
    return {
      res,
      name
    };
  }

  @logging()
  @paginate()
  async getByDate(date: string, page: number = 1): Promise<Object> {
    const opts = {
      page: page,
      limit: 5
    };
    return this.informModel.paginate(this.informModel.find({
      createTime: date
    }), opts);
  }

  // async getByDateByGroups(date: string, groups: number[]) {
  //   const f = new Promise(resolve => {
  //     const a = groups.map(r => this.fn(r, date));
  //     const b = Promise.all(a);
  //     resolve(b);
  //   });
  //   return await f;
  // }
  //
  // async getByDateByStuId(date: string, stuId: number) {
  //   // check if groups field exists
  //   const groups = await this.userService.getGroupsByStuId(stuId);
  //   if (groups == null) throw new ResponseError("该用户学号错误或未添加群组！");
  //   const f = new Promise(resolve => {
  //     const a = groups.map(r => this.fn(r, date));
  //     const b = Promise.all(a);
  //     resolve(b);
  //   });
  //   return await f;
  // }

  @logging({
    errMsg: "创建通知失败！"
  })
  async insert(inform: Inform, stuId: number): Promise<Inform> {
    inform.creator = stuId;
    return new this.informModel(inform).save();
  }

  async update(inform: Inform): Promise<boolean> {
    const res = await this.informModel.updateOne({
      informId: inform.informId
    }, inform);
    return res.n && res.nModified > 0;
  }

  async delete(id: number) {
    return this.informModel.deleteOne({
      informId: id
    });
  }
}