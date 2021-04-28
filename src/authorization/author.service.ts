import { HttpService, Injectable } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";
import { api } from "../decorator/api.decorator";

@Injectable()
export class AuthorService {
  constructor(private httpService: HttpService,
              private readonly redis: RedisService) {
  }

  private appId: string = "wx15a26fbbc963b6b9";
  private secret: string = "02c1de3da58f8ce5e53c3c3d0db622b3";

  @api({
    desc: "微信获取openID等信息的接口",
    checked: true
  })
  async requestWx(jsCode: string) {
    try {
      return await this.httpService.get(`https://api.weixin.qq.com/sns/jscode2session?appid=${this.appId}&secret=${this.secret}&js_code=${jsCode}&grant_type=authorization_code`)
        .toPromise();
    } catch (e) {
      return null;
    }
  }
}