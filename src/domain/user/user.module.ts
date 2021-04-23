import { forwardRef, Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Users } from "./user.entity";
import { GroupModule } from "../group/group.module";
import { RedisModule } from "../../redis/redis.module";
import { UserController } from "./user.controller";

@Module({
  imports: [forwardRef(() => GroupModule), RedisModule, TypeOrmModule.forFeature([Users])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {

}