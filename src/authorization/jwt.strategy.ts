import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { jwtConstants } from "./constants";
import { RedisService } from "../redis/redis.service";
import { ResponseError } from "../error/custom.error";
import { HttpCode } from "../enum/httpCode.enum";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private redisService: RedisService) {
    super({
      jwtFromRequest: ExtractJwt.fromHeader("session"),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret
    });
  }

  async validate(payload: any) {
    const thirdKey = payload.sub;
    const res = await this.redisService.get(thirdKey);
    if (res == undefined) throw new ResponseError("无Session会话！", HttpCode.NO_SESSION);
    return thirdKey;
  }
}