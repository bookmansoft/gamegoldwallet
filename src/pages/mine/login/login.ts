import { AlertController, Events, NavController, NavParams, ViewController } from 'ionic-angular';
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Logger } from '../../../providers/logger/logger';

// providers
import { ConfigProvider } from '../../../providers/config/config';
import { ExternalLinkProvider } from '../../../providers/external-link/external-link';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ProfileProvider } from '../../../providers/profile/profile';
import { TouchIdProvider } from '../../../providers/touchid/touchid';
import { WalletProvider } from '../../../providers/wallet/wallet';

// pages
import { AboutPage } from '../../settings/about/about';
import { PoundagePage } from '../../settings/poundage/poundage';


@Component({
  selector: 'page-login2',
  templateUrl: 'login.html'
})
export class LoginPage {
  phone: string;
  password: string;

  constructor(
    private profileProvider: ProfileProvider,
    private logger: Logger,
    private walletProvider: WalletProvider,
    private externalLinkProvider: ExternalLinkProvider,
    private configProvider: ConfigProvider,
    private navCtrl: NavController,
    private navParams: NavParams,
    private touchIdProvider: TouchIdProvider,
    private translate: TranslateService,
    private alertController: AlertController,
    private http: HttpClient,
  ) { }

  ionViewDidLoad() {
    this.logger.info('ionViewDidLoad WalletSettingsPage');
  }

  ionViewWillEnter() { }

  async alert(msg) {
    const alert = await this.alertController.create({
      title: '提示',
      message: msg,
      buttons: ['OK']
    });
    await alert.present();
  }

  // 获取手机验证码
  public vcode(): void {
    this.alert('短信验证码已发送');
  }
  // 登录
  public login(): void {
    var myreg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
    if (!myreg.test(this.phone)) {
      this.logger.info("true");
      this.alert('请输入正确的手机号码格式');
      return;
    }
    var pwdreg = /^([0-9]){6}$/;
    if (!pwdreg.test(this.password)) {
      this.logger.info("true");
      this.alert('请输入6位短信验证码！');
      return;
    }
    // 调用登录接口
    let url = `http://121.40.82.216:8081/gamegoldWeb/port/user/login?userName=${this.phone}&password=${this.password}`;
    this.http.get(url).subscribe(
      result => {
        this.logger.info("post 登录 ok: " + JSON.stringify(result));
        if (result['code'] == 0) {
          sessionStorage.setItem("userId", result['data']['userId'] + '');
          this.alert('登录成功');
          this.navCtrl.pop();
        }
        else {
          this.alert(result['msg']);
        }
      },
      error => {
        this.logger.error("post 登录 error :" + JSON.stringify(error));
      });


    // this.navCtrl.push(PoundagePage);
  }
}
