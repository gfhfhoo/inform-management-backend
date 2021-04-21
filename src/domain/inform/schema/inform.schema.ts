import { Document } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type InformDocument = Inform & Document

function de(json, ins) {
  for (const prop in json) {
    if (!json.hasOwnProperty(prop)) continue;
    ins[prop] = json[prop];
  }
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  ins["createTime"] = `${year}-${month}-${day}`;
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
  content: string;
  @Prop({
    required: true
  })
  relatedGroupId: number[];
  @Prop({
    required: true
  })
  createTime: string;
  @Prop()
  deadline: string = null;
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