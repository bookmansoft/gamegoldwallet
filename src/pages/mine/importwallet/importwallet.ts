import { Component, VERSION, ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import {
  AlertController,
  App,
  Events,
  ModalController,
  NavController,
  NavParams,
  ToastController
} from 'ionic-angular';
import { from } from 'rxjs/observable/from';
import { Logger } from '../../../providers/logger/logger';
import { SpvNodeProvider } from '../../../providers/spvnode/spvnode';
import { TabsPage } from '../../tabs/tabs';
import { MyWalletPage } from '../mywallet/mywallet';
import { SetPasswordPage } from '../setpassword/setpassword';

@Component({
  selector: 'page-importwallet',
  templateUrl: './importwallet.html'
})
export class ImportWalletPage {
  public status: any;
  private backupInput: string;
  private path: string;
  private title: string = '设置您的支付密码';
  private title1: string = '确认您的支付密码';
  private password: string;
  private confirmpwd: string;

  constructor(
    private navCtrl: NavController,
    public toastCtrl: ToastController,
    private spvNodeProvider: SpvNodeProvider,
    private alertCtrl: AlertController,
    private storage: Storage,
    private logger: Logger,
    private app: App,
    public navParams: NavParams
  ) {
    this.status = true;
    this.path = navParams.get('path');
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
            // this.navCtrl.push(MyWalletPage, {});
            this.storage.set('backup', 'backup');
            this.storage.set('firstIn', true);
            if (this.path == 'welcome') {
              this.app.getRootNav().push(TabsPage);
            } else if (this.path == 'mine') {
              this.navCtrl.push(MyWalletPage, {});
            }
          }
        },
        {
          text: '设置密码',
          handler: data => {
            this.setPassword(this.title, 0);
          }
        }
      ]
    });
    foundPrompt.present();
  }

  // 设置支付密码
  setPassword(title: string, index: number) {
    const prompt = this.alertCtrl.create({
      title,
      message: '支付密码若丢失则无法找回，请妥善保管',
      enableBackdropDismiss: false,
      inputs: [
        {
          name: 'password',
          placeholder: '请输入',
          type: 'number'
        }
      ],
      buttons: [
        {
          text: '取消',
          handler: data => {
            this.storage.set('backup', 'backup');
            this.storage.set('firstIn', true);
            if (this.path == 'welcome') {
              this.app.getRootNav().push(TabsPage);
            } else if (this.path == 'mine') {
              this.navCtrl.push(MyWalletPage, {});
            }
          }
        },
        {
          text: '确定',
          role: null,
          handler: data => {
            if (data.password != '') {
              if (index == 0) {
                this.password = data.password;
                this.setPassword(this.title1, 1);
              } else if (index == 1) {
                if (this.password == data.password) {
                  this.storage.set('backup', 'backup');
                  this.storage.set('firstIn', true);
                  if (this.path == 'welcome') {
                    this.app.getRootNav().push(TabsPage);
                  } else if (this.path == 'mine') {
                    this.navCtrl.push(MyWalletPage, {});
                  }
                } else {
                  let toast = this.toastCtrl.create({
                    message: '两次输入的密码不一致！',
                    duration: 2000
                  });
                  toast.present();
                  this.setPassword(this.title, 0);
                }
              }
            } else {
              this.setPassword(this.title, 0);
              let toast = this.toastCtrl.create({
                message: '输入不能为空！',
                duration: 2000
              });
              toast.present();
            }
          }
        }
      ]
    });
    prompt.present();
  }
}
