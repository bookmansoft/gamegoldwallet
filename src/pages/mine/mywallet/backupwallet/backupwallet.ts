import { Component, VERSION, ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import {
  AlertController,
  Events,
  ModalController,
  NavController,
  ToastController
} from 'ionic-angular';
import { Logger } from '../../../../providers/logger/logger';
import { SpvNodeProvider } from '../../../../providers/spvnode/spvnode';
@Component({
  selector: 'page-backupwallet',
  templateUrl: './backupwallet.html'
})
export class BackupWalletPage {
  public index: number = 0;
  public indexstr: string = '开始备份';
  public mnemonic: string;
  public list: any;
  public checkList;
  public status: any;
  constructor(
    private navCtrl: NavController,
    public toastCtrl: ToastController,
    private spvNodeProvider: SpvNodeProvider,
    private alertCtrl: AlertController,
    private storage: Storage
  ) {
    this.mnemonic = this.spvNodeProvider.getMnemonicPhrase();
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
  ionViewDidEnter() { }
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
        const confirm = this.alertCtrl.create({
          title: '备份完成',
          message: '请务必保管好您的助记词',
          buttons: [
            {
              text: '好的',
              handler: () => {
                this.storage.set('backup', 'backup');
                this.navCtrl.pop();
              }
            }
          ]
        });
        confirm.present();
      } else {
        const confirm = this.alertCtrl.create({
          title: '助记词验证错误',
          message: '请重新尝试验证您的助记词',
          buttons: [
            {
              text: '好的',
              handler: () => { }
            }
          ]
        });
        confirm.present();
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
  // 弹出对话框
  showConfirm() {
    const confirm = this.alertCtrl.create({
      title: '提示',
      message: '确定购买吗？',
      buttons: [
        {
          text: '取消',
          handler: () => { }
        },
        {
          text: '确定',
          handler: () => { }
        }
      ]
    });
    confirm.present();
  }
}
