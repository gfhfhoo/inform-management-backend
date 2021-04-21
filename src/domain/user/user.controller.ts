import { Body, Controller, Post } from "@nestjs/common";
import { session, stuId } from "../../decorator/session.decorator";
import { UserService } from "./user.service";
import { api } from "../../decorator/api.decorator";

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {
  }

  @api({
    desc: "绑定用户"
  })
  @Post("bindUser")
  async bindUser(@Body() body: object,
                 @session() session: string) {
    return await this.userService.bindUser(session, body["realName"], body["stuId"]);
  }
}