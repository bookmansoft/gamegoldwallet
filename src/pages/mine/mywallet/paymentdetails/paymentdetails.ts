import { Component, VERSION, ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import {
  Events,
  ModalController,
  Navbar,
  NavController,
  NavParams,
  ToastController
} from 'ionic-angular';
import { from } from 'rxjs/observable/from';
import { Logger } from '../../../../providers/logger/logger';
import { SpvNodeProvider } from '../../../../providers/spvnode/spvnode';
import { BillingDetailsPage } from '../billingdetails/billingdetails';
@Component({
  selector: 'page-paymentdetails',
  templateUrl: './paymentdetails.html'
})
export class PaymentDetailsPage {
  public datas: any[];
  constructor(
    private navCtrl: NavController,
    private logger: Logger,
    public toastCtrl: ToastController,
    private events: Events,
    private spvNodeProvider: SpvNodeProvider,
    private storage: Storage
  ) {
    this.datas = [
      {
        month: '2018-11',
        info: [
          {
            date: '2018-10-01   15:00:00',
            detail: '支出 - 购买道具',
            amount: '-30.00',
            type: 0,
            order: '12121110225546227811220',
            note: '换取道具',
            balance: 1020.0
          },
          {
            date: '2018-10-01   15:00:00',
            detail: '收入 - 系统奖励',
            amount: '+130.00',
            type: 1,
            order: '12121110225546227811220',
            note: '转出道具',
            balance: 1050.0
          },
          {
            date: '2018-10-01   15:00:00',
            detail: '收入 - 卖出道具',
            amount: '+150.00',
            type: 1,
            order: '12121110225546227811220',
            note: '转出道具',
            balance: 920.0
          }
        ]
      },
      {
        month: '2018-10',
        info: [
          {
            date: '2018-10-01   15:00:00',
            detail: '支出 - 购买道具',
            amount: '-30.00',
            type: 0,
            order: '12121110225546227811220',
            note: '换取道具',
            balance: 770.0
          },
          {
            date: '2018-10-01   15:00:00',
            detail: '收入 - 卖出道具',
            amount: '+130.00',
            type: 1,
            order: '12121110225546227811220',
            note: '转出道具',
            balance: 800.0
          }
        ]
      },
      {
        month: '2018-09',
        info: [
          {
            date: '2018-10-01   15:00:00',
            detail: '支出 - 购买道具',
            amount: '-30.00',
            type: 0,
            order: '12121110225546227811220',
            note: '换取道具',
            balance: 670.0
          },
          {
            date: '2018-10-01   15:00:00',
            detail: '收入 - 卖出道具',
            amount: '+130.00',
            type: 1,
            order: '12121110225546227811220',
            note: '转出道具',
            balance: 700.0
          }
        ]
      },
      {
        month: '2018-08',
        info: [
          {
            date: '2018-10-01   15:00:00',
            detail: '支出 - 购买道具',
            amount: '-30.00',
            type: 0,
            order: '12121110225546227811220',
            note: '换取道具',
            balance: 570.0
          },
          {
            date: '2018-10-01   15:00:00',
            detail: '收入 - 卖出道具',
            amount: '+130.00',
            type: 1,
            order: '12121110225546227811220',
            note: '转出道具',
            balance: 600.0
          }
        ]
      },
      {
        month: '2018-07',
        info: [
          {
            date: '2018-10-01   15:00:00',
            detail: '支出 - 购买道具',
            amount: '-30.00',
            type: 0,
            order: '12121110225546227811220',
            note: '换取道具',
            balance: 470.0
          },
          {
            date: '2018-10-01   15:00:00',
            detail: '收入 - 卖出道具',
            amount: '+130.00',
            type: 1,
            order: '12121110225546227811220',
            note: '转出道具',
            balance: 500.0
          }
        ]
      }
    ];
  }
  // 跳转到流水详情
  gotoBillingDetailsPage(item: any) {
    this.logger.info('>>>流水：' + JSON.stringify(item));
    this.navCtrl.push(BillingDetailsPage, { data: item });
  }
}
