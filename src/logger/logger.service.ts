import { Injectable, Logger, Scope } from "@nestjs/common";
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;

enum Colors {
  Red = "\x1b[31m",
  Yellow = "\x1b[33m",
  Blue = "\x1b[36m",
  Close = "\x1b[0m"
}

const dateOption: DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "numeric",
  minute: "numeric",
  second: "numeric"
};

@Injectable({ scope: Scope.TRANSIENT })
export class CLogger extends Logger {

  private static picker(color: Colors, method?: string) {
    const str = (method ? `${Colors.Yellow}[${method}]${Colors.Close} ` : ``) + `${color}`;
    switch (color) {
      case Colors.Blue:
        return `${color}[CLogger] - INFO - ${Colors.Close}${new Date().toLocaleString(undefined, dateOption)}  ${str}%s${Colors.Close}`;
      case Colors.Yellow:
        return `${color}[CLogger] - WARN - ${Colors.Close}${new Date().toLocaleString(undefined, dateOption)}  ${str}%s${Colors.Close}`;
      case Colors.Red:
        return `${color}[CLogger] - ERROR - ${Colors.Close}${new Date().toLocaleString(undefined, dateOption)}  ${str}%s${Colors.Close}`;
    }
  }

  _err(msg: any, target?: string) {
    console.log(CLogger.picker(Colors.Red, target), msg);
  }

  _info(msg: any, target?: string) {
    console.log(CLogger.picker(Colors.Blue, target), msg);
  }

  _warn(msg: any, target?: string) {
    console.log(CLogger.picker(Colors.Yellow, target), msg);
  }
}