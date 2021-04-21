import { Controller, Get, Post, Query } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller()
export class AuthorController {
  constructor(private readonly authService: AuthService) {
  }

  @Get("login")
  async login(@Query("js_code") code: string) {
    return await this.authService.login(code);
  }

}