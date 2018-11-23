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
import { MarketListPage } from './market-list/market-list';
import { SellingDetailsPage } from './sellingdetails/sellingdetails';

import env from '../../environments';

@Component({
  selector: 'page-gamemarket',
  templateUrl: 'gamemarket.html'
})
export class GameMarketPage {
  ngVersion = VERSION.full;
  public isCordova: boolean;
  public showButtonText: string;
  public gamelist: any;

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
    this.showButtonText = '查看';
    this.logger.info('ionViewWillEnter' + '221');
    // 进行事件监听
    this.listenForEvents();
  }

  ionViewWillEnter() {
    this.logger.info('ionViewWillEnter' + '221');
    this.spvNodeProvider.getCpList();
  }

  ngOnDestroy() {
    this.unListenForEvents();
  }

  private listenForEvents() {
    this.events.subscribe('node:cplist', cps => {
      this.gamelist = this.tranformGameList(cps);
    });
  }

  private unListenForEvents() {
    this.events.unsubscribe('node:cplist');
  }

  // 用于跳转到道具市场页面
  gotoMaketList(gameinfo) {
    this.navCtrl.push(MarketListPage, {
      game: gameinfo
    });
  }
  // 用于跳转到出售详情页面
  gotoSellingDetails(gameinfo) {
    this.navCtrl.push(SellingDetailsPage, {
      game: gameinfo
    });
  }

  // 显示熔铸的确认窗
  showFound(prop: any) {
    const defaultValue = 1;
    const foundPrompt = this.alertCtrl.create({
      title: this.translate.instant('Warning'),
      message: this.translate.instant('Are you sure you want Found this?'),
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
            this.spvNodeProvider.foundProp(prop);
          }
        }
      ]
    });
    foundPrompt.present();
  }

  // 显示拍卖的提示窗
  showSale(prop: any) {
    const defaultValue = 1;
    const foundPrompt = this.alertCtrl.create({
      title: this.translate.instant('Warning'),
      message: this.translate.instant('Are you sure you want Found this?'),
      inputs: [
        {
          // 保底价
          name: 'minValue',
          placeholder: '1',
          type: 'number',
          value: '1'
        },
        {
          // 一口价
          name: 'maxValue',
          placeholder: '12',
          type: 'number',
          value: '12'
        }
      ],
      buttons: [
        {
          text: this.translate.instant('Cancel'),
          handler: data => {}
        },
        {
          text: this.translate.instant('Ok'),
          handler: data => {
            // data里面包含input的信息.是一个hashmap
            this.logger.info('minValue' + data.minValue);
            this.logger.info('maxValue' + data.maxValue);
            this.spvNodeProvider.saleProp(prop, data.maxValue);
          }
        }
      ]
    });
    foundPrompt.present();
  }

  // 转换返回的cp为可显示的gamelist
  // TODO:cplist的modal.
  private tranformGameList(cplist) {
    let gameList = [];
    if (cplist && cplist.list) {
      cplist.list.forEach(cp => {
        // TODO:应该根据URL从游戏服务器获取.
        // boss特殊处理,不显示
        // this.logger.info(cp);
        if (cp.cid != 'xxxxxxxx-game-gold-boss-xxxxxxxxxxxx') {
          let nowGame = {
            cpid: cp.cid,
            img:
              'http://img.d.cn/netgame/hdlogo/4903_1510723591714_DMyLJKIQ.png',
            title: cp.name,
            subtitle: '人有千面，妖具万相。 极具灵韵之美，新生代国创卡牌妖神记',
            version: '3.1.1'
          };
          gameList.push(nowGame);
        }
      });
    }
    return gameList;
  }
}
