import { JsonPipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
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
// pages


@Component({
  selector: 'page-game-discuss',
  templateUrl: 'game-discuss.html'
})
export class GameDiscussPage {
  discussStar: number;
  gameName: string;
  userId: number;
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
    this.userId = this.navParams.get("userId");
  }
  ionViewWillEnter() {
    this.logger.info("进入游戏评论页");
    this.logger.info(this.discussStar);
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      title: '提示',
      // subTitle: 'Subtitle',
      message: '发表评论成功',
      buttons: ['OK']
    });

    await alert.present();
  }

  /**
   * 保存评论
   */
  async saveDiscuss() {
    let userId = 4;
    let content = '评论内容评论内容评论内容评论内容评论内容评论内容评论内容评论内容评论内容评论内容评论内容评论内容';
    content = encodeURIComponent(encodeURIComponent(content));
    let url = `http://121.40.82.216:8081/gamegoldWeb/port/discuss/save?gameName=${this.gameName}&score=${this.discussStar}&userId=${this.userId}&content=${this.remark}`;





    this.http.get(url).subscribe(
      result => {
        this.logger.info("post discuss ok: " + JSON.stringify(result));
        this.presentAlert();
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
