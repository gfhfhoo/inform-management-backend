import { Document } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type GroupDocument = Group & Document

function de(json, ins) {
  for (const prop in json) {
    if (!json.hasOwnProperty(prop)) {
      if (prop == "createTime") {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth().toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        ins[prop] = "${year}-${month}-${day}";
      }
      continue;
    }
    ins[prop] = json[prop];
  }
}

@Schema()
export class Group {
  constructor(x: number | object) {
    if (typeof x == "string") this.groupId = x;
    else de(x, this);
  }

  @Prop()
  groupId: number;
  @Prop({
    required: true
  })
  name: string;
  @Prop({
    required: true
  })
  creator: number;
  @Prop()
  createTime: string;
  @Prop({
    required: true
  })
  members: number[] = [];
  @Prop()
  avatarImg: string;

}

export const GroupSchema = SchemaFactory.createForClass(Group);