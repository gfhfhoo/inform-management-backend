import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthorModule } from "./authorization/author.module";
import { InformModule } from "./domain/inform/inform.module";
import { RedisModule } from "./redis/redis.module";
import { UtilsModule } from "./utils/utils.module";
import { GroupModule } from "./domain/group/group.module";
import { UserModule } from "./domain/user/user.module";
import * as path from "path";
import { ServeStaticModule } from "@nestjs/serve-static";

const URL = "49.232.223.89";
const dirname = "/home/sipc-ubuntu/project/dist/upload";

@Module({
  imports: [MongooseModule.forRootAsync({
    useFactory: () => ({
      uri: `mongodb://${URL}:50006/database`
    })
  }), TypeOrmModule.forRootAsync(({
    useFactory: () => ({
      type: "mysql",
      host: URL,
      port: 50005,
      username: "root",
      password: "123456",
      database: "inform",
      autoLoadEntities: true,
      synchronize: true
    })
  })), ServeStaticModule.forRoot({
    rootPath: dirname,
    renderPath: "233"
  }), AuthorModule, InformModule, RedisModule, UtilsModule, GroupModule, UserModule],
  controllers: [],
  providers: []
})
export class AppModule {
}
