import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Events, ModalController, NavController } from 'ionic-angular';
import { Logger } from '../../providers/logger/logger';

import * as _ from 'lodash';

// providers
import { AppProvider } from '../../providers/app/app';
import { ConfigProvider } from '../../providers/config/config';
import { ExternalLinkProvider } from '../../providers/external-link/external-link';
import { LanguageProvider } from '../../providers/language/language';
import { PlatformProvider } from '../../providers/platform/platform';
import { ProfileProvider } from '../../providers/profile/profile';
import { SpvNodeProvider } from '../../providers/spvnode/spvnode';
import { TouchIdProvider } from '../../providers/touchid/touchid';

// pages
import { ContractPage } from '../contract/contract';
import { FeedbackCompletePage } from '../feedback/feedback-complete/feedback-complete';
import { SendFeedbackPage } from '../feedback/send-feedback/send-feedback';
import { PinModalPage } from '../pin/pin-modal/pin-modal';
import { ReceivePage } from '../receive/receive';
import { ScanPage } from '../scan/scan';
import { SendPage } from '../send/send';
import { AboutPage } from '../settings/about/about';
import { AddressbookPage } from '../settings/addressbook/addressbook';
import { AdvancedPage } from '../settings/advanced/advanced';
import { AltCurrencyPage } from '../settings/alt-currency/alt-currency';
import { FeePolicyPage } from '../settings/fee-policy/fee-policy';
import { LanguagePage } from '../settings/language/language';
import { LockPage } from '../settings/lock/lock';
import { NotificationsPage } from '../settings/notifications/notifications';
import { WalletSettingsPage } from '../settings/wallet-settings/wallet-settings';

@Component({
  selector: 'page-mine',
  templateUrl: 'mine.html'
})
export class MinePage {
  public appName: string;
  public currentLanguageName: string;
  public languages;
  public walletsBtc;
  public walletsBch;
  public config;
  public selectedAlternative;
  public isCordova: boolean;
  public lockMethod: string;
  public integrationServices = [];
  public bitpayCardItems = [];
  public walletNotRegistered: boolean;
  public updateError: boolean;
  public updateStatusError;
  public updatingStatus: boolean;
  public updatingTxHistory: boolean;
  public updateTxHistoryError: boolean;
  public updatingTxHistoryProgress: number = 0;
  public showNoTransactionsYetMsg: boolean;
  public showBalanceButton: boolean = false;
  public scanning: boolean = false;
  public walletBalance;
  constructor(
    private navCtrl: NavController,
    private app: AppProvider,
    private language: LanguageProvider,
    private externalLinkProvider: ExternalLinkProvider,
    private profileProvider: ProfileProvider,
    private configProvider: ConfigProvider,
    private logger: Logger,
    private events: Events,
    private platformProvider: PlatformProvider,
    private translate: TranslateService,
    private modalCtrl: ModalController,
    private touchid: TouchIdProvider,
    private spvNodeProvider: SpvNodeProvider
  ) {
    this.appName = this.app.info.nameCase;
    this.walletsBtc = [];
    this.isCordova = this.platformProvider.isCordova;
  }

  ionViewDidLoad() {
    this.logger.info('ionViewDidLoad SettingsPage');
  }

  ionViewWillEnter() {
    this.currentLanguageName = this.language.getName(
      this.language.getCurrent()
    );
    this.walletsBtc = this.profileProvider.getWallets({
      coin: 'btc'
    });
    this.config = this.configProvider.get();
    this.selectedAlternative = {
      name: this.config.wallet.settings.alternativeName,
      isoCode: this.config.wallet.settings.alternativeIsoCode
    };
    this.lockMethod =
      this.config && this.config.lock && this.config.lock.method
        ? this.config.lock.method.toLowerCase()
        : null;
    this.listenForEvents();
  }

  ionViewDidEnter() {
    this.spvNodeProvider.getBalance();
  }

  ionViewWillLeave() {
    this.unListenForEvents();
  }

