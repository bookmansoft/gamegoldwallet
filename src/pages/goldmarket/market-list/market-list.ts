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

import env from '../../../environments';
import { PropDetailPage } from '../../propmarket/propdetail/propdetail';

@Component({
  selector: 'page-market-list',
  templateUrl: './market-list.html'
})
export class MarketListPage {
  private isCordova: boolean;
  private game: any;
  public propType: string;
  public platformType: string;
  public server: string;
  public advance: string;
  public showButtonText: string;
  public buyButtonText: string;
  public foundButtonText: string;
  public saleButtonText: string;
  public proplist: any;
  public orderList: any;

  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private platform: PlatformProvider,
    private incomingDataProvider: IncomingDataProvider,
    private events: Events,
    private modalCtrl: ModalController,
    private externalLinkProvider: ExternalLinkProvider,
    private logger: Logger,
    private api: Api,
    private translate: TranslateService,
    private navParams: NavParams,
    private walletProvider: WalletProvider,
    private spvNodeProvider: SpvNodeProvider
  ) {
    this.isCordova = this.platform.isCordova;
    this.game = this.navParams.get('game');
    this.logger.info(JSON.stringify(this.game));
    // TODO:翻译
    this.buyButtonText = '购买';
    this.listenForEvents();
  }

  // 滚动到最下面时候加载新的
  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.logger.info('Async operation has ended');
      infiniteScroll.complete();
    }, 2000);
  }

  buySaleProp(prop) {
    let wdb = this.spvNodeProvider.getWdb();
    wdb.rpc
      .execute({
        method: 'prop.buy',
        params: [prop.propid, prop.fixed]
      })
      .then(tx => {
        this.logger.info(tx);
      })
      .catch(err => {
        this.logger.info("bugPropErr:" + err);
      });
    this.navCtrl.pop();
  }


  private tranformPropList(props) {
    let saleList = [];
    props.forEach(prop => {
      let saleProp = {
        "propid": prop.pid,
        "cid": prop.cid,
        "oid": prop.oid,
        "current": prop.current,
        "gold": prop.gold,  // 含金量
        "price": prop.price,// 当前价格
        "fixed": prop.fixed, // 最高价-一口价
        "bid": prop.bid,// 起拍价
        "times": prop.times,// 竞拍次数
        "status": prop.status,
        "period": prop.period,
        "addr": prop.addr,
        "img": "assets/img/prop/solider.jpg"
      };
      saleList.push(saleProp);
    });
    return saleList;
  }

  ionViewWillEnter() {
    this.logger.info("ionViewWillEnter");
    this.spvNodeProvider.listMarket(this.game.cpid);
  }

  ngOnDestroy() {
    this.unListenForEvents();
  }

  private listenForEvents() {
    this.events.subscribe('prop.list.market', props => {
      this.logger.info("get market props " + JSON.stringify(props));
      this.proplist = this.tranformPropList(props);
      this.logger.info("tranformPropList " + JSON.stringify(this.proplist));
    });
  }

  private unListenForEvents() {
    this.events.unsubscribe('prop.list.market');
  }
}