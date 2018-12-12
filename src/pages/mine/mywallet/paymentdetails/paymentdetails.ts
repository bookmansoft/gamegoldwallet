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
            amount: '-30',
            type: 0
          },
          {
            date: '2018-10-01   15:00:00',
            detail: '支出 - 购买道具',
            amount: '130',
            type: 1
          },
          {
            date: '2018-10-01   15:00:00',
            detail: '支出 - 购买道具',
            amount: '150',
            type: 1
          }
        ]
      },
      {
        month: '2018-10',
        info: [
          {
            date: '2018-10-01   15:00:00',
            detail: '支出 - 购买道具',
            amount: '-30',
            type: 0
          },
          {
            date: '2018-10-01   15:00:00',
            detail: '支出 - 购买道具',
            amount: '130',
            type: 1
          }
        ]
      },
      {
        month: '2018-09',
        info: [
          {
            date: '2018-10-01   15:00:00',
            detail: '支出 - 购买道具',
            amount: '-30',
            type: 0
          },
          {
            date: '2018-10-01   15:00:00',
            detail: '支出 - 购买道具',
            amount: '130',
            type: 1
          }
        ]
      },
      {
        month: '2018-08',
        info: [
          {
            date: '2018-10-01   15:00:00',
            detail: '支出 - 购买道具',
            amount: '-30',
            type: 0
          },
          {
            date: '2018-10-01   15:00:00',
            detail: '支出 - 购买道具',
            amount: '130',
            type: 1
          }
        ]
      },
      {
        month: '2018-07',
        info: [
          {
            date: '2018-10-01   15:00:00',
            detail: '支出 - 购买道具',
            amount: '-30',
            type: 0
          },
          {
            date: '2018-10-01   15:00:00',
            detail: '支出 - 购买道具',
            amount: '130',
            type: 1
          }
        ]
      }
    ];
    logger.info('>>>输出：' + this.datas);
  }

  getKeys(item) {
    return Object.keys(item);
  }
}