  public openAltCurrencyPage(): void {
    this.navCtrl.push(AltCurrencyPage);
  }

  public openLanguagePage(): void {
    this.navCtrl.push(LanguagePage);
  }

  public openAdvancedPage(): void {
    this.navCtrl.push(AdvancedPage);
  }

  public openAboutPage(): void {
    this.navCtrl.push(AboutPage);
  }

  public openLockPage(): void {
    let config = this.configProvider.get();
    let lockMethod =
      config && config.lock && config.lock.method
        ? config.lock.method.toLowerCase()
        : null;
    if (!lockMethod || lockMethod == 'disabled') this.navCtrl.push(LockPage);
    if (lockMethod == 'pin') this.openPinModal('lockSetUp');
    if (lockMethod == 'fingerprint') this.checkFingerprint();
  }

  public openAddressBookPage(): void {
    this.navCtrl.push(AddressbookPage);
  }

  public openNotificationsPage(): void {
    this.navCtrl.push(NotificationsPage);
  }

  public openFeePolicyPage(): void {
    this.navCtrl.push(FeePolicyPage);
  }

  public openWalletSettingsPage(walletId: string): void {
    this.navCtrl.push(WalletSettingsPage, { walletId });
  }

  public openSendFeedbackPage(): void {
    this.navCtrl.push(SendFeedbackPage);
  }

  public openFeedbackCompletePage(): void {
    this.navCtrl.push(FeedbackCompletePage, { fromSettings: true });
  }

  public openHelpExternalLink(): void {
    let url = 'http://bookman.com';
    let optIn = true;
    let title = null;
    let message = this.translate.instant(
      'Help and support information is available at the website.'
    );
    let okText = this.translate.instant('Open');
    let cancelText = this.translate.instant('Go Back');
    this.externalLinkProvider.open(
      url,
      optIn,
      title,
      message,
      okText,
      cancelText
    );
  }

  private openPinModal(action): void {
    const modal = this.modalCtrl.create(
      PinModalPage,
      { action },
      { cssClass: 'fullscreen-modal' }
    );
    modal.present();
    modal.onDidDismiss(cancelClicked => {
      if (!cancelClicked) this.navCtrl.push(LockPage);
    });
  }

  private checkFingerprint(): void {
    this.touchid.check().then(() => {
      this.navCtrl.push(LockPage);
    });
  }

  public toggleBalance() {
    // 隐藏金额
  }

  private updateAll = _.debounce(
    (force?) => {
      // this.updateStatus(force);
      // this.updateTxHistory();
    },
    2000,
    {
      leading: true
    }
  );

  private listenForEvents() {
    // BWS Events: Update Status per Wallet
    // NewBlock, NewCopayer, NewAddress, NewTxProposal, TxProposalAcceptedBy, TxProposalRejectedBy, txProposalFinallyRejected,
    // txProposalFinallyAccepted, TxProposalRemoved, NewIncomingTx, NewOutgoingTx
    // this.events.subscribe('bwsEvent', (walletId: string) => {
    //   if (this.recentTransactionsEnabled) this.getNotifications();
    //   this.updateWallet(walletId);
    // });

    // // Create, Join, Import and Delete -> Get Wallets -> Update Status for All Wallets
    // this.events.subscribe('status:updated', () => {
    //   this.updateTxps();
    //   this.setWallets();
    // });

    this.events.subscribe('node:balance', balance => {
      this.walletBalance = balance;
      this.logger.info(this.walletBalance);
    });

    this.events.subscribe('node:cplist', cps => {
      // this.cpList = cps;
    });
  }

  private unListenForEvents() {
    this.events.unsubscribe('node:balance');
    this.events.unsubscribe('node:cplist');
  }

  public openScanPage(): void {
    this.navCtrl.push(ScanPage);
  }

  public openReceivePage(): void {
    this.navCtrl.push(ReceivePage);
  }
  public openSendPage(): void {
    this.navCtrl.push(SendPage);
  }

  public openContractPage(): void {
    this.navCtrl.push(ContractPage);
  }
}
