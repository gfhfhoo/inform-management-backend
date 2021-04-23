import { Injectable } from "@nestjs/common";
import { ResponseError } from "../error/custom.error";
import { HttpCode } from "../enum/httpCode.enum";
import * as fs from "fs";
import * as path from "path";
import { Express } from "express";
import { UtilsService } from "../utils/utils.service";

@Injectable()
export class UploadService {
  constructor(private readonly utils: UtilsService) {
  }

  async upload(dirname: string, files: Express.Multer.File[]) {
    if (!files || files.length == 0) throw new ResponseError("上传失败！检查是否包含所需上传文件", HttpCode.UPLOAD_FAILED);
    const fileNames = [];
    if (!fs.existsSync(dirname)) fs.mkdirSync(dirname);
    for (const file of files) {
      const hash = await this.utils.nextHash();
      const fileName = `${hash}${path.extname(file.originalname)}`;
      const img = fs.createWriteStream(path.join(dirname, fileName));
      try {
        img.write(file.buffer);
      } catch (e) {
        throw new ResponseError("上传失败！", HttpCode.UPLOAD_FAILED);
      }
      fileNames.push(fileName);
    }
    return fileNames;
  }

  async delete(dirname: string, file: string) {
    const imgPath = path.join(dirname, file);
    if (fs.existsSync(imgPath)) fs.rmSync(path.join(dirname, file));
    else throw new ResponseError("删除失败！", HttpCode.ERROR);
  }
}