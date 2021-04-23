import { Injectable } from "@nestjs/common";
import { UserService } from "../domain/user/user.service";

@Injectable()
export class UtilsService {
  constructor() {
  }

  async nextKey(): Promise<string> {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    let id = [], i;
    let radix = chars.length;
    for (i = 0; i < 168; ++i) id[i] = chars[0 | Math.random() * radix];
    return id.join("");
  }

  async nextHash(): Promise<string> {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    let id = [], i;
    let radix = chars.length;
    for (i = 0; i < 64; ++i) id[i] = chars[0 | Math.random() * radix];
    return id.join("");
  }

  async nextFriendCode(): Promise<string> {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyz".split("");
    let code = [], i;
    let radix = chars.length;
    for (i = 0; i < 6; ++i) code[i] = chars[0 | Math.random() * radix];
    return code.join("");
  }

  async dateCompare(v1: string | Date, v2: string | Date): Promise<number> {
    const date1 = new Date(v1);
    const date2 = new Date(v2);
    if (date1 < date2) return -1;
    else return 1;
    // const tmp1 = v1.split("-");
    // const tmp2 = v2.split("-");
    // for (let i = 0; i < 3; ++i) {
    //   let k1 = Number(tmp1[i]);
    //   let k2 = Number(tmp2[i]);
    //   if (k1 < k2) return -1;
    // }
    // return 1;
  }

}
