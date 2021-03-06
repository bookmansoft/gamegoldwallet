import { Component, VERSION, ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import {
  AlertController,
  Events,
  LoadingController,
  ModalController,
  NavController,
  NavParams,
  ToastController
} from 'ionic-angular';

// providers
import { Api } from '../../../providers/api/api';
import { ExternalLinkProvider } from '../../../providers/external-link/external-link';
import { IncomingDataProvider } from '../../../providers/incoming-data/incoming-data';
import { PlatformProvider } from '../../../providers/platform/platform';
import { SpvNodeProvider } from '../../../providers/spvnode/spvnode';

import { JsonPipe } from '@angular/common';
import { from } from 'rxjs/observable/from';
import { Logger } from '../../../providers/logger/logger';
import { PoundagePage } from '../../settings/poundage/poundage';
import { ConFirmResultPage } from '../confirmresult/confirmresult';

@Component({
  selector: 'page-confirmsend',
  templateUrl: './confirmsend.html'
})
export class ConfirmSendPage {
  private pass: string;
  private poundage: string;
  private address: string;
  private pay: number;
  private note: string;

  constructor(
    private spvNodeProvider: SpvNodeProvider,
    public toastCtrl: ToastController,
    private navCtrl: NavController,
    private logger: Logger,
    private storage: Storage,
    public alertCtrl: AlertController,
    public navParams: NavParams,
    private events: Events,
    public loadingCtrl: LoadingController
  ) {
    this.storage.get('walletpassword').then(val => {
      this.pass = val;
    });
    this.address = this.navParams.get('toAddress');
    this.note = this.navParams.get('note');
    this.pay = this.navParams.get('pay');
  }

  ionViewWillEnter() {
    this.storage.get('poundage').then(val => {
      this.poundage = val;
    });
    // 可以不要,与leave成对使用
    // this.events.subscribe('tx.send', tx => {
    //   this.logger.info('>>>发送游戏金结果：' + JSON.stringify(tx));
    // });
  }

  ionViewDidEnter() {}

  ionViewWillLeave() {
    // 可以不要,
    // this.events.unsubscribe('tx.send');
  }

  // 发送
  sendGDD() {
    if (this.pass != null) {
      this.showArter();
    } else {
      const loader = this.loadingCtrl.create({
        content: '正在发送，请稍等...'
      });
      loader.present();
      this.spvNodeProvider
        .sendGGD(this.address, this.pay * 100000)
        .then(ret => {
          // 这里直接就能获取,不大需要注册tx.send事件
          loader.dismiss();
          if (ret.code == 0) {
            this.navCtrl.push(ConFirmResultPage, {
              resutl: 1
            });
          } else {
            this.navCtrl.push(ConFirmResultPage, {
              resutl: 0,
              content: ret.msg
            });
          }
        });
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
                const loader = this.loadingCtrl.create({
                  content: '正在发送，请稍等...'
                });
                loader.present();
                this.spvNodeProvider
                  .sendGGD(this.address, this.pay * 100000)
                  .then(ret => {
                    loader.dismiss();
                    // 这里直接就能获取,不大需要注册tx.send事件
                    if (ret.code == 0) {
                      this.navCtrl.push(ConFirmResultPage, {
                        resutl: 1
                      });
                    } else {
                      this.navCtrl.push(ConFirmResultPage, {
                        resutl: 0,
                        content: ret.msg
                      });
                    }
                  });
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
