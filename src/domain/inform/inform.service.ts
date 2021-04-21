import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Inform, InformDocument } from "./schema/inform.schema";
import { PaginateModel } from "mongoose";
import { GroupService } from "../group/group.service";
import { UserService } from "../user/user.service";
import { ResponseError } from "../../error/custom.error";


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

  async getAll(page: number = 1): Promise<Object> {
    const opts = {
      page: page,
      limit: 5
    };
    return this.informModel.paginate(this.informModel.find(), opts).then(r => {
      return {
        docs: r.docs,
        nowPage: Number(r.page).valueOf(),
        pageTotal: r.pages,
        itemTotal: r.total
      };
    });
  }

  async getByGroup(groupId: number, page: number = 1): Promise<Object> {
    const opts = {
      page: page,
      limit: 5
    };
    return this.informModel.paginate(this.informModel.find({
      relatedGroupId: { $elemMatch: { $eq: groupId } }
    }), opts).then(r => {
      return {
        docs: r.docs,
        nowPage: Number(r.page).valueOf(),
        pageTotal: r.pages,
        itemTotal: r.total
      };
    });
  }

  async getByInformId(informId: number): Promise<[Inform, string]> {
    let res = await this.informModel.findOne({
      informId: informId
    });
    const name = await this.userService.getRealNameByStuId(res.creator);
    return [res, name];
  }

  async getByDate(date: string, page: number = 1): Promise<Object> {
    const opts = {
      page: page,
      limit: 5
    };
    return this.informModel.paginate(this.informModel.find({
      createTime: date
    }), opts).then(r => {
      return {
        docs: r.docs,
        nowPage: Number(r.page).valueOf(),
        pageTotal: r.pages,
        itemTotal: r.total
      };
    });
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

  async insert(inform: Inform, stuId: number): Promise<Inform> {
    inform.creator = stuId;
    return new this.informModel(inform).save().catch(() => {
      throw new ResponseError("创建通知失败！");
    });
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