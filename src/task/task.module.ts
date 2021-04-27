import { HttpModule, Module } from "@nestjs/common";
import { TaskService } from "./task.service";
import { UserModule } from "../domain/user/user.module";
import { GroupModule } from "../domain/group/group.module";
import { RedisModule } from "../redis/redis.module";

@Module({
  imports: [UserModule, GroupModule, HttpModule, RedisModule],
  providers: [TaskService],
  exports: [TaskService]
})
export class TaskModule {

}