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

@Component({
  selector: 'page-prop-detail',
  templateUrl: './prop-detail.html'
})
export class PropDetailPage {
  private isCordova: boolean;
  private game: any;
  private userid: string;
  private gameid: string;
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
    this.userid = this.navParams.get('userId');
    // this.logger.info(this.gameid);

    // TODO:翻译
    this.buyButtonText = '购买';
    this.showButtonText = '查看';
    this.foundButtonText = '熔铸';
    this.saleButtonText = '出售';
    // 获取游戏列表数据,目前为json
    // this.api
    //   .get('assets/mock/proplist.json')
    //   .toPromise()
    //   .then(data => {
    //     this.proplist = data;
    //   })
    //   .catch(e => this.logger.info(e));
    // 从模拟游戏获取游戏列表数据,目前为json
    this.api.get<GameProps>('order/list/1', {}, undefined, true).subscribe(
      response => {
        if (response) {
          let strings = JSON.stringify(response);
          this.logger.info(response);
          let gameProps: any = JSON.parse(strings);
          this.orderList = this.tranformOrderList(gameProps.data);
          // this.logger.info("orderlist" + JSON.stringify(this.orderList));
        }
      },
      err => {
        this.logger.info(err);
      }
    );
    this.listenForEvents();
  }

  // 滚动到最下面时候加载新的
  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.logger.info('Async operation has ended');
      infiniteScroll.complete();
    }, 2000);
  }

  buyProp(prop) {
    let wdb = this.spvNodeProvider.getWdb();
    wdb.rpc
      .execute({
        method: 'order.pay',
        params: [prop.cid, this.userid, prop.propid, prop.price]
        // params: ["4e2eee20-d84d-11e8-8f4f-554ee13bb529", "10008", "asdasgasdgasd", 30000]
      })
      .then(tx => {
        this.navCtrl.pop();
      })
      .catch(err => {
        this.logger.info('bugPropErr:' + err);
      });
  }

  foundProp(prop) {
    let wdb = this.spvNodeProvider.getWdb();
    wdb.rpc
      .execute({
        method: 'prop.found',
        params: [prop.current.rev, prop.current.index]
      })
      .then(tx => {
        this.logger.info(tx);
      })
      .catch(err => {
        this.logger.info('found PropErr:' + err);
      });
    this.navCtrl.pop();
  }

  saleProp(prop) {
    let wdb = this.spvNodeProvider.getWdb();
    let price = prop.price * 2;
    wdb.rpc
      .execute({
        method: 'prop.sale',
        params: [prop.current.rev, prop.current.index, price]
      })
      .then(tx => {
        this.logger.info(tx);
      })
      .catch(err => {
        this.logger.info('salePropErr:' + err);
      });
    this.navCtrl.pop();
  }

  private tranformOrderList(orders) {
    let orderList = [];
    orders.forEach(order => {
      // TODO:应该根据URL从游戏服务器获取.
      // /{"cid":"a6589120-c2ed-11e8-a66f-7b3ab06b2b56","uid":"10000009",
      // "sn":"e1b61920-c2ef-11e8-ae5e-ef505d8de521","pid":"3",
      // "content":"3|3001|20000|区块剑","price":20000,"confirm":100
      this.logger.info('order' + JSON.stringify(order));
      if (order.uid == this.userid && order.confirm < 6) {
        orderList.push({
          propid: order.sn,
          cid: order.cid,
          img: 'assets/img/prop/monkey.jpg',
          name: '巨力神猿',
          content: order.content,
          price: order.price,
          confirm: order.confirm,
          pid: order.pid
        });
      }
    });
    return orderList;
  }

  private tranformPropList(props) {
    let propList = [];
    props.forEach(prop => {
      propList.push({
        propid: prop.pid,
        cid: prop.cid,
        oid: prop.oid,
        img: 'assets/img/prop/nightman.jpg',
        name: '区块剑',
        price: prop.gold,
        status: prop.status,
        cp: prop.cp,
        current: prop.current
      });
    });
    return propList;
  }

  ionViewWillEnter() {
    this.logger.info('ionViewWillEnter');
    this.spvNodeProvider.getPropList();
  }

  ngOnDestroy() {
    this.unListenForEvents();
  }

  private listenForEvents() {
    this.events.subscribe('prop.list', props => {
      this.proplist = this.tranformPropList(props);
      this.logger.info('get props ' + JSON.stringify(this.proplist));
    });
  }

  private unListenForEvents() {
    this.events.unsubscribe('prop.list');
  }

  showConfirm() {
    const confirm = this.alertCtrl.create({
      title: '提示',
      message: '确定以0.05游戏金购买此道具吗？',
      buttons: [
        {
          text: '取消',
          handler: () => { }
        },
        {
          text: '确定',
          handler: () => { }
        }
      ]
    });
    confirm.present();
  }
}

class GameProps {
  code: number;
  data: any;
}
