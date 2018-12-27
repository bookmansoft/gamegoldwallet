import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Logger } from '../../providers/logger/logger';
@Injectable()
export class Utils {
  constructor(private logger: Logger, private translate: TranslateService) {}
  // 转换成千克并保留3位小数点
  public toKgUnit(value: number): string {
    let result = (value / 100000)
      .toFixed(4)
      .substring(0, (value / 100000).toFixed(4).lastIndexOf('.') + 4);
    return result;
  }
}
