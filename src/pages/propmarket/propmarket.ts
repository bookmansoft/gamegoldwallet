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
import { PropReleasePage } from './propsrelease/proprelease';

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
  public firstAddress: any;

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
    // // 获取游戏列表数据,目前为json
    // this.api
    //   .get('assets/mock/gamelist.json')
    //   .toPromise()
    //   .then(data => {
    //     this.gamelist = data;
    //   })
    //   .catch(e => this.logger.info(e));
    // this.spvNodeProvider.getCpList().then(cps => {
    //   this.gamelist = cps;
    //   this.logger.info(this.gamelist);
    // });
    // 进行事件监听
    this.listenForEvents();
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
  // 用于跳转到道具发布页面
  gotoPropRelease(gameinfo) {
    // TODO: 此时应该获取存储的游戏内用户id,目前先固定一个值,便于测试
    this.navCtrl.push(PropReleasePage, {
      game: gameinfo,
      userId: this.firstAddress
    });
    this.logger.info('页面跳转gotoList' + gameinfo);
  }
  // 用于跳转到道具页面
  gotoPropList(gameinfo) {
    // TODO: 此时应该获取存储的游戏内用户id,目前先固定一个值,便于测试
    // 这个地址应该存储到storage中.
    this.navCtrl.push(PropListPage, {
      game: gameinfo,
      userId: this.firstAddress
    });
    this.logger.info('页面跳转gotoList' + gameinfo);
  }

  ionViewWillEnter() {
    this.logger.info('ionViewWillEnter');
    this.spvNodeProvider.getCpList();
    this.spvNodeProvider.getFirstAddress();
  }

  ngOnDestroy() {
    this.unListenForEvents();
  }

  private listenForEvents() {
    this.events.subscribe('node:cplist', cps => {
      this.gamelist = this.tranformGameList(cps);
    });
    // 用地址簿的第一个地址作为游戏内ID
    this.events.subscribe('address.first', address => {
      this.firstAddress = address;
    });
  }

  private unListenForEvents() {
    this.events.unsubscribe('node:cplist');
    this.events.unsubscribe('address.first');
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
