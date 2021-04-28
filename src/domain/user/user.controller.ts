import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { stuId } from "../../decorator/session.decorator";
import { UserService } from "./user.service";
import { api } from "../../decorator/api.decorator";
import { JwtAuthGuard } from "../../authorization/jwt-auth.guard";

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

  @UseGuards(JwtAuthGuard)
  @Get("getMyStuId")
  async getMyStuId(@stuId() stuId: number) {
    return stuId;
  }

  @UseGuards(JwtAuthGuard)
  @Get("getMyInfo")
  async getMyInfo(@stuId() stuId: number) {
    return this.userService.getMyInfoByStuId(stuId);
  }
}