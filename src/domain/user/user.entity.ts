import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Users {
  constructor(id: string | number) {
    if (typeof id === "string") this.wxid = id;
    else this.stu_id = id;
  }

  @PrimaryColumn()
  stu_id: number;

  @Column()
  real_name: string;

  @Column()
  wxid: string;


}