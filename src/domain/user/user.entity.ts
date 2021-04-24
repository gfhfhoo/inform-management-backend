import { Column, Entity, PrimaryColumn } from "typeorm";

export type UserElement = Pick<Users, "stuId" | "realName">

@Entity()
export class Users {
  constructor(id: string | number) {
    if (typeof id === "string") this.wxid = id;
    else this.stuId = id;
  }

  @PrimaryColumn()
  stuId: number;

  @Column()
  realName: string;

  @Column()
  wxid: string;


}