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
  selector: 'page-saleprops',
  templateUrl: './saleprops.html'
})
export class SalePropsPage {
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
    this.datas = [
      {
        name: '宇宙飞船',
        content: 'Forza Horizon 3',
        pay: 6,
        src: 'assets/img/u146.png'
      },
      {
        name: '风暴之锤（魔兽世界二十周年限量纪念珍藏版）',
        content: '魔兽世界',
        pay: 8,
        src: 'assets/img/u146.png'
      },
      {
        name: '风暴之锤（魔兽世界二十周年限量纪念珍藏版）',
        content: '魔兽世界',
        pay: 8,
        src: 'assets/img/u146.png'
      },
      {
        name: '风暴之锤（魔兽世界二十周年限量纪念珍藏版）',
        content: '魔兽世界',
        pay: 8,
        src: 'assets/img/u146.png'
      },
      {
        name: '风暴之锤（魔兽世界二十周年限量纪念珍藏版）',
        content: '魔兽世界',
        pay: 8,
        src: 'assets/img/u146.png'
      }
    ];
  }
}
