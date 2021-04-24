import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthorService } from "./author.service";
import { RedisService } from "../redis/redis.service";
import { UtilsService } from "../utils/utils.service";
import { UserService } from "../domain/user/user.service";
import { ResponseError } from "../error/custom.error";
import { HttpCode } from "../enum/httpCode.enum";
import { logging } from "../decorator/log.decorator";

interface JWT {
  sub: string,
  stuId: number,
  iat: number,
  exp: number
}

interface LoginRet {
  session: string,
  stuId: number,
  isRegister: boolean
}

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService,
              private authorService: AuthorService,
              private redisService: RedisService,
              @Inject(forwardRef(() => UserService)) private userService: UserService,
              private readonly utils: UtilsService) {
  }

  @logging()
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
    if (sessionKey == null || openId == null) throw new ResponseError("服务端向微信请求JS_CODE时发生错误，请过一会重试。");
    // 判断当前用户的Session是否存在Redis中
    const key = await this.redisService.get(openId);
    if (key) {
      // 查询JWT时间戳是否即将过期（小于6小时）
      // let extendPayload = this.jwtService.decode(key["thirdKey"], {
      //   json: true
      // });
      // let jwtToken = this.jwtService.sign(extendPayload, {
      //   expiresIn: "48d"
      // });
      return {
        session: key["thirdKey"], //返回JWT
        isRegister: true
      };
    }// 查到返回三方key
    // 根据微信用户唯一标识换取数据库学号信息
    const queryRes = (await this.userService.getStuIdByOpenId(openId))[0];
    let stuId = null;
    if (queryRes) stuId = queryRes.stuId;
    // 判断stuId是否不存在
    if (stuId == null) {
      // 抛出异常，返回给用户提示需要进行绑定
      return {
        desc: "未检测到用户在数据库的信息，请注册绑定！",
        isRegister: false
      };
    }
    // 通过Login方法后的Value
    const payload = {
      stuId: stuId
    };
    const token = this.jwtService.sign(payload, {
      expiresIn: "48d"
    });
    const val = {
      sessionKey: sessionKey,
      thirdKey: token
    };
    await this.redisService.add(openId, val, 172600);
    console.log(token, this.jwtService.decode(token));
    return <LoginRet>{
      session: token, // 返回JWT
      stuId: stuId,
      isRegister: true
    };
  }
}