import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ResponseInterceptor } from "./interceptor/response.interceptor";
import { ErrorFilter } from "./interceptor/error.filter";
import { CLogger } from "./logger/logger.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  // app.useGlobalGuards()
  // app.useLogger(new CLogger());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(
    new ErrorFilter()
  );

  await app.listen(3000);
}

bootstrap().then(() => {
  new CLogger().log(`our server is successfully running!`);
});
