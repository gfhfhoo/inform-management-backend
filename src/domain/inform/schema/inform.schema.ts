import { Document } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { GroupElement } from "../../group/schema/group.schema";

export type InformDocument = Inform & Document

function de(json, ins) {
  for (const prop in json) {
    if (!json.hasOwnProperty(prop)) continue;
    if (prop == "deadline") { // 处理deadline时间戳
      ins[prop] = +new Date(json[prop]).getTime() + 86399000; // 锁定23:59:59
    } else ins[prop] = json[prop];
  }
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  ins["createTime"] = new Date(`${year}/${month}/${day}`).getTime();
}

@Schema()
export class Inform {
  constructor(x: object) {
    de(x, this);
  }

  @Prop()
  informId: number;
  @Prop({
    required: true
  })
  title: string;
  @Prop({
    required: true
  })
  creator: number;
  @Prop({
    required: true
  })
  creatorName: string;
  @Prop({
    required: true
  })
  content: string;
  @Prop({
    required: true
  })
  relatedGroup: GroupElement[];
  @Prop({
    required: true
  })
  createTime: number;
  @Prop()
  deadline: number = null;
  @Prop()
  tag: string[] = [];
  @Prop()
  priority: number = 0;
  @Prop()
  hasRead: number[] = [];
  @Prop()
  resources: string[] = [];

}

export const InformSchema = SchemaFactory.createForClass(Inform);