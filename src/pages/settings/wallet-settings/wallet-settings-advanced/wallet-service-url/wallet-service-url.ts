import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Events, NavController, NavParams } from 'ionic-angular';
import { Logger } from '../../../../../providers/logger/logger';

// native
import { SplashScreen } from '@ionic-native/splash-screen';

// providers
import { AppProvider } from '../../../../../providers/app/app';
import { ConfigProvider } from '../../../../../providers/config/config';
import { PersistenceProvider } from '../../../../../providers/persistence/persistence';
import { PlatformProvider } from '../../../../../providers/platform/platform';
import { ProfileProvider } from '../../../../../providers/profile/profile';
import { ReplaceParametersProvider } from '../../../../../providers/replace-parameters/replace-parameters';

@Component({
  selector: 'page-wallet-service-url',
  templateUrl: 'wallet-service-url.html'
})
export class WalletServiceUrlPage {
  public success: boolean = false;
  public wallet;
  public comment: string;
  public walletServiceForm: FormGroup;
  private config;
  private defaults;

  constructor(
    private profileProvider: ProfileProvider,
    private navCtrl: NavController,
    private navParams: NavParams,
    private configProvider: ConfigProvider,
    private app: AppProvider,
    private logger: Logger,
    private persistenceProvider: PersistenceProvider,
    private formBuilder: FormBuilder,
    private events: Events,
    private splashScreen: SplashScreen,
    private platformProvider: PlatformProvider,
    private replaceParametersProvider: ReplaceParametersProvider,
    private translate: TranslateService
  ) {
    this.walletServiceForm = this.formBuilder.group({
      bwsurl: [
        '',
        Validators.compose([Validators.minLength(1), Validators.required])
      ]
    });
  }

  ionViewDidLoad() {
    this.logger.info('ionViewDidLoad WalletServiceUrlPage');
  }

  ionViewWillEnter() {
    this.wallet = this.profileProvider.getWallet(this.navParams.data.walletId);
    this.defaults = this.configProvider.getDefaults();
    this.config = this.configProvider.get();
    let appName = this.app.info.nameCase;
    this.comment = this.replaceParametersProvider.replace(
      this.translate.instant(
        "{{appName}} depends on Bitcore Wallet Service (BWS) for blockchain information, networking and synchronization. The default configuration points to https://bws.bitpay.com (BitPay's public BWS instance)."
      ),
      { appName }
    );
    this.walletServiceForm.value.bwsurl =
      (this.config.bwsFor &&
        this.config.bwsFor[this.wallet.credentials.walletId]) ||
      this.defaults.bws.url;
  }

  public resetDefaultUrl(): void {
    this.walletServiceForm.value.bwsurl = this.defaults.bws.url;
  }

  // 把信息保存到bitwallet-service中,这里不需要
  public save(): void {
    let opts = {
      bwsFor: {}
    };
    opts.bwsFor[
      this.wallet.credentials.walletId
    ] = this.walletServiceForm.value.bwsurl;

    this.configProvider.set(opts);
    this.persistenceProvider.setCleanAndScanAddresses(
      this.wallet.credentials.walletId
    );
    this.events.publish('wallet:updated', this.wallet.credentials.walletId);
    this.navCtrl.popToRoot({ animate: false }).then(() => {
      this.navCtrl.parent.select(0);
      this.reload();
    });
  }

  private reload(): void {
    window.location.reload();
    if (this.platformProvider.isCordova) this.splashScreen.show();
  }
}
