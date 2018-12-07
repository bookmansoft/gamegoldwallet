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
  public list: any;
  public checkList;
  public status: any;
  constructor(
    private navCtrl: NavController,
    public toastCtrl: ToastController
  ) {
    this.checkList = [];
    this.status = false;
    this.list = this.mnemonic.split(' ');
    for (let i = 0, len = this.list.length; i < len; i++) {
      let currentRandom = Math.floor(Math.random() * (len - 1));
      let current = this.list[i];
      this.list[i] = this.list[currentRandom];
      this.list[currentRandom] = current;
    }
  }
  controlPage() {
    if (this.index == 0) {
      this.index = 1;
      this.indexstr = '已按顺序记下助记词';
    } else if (this.index == 1) {
      this.index = 2;
      this.indexstr = '确定';
      this.status = true;
    } else if (this.index == 2) {
      let checkStr = this.checkList.join('');
      let mnem = this.mnemonic.replace(/\s*/g, '');
      if (checkStr == mnem) {
        let toast = this.toastCtrl.create({
          message: '请务必保管好您的助记词！',
          duration: 2000
        });
        toast.present();
      } else {
        let toast = this.toastCtrl.create({
          message: '请重新尝试验证您的助记词！',
          duration: 2000
        });
        toast.present();
      }
    }
  }
  /**
   * 选中的文字
   * @param items
   */
  onClickitems(items) {
    if (this.checkList.length < this.list.length) {
      this.checkList.push(items);
      if (this.checkList.length == this.list.length) {
        this.status = false;
      }
    } else {
      let toast = this.toastCtrl.create({
        message: '助记词已全部选择完毕！',
        duration: 2000
      });
      toast.present();
    }
  }
  /**
   * 清空数组
   */
  onClearItems() {
    this.checkList.length = 0;
    this.status = true;
  }
}
