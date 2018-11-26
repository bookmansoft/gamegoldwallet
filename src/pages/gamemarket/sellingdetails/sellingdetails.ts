import { Component, VERSION, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  AlertController,
  Events,
  ModalController,
  NavController,
  NavParams
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
import { AmountPage } from '../../send/amount/amount';
import { AddressbookAddPage } from '../../settings/addressbook/add/add';
import { BuysuccessPage } from '../buysuccess/buysuccess';

import env from '../../../environments';
import { PropDetailPage } from '../../propmarket/propdetail/propdetail';
@Component({
  selector: 'page-sellingdetails',
  templateUrl: './sellingdetails.html'
})
export class SellingDetailsPage {
  constructor(
    private alertCtrl: AlertController,
    private navCtrl: NavController
  ) {}
  showConfirm() {
    const confirm = this.alertCtrl.create({
      title: '提示',
      message: '确定购买吗？',
      buttons: [
        {
          text: '取消',
          handler: () => {}
        },
        {
          text: '确定',
          handler: () => {
            this.navCtrl.push(BuysuccessPage, {});
          }
        }
      ]
    });
    confirm.present();
  }
}
