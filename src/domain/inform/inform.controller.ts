import { Body, Controller, Get, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { InformService } from "./inform.service";
import { Inform } from "./schema/inform.schema";
import { stuId } from "../../decorator/session.decorator";
import { inform } from "src/decorator/inform.decorator";
import { FilesInterceptor } from "@nestjs/platform-express";
import { Express } from "express";
import { api } from "../../decorator/api.decorator";
import { UploadService } from "../../fileUpload/upload.service";
import { JwtAuthGuard } from "../../authorization/jwt-auth.guard";

const dirname = "/home/sipc-ubuntu/project/dist/upload";

@Controller()
export class InformController {
  constructor(private readonly informService: InformService,
              private readonly uploadService: UploadService) {
  }

  private wrap(source: any, stuId: number) {
    if (!source.docs) return source;
    source.docs = source.docs.map(d => ({
      ...d._doc,
      isRead: d.hasRead.includes(stuId),
      isExpired: d._doc.deadline ? d._doc.deadline < (+new Date()) : false,
      createTime: this.informService.standardizeTime(d._doc.createTime),
      deadline: this.informService.standardizeTime(d._doc.deadline)
    }));
    return source;
  }

  // TESTED
  @api({
    desc: "某人已读信息，回传至服务器"
  })
  @UseGuards(JwtAuthGuard)
  @Get("read")
  async read(@Query("informId") informId: number,
             @stuId() stuId: number) {
    const inform = (await this.informService.getByInformId(informId))[0] as Inform;
    if (inform.hasRead.includes(stuId)) return false;
    else {
      inform.hasRead.push(stuId);
      return await this.informService.update(inform);
    }
  }

  //TESTED
  @api({
    desc: "获取通知详情"
  })
  @UseGuards(JwtAuthGuard)
  @Get("getInformDetail")
  async getDetail(@Query("informId") informId: number) {
    return this.informService.getByInformId(informId);
  }

  //TESTED
  // @UseGuards(JwtAuthGuard)
  @api({
    desc: "添加发布通知"
  })
  @UseGuards(JwtAuthGuard)
  @Post("addInform")
  async createInform(@inform() inform: Inform,
                     @stuId() stuId: number) {
    await this.informService.insert(inform, stuId);
  }

  @api({
    desc: "根据群组获取信息"
  })
  @UseGuards(JwtAuthGuard)
  @Get("getMyInformByGroup")
  async getMyInform(@Query("groupId") group: number,
                    @stuId() stuId: number) {
    const res = await this.informService.getByGroup(group);
    return this.wrap(res, stuId);
  }

  @api({
    desc: "根据时间获取信息"
  })
  @UseGuards(JwtAuthGuard)
  @Get("getMyInformByDate")
  async getMyInformByDate(@stuId() stuId: number,
                          @Query("date") date: string,
                          @Query("page") page?: number,
                          @Query("order") order: number = 3) {
    // 转一下成yyyy/mm/dd  免得new错误
    const res = await this.informService.getByDate(new Date(date.replace("-", "/")), page, order, stuId);
    return this.wrap(res, stuId);
  }


  @api({
    desc: "上传图片"
  })
  @UseGuards(JwtAuthGuard)
  @Post("uploadImages")
  @UseInterceptors(FilesInterceptor("file"))
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    return await this.uploadService.upload(dirname, files);
  }

  @api({
    desc: "删除图片"
  })
  @UseGuards(JwtAuthGuard)
  @Post("deleteUploadedImage")
  async deleteImage(@Body() body: object) {
    return await this.uploadService.delete(dirname, body["img"]);
  }

  @api({
    desc: "根据排序获取我的所有通知"
  })
  @UseGuards(JwtAuthGuard)
  @Get("getMyInformByOrder")
  async getMyInformByOrder(@Query("order") order: number,
                           @stuId() stuId: number) {
    const res = await this.informService.getMyAllInform(stuId, order);
    return this.wrap(res, stuId);
  }

  // @Get("tt")
  // @logging()
  // async test() {
  //   throw new ResponseError("11");
  // }
}