import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { HttpCode } from "../enum/httpCode.enum";

export interface Response<T> {
  data: T;
  code: HttpCode,
  description: string
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    if (request.method == "POST") response.status(HttpStatus.OK);
    return next
      .handle()
      .pipe(
        map(data => ({
          data: data == null ? "请求完成" : data,
          code: HttpCode.OK,
          description: HttpCode[HttpCode.OK]
        }))
      );
  }
}