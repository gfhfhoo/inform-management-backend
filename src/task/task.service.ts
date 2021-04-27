import { HttpService, Injectable } from "@nestjs/common";
import { Interval, Timeout } from "@nestjs/schedule";
import { CLogger } from "../logger/logger.service";
import { UserService } from "../domain/user/user.service";
import { GroupService } from "../domain/group/group.service";
import { RedisService } from "../redis/redis.service";

@Injectable()
export class TaskService {
  constructor(private readonly userService: UserService,
              private readonly groupService: GroupService,
              private readonly httpService: HttpService,
              private readonly redisService: RedisService) {
  }

  private appId: string = "wx15a26fbbc963b6b9";
  private secret: string = "02c1de3da58f8ce5e53c3c3d0db622b3";

  @Timeout(0)
  async handleTimeOut() {
    new CLogger()._info("服务器正在同步用户缓存.......");
    await this.userService.updateUserCache();
    new CLogger()._info("服务器正在同步群组缓存.......");
    await this.groupService.updateGroupCache();
  }

  @Interval(60 * 60 * 1000)
  async handleInterval() {
    await this.handleTimeOut();
  }

  @Interval(1000 * 60)
  async requestAccessToken() {
    const accessToken = await this.redisService.get("access_token");
    if (accessToken) return;
    const res = (await this.httpService.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.secret}`)
      .toPromise()).data;
    if (!res["errcode"]) {
      let ttl = res["expires_in"] as number;
      ttl = ttl - 5 <= 0 ? ttl - 1 : ttl - 5;
      const newToken = res["access_token"] as string;
      await this.redisService.add("access_token", newToken, ttl);
    }
  }
}