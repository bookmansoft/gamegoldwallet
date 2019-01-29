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
import { GameMarketPage } from '../gamemarket';

import env from '../../../environments';
import { PropDetailPage } from '../../propmarket/prop-detail/prop-detail';
@Component({
  selector: 'page-buysuccess',
  templateUrl: './buysuccess.html'
})
export class BuysuccessPage {
  private data: any;
  private content: any;
  constructor(
    private alertCtrl: AlertController,
    public navCtrl: NavController,
    public navParams: NavParams,
    private logger: Logger
  ) {
    this.logger.info('>>>传值:' + navParams.get('lable'));
    this.data = navParams.get('lable');
    if (this.data == '1') {
      this.content = {
        headertitle: '购买成功',
        title: '已锁定订单',
        contentone: '向对方BTC钱包转账相应数量的BTC',
        contenttwo: '账完成后Gamegold将自动到账',
        lable: '请及时完成转账，长时间未完成转账，订单将自动取消',
        btn: '查看订单'
      };
    } else if (this.data == '2') {
      this.content = {
        headertitle: '发布成功',
        title: '发布成功，等待购买',
        contentone: '买方下单后，向您的BTC钱包转账足额BTC',
        contenttwo: '交易完成',
        lable:
          '若买方下单后未及时完成转账，订单将自动取消，则您需要重新发布出售',
        btn: '查看我的发布'
      };
    }
  }
  showConfirm() {
    const confirm = this.alertCtrl.create({
      title: '提示',
      message: '确定购买吗？',
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
  // 返回市场
  gotoGamemarket() {
    this.navCtrl.parent.select(2);
  }
}
