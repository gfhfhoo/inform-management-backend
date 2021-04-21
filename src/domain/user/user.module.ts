import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Users } from "./user.entity";
import { GroupModule } from "../group/group.module";
import { RedisModule } from "../../redis/redis.module";

@Module({
  imports: [GroupModule, RedisModule, TypeOrmModule.forFeature([Users])],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {

}