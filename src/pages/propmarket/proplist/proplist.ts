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
import { PropDetailPage } from '../propdetail/propdetail';

import env from '../../../environments';

@Component({
  selector: 'page-proplist',
  templateUrl: './proplist.html'
})
export class PropListPage {
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
  public proplist: any;

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
          this.proplist = this.tranformPropList(gameProps.data);
          this.logger.info("proplist" + JSON.stringify(this.proplist));
        }
      },
      err => {
        this.logger.info(err);
      }
    );
  }

  // 滚动到最下面时候加载新的
  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.logger.info('Async operation has ended');
      infiniteScroll.complete();
    }, 2000);
  }

  gotoProp(propid) {
    this.navCtrl.push(PropDetailPage, {
      prop: propid
    });
  }

  buyProp(prop) {
    let wdb = this.spvNodeProvider.getWdb();
    wdb.rpc
      .execute({
        method: 'order.pay',
        params: [prop.cid, prop.uid, prop.sn, prop.price]
      })
      .then(tx => {
        this.logger.info(tx);
      })
      .catch(err => {
        this.logger.info("bugPropErr:" + err);
      });
  }

  private tranformPropList(props) {
    let propList = [];
    props.forEach(prop => {
      // TODO:应该根据URL从游戏服务器获取.
      // /{"cid":"a6589120-c2ed-11e8-a66f-7b3ab06b2b56","uid":"10000007",
      // "sn":"e1b61920-c2ef-11e8-ae5e-ef505d8de521","pid":"3",
      // "content":"3|3001|20000|区块剑","price":20000,"confirm":100
      if (prop.uid == this.userid && prop.confirm < 6) {
        let nowProp = {
          "propid": prop.sn,
          "img": "assets/img/prop/monkey.jpg",
          "name": "巨力神猿",
          "content": prop.content,
          "price": prop.price,
          "confirm": prop.confirm,
          "pid": prop.pid
        };
        propList.push(nowProp);
      }
    });
    return propList;
  }
}

class GameProps {
  code: number;
  data: any;
}
