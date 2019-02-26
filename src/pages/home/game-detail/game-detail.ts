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
import { PropDetailPage } from '../../propmarket/prop-detail/prop-detail';

@Component({
  selector: 'page-game-detail',
  templateUrl: 'game-detail.html'
})
export class GameDetailPage {
  private cp: any;
  private authoried: boolean;
  private authoriedGames: any[];
  private index: number = 1;

  // 论坛的游戏和评论信息
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
    this.cp = this.navParams.get('cpDeatail');
    this.authoried = false;
    this.storage.get('authorizedGame').then(val => {
      if (val == null) {
        this.storage.set('authorizedGame', []);
        this.authoriedGames = [];
      }
      else {
        this.authoriedGames = val;
        this.authoriedGames.forEach(game => {
          if (game.game.cp_name == this.cp.game.cp_name) {
            this.authoried = true;
          }
        });
      }
    });
  }

  ionViewWillEnter() {
    this.logger.info("进入游戏详情页");
    this.starArray = new Array(5);
    this.getForumGame();
    this.getForumDiscuss();

  }

  // moreDiscuss() {
  //   this.logger.info("显示更多评论，在页面加载时也将调用一次");
  //   var data = "";
  //   data += "<ion-row>";
  //   data += "<ion-col col-2>"
  //   data += "  <div style='float:right'><img src='assets/img/u85.png' mode='widthFix' /></div>";
  //   data += "</ion-col>";
  //   data += "<ion-col col-4>";
  //   data += "  Naruto<br />";
  //   data += "  <img src='assets/img/u86.png' mode='widthFix' /><img src='assets/img/u86.png' mode='widthFix' /><img src='assets/img/u86.png' mode='widthFix' />";
  //   data += "</ion-col>";
  //   data += "<ion-col col-2></ion-col>";
  //   data += "<ion-col col-4>";
  //   data += "  <div style='float:right;padding-top: 10px;padding-right: 5px'><img src='assets/img/u114.png' style='width:16px;height:16px' mode='widthFix' />&nbsp;6623</div>";
  //   data += "</ion-col>";
  //   data += "</ion-row>";
  //   data += "<ion-row>";
  //   data += "<ion-col col-12>";
  //   data += "  这游戏是我玩过最耐玩的，在第一个地图我玩了半年时间，升到了71级，然后来看评论才知道居然后面还有那么多地图。为什么早没有人告诉我，我很难...";
  //   data += "</ion-col>";
  //   data += "<ion-col col-12 class='center'>";
  //   data += "  <span style='margin-top:3px;margin-left: 10px;font-size:14px;color:#18bb9a'>显示全部</span>";
  //   data += "</ion-col>";
  //   data += "</ion-row>";
  //   data += "<ion-row>";
  //   data += "<ion-col col-12>";
  //   data += "  <div style='border-bottom:1px #bbbbbb solid'></div>";
  //   data += "</ion-col>";
  //   data += "</ion-row>";
  //   this.logger.info(data);
  //   this.discussRowInfo = data;


  // }
  // 获取论坛中的游戏信息数据（评分、星级等）
  getForumGame() {
    this.logger.info("获取论坛中的游戏信息数据（评分、星级等）");
    let url = `http://127.0.0.1:8081/gamegoldWeb/port/game/get?game.gameName=${this.cp.game.cp_name}`;
    this.http.get(url).subscribe(
      response => {
        this.logger.info("Get forumGameInfo: " + response);
        this.forumGame = response;
        this.logger.info(this.forumGame.gameText);
        // 设置百分比
        var theTotal = (this.forumGame.totalStar1 + this.forumGame.totalStar2 + this.forumGame.totalStar3 + this.forumGame.totalStar4 + this.forumGame.totalStar5);
        this.percent1 = parseInt(this.forumGame.totalStar1 * 100 / theTotal + '', 10) + '%';
        this.percent2 = parseInt(this.forumGame.totalStar2 * 100 / theTotal + '', 10) + '%';
        this.percent3 = parseInt(this.forumGame.totalStar3 * 100 / theTotal + '', 10) + '%';
        this.percent4 = parseInt(this.forumGame.totalStar4 * 100 / theTotal + '', 10) + '%';
        this.percent5 = parseInt(this.forumGame.totalStar5 * 100 / theTotal + '', 10) + '%';
        this.logger.info(this.percent5);
        this.out_percent1 = (100 - parseInt(this.forumGame.totalStar1 * 100 / theTotal + '', 10)) + '%';
        this.out_percent2 = (100 - parseInt(this.forumGame.totalStar2 * 100 / theTotal + '', 10)) + '%';
        this.out_percent3 = (100 - parseInt(this.forumGame.totalStar3 * 100 / theTotal + '', 10)) + '%';
        this.out_percent4 = (100 - parseInt(this.forumGame.totalStar4 * 100 / theTotal + '', 10)) + '%';
        this.out_percent5 = (100 - parseInt(this.forumGame.totalStar5 * 100 / theTotal + '', 10)) + '%';
        this.logger.info(this.out_percent5);
      },
      error => {
        this.logger.error("Get forumGameInfo: " + JSON.stringify(error));
      });
  }
  // 获取论坛中的评价信息数据（评价、点赞数）
  getForumDiscuss() {
    this.logger.info("获取论坛中的评价信息数据（评价、点赞数）");
    let url = `http://127.0.0.1:8081/gamegoldWeb/port/discuss/page?game.gameName=${this.cp.game.cp_name}`;
    this.http.get(url).subscribe(
      response => {
        this.logger.info("Get forumDiscussInfo: " + response);
        this.forumDiscuss = response.list; // 跳到集合这一层
      },
      error => {
        this.logger.error("Get forumGameInfo: " + JSON.stringify(error));
      });
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
          text: '取消',
          role: null,
          handler: data => {
          }
        },
        {
          text: '确定',
          role: null,
          handler: data => {
            if (data.phone != '') {
              this.logger.info("this.Autho" + JSON.stringify(this.authoriedGames));
              // 记录已授权的游戏
              this.authoriedGames.push(this.cp);
              this.storage.set('authorizedGame', this.authoriedGames);
              // 记录游戏账号
              this.storage.set('authorizedGame' + this.cp.game.cp_name, data.phone);
              // 调用SPV,获取游戏的登录token,并且记录下来,下次可以直接登录游戏
              this.spvNodeProvider.tokenUser(this.cp.game.cid, data.phone).then(token => {
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
  // 由于目前没有游戏,只能直接购买道具了.
  gotoGame() {
    const prompt = this.alertCtrl.create({
      message: '敬请期待游戏跳转功能',
      enableBackdropDismiss: false,
      buttons: [
        {
          text: '确定'
        }
      ]
    });
    prompt.present();
  }

  enterGame() {
    if (this.authoried)
      this.gotoGame()
    else
      this.authorizeGame();
  }
  /**
   * 跳转到游戏道具详情,引导用户购买道具
   * @param prop 玩家想购买的道具
   */
  gotoPropDetail(prop) {
    let propDetail;
    // 在跳转之前,获取道具详细信息
    let propUrl = `${prop.cp.url}/prop/${prop.id}`;
    this.http.get(propUrl).subscribe(
      propDetail => {
        this.logger.info("Get Http prop Detail: " + JSON.stringify(propDetail));
        propDetail['cp'] = this.cp.game;
        this.logger.info("prop Deatil:" + JSON.stringify(propDetail));
        // 拉取成功,此时才能进入道具明细页
        this.navCtrl.push(PropDetailPage,
          {
            'prop': propDetail,
            'fromCp': true
          });
      },
      error => {
        this.logger.error("get CPDetai error :" + JSON.stringify(error));
      });
  }

  // 选项卡切换
  onSelect(index) {
    this.index = index;
  }
}
