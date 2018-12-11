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

import { Logger } from '../../../providers/logger/logger';
@Component({
  selector: 'page-confirmsend',
  templateUrl: './confirmsend.html'
})
export class ConfirmSendPage {
  private pass: string;
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

  // 发送
  sendGDD() {
    const prompt = this.alertCtrl.create({
      title: '密码验证',
      message: '',
      enableBackdropDismiss: false,
      inputs: [
        {
          name: 'password',
          placeholder: '请输入钱包密码',
          type: 'number'
        }
      ],
      buttons: [
        {
          text: '取消',
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
}
