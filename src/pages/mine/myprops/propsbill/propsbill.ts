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
import { PropsDetailsPage } from '../propsdetails/propsdetails';

@Component({
  selector: 'page-propsbill',
  templateUrl: './propsbill.html'
})
export class PropsBillPage {
  private datas: any;
  index: number = 1;
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
        date: '09-19',
        info: [
          {
            name: '黄金59式',
            game: '坦克世界',
            instructions: 'APP内兑换',
            lable: 1
          },
          {
            name: 'T110E5',
            game: '坦克世界',
            instructions: '游戏内获取',
            lable: 1
          },
          {
            name: '暴风之锤',
            game: '坦克世界',
            instructions: '售出',
            lable: 2
          }
        ]
      },
      {
        date: '09-10',
        info: [
          {
            name: '冰霜大剑',
            game: '魔兽世界',
            instructions: '熔铸',
            lable: 3
          },
          {
            name: 'T110E5',
            game: '坦克世界',
            instructions: 'APP内兑换',
            lable: 1
          }
        ]
      },
      {
        date: '09-09',
        info: [
          {
            name: '暴风之锤',
            game: '魔兽世界',
            instructions: '赠送他人',
            lable: 2
          },
          {
            name: '冰霜大剑',
            game: '魔兽世界',
            instructions: '熔铸',
            lable: 3
          }
        ]
      },
      {
        date: '09-08',
        info: [
          {
            name: '暴风之锤',
            game: '魔兽世界',
            instructions: '赠送他人',
            lable: 2
          },
          {
            name: '冰霜大剑',
            game: '魔兽世界',
            instructions: '熔铸',
            lable: 3
          }
        ]
      },
      {
        date: '09-08',
        info: [
          {
            name: '暴风之锤',
            game: '魔兽世界',
            instructions: '赠送他人',
            lable: 2
          }
        ]
      }
    ];
  }
  // 选项卡切换
  onSelect(index) {
    this.logger.info('点击 !' + index);
    this.index = index;
  }

  // 道具流水详情
  public openPropsDetailsPage(): void {
    this.navCtrl.push(PropsDetailsPage);
  }
}
