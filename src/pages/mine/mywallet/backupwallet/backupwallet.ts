import { Component, VERSION, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  Events,
  ModalController,
  NavController,
  ToastController
} from 'ionic-angular';
import { Logger } from '../../../../providers/logger/logger';
@Component({
  selector: 'page-backupwallet',
  templateUrl: './backupwallet.html'
})
export class BackupWalletPage {
  public index: number = 0;
  public indexstr: string = '开始备份';
  public mnemonic: string = '去 的 发 个 好 就 看 吗 你 吧 了 赔';
  constructor(private navCtrl: NavController) {}
  controlPage() {
    if (this.index == 0) {
      this.index = 1;
      this.indexstr = '已按顺序记下助记词';
    } else if (this.index == 1) {
      this.index = 2;
      this.indexstr = '确定';
    }
  }
}
