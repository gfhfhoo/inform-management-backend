import { Module } from "@nestjs/common";
import { UploadService } from "./upload.service";
import { UtilsModule } from "../utils/utils.module";
import { AuthorModule } from "../authorization/author.module";

@Module({
  imports: [UtilsModule, AuthorModule],
  providers: [UploadService],
  exports: [UploadService]
})
export class UploadModule {

}