import { Module } from "@nestjs/common";
import { UploadService } from "./upload.service";
import { UtilsModule } from "../utils/utils.module";

@Module({
  imports: [UtilsModule],
  providers: [UploadService],
  exports: [UploadService]
})
export class UploadModule {

}