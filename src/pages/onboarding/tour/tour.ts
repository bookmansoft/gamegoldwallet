import { Component, ViewChild } from '@angular/core';
// import { TranslateService } from '@ngx-translate/core';
import {
  LoadingController,
  Navbar,
  NavController,
  Slides
} from 'ionic-angular';
import { Logger } from '../../../providers/logger/logger';

// pages
import { CollectEmailPage } from '../collect-email/collect-email';

// providers
import { OnGoingProcessProvider } from '../../../providers/on-going-process/on-going-process';
import { PersistenceProvider } from '../../../providers/persistence/persistence';
// import { PopupProvider } from '../../../providers/popup/popup';
// import { ProfileProvider } from '../../../providers/profile/profile';
import { RateProvider } from '../../../providers/rate/rate';
import { TxFormatProvider } from '../../../providers/tx-format/tx-format';

@Component({
  selector: 'page-tour',
  templateUrl: 'tour.html'
})
export class TourPage {
  @ViewChild(Slides) slides: Slides;
  @ViewChild(Navbar) navBar: Navbar;

  public localCurrencySymbol: string;
  public localCurrencyPerBtc: string;
  public currentIndex: number;

  // private retryCount: number = 0;

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    private logger: Logger,
    // private translate: TranslateService,
    // private profileProvider: ProfileProvider,
    private rateProvider: RateProvider,
    private txFormatProvider: TxFormatProvider,
    private onGoingProcessProvider: OnGoingProcessProvider,
    private persistenceProvider: PersistenceProvider // private popupProvider: PopupProvider
  ) {
    this.currentIndex = 0;
    this.rateProvider.whenRatesAvailable('btc').then(() => {
      let btcAmount = 1;
      this.localCurrencySymbol = '$';
      this.localCurrencyPerBtc = this.txFormatProvider.formatAlternativeStr(
        'btc',
        btcAmount * 1e8
      );
    });
  }

  ionViewDidLoad() {
    this.logger.info('ionViewDidLoad TourPage');
  }

  ionViewWillEnter() {
    this.navBar.backButtonClick = () => {
      this.slidePrev();
    };
  }

  public slideChanged(): void {
    this.currentIndex = this.slides.getActiveIndex();
  }

  public slidePrev(): void {
    if (this.currentIndex == 0) this.navCtrl.pop();
    else {
      this.slides.slidePrev();
    }
  }

  public slideNext(): void {
    this.slides.slideNext();
  }

  public createDefaultWallet(): void {
    this.onGoingProcessProvider.set('creatingWallet');
    // this.profileProvider
    //   .createDefaultWallet()
    //   .then(wallet => {
    //     this.onGoingProcessProvider.clear();
    //     this.persistenceProvider.setOnboardingCompleted();
    //     this.navCtrl.push(CollectEmailPage, { walletId: wallet.id });
    //   })
    //   .catch(err => {
    //     setTimeout(() => {
    //       this.logger.warn(
    //         'Retrying to create default wallet.....:' + ++this.retryCount
    //       );
    //       if (this.retryCount > 3) {
    //         this.onGoingProcessProvider.clear();
    //         let title = this.translate.instant('Cannot create wallet');
    //         let okText = this.translate.instant('Retry');
    //         this.popupProvider.ionicAlert(title, err, okText).then(() => {
    //           this.retryCount = 0;
    //           this.createDefaultWallet();
    //         });
    //       } else {
    //         this.createDefaultWallet();
    //       }
    //     }, 2000);
    //   });
    let wallet = {
      baseUrl: 'https://bws.bitpay.com/bws/api',
      coin: 'btc',
      color: '#1abb9b',
      credentials: {
        n: 1,
        network: 'livenet',
        personalEncryptingKey: 'U8wDZZ+/rfj5SFqdemjMPQ==',
        publicKeyRing: [
          {
            requestPubKey:
              '021d489f0ff8dc69883e3f680dd3e583f9c0c85e5ba9e368b4f0170f9468c5765d',
            xPubKey:
              'xpub6BouECCgZYjbXrkjHsZZbXqu7KUHELdUWuUSmKWtVqNKaKQzUxenZYaaU1qoXYmDR6Lqi93oHiyFrzaMH7ioFRj2USBiaAtmirnacjBW9xj'
          }
        ],
        requestPrivKey:
          'd38a40c8ece476fee48075d7b6f1565d2df3281494feac7eb3e7a6fe5d09d078',
        requestPubKey:
          '021d489f0ff8dc69883e3f680dd3e583f9c0c85e5ba9e368b4f0170f9468c5765d',
        sharedEncryptingKey: '++E3fmAQlLjmGGFE5QszAw==',
        version: '1.0.0',
        walletId: 'e5832822-60be-403f-ab23-28be13158e36',
        walletName: '个人钱包',
        walletPrivKey:
          '913887c76532e94a5be59721490b9ef730603de73e7df0e4c304bacffda5dd1b',
        xPrivKey:
          'xprv9s21ZrQH143K2nGs8WnCUnYUKqddof43HNK6mWf64PsKkUFUv8EabPYxVVZddctoX9jvtRqbxABXy1bgFievfHV5tCeszxi4EUUzizifryT',
        xPubKey: 'xpub6BouECCgZYjbXrkjHsZZbXqu7K'
      },
      doNotVerifyPayPro: null,
      email: null,
      id: 'e5832822-60be-403f-ab23-28be13158e36',
      logLevel: 'silent',
      m: 1,
      n: 1,
      name: '个人钱包',
      needsBackup: true,
      network: 'livenet',
      payProHttp: null,
      started: true,
      status: {},
      supportStaffWalletId: null,
      timeout: 100000,
      usingCustomBWS: null
    };
    this.onGoingProcessProvider.clear();
    this.persistenceProvider.setOnboardingCompleted();
    this.navCtrl.push(CollectEmailPage, { walletId: wallet.id });
  }
}
