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
import { Logger } from '../../../providers/logger/logger';
import { SpvNodeProvider } from '../../../providers/spvnode/spvnode';
import { AllPropsPage } from './allprops/allprops';
import { PropsBillPage } from './propsbill/propsbill';
import { SalePropsPage } from './saleprops/saleprops';

@Component({
  selector: 'page-myprops',
  templateUrl: './myprops.html'
})
export class MyPropsPage {
  private datas: any;
  constructor(
    private navCtrl: NavController,
    private logger: Logger,
    public toastCtrl: ToastController,
    private events: Events,
    private spvNodeProvider: SpvNodeProvider,
    private storage: Storage,
    public navParams: NavParams
  ) {
    this.datas = {
      existing: [
        {
          id: 1234,
          src: 'assets/img/u152.png',
          name: '黄金59式',
          label: 1
        },
        {
          id: 1234,
          src: 'assets/img/u145.png',
          name: '黄金59式',
          label: 1
        },
        {
          id: 1234,
          src: 'assets/img/u152.png',
          name: '黄金59式',
          label: 0
        },
        {
          id: 1234,
          src: 'assets/img/u147.png',
          name: '黄金59式',
          label: 0
        }
      ],
      sale: [
        {
          id: 1234,
          src: 'assets/img/test6.png',
          name: '黄金59式',
          pay: '8'
        },
        {
          id: 1234,
          src: 'assets/img/u147.png',
          name: '黄金59式',
          pay: '6'
        },
        {
          id: 1234,
          src: 'assets/img/u152.png',
          name: '黄金59式',
          pay: '10'
        }
      ],
      prop: [
        {
          info: '兑换黄金59式',
          date: '2018-09-19',
          label: 1
        },
        {
          info: '兑换黄金59式',
          date: '2018-09-20',
          label: 1
        },
        {
          info: '兑换黄金59式',
          date: '2018-09-21',
          label: 2
        },
        {
          info: '兑换黄金59式',
          date: '2018-09-22',
          label: 3
        },
        {
          info: '兑换黄金59式',
          date: '2018-09-23',
          label: 1
        }
      ]
    };
  }

  // 全部道具
  public openAllPropsPage(): void {
    this.navCtrl.push(AllPropsPage);
  }

  // 我的在售道具
  public openMySalePropsPage(): void {
    this.navCtrl.push(SalePropsPage);
  }

  // 全部道具流水
  public openPropsBillPage(): void {
    this.navCtrl.push(PropsBillPage);
  }
}
