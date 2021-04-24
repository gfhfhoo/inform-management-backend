import { Body, Controller, Get, Post } from "@nestjs/common";
import { stuId } from "../../decorator/session.decorator";
import { UserService } from "./user.service";
import { api } from "../../decorator/api.decorator";

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {
  }

  @api({
    desc: "使用JsCode获取OpenId来绑定用户"
  })
  @Post("bindUser")
  async bindUser(@Body() body: object) {
    return await this.userService.bindUser(body["jsCode"], body["realName"], body["stuId"]);
  }

  @Get("getMyStuId")
  async getMyStuId(@stuId() stuId: number) {
    return stuId;
  }
}