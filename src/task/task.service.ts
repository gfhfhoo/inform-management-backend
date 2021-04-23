import { Injectable } from "@nestjs/common";
import { Interval, Timeout } from "@nestjs/schedule";
import { CLogger } from "../logger/logger.service";
import { UserService } from "../domain/user/user.service";
import { GroupService } from "../domain/group/group.service";

@Injectable()
export class TaskService {
  constructor(private readonly userService: UserService,
              private readonly groupService: GroupService) {
  }

  @Timeout(0)
  async handleTimeOut() {
    new CLogger()._info("服务器正在同步用户缓存.......");
    await this.userService.updateUserCache();
    new CLogger()._info("服务器正在同步群组缓存.......");
    await this.groupService.updateGroupCache();
  }

  @Interval(60*60*1000)
  async handleInterval() {
    await this.handleTimeOut();
  }
}