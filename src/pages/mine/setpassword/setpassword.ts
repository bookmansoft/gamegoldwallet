import { Component, VERSION, ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import {
  Events,
  ModalController,
  NavController,
  ToastController
} from 'ionic-angular';
import { Logger } from '../../../providers/logger/logger';

// providers
import { Api } from '../../../providers/api/api';
import { ExternalLinkProvider } from '../../../providers/external-link/external-link';
import { IncomingDataProvider } from '../../../providers/incoming-data/incoming-data';
import { PlatformProvider } from '../../../providers/platform/platform';
import { SpvNodeProvider } from '../../../providers/spvnode/spvnode';
import { WalletProvider } from '../../../providers/wallet/wallet';

// pages
import { MyWalletPage } from '../../mine/mywallet/mywallet';
import { AmountPage } from '../../send/amount/amount';
import { AddressbookAddPage } from '../../settings/addressbook/add/add';

import env from '../../../environments';
import { PropDetailPage } from '../../propmarket/prop-detail/prop-detail';
@Component({
  selector: 'page-setpassword',
  templateUrl: './setpassword.html'
})
export class SetPasswordPage {
  constructor(
    private spvNodeProvider: SpvNodeProvider,
    public toastCtrl: ToastController,
    private navCtrl: NavController,
    private logger: Logger,
    private storage: Storage
  ) { }
  /**
   * 获取输入
   * @param password
   * @param password1
   */
  getInput(password: HTMLInputElement, password1: HTMLInputElement) {
    if (password.value != '' && password1.value != '') {
      if (password.value == password1.value) {
        this.storage.set('walletpassword', password.value);
        this.gotoMyWallet();
      } else {
        let toast = this.toastCtrl.create({
          message: '确认密码和钱包密码不一致，请重新输入！',
          duration: 2000
        });
        toast.present();
      }
    } else {
      let toast = this.toastCtrl.create({
        message: '请输入钱包密码和确认钱包密码！',
        duration: 2000
      });
      toast.present();
    }
  }

  ionViewDidEnter() {
    /** this.spvNodeProvider.createWallet(opt); */
  }
  // 跳转我的钱包
  gotoMyWallet() {
    this.navCtrl.push(MyWalletPage, {});
  }
}
