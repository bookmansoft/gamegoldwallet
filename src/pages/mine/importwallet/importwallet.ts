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
import { from } from 'rxjs/observable/from';
import { Logger } from '../../../providers/logger/logger';
import { SpvNodeProvider } from '../../../providers/spvnode/spvnode';
import { MyWalletPage } from '../mywallet/mywallet';
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
    if (this.backupInput.length == 23) {
      let num = this.backupInput.trim().split(' ').length - 1;
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
    // this.navCtrl.push(SetPasswordPage, {});
    if (this.spvNodeProvider.setMnemonic(this.backupInput)) {
      this.showFound();
    } else {
      const foundPrompt = this.alertCtrl.create({
        message:
          '您输入的助记词不正确，请重新输入，请确保文字之间有一个空格隔开',
        buttons: [
          {
            text: '好的',
            handler: data => {}
          }
        ]
      });
      foundPrompt.present();
    }
  }

  // 显示导入钱包确认窗
  showFound() {
    const foundPrompt = this.alertCtrl.create({
      title: '是否要设置支付密码',
      message:
        '设置支付密码后，您的转账、支付等操作将需要输入支付密码。（支付密码若丢失则无法找回，请妥善保管）',
      buttons: [
        {
          text: '以后再说',
          handler: data => {
            this.navCtrl.push(MyWalletPage, {});
          }
        },
        {
          text: '设置密码',
          handler: data => {}
        }
      ]
    });
    foundPrompt.present();
  }
}
