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
import { ExternalLinkProvider } from '../../../providers/external-link/external-link';
import { IncomingDataProvider } from '../../../providers/incoming-data/incoming-data';
import { PlatformProvider } from '../../../providers/platform/platform';
import { SpvNodeProvider } from '../../../providers/spvnode/spvnode';
import { WalletProvider } from '../../../providers/wallet/wallet';

// pages
import { PaperWalletPage } from '../../paper-wallet/paper-wallet';
import { AmountPage } from '../../send/amount/amount';
import { AddressbookAddPage } from '../../settings/addressbook/add/add';

import env from '../../../environments';

@Component({
  selector: 'page-propdetail',
  templateUrl: './propdetail.html'
})
export class PropDetailPage {
  private isCordova: boolean;
  public propid: string;

  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private platform: PlatformProvider,
    private incomingDataProvider: IncomingDataProvider,
    private events: Events,
    private modalCtrl: ModalController,
    private externalLinkProvider: ExternalLinkProvider,
    private logger: Logger,
    private translate: TranslateService,
    private navParams: NavParams,
    private walletProvider: WalletProvider,
    private spvNodeProvider: SpvNodeProvider
  ) {
    this.isCordova = this.platform.isCordova;
    this.propid = this.navParams.get('prop');
  }

  buyProp() {
    this.logger.info('购买商品');
    const foundPrompt = this.alertCtrl.create({
      title: this.translate.instant('购买商品'),
      message: this.translate.instant(
        '确定花费' + '5.0 Gold' + '购买' + '蜃气妖?'
      ),
      buttons: [
        {
          text: this.translate.instant('Cancel'),
          handler: data => {}
        },
        {
          text: this.translate.instant('Ok'),
          handler: data => {
            // data里面包含input的信息.是一个hashmap
            // 熔铸信息已经包含在prop中了.
            this.logger.info('购买成功');
            this.navCtrl.pop();
          }
        }
      ]
    });
    foundPrompt.present();
  }
}
