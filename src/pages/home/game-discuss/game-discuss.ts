import { JsonPipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, Events, NavController, NavParams, ViewController } from 'ionic-angular';
// providers
import { AddressBookProvider } from '../../../providers/address-book/address-book';
import { LoginPage } from '../../mine/login/login';
import { Logger } from '../../../providers/logger/logger';
import { OnGoingProcessProvider } from '../../../providers/on-going-process/on-going-process';
import { ProfileProvider } from '../../../providers/profile/profile';
import { SpvNodeProvider } from '../../../providers/spvnode/spvnode';
// pages


@Component({
  selector: 'page-game-discuss',
  templateUrl: 'game-discuss.html'
})
export class GameDiscussPage {
  discussStar: number;
  gameName: string;
  // 绑定的内容，用这个名字区别下
  remark: string;
  // 构造器
  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private logger: Logger,
    private events: Events,
    private spvNodeProvider: SpvNodeProvider,
    private storage: Storage,
    private alertController: AlertController,
    private http: HttpClient
  ) {
    // 设置初始星数
    this.discussStar = (this.navParams.get("discussStar") == null) ? 0 : this.navParams.get("discussStar");
    this.gameName = this.navParams.get("gameName");
  }
  ionViewWillEnter() {
    this.logger.info("进入游戏评论页");
    this.logger.info(this.discussStar);
  }

  async alert(msg: string) {
    const alert = await this.alertController.create({
      title: '提示',
      // subTitle: 'Subtitle',
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }

  /**
   * 保存评论
   */
  async saveDiscuss() {
    if (sessionStorage.getItem("userId") == null) {
      this.alert("您还未登录，请在登录后发表评论");
      this.navCtrl.push(LoginPage, {})
      return;
    }

    let userId = parseInt(sessionStorage.getItem("userId"));
    let content = encodeURIComponent(encodeURIComponent(this.remark));
    let url = `http://121.40.82.216:8081/gamegoldWeb/port/discuss/save?gameName=${this.gameName}&score=${this.discussStar}&userId=${userId}&content=${content}`;

    this.http.get(url).subscribe(
      result => {
        this.logger.info("post discuss ok: " + JSON.stringify(result));
        this.alert("发表评论成功");
      },
      error => {
        this.logger.error("post discuss error :" + JSON.stringify(error));
      });
  }

  // 展示对应的星星数
  showGameDiscuss(discussStar) {
    this.discussStar = discussStar;
  }
}
