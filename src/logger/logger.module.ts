import { Module } from "@nestjs/common";
import { CLogger } from "./logger.service";

@Module({
  providers: [CLogger],
  exports: [CLogger]
})
export class LoggerModule {

}