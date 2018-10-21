import { Component, VERSION, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  AlertController,
  Events,
  ModalController,
  NavController,
  NavParams
} from 'ionic-angular';
import { Logger } from '../../providers/logger/logger';

// providers
import { ExternalLinkProvider } from '../../providers/external-link/external-link';
import { IncomingDataProvider } from '../../providers/incoming-data/incoming-data';
import { PlatformProvider } from '../../providers/platform/platform';
import { SpvNodeProvider } from '../../providers/spvnode/spvnode';
import { WalletProvider } from '../../providers/wallet/wallet';

// pages
import { PaperWalletPage } from '../paper-wallet/paper-wallet';
import { AmountPage } from '../send/amount/amount';
import { AddressbookAddPage } from '../settings/addressbook/add/add';

import env from '../../environments';

@Component({
  selector: 'page-goldmarket',
  templateUrl: 'goldmarket.html'
})
export class GoldMarketPage {
  ngVersion = VERSION.full;
  public isCordova: boolean;
  // 币种代码
  changeType: string;
  // 买卖开关
  sellSwitch: string;
  // 买单列表
  buylist: any;
  // 卖单列表
  selllist: any;

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
    this.sellSwitch = 'buy';
    this.changeType = 'BTC';

  }
  // 选择币种时候,重新加载买卖列表
  switchType(value) {
    this.logger.info("changed: " + value);
  }
  // 跳转到新增交易对页面
  createContract() {
    this.navCtrl.push("");
  }
}
