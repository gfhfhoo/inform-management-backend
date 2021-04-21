import { Body, Controller, Get, Post, Query, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { InformService } from "./inform.service";
import { Inform } from "./schema/inform.schema";
import { stuId } from "../../decorator/session.decorator";
import { inform } from "src/decorator/inform.decorator";
import { FilesInterceptor } from "@nestjs/platform-express";
import { Express } from "express";
import { api } from "../../decorator/api.decorator";
import { UploadService } from "../../fileUpload/upload.service";


const dirname = "/home/sipc-ubuntu/project/dist/upload";

@Controller()
export class InformController {
  constructor(private readonly informService: InformService,
              private readonly uploadService: UploadService) {
  }

  // TESTED
  @api({
    desc: "某人已读信息，回传至服务器"
  })
  @Post("read")
  async read(@Query("informId") informId: number,
             @stuId() stuId: number) {
    const inform = (await this.informService.getByInformId(informId))[0];
    if (inform["hasRead"].includes(stuId)) return false;
    else {
      inform["hasRead"].push(stuId);
      return await this.informService.update(inform);
    }
  }

  //TESTED
  @api({
    desc: "获取通知详情"
  })
  @Get("getInformDetail")
  async getDetail(@Query("informId") informId: number) {
    return this.informService.getByInformId(informId);
  }

  //TESTED
  // @UseGuards(JwtAuthGuard)
  @api({
    desc: "添加发布通知"
  })
  @Post("addInform")
  async createInform(@inform() inform: Inform,
                     @stuId() stuId: number) {
    await this.informService.insert(inform, stuId);
  }

  @api({
    desc: "根据群组获取信息"
  })
  @Get("getMyInformByGroup")
  async getMyInform(@Query("groupId") group: number) {
    return await this.informService.getByGroup(group);
  }

  @api({
    desc: "根据时间获取信息"
  })
  @Get("getMyInformByDate")
  async getMyInformByDate(@Query("date") date: string) {
    return await this.informService.getByDate(date);
  }


  @api({
    desc: "上传图片"
  })
  @Post("uploadImages")
  @UseInterceptors(FilesInterceptor("file"))
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    return await this.uploadService.upload(dirname, files);
  }

  @api({
    desc: "删除图片"
  })
  @Post("deleteUploadedImage")
  async deleteImage(@Body() body: object) {
    return await this.uploadService.delete(dirname, body["img"]);
  }

  // @Get("tt")
  // @logging()
  // async test() {
  //   throw new ResponseError("oooooo");
  // }
}