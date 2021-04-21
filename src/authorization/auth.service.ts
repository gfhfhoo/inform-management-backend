import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthorService } from "./author.service";
import { RedisService } from "../redis/redis.service";
import { UtilsService } from "../utils/utils.service";
import { UserService } from "../domain/user/user.service";
import { ResponseError } from "../error/custom.error";
import { HttpCode } from "../enum/httpCode.enum";

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService,
              private authorService: AuthorService,
              private redisService: RedisService,
              private userService: UserService,
              private readonly utils: UtilsService) {
  }

  async login(jsCode: string) {
    if (jsCode == null || jsCode == "") throw new ResponseError("未提供有效的微信凭证！", HttpCode.REQUEST_REFUSED);
    const response = await this.authorService.requestWx(jsCode);
    const data = response.data;
    const sessionKey = data["session_key"];
    const openId = data["openid"];// 区分每个微信用户，与数据库的学号进行绑定
    if (sessionKey == null || openId == null) throw new ResponseError("服务端请求错误，请过一会重试。");
    const stuId = (await this.userService.getStuIdByOpenId(openId))[0];
    const thirdKey = await this.utils.nextKey();
    if (stuId == null) {
      // throw an exception to user, informing him go to bind his user info
      const bindTip = {
        openId: openId
      };
      await this.redisService.add(thirdKey, bindTip, 300);
      throw new ResponseError({
        desc: "未检测到用户在数据库的信息，请注册绑定！",
        tmp_session: thirdKey
      }, HttpCode.REDIRECT_TO_LOGIN);
    }
    const val = {
      sessionKey: sessionKey,
      openId: openId
    };
    const payload = {
      sub: thirdKey,
      stuId: stuId
    };
    const token = this.jwtService.sign(payload);
    await this.redisService.add(thirdKey, val, 173000);
    return {
      session: token
    };
  }
}