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

import env from '../../environments';

@Component({
  selector: 'page-contract',
  templateUrl: 'contract.html'
})
export class ContractPage {
  ngVersion = VERSION.full;
  public isCordova: boolean;
  // 币种代码
  changeType: string;
  // 买卖开关
  sellSwitch: string;
  // 买单列表
  contracts: any;
  index: number = 1;

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
    // 进行事件监听
    this.listenForEvents();
  }

  ionViewDidEnter() {
    this.spvNodeProvider.listMineContract();
  }

  ngOnDestroy() {
    this.unListenForEvents();
  }

  private listenForEvents() {
    this.events.subscribe('contract.mine', contracts => {
      this.logger.info(JSON.stringify(contracts));
      this.contracts = contracts;
    });
  }

  private unListenForEvents() {
    this.events.unsubscribe('contract.mine');
  }

  // 选择币种时候,重新加载买卖列表
  switchType(value) {
    this.logger.info('changed: ' + value);
  }

  // 选项卡切换
  onSelect(index) {
    this.logger.info('点击 !' + index);
    this.index = index;
  }
}
