import { Document } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

// export interface GroupElement {
//   groupId: number,
//   groupName: string
// }

export type GroupDocument = Group & Document
export type GroupElement = Pick<Group, "groupId" | "name">;

function de(json, ins) {
  for (const prop in json) {
    if (!json.hasOwnProperty(prop)) {
      continue;
    }
    ins[prop] = json[prop];
  }
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  ins["createTime"] = new Date(`${year}/${month}/${day}`).getTime();
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
  @Prop({
    required: true
  })
  creatorName: string;
  @Prop()
  createTime: number;
  @Prop({
    required: true
  })
  members: number[] = [];
  @Prop()
  avatarImg: string = "defaultCover.jpg";
  @Prop({
    required: true
  })
  admins: number[] = [];

}

export const GroupSchema = SchemaFactory.createForClass(Group);