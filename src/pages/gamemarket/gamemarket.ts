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
import { AddressbookAddPage } from '../settings/addressbook/add/add';

import env from '../../environments';

@Component({
  selector: 'page-gamemarket',
  templateUrl: 'gamemarket.html'
})
export class GameMarketPage {
  ngVersion = VERSION.full;
  public isCordova: boolean;
  // 背包中道具列表
  propList: any;
  // 厂商列表
  cpList: any;

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
  }

  ionViewDidLoad() {
    this.logger.info('ionViewDidLoad PacksackPage');
  }

  ionViewWillEnter() {
    // 订阅产品列表数据
    this.events.subscribe('prop.list', propList => {
      this.propList = propList;
      this.logger.info(propList);
      // for test -- prop 本身是一个特殊的tx.
      let prop1 = {
        cid: 34343,
        pid: '23l423',
        gold: 2000,
        current: {
          rev:
            '3b837cf4ca6d53c4fccaae22b58d49c16a7f6a17589e2ff73c03f1b3f84da039',
          index: 3
        }
      };
      let prop2 = {
        cid: 1114343,
        pid: '2223l423',
        gold: 4000,
        current: {
          rev:
            '3b837cf4ca6d53c4fccaae22b58d49c16a7f6a17589e2ff73c03f1b3f84da039',
          index: 3
        }
      };
      // this.propList = new Array();
      this.propList.push(prop1);
      this.propList.push(prop2);
    });
    // 订阅熔铸结果
    this.events.subscribe('prop.found', tx => {});
    // 订阅厂商列表
    this.events.subscribe('node:cplist', cpList => {
      this.cpList = cpList;
    });
    // 订阅厂商列表
    this.events.subscribe('prop.sale', tx => {});

    // 查询道具
    // this.spvNodeProvider.getPropList();
  }

  ionViewWillLeave() {
    // 取消订阅
    this.events.unsubscribe('prop.list');
    this.events.unsubscribe('prop.found');
    this.events.unsubscribe('node:cplist');
    this.events.unsubscribe('prop.sale');
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
}
