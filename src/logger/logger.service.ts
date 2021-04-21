import { Injectable, Logger, Scope } from "@nestjs/common";

enum Colors {
  Red = "\x1b[31m",
  Yellow = "\x1b[33m",
  Blue = "\x1b[36m",
  Close = "\x1b[0m"
}

@Injectable({ scope: Scope.TRANSIENT })
export class CLogger extends Logger {

  private static picker(color: Colors, method?: string) {
    if (method == null) return `${color}[CLogger]      - ${new Date().toLocaleString()}    %s${Colors.Close}`;
    return `${color}[CLogger]      - ${Colors.Close}${new Date().toLocaleString()}    ${Colors.Yellow}[${method}] ${color}%s${Colors.Close}`;
  }

  _err(msg: any, target?: string) {
    console.log(CLogger.picker(Colors.Red, target), msg);
  }

  _info(msg: any, target?: string) {
    console.log(CLogger.picker(Colors.Blue, target), msg);
  }
}