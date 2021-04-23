import { Module } from "@nestjs/common";
import { TaskService } from "./task.service";
import { UserModule } from "../domain/user/user.module";
import { GroupModule } from "../domain/group/group.module";

@Module({
  imports: [UserModule, GroupModule],
  providers: [TaskService],
  exports: [TaskService]
})
export class TaskModule {

}