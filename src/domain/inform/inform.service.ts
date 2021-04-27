import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Inform, InformDocument } from "./schema/inform.schema";
import { PaginateModel } from "mongoose";
import { GroupService } from "../group/group.service";
import { UserService } from "../user/user.service";
import { paginate } from "../../decorator/paginate.decorator";
import { logging } from "../../decorator/log.decorator";
import { Order, OrderToField } from "../../enum/order.enum";
import { ResponseError } from "../../error/custom.error";
import { HttpCode } from "../../enum/httpCode.enum";


@Injectable()
export class InformService {
  constructor(@InjectModel(Inform.name) private readonly informModel: PaginateModel<InformDocument>,
              private readonly groupService: GroupService,
              private readonly userService: UserService) {
  }

  standardizeTime(timestamp: number) {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  @logging()
  @paginate()
  async getAll(page: number = 1): Promise<any> {
    const opts = {
      page: page,
      limit: 5
    };
    return this.informModel.paginate(this.informModel.find(), opts);
  }

  @logging()
  async getMyAllInform(stuId: number, order: Order): Promise<any> {
    const map = OrderToField(order);
    let groups = await this.userService.getGroupsByStuId(stuId) as any[];
    if (groups == null) throw new ResponseError("该用户学号错误或未添加群组！", HttpCode.REQUEST_REFUSED);
    groups = groups.map((value: any) => {
      return value.groupId;
    });
    return await new Promise(((resolve, reject) => {
      this.informModel.find({
        relatedGroup: { $elemMatch: { groupId: { $in: groups } } }
      }).sort(map).exec(((err, data) => {
        if (err) reject(err);
        else resolve({ docs: data });
      }));
    }));
  }

  @logging()
  @paginate()
  async getByGroup(groupId: number, page: number = 1): Promise<Object> {
    const opts = {
      page: page,
      limit: 5
    };
    return new Promise(((resolve, reject) => {
      this.informModel.find({
        relatedGroup: { $elemMatch: { groupId: { $eq: groupId } } }
      }).exec((err, data) => {
        if (err) reject(err);
        else resolve(this.informModel.paginate(data, opts));
      });
    }));
  }

  @logging()
  async getByInformId(informId: number): Promise<Object> {
    let res = (await this.informModel.find({
      informId: informId
    }))[0];
    const name = (await this.userService.getRealNameByStuId([res.creator]))[0];
    return [res, name];
  }

  @logging()
  @paginate()
  async getByDate(date: Date, page: number = 1, order: Order): Promise<any> {
    const sort = OrderToField(order);
    const opts = {
      page: page,
      limit: 5
    };
    return this.informModel.paginate(this.informModel.find({
      createTime: +date.getTime()
    }).sort(sort), opts);
  }

  @logging()
  async insert(inform: Inform, stuId: number): Promise<Inform> {
    inform.creator = stuId;
    // inform.hasRead.push(stuId);
    inform.creatorName = (await this.userService.getRealNameByStuId([stuId]))[0];
    // 限制deadline
    if (inform.deadline) {
      if (inform.deadline < inform.createTime) throw new ResponseError("截止日期不符合规范", HttpCode.REQUEST_REFUSED);
    }
    const mapping = await this.groupService.getGroupElement() as any[];
    for (let group of inform.relatedGroup) {
      group.name = mapping.find(x => (x.groupId == group.groupId)).name;
    }
    return new this.informModel(inform).save();
  }

  @logging()
  async update(inform: Inform): Promise<boolean> {
    const res = await this.informModel.updateOne({
      informId: inform.informId
    }, inform);
    return res.n && res.nModified > 0;
  }

  @logging()
  async delete(id: number) {
    return this.informModel.deleteOne({
      informId: id
    });
  }
}