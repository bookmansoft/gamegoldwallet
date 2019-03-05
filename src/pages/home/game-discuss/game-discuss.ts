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
  private cp: any;
  private authoried: boolean;
  private authoriedGames: any[];
  private index: number = 1;


  // 论坛的游戏和评论信息
  private discussRowShow: number;
  private forumGame: any;
  private forumDiscuss: object;
  private percent5: string;
  private percent4: string;
  private percent3: string;
  private percent2: string;
  private percent1: string;
  private out_percent5: string;
  private out_percent4: string;
  private out_percent3: string;
  private out_percent2: string;
  private out_percent1: string;
  private discussRowInfo: string;

  private starArray: any;
  // 构造器
  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private logger: Logger,
    private events: Events,
    private spvNodeProvider: SpvNodeProvider,
    private storage: Storage,
    private alertCtrl: AlertController,
    private http: HttpClient
  ) {

  }
  ionViewWillEnter() {
    this.logger.info("进入游戏评论页");
  }

  /**
   * 保存评论
   */
  saveDiscuss() {
    let gameName = 'cp0219';
    let score = 4;
    let userId = 4;
    let content = '评论内容评论内容评论内容评论内容评论内容评论内容评论内容评论内容评论内容评论内容评论内容评论内容';
    content = encodeURIComponent(encodeURIComponent(content));
    let url = `http://127.0.0.1:8081/gamegoldWeb/port/discuss/save?gameName=${gameName}&score=${score}&userId=${userId}&content=${content}`;





    this.http.get(url).subscribe(
      result => {
        this.logger.info("post discuss ok: " + JSON.stringify(result));

      },
      error => {
        this.logger.error("post discuss error :" + JSON.stringify(error));
      });
  }


}
