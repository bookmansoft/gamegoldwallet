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
import { Logger } from '../../../providers/logger/logger';
import { SpvNodeProvider } from '../../../providers/spvnode/spvnode';
import { SetPasswordPage } from '../setpassword/setpassword';

@Component({
  selector: 'page-importwallet',
  templateUrl: './importwallet.html'
})
export class ImportWalletPage {
  public status: any;
  private backupInput: string;
  constructor(
    private navCtrl: NavController,
    public toastCtrl: ToastController,
    private spvNodeProvider: SpvNodeProvider,
    private alertCtrl: AlertController,
    private storage: Storage,
    private logger: Logger
  ) {
    this.status = true;
  }
  // 监听助记词输入
  onChange() {
    this.logger.info('>>>监听输入变化！' + this.backupInput);
    this.logger.info('>>>输入长度：' + this.backupInput.length);
    if (this.backupInput.length == 23) {
      let num = this.backupInput.trim().split(' ').length - 1;
      this.logger.info('>>>空格：' + num);
      if (num != 11) {
        let toast = this.toastCtrl.create({
          message: '格式错误，请确保文字之间有一个空格隔开！',
          duration: 2000
        });
        toast.present();
      } else {
        this.status = false;
      }
    } else {
      this.status = true;
    }
  }

  // 提交助记词
  submitBackup() {
    this.navCtrl.push(SetPasswordPage, {});
  }
}
