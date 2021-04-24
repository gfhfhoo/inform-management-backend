import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";
import { ResponseError } from "../error/custom.error";
import { HttpCode } from "../enum/httpCode.enum";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err, user, info): any {
    if (err || !user) {
      throw new ResponseError("该Session不是有效的会话，请检查Session是否过期或错误！", HttpCode.NO_SESSION);
    }
  }
}