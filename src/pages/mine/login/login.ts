import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavController, NavParams } from 'ionic-angular';
import { Logger } from '../../../providers/logger/logger';

// providers
import { ConfigProvider } from '../../../providers/config/config';
import { ExternalLinkProvider } from '../../../providers/external-link/external-link';
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
  constructor(
    private profileProvider: ProfileProvider,
    private logger: Logger,
    private walletProvider: WalletProvider,
    private externalLinkProvider: ExternalLinkProvider,
    private configProvider: ConfigProvider,
    private navCtrl: NavController,
    private navParams: NavParams,
    private touchIdProvider: TouchIdProvider,
    private translate: TranslateService
  ) {}

  ionViewDidLoad() {
    this.logger.info('ionViewDidLoad WalletSettingsPage');
  }

  ionViewWillEnter() {}

  public hiddenBalanceChange(): void {}

  // 跳转到关于我们页
  public openAboutPage(): void {
    this.navCtrl.push(AboutPage);
  }
  // 跳转到手续费策略
  public openPuoundPage(): void {
    this.navCtrl.push(PoundagePage);
  }
}
