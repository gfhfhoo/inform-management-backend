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
    // 检查JSCode
    if (jsCode == null || jsCode == "") throw new ResponseError("未提供有效的微信凭证！", HttpCode.REQUEST_REFUSED);
    // 请求微信端
    const response = await this.authorService.requestWx(jsCode);
    // 获取微信返回的Session
    const data = response.data;
    const sessionKey = data["session_key"];
    const openId = data["openid"];// 区分每个微信用户，与数据库的学号进行绑定
    // 检查微信返回是否包含了用户信息
    if (sessionKey == null || openId == null) throw new ResponseError("服务端请求错误，请过一会重试。");
    // 根据微信用户唯一标识换取数据库学号信息
    const stuId = await this.userService.getStuIdByOpenId(openId);
    // 生成本地三方Key
    const thirdKey = await this.utils.nextKey();
    // 判断stuId是否不存在
    if (stuId.length == 0) {
      // 抛出异常，返回给用户提示需要进行绑定
      // 临时绑定的一个小Value，包含OpenId
      const bindTip = {
        openId: openId
      };
      await this.redisService.add(thirdKey, bindTip, 300);
      return {
        desc: "未检测到用户在数据库的信息，请注册绑定！",
        session: thirdKey,
        isRegister: false
      };
    }
    // 通过Login方法后的Value
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
      session: token,
      isRegister: true
    };
  }
}