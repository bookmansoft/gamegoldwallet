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
import { Api } from '../../providers/api/api';
import { IncomingDataProvider } from '../../providers/incoming-data/incoming-data';
import { PlatformProvider } from '../../providers/platform/platform';
import { SpvNodeProvider } from '../../providers/spvnode/spvnode';
import { WalletProvider } from '../../providers/wallet/wallet';

// pages
import { AmountPage } from '../send/amount/amount';
import { AddressbookAddPage } from '../settings/addressbook/add/add';
import { PropListPage } from './proplist/proplist';

import env from '../../environments';

@Component({
  selector: 'page-propmarket',
  templateUrl: './propmarket.html'
})
export class PropMarketPage {
  public searchInput: string;
  public showCancel: boolean;
  private isCordova: boolean;
  public searchButtonText: string;
  public showButtonText: string;
  public gamelist: any;

  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private platform: PlatformProvider,
    private incomingDataProvider: IncomingDataProvider,
    private events: Events,
    private modalCtrl: ModalController,
    private api: Api,
    private logger: Logger,
    private translate: TranslateService,
    private navParams: NavParams,
    private walletProvider: WalletProvider,
    private spvNodeProvider: SpvNodeProvider
  ) {
    this.isCordova = this.platform.isCordova;
    // TODO:翻译
    this.searchButtonText = '搜索';
    this.showButtonText = '查看';
    // 获取游戏列表数据,目前为json
    this.api
      .get('assets/mock/gamelist.json')
      .toPromise()
      .then(data => {
        this.gamelist = data;
      })
      .catch(e => this.logger.info(e));
  }
  // 用于实时搜索,提示
  onInput(inputEvent: Event) {
    this.logger.info('input21111 !' + this.searchInput);
  }
  // 用于确认搜索
  onSearch() {
    // this.myInput有值时候,进行搜索
    this.logger.info('搜索 !' + this.searchInput);
  }
  // 用于聚焦切换
  onFocusInput() {
    this.logger.info('focusInput !');
  }

  // 滚动到最下面时候加载新的
  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.logger.info('Async operation has ended');
      infiniteScroll.complete();
    }, 2000);
  }

  // 用于跳转到道具页面
  gotoPropList(gameinfo) {
    this.navCtrl.push(PropListPage, {
      game: gameinfo
    });
    this.logger.info('gotoProp');
  }
}
