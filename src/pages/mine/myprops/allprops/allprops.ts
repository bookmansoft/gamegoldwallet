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
  selector: 'page-allprops',
  templateUrl: './allprops.html'
})
export class AllPropsPage {
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
        name: 'WOW',
        mode: '',
        src: 'assets/img/u152.png',
        propinfo: [
          {
            propname: '暴风锤',
            src: 'assets/img/test7.png',
            lable: '1'
          },
          {
            propname: '巫术之盾',
            src: 'assets/img/test7.png',
            lable: '1'
          },
          {
            propname: '巫术之盾',
            src: 'assets/img/test7.png',
            lable: '0'
          },
          {
            propname: '巫术之盾',
            src: 'assets/img/test7.png',
            lable: '0'
          },
          {
            propname: '巫术之盾',
            src: 'assets/img/test6.png',
            lable: '0'
          },
          {
            propname: '巫术之盾',
            src: 'assets/img/test7.png',
            lable: '0'
          },
          {
            propname: '巫术之盾',
            src: 'assets/img/test7.png',
            lable: '0'
          }
        ]
      },
      {
        name: 'TANK',
        mode: '',
        src: 'assets/img/u146.png',
        propinfo: [
          {
            propname: '黄金59式',
            src: 'assets/img/u146.png',
            lable: '1'
          },
          {
            propname: '黄金59式',
            src: 'assets/img/test7.png',
            lable: '0'
          },
          {
            propname: '黄金59式',
            src: 'assets/img/test7.png',
            lable: '0'
          }
        ]
      },
      {
        name: 'Forza Horizon 3',
        mode: '',
        src: 'assets/img/u147.png',
        propinfo: [
          {
            propname: '飞机',
            src: 'assets/img/test7.png',
            lable: '0'
          },
          {
            propname: '宇宙飞船',
            src: 'assets/img/u146.png',
            lable: '0'
          }
        ]
      },
      {
        name: 'Pick You Pet',
        mode: '',
        src: 'assets/img/u146.png',
        propinfo: [
          {
            propname: '飞机',
            src: 'assets/img/test7.png',
            lable: '0'
          },
          {
            propname: '宇宙飞船',
            src: 'assets/img/u146.png',
            lable: '0'
          }
        ]
      }
    ];
  }
}
