import { Controller, Get, Query } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { api } from "../decorator/api.decorator";

@Controller()
export class AuthorController {
  constructor(private readonly authService: AuthService) {
  }

  @api({
    desc: "请求登录接口",
    checked: true
  })
  @Get("login")
  async login(@Query("js_code") code: string): Promise<any> {
    return await this.authService.login(code);
  }

}