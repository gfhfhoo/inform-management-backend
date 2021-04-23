import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { jwtConstants } from "./constants";
import { RedisService } from "../redis/redis.service";
import { ResponseError } from "../error/custom.error";
import { HttpCode } from "../enum/httpCode.enum";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly redisService: RedisService) {
    super({
      jwtFromRequest: ExtractJwt.fromHeader("session"),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret
    });
  }

  async validate(payload: any) {
    // payload 是解析后的Object
    const thirdKey = payload.sub;
    const res = await this.redisService.get(thirdKey);
    if (!res) throw new ResponseError("该会话已过期！", HttpCode.SESSION_EXPIRED); // Session已过期
    return true;
  }
}