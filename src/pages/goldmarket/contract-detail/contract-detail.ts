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
  selector: 'page-contract-detail',
  templateUrl: './contract-detail.html'
})
export class ContractDetailPage {
  private isCordova: boolean;
  // 余额
  public balance: any;
  // 兑换数量
  public ggAmount: number;
  // 兑换btc数量
  public btcAmount: number;
  // 兑换btc地址
  public btcAddress: string;

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
    // 进行事件监听
    this.listenForEvents();
    this.spvNodeProvider.getBalance();
  }

  ngOnDestroy() {
    this.unListenForEvents();
  }

  private listenForEvents() {
    this.events.subscribe('node:balance', balance => {
      this.balance = balance;
    });
  }

  private unListenForEvents() {
    this.events.unsubscribe('node:balance');
  }

  createContract() {
    this.logger.info('创建交易对');
    // TODO:判断余额,余额满足才行.
    // TODO:判断btc地址合法性.
    const foundPrompt = this.alertCtrl.create({
      title: this.translate.instant('创建交易对'),
      message: this.translate.instant(
        '确定花费' + this.ggAmount + 'GameGold' + '兑换' + this.btcAmount + 'Btc'
      ),
      buttons: [
        {
          text: this.translate.instant('Cancel'),
          handler: data => { }
        },
        {
          text: this.translate.instant('Ok'),
          handler: data => {
            this.spvNodeProvider.createContract(this.ggAmount, this.btcAmount, this.btcAddress)
            // .then(contract => {
            //   this.logger.info(contract);

            // })
            // .catch(err => {
            //   this.logger.info(err);
            // });
            this.navCtrl.pop();
          }
        }
      ]
    });
    foundPrompt.present();
  }
}
