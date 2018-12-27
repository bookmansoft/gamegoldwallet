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

// providers
import { Api } from '../../../providers/api/api';
import { ExternalLinkProvider } from '../../../providers/external-link/external-link';
import { IncomingDataProvider } from '../../../providers/incoming-data/incoming-data';
import { PlatformProvider } from '../../../providers/platform/platform';
import { SpvNodeProvider } from '../../../providers/spvnode/spvnode';

import { from } from 'rxjs/observable/from';
import { Logger } from '../../../providers/logger/logger';
import { PoundagePage } from '../../settings/poundage/poundage';
@Component({
  selector: 'page-confirmsend',
  templateUrl: './confirmsend.html'
})
export class ConfirmSendPage {
  private pass: string;
  private poundage: string;
  constructor(
    private spvNodeProvider: SpvNodeProvider,
    public toastCtrl: ToastController,
    private navCtrl: NavController,
    private logger: Logger,
    private storage: Storage,
    public alertCtrl: AlertController
  ) {
    this.storage.get('walletpassword').then(val => {
      this.pass = val;
    });
  }

  ionViewWillEnter() {
    this.storage.get('poundage').then(val => {
      this.poundage = val;
    });
  }

  // 发送
  sendGDD() {
    if (this.pass != null) {
      this.showArter();
    } else {
      let toast = this.toastCtrl.create({
        message: '没有设置密码！',
        duration: 2000
      });
      toast.present();
    }
  }

  // 弹出验证密码对话框
  showArter() {
    const prompt = this.alertCtrl.create({
      title: '密码验证',
      message: '',
      enableBackdropDismiss: false,
      inputs: [
        {
          name: 'password',
          placeholder: '请输入钱包密码',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: '取消',
          cssClass: 'alert-btn',
          handler: data => {}
        },
        {
          text: '确定',
          handler: data => {
            if (data.password != '') {
              if (data.password == this.pass) {
                let toast = this.toastCtrl.create({
                  message: '钱包密码正确！',
                  duration: 2000
                });
                toast.present();
              } else {
                let toast = this.toastCtrl.create({
                  message: '钱包密码错误请重新输入！',
                  duration: 2000
                });
                toast.present();
              }
            } else {
              let toast = this.toastCtrl.create({
                message: '钱包密码不能为空！',
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
  // 跳转到费率页
  gotoPoundagePage() {
    this.navCtrl.push(PoundagePage, {});
  }
}
