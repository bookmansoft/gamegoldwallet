import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, Events, NavController, NavParams, ViewController } from 'ionic-angular';
// providers
import { AddressBookProvider } from '../../../providers/address-book/address-book';
import { Logger } from '../../../providers/logger/logger';
import { OnGoingProcessProvider } from '../../../providers/on-going-process/on-going-process';
import { ProfileProvider } from '../../../providers/profile/profile';
import { SpvNodeProvider } from '../../../providers/spvnode/spvnode';

@Component({
  selector: 'game-detail',
  templateUrl: 'game-detail.html'
})
export class GameDetailPage {
  private cp: any;
  private authoried: boolean;
  private authoriedGames: any[];
  private index: number = 1;
  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private logger: Logger,
    private events: Events,
    private spvNodeProvider: SpvNodeProvider,
    private storage: Storage,
    private alertCtrl: AlertController,
  ) {
    this.cp = this.navParams.get('cpDeatail');
    this.authoried = false;
    this.storage.get('authorizedGame').then(val => {
      if (val == null) {
        this.storage.set('authorizedGame', '');
        this.authoriedGames = [];
      }
      else {
        this.authoriedGames = val.split(",");
        this.authoriedGames.forEach(game => {
          if (game == this.cp.game.cp_name) {
            this.authoried = true;
          }
        });
      }
    });
  }

  ionViewWillEnter() {

  }
  // 用来授权游戏,需要和链交互,获取登录游戏的token和地址.
  authorizeGame() {
    const prompt = this.alertCtrl.create({
      message: '请输入您的游戏注册手机号',
      enableBackdropDismiss: false,
      inputs: [
        {
          name: 'phone',
          placeholder: '注册手机号',
          type: 'number'
        }
      ],
      buttons: [
        {
          text: '确定',
          role: null,
          handler: data => {
            if (data.phone != '') {
              this.authoriedGames.push(this.cp.game.cp_name);
              this.logger.info("this.Autho" + JSON.stringify(this.authoriedGames));
              // 记录已授权的游戏
              this.storage.set('authorizedGame', this.authoriedGames.join(','));
              // 记录游戏账号
              this.storage.set('authorizedGame' + this.cp.game.cp_name, data.phone);
              // 调用SPV,获取游戏的登录token,并且记录下来,下次可以直接登录游戏
              this.spvNodeProvider.tokenUser(this.cp.cpId, data.phone).then(token => {
                this.logger.info("getToken" + JSON.stringify(token));
                this.storage.set('authorizedToken' + this.cp.game.cp_name, JSON.stringify(token));
              });
              this.authoried = true;
            }
          }
        }
      ]
    });
    prompt.present();
  }

  // 已经授权过游戏,可以进入游戏了.
  // 由于目前没有游戏,直接购买道具了.
  gotoGameMarket(prop) {

  }

  gotoPropDetail(prop) {

  }

  // 选项卡切换
  onSelect(index) {
    this.index = index;
  }
}
