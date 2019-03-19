import { Component, VERSION, ViewChild } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import {
  AlertController,
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
import { LoginPage } from '../login/login';
import { AppAvailability } from '@ionic-native/app-availability/ngx';


@Component({
  selector: 'page-mygame',
  templateUrl: './mygame.html'
})
export class MyGamePage {
  private authoriedGames: any;
  private index: number = 1;

  private forumDiscuss: object; // 有用
  private starArray: any;


  constructor(
    private navCtrl: NavController,
    private logger: Logger,
    public toastCtrl: ToastController,
    private events: Events,
    private spvNodeProvider: SpvNodeProvider,
    private storage: Storage,
    public navParams: NavParams,
    private http: HttpClient,
    private alertController: AlertController,
    private appAvailability: AppAvailability,
  ) {
    this.storage.get('authorizedGame').then(val => {
      if (val == null) {
        this.storage.set('authorizedGame', '');
        this.authoriedGames = [];
      }
      else {
        this.authoriedGames = val;
      }
    });
  }

  ionViewWillEnter() {
    this.logger.info("进入我的游戏");
    this.starArray = new Array(5);
    if (sessionStorage.getItem("userId") != null) {
      this.getForumDiscuss();
    }


  }

  async alert(msg) {
    const alert = await this.alertController.create({
      title: '提示',
      message: msg,
      buttons: ['OK']
    });
    await alert.present();
  }


  openLoginPage() {
    this.navCtrl.push(LoginPage, {});
  }

  // 选项卡切换
  onSelect(index) {
    this.index = index;
  }

  // 获取论坛中的评价信息数据（评价、点赞数）
  getForumDiscuss() {
    this.logger.info("获取论坛中的评价信息数据（评价、点赞数）" + sessionStorage.getItem("userId"));
    let url = `http://121.40.82.216:8081/gamegoldWeb/port/discuss/page?user.userId=` + sessionStorage.getItem("userId"); // ?game.gameName=cp0311
    this.http.get(url).subscribe(
      response => {
        if (response == null) {
          return;
        }
        this.logger.info("Get forumDiscussInfo: " + JSON.stringify(response));
        this.forumDiscuss = response['list']; // 跳到集合这一层
      },
      error => {
        this.logger.error("Get forumGameInfo: " + JSON.stringify(error));
      });
  }


  // 打开App的方法，测试用途
  async openApp() {
    try {
      this.alert("101 openApp");
      this.alert(this.appAvailability);
      this.appAvailability.check("com.baidu.BaiduMap")
        .then(
          (yes: boolean) => {
            this.alert('app is available')
            var sApp = (window as any).startApp.set({ "application": "com.baidu.BaiduMap" });
            sApp.start(function (compete) {
              console.log(compete);
              this.alert("start success");
            }, function (error) {
              console.error(error);
              this.alert('start error');
            });
          },
          (no: boolean) => this.alert('未安装')
        );

      this.alert("119");

      // this.alert("114");
      // sApp.start(function (compete) {
      //   console.log(compete);
      //   this.alert("start success");
      // }, function (error) {
      //   console.error(error);
      //   this.alert('start error');
      // });

    }
    catch (ex) {
      console.log(ex);
      this.alert(ex);
    }


  }
}
