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

import env from '../../../environments';

@Component({
  selector: 'page-prop-detail',
  templateUrl: './prop-detail.html'
})
export class PropDetailPage {
  private isCordova: boolean;
  private prop: any;
  public propDetail: any;
  public platformType: string;
  public server: string;
  public advance: string;
  public showButtonText: string;
  public buyButtonText: string;
  public foundButtonText: string;
  public saleButtonText: string;
  public proplist: any;
  public orderList: any;
  public fromCp: boolean;
  public fromMarket: boolean;
  public fromMine: boolean;

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
    private spvNodeProvider: SpvNodeProvider,
    private http: HttpClient
  ) {
    this.isCordova = this.platform.isCordova;
    // 表明页面来源
    this.fromCp = false;
    this.fromMarket = false;
    this.fromMine = false;

    // TODO:翻译
    this.buyButtonText = '购买';
    this.showButtonText = '查看';
    this.foundButtonText = '熔铸';
    this.saleButtonText = '出售';
    // 从参数获取属性
    this.prop = this.navParams.get('prop');
    let paramFrom = null;
    paramFrom = this.navParams.get('fromCp');
    if (!!paramFrom)
      this.fromCp = paramFrom;
    paramFrom = null;
    paramFrom = this.navParams.get('fromMarket');
    if (!!paramFrom)
      this.fromMarket = paramFrom;
    paramFrom = null;
    paramFrom = this.navParams.get('fromMine');
    if (!!paramFrom)
      this.fromCp = paramFrom;
    // 开始事件监听
    this.listenForEvents();

    this.logger.info('get prop:' + JSON.stringify(this.prop));
    this.logger.info('fromCp:' + JSON.stringify(this.fromCp));
    this.logger.info('fromMarket:' + JSON.stringify(this.fromMarket));
  }

  ionViewWillEnter() {
    this.logger.info('prop-detail get Prop Detail From Server');

  }

  ngOnDestroy() {
    this.unListenForEvents();
  }

  private listenForEvents() {

  }

  private unListenForEvents() {

  }

  /**
   * 从CP购买调用道具
   */
  buyPropFromCP() {

  }
  /**
   * 从道具市场购买道具
   */
  buyPropFromMarket() {

  }
  /**
   * 熔铸道具
   */
  foundProp() {

  }

  /**
   * 出售道具
   */
  saleProp() {

  }

  /**
   * 提示购买道具
   */
  showBuyConfirm() {
    let propPrice;
    if (this.fromCp)
      propPrice = this.prop.props_price;
    else if (this.fromMarket)
      propPrice = this.prop.detailOnChain.fixed;
    const confirm = this.alertCtrl.create({
      title: '提示',
      message: `确定以${propPrice}游戏金购买此道具吗？`,
      buttons: [
        {
          text: '取消',
          handler: () => { }
        },
        {
          text: '确定',
          handler: async () => {
            if (this.fromCp) {

            }
            else if (this.fromMarket) {
              let bytx = await this.spvNodeProvider.buyProp(this.prop.detailOnChain, this.prop.detailOnChain.fixed);
              this.logger.info("buy prop tx:" + JSON.stringify(bytx));
            }
            // 退到上一页.
            this.navCtrl.pop();
          }
        }
      ]
    });
    confirm.present();
  }

  /**
   * 提示出售道具
   */
  showSaleConfirm() {
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
  /**
   * 提示熔铸道具
   */
  showFoundConfirm() {
    const confirm = this.alertCtrl.create({
      title: '提示',
      message: '确定熔铸道具吗？',
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
