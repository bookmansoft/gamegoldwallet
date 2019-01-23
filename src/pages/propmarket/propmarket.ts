import { HttpClient, HttpParams } from '@angular/common/http';
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
import { ScanPage } from '../scan/scan';
import { AmountPage } from '../send/amount/amount';
import { AddressbookAddPage } from '../settings/addressbook/add/add';
import { PropDetailPage } from './prop-detail/prop-detail';
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
  public propList: any;
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
    private spvNodeProvider: SpvNodeProvider,
    private http: HttpClient
  ) {
    this.isCordova = this.platform.isCordova;
    // TODO:翻译
    this.searchButtonText = '搜索';
    this.showButtonText = '查看';
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
  // gotoPropRelease(gameinfo) {
  //   // TODO: 此时应该获取存储的游戏内用户id,目前先固定一个值,便于测试
  //   this.navCtrl.push(PropReleasePage, {
  //     game: gameinfo,
  //     userId: this.firstAddress
  //   });
  //   this.logger.info('页面跳转gotoList' + gameinfo);
  // }

  // 跳转到道具页面
  gotoPropDetail(gameinfo) {
    // TODO: 此时应该获取存储的游戏内用户id,目前先固定一个值,便于测试
    // 这个地址应该存储到storage中.
    this.navCtrl.push(PropDetailPage, {
      game: gameinfo,
      userId: this.firstAddress
    });
    this.logger.info('页面跳转gotoList' + gameinfo);
  }

  // 扫一扫
  gotoScanPage() {
    this.navCtrl.push(ScanPage, {});
  }

  ionViewWillEnter() {
    this.logger.info('ionViewWillEnter');
    this.spvNodeProvider.listMarket();
  }

  ngOnDestroy() {
    this.unListenForEvents();
  }

  private listenForEvents() {
    this.events.subscribe('node:prop.list.market', props => {
      this.logger.info("propmarketlist" + JSON.stringify(props));
      this.tranformPropList(props);
    });
  }

  private unListenForEvents() {
    this.events.unsubscribe('node:prop.list.market');
  }

  /**
   * 转换返回的道具信息为可显示的proplist
   * 从链上获取了在售道具列表,还需要进行下面几步操作.
   * 1.根据cid获取prop对应的cp信息
   * 2.根据cp信息中url,拼接道具propurl,获取厂商prop信息
   * 3.组合链上prop和厂商prop,形成prop的完整信息.
   * @param proplist 链上的在售道具列表
   */
  private async tranformPropList(proplist) {
    this.propList = [];
    for (var i = 0; i < proplist.length; i++) {
      let prop = proplist[i];
      let cp = await this.spvNodeProvider.getCpById(prop.cid);
      prop['cp'] = cp;
      if (!!cp.url) {
        this.http.get(cp.url + '/prop/' + prop.oid).subscribe(
          propDetail => {
            this.logger.info("propDetail: " + JSON.stringify(propDetail));
            prop['detail'] = propDetail;
            this.propList.push(prop);
          },
          error => {
            this.logger.error("get PropDetail error :" + error);
          });
      }
    }
  }
}
