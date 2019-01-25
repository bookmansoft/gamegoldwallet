import { Component, NgZone, ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import {
  Events,
  ModalController,
  NavController,
  Platform
} from 'ionic-angular';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

// Pages
import { AddPage } from '../add/add';
import { TxDetailsPage } from '../tx-details/tx-details';
import { TxpDetailsPage } from '../txp-details/txp-details';
import { WalletDetailsPage } from '../wallet-details/wallet-details';
import { ActivityPage } from './activity/activity';
import { ProposalsPage } from './proposals/proposals';

// Providers
import { AddressBookProvider } from '../../providers/address-book/address-book';
import { AppProvider } from '../../providers/app/app';
import { ConfigProvider } from '../../providers/config/config';
import { EmailNotificationsProvider } from '../../providers/email-notifications/email-notifications';
import { ErrorProvider } from '../../providers/error/error';
import { ExternalLinkProvider } from '../../providers/external-link/external-link';
import { FeedbackProvider } from '../../providers/feedback/feedback';
import { HttpClient } from '@angular/common/http';
import { Logger } from '../../providers/logger/logger';
import { OnGoingProcessProvider } from '../../providers/on-going-process/on-going-process';
import { PersistenceProvider } from '../../providers/persistence/persistence';
import { PlatformProvider } from '../../providers/platform/platform';
import { PopupProvider } from '../../providers/popup/popup';
import { ProfileProvider } from '../../providers/profile/profile';
import { ReleaseProvider } from '../../providers/release/release';
import { ReplaceParametersProvider } from '../../providers/replace-parameters/replace-parameters';
import { SpvNodeProvider } from '../../providers/spvnode/spvnode';
import { WalletProvider } from '../../providers/wallet/wallet';
import { ScanPage } from '../scan/scan';

@Component({
  selector: 'page-game-detail',
  templateUrl: 'game-detail.html'
})
export class GameDetailPage {
  public searchInput: string;
  index: number = 1;

  @ViewChild('showCard')
  showCard;
  public ggWallet: any;
  public wallets: any;
  public walletsBtc: any;
  public walletsBch: any;
  public cachedBalanceUpdateOn: string;
  public recentTransactionsEnabled: boolean;
  public txps: any;
  public txpsN: number;

  public notifications;
  public notificationsN: number;
  public serverMessage;
  public addressbook;
  public newRelease: boolean;
  public updateText: string;
  public homeIntegrations;
  public bitpayCardItems;
  public showBitPayCard: boolean = false;
  public showAnnouncement: boolean = false;

  public showRateCard: boolean;
  public homeTip: boolean;
  public showReorderBtc: boolean;
  public showReorderBch: boolean;
  public showIntegration;

  private isNW: boolean;
  private updatingWalletId: object;
  private zone;
  private onResumeSubscription: Subscription;
  private onPauseSubscription: Subscription;

  public gameServer: string;
  public firstAddress: string;

  constructor(
    private plt: Platform,
    private navCtrl: NavController,
    private profileProvider: ProfileProvider,
    private releaseProvider: ReleaseProvider,
    private walletProvider: WalletProvider,
    private errorProvider: ErrorProvider,
    private logger: Logger,
    private events: Events,
    private configProvider: ConfigProvider,
    private externalLinkProvider: ExternalLinkProvider,
    private onGoingProcessProvider: OnGoingProcessProvider,
    private popupProvider: PopupProvider,
    private modalCtrl: ModalController,
    private addressBookProvider: AddressBookProvider,
    private appProvider: AppProvider,
    private platformProvider: PlatformProvider,
    private persistenceProvider: PersistenceProvider,
    private feedbackProvider: FeedbackProvider,
    private translate: TranslateService,
    private emailProvider: EmailNotificationsProvider,
    private replaceParametersProvider: ReplaceParametersProvider,
    private spvNodeProvider: SpvNodeProvider,
    private storage: Storage,
    private http: HttpClient,
  ) {

  }
  // 用于实时搜索,提示
  onInput(inputEvent: Event) {
    this.logger.info('input21111 !' + this.searchInput);
  }
  // 用于确认搜索
  onSearch() {
    // this.myInput有值时候,进行搜索
    this.logger.info('搜索 !' + this.searchInput);
  }
  // 用于聚焦切换
  onFocusInput() {
    this.logger.info('focusInput !');
  }
  // 选项卡切换
  onSelect(index) {
    this.logger.info('点击 !' + index);
    this.index = index;
  }

  // 扫一扫
  public openScanPage(): void {
    this.navCtrl.push(ScanPage, {});
  }

  ionViewWillEnter() {

  }

  ionViewDidEnter() {

  }

  ionViewDidLoad() {
    this.logger.info('ionViewDidLoad GameDetailPage');

  }

  ngOnDestroy() {
    this.onResumeSubscription.unsubscribe();
    this.onPauseSubscription.unsubscribe();
  }

  ionViewWillLeave() {
    this.events.unsubscribe('bwsEvent');
  }

  public getGameInfo(): void {
    let url = 'http://114.116.148.48:9701/mock/cp0104';
    this.http.get(url).subscribe(response => {
      console.log("165");
      console.log(response);


    });
  }

  // private subscribeBwsEvents() {
  //   // BWS Events: Update Status per Wallet
  //   // NewBlock, NewAddress, NewTxProposal, TxProposalAcceptedBy, TxProposalRejectedBy, txProposalFinallyRejected,
  //   // txProposalFinallyAccepted, TxProposalRemoved, NewIncomingTx, NewOutgoingTx
  //   this.events.subscribe('bwsEvent', (walletId: string) => {
  //     this.getNotifications();
  //     this.updateWallet(walletId);
  //   });
  // }

  // private subscribeStatusEvents() {
  //   // Create, Join, Import and Delete -> Get Wallets -> Update Status for All Wallets
  //   this.events.subscribe('status:updated', () => {
  //     this.updateTxps();
  //     this.setWallets();
  //   });
  // }

  // private openEmailDisclaimer() {
  //   let message = this.translate.instant(
  //     'By providing your email address, you give explicit consent to BitPay to use your email address to send you email notifications about payments.'
  //   );
  //   let title = this.translate.instant('Privacy Policy update');
  //   let okText = this.translate.instant('Accept');
  //   let cancelText = this.translate.instant('Disable notifications');
  //   this.popupProvider
  //     .ionicConfirm(title, message, okText, cancelText)
  //     .then(ok => {
  //       if (ok) {
  //         // Accept new Privacy Policy
  //         this.persistenceProvider.setEmailLawCompliance('accepted');
  //       } else {
  //         // Disable email notifications
  //         this.persistenceProvider.setEmailLawCompliance('rejected');
  //         this.emailProvider.updateEmail({
  //           enabled: false,
  //           email: 'null@email'
  //         });
  //       }
  //     });
  // }

  // private checkEmailLawCompliance(): void {
  //   setTimeout(() => {
  //     if (this.emailProvider.getEmailIfEnabled()) {
  //       this.persistenceProvider.getEmailLawCompliance().then(value => {
  //         if (!value) this.openEmailDisclaimer();
  //       });
  //     }
  //   }, 2000);
  // }

  // private startUpdatingWalletId(walletId: string) {
  //   this.updatingWalletId[walletId] = true;
  // }

  // private stopUpdatingWalletId(walletId: string) {
  //   setTimeout(() => {
  //     this.updatingWalletId[walletId] = false;
  //   }, 10000);
  // }

  // private setWallets = _.debounce(
  //   () => {
  //     this.wallets = this.profileProvider.getWallets();
  //     this.walletsBtc = _.filter(this.wallets, (x: any) => {
  //       return x.credentials.coin == 'btc';
  //     });
  //     this.walletsBch = _.filter(this.wallets, (x: any) => {
  //       return x.credentials.coin == 'bch';
  //     });
  //     this.updateAllWallets();
  //   },
  //   5000,
  //   {
  //     leading: true
  //   }
  // );

  // public checkHomeTip(): void {
  //   this.persistenceProvider.getHomeTipAccepted().then((value: string) => {
  //     this.homeTip = value == 'accepted' ? false : true;
  //   });
  // }

  // public hideHomeTip(): void {
  //   this.persistenceProvider.setHomeTipAccepted('accepted');
  //   this.homeTip = false;
  // }

  // private async checkAnnouncement() { }

  // public hideAnnouncement(): void {
  //   this.persistenceProvider.setShowAmazonJapanAnnouncement('hide');
  //   this.showAnnouncement = false;
  // }

  // public openAnnouncement(): void { }

  // private checkFeedbackInfo() {
  //   this.persistenceProvider.getFeedbackInfo().then(info => {
  //     if (!info) {
  //       this.initFeedBackInfo();
  //     } else {
  //       let feedbackInfo = info;
  //       // Check if current version is greater than saved version
  //       let currentVersion = this.releaseProvider.getCurrentAppVersion();
  //       let savedVersion = feedbackInfo.version;
  //       let isVersionUpdated = this.feedbackProvider.isVersionUpdated(
  //         currentVersion,
  //         savedVersion
  //       );
  //       if (!isVersionUpdated) {
  //         this.initFeedBackInfo();
  //         return;
  //       }
  //       let now = moment().unix();
  //       let timeExceeded = now - feedbackInfo.time >= 24 * 7 * 60 * 60;
  //     }
  //   });
  // }

  // private initFeedBackInfo() {
  //   this.persistenceProvider.setFeedbackInfo({
  //     time: moment().unix(),
  //     version: this.releaseProvider.getCurrentAppVersion(),
  //     sent: false
  //   });
  //   this.showRateCard = false;
  // }

  // private updateWallet(walletId: string): void {
  //   if (this.updatingWalletId[walletId]) return;
  //   this.startUpdatingWalletId(walletId);
  //   let wallet = this.profileProvider.getWallet(walletId);
  //   this.walletProvider
  //     .getStatus(wallet, {})
  //     .then(status => {
  //       wallet.status = status;
  //       wallet.error = null;
  //       this.profileProvider.setLastKnownBalance(
  //         wallet.id,
  //         wallet.status.availableBalanceStr
  //       );
  //       this.updateTxps();
  //       this.stopUpdatingWalletId(walletId);
  //     })
  //     .catch(err => {
  //       this.logger.error(err);
  //       this.stopUpdatingWalletId(walletId);
  //     });
  // }

  // private updateTxps = _.debounce(
  //   () => {
  //     this.profileProvider
  //       .getTxps({ limit: 3 })
  //       .then(data => {
  //         this.zone.run(() => {
  //           this.txps = data.txps;
  //           this.txpsN = data.n;
  //         });
  //       })
  //       .catch(err => {
  //         this.logger.error(err);
  //       });
  //   },
  //   5000,
  //   {
  //     leading: true
  //   }
  // );

  // private getNotifications = _.debounce(
  //   () => {
  //     if (!this.recentTransactionsEnabled) return;
  //     this.profileProvider
  //       .getNotifications({ limit: 3 })
  //       .then(data => {
  //         this.zone.run(() => {
  //           this.notifications = data.notifications;
  //           this.notificationsN = data.total;
  //         });
  //       })
  //       .catch(err => {
  //         this.logger.error(err);
  //       });
  //   },
  //   5000,
  //   {
  //     leading: true
  //   }
  // );

  // private updateAllWallets(): void {
  //   let foundMessage = false;

  //   if (_.isEmpty(this.wallets)) return;

  //   let i = this.wallets.length;
  //   let j = 0;

  //   let pr = ((wallet, cb) => {
  //     this.walletProvider
  //       .getStatus(wallet, {})
  //       .then(status => {
  //         wallet.status = status;
  //         wallet.error = null;

  //         if (!foundMessage && !_.isEmpty(status.serverMessage)) {
  //           this.serverMessage = status.serverMessage;
  //           foundMessage = true;
  //         }

  //         this.profileProvider.setLastKnownBalance(
  //           wallet.id,
  //           wallet.status.availableBalanceStr
  //         );
  //         return cb();
  //       })
  //       .catch(err => {
  //         wallet.error =
  //           err === 'WALLET_NOT_REGISTERED'
  //             ? 'Wallet not registered'
  //             : this.errorProvider.msg(err);
  //         this.logger.warn(
  //           this.errorProvider.msg(
  //             err,
  //             'Error updating status for ' + wallet.name
  //           )
  //         );
  //         return cb();
  //       });
  //   }).bind(this);

  //   _.each(this.wallets, wallet => {
  //     pr(wallet, () => {
  //       if (++j == i) {
  //         this.updateTxps();
  //       }
  //     });
  //   });
  // }

  // private checkUpdate(): void {
  //   this.releaseProvider
  //     .getLatestAppVersion()
  //     .toPromise()
  //     .then(version => {
  //       this.logger.debug('Current app version:', version);
  //       var result = this.releaseProvider.checkForUpdates(version);
  //       this.logger.debug('Update available:', result.updateAvailable);
  //       if (result.updateAvailable) {
  //         this.newRelease = true;
  //         this.updateText = this.replaceParametersProvider.replace(
  //           this.translate.instant(
  //             'There is a new version of {{nameCase}} available'
  //           ),
  //           { nameCase: this.appProvider.info.nameCase }
  //         );
  //       }
  //     })
  //     .catch(err => {
  //       this.logger.error('Error getLatestAppVersion', err);
  //     });
  // }

  // public openServerMessageLink(): void {
  //   let url = this.serverMessage.link;
  //   this.externalLinkProvider.open(url);
  // }

  // public goToAddView(): void {
  //   this.navCtrl.push(AddPage);
  // }

  // public goToWalletDetails(wallet): void {
  //   if (this.showReorderBtc || this.showReorderBch) return;
  //   if (!wallet.isComplete()) {
  //     return;
  //   }
  //   this.navCtrl.push(WalletDetailsPage, {
  //     walletId: wallet.credentials.walletId
  //   });
  // }

  // public openNotificationModal(n) {
  //   let wallet = this.profileProvider.getWallet(n.walletId);

  //   if (n.txid) {
  //     this.navCtrl.push(TxDetailsPage, { walletId: n.walletId, txid: n.txid });
  //   } else {
  //     var txp = _.find(this.txps, {
  //       id: n.txpId
  //     });
  //     if (txp) {
  //       this.openTxpModal(txp);
  //     } else {
  //       this.onGoingProcessProvider.set('loadingTxInfo');
  //       this.walletProvider
  //         .getTxp(wallet, n.txpId)
  //         .then(txp => {
  //           var _txp = txp;
  //           this.onGoingProcessProvider.clear();
  //           this.openTxpModal(_txp);
  //         })
  //         .catch(() => {
  //           this.onGoingProcessProvider.clear();
  //           this.logger.warn('No txp found');
  //           let title = this.translate.instant('Error');
  //           let subtitle = this.translate.instant('Transaction not found');
  //           return this.popupProvider.ionicAlert(title, subtitle);
  //         });
  //     }
  //   }
  // }

  // public reorderBtc(): void {
  //   this.showReorderBtc = !this.showReorderBtc;
  // }

  // public reorderBch(): void {
  //   this.showReorderBch = !this.showReorderBch;
  // }

  // public reorderWalletsBtc(indexes): void {
  //   let element = this.walletsBtc[indexes.from];
  //   this.walletsBtc.splice(indexes.from, 1);
  //   this.walletsBtc.splice(indexes.to, 0, element);
  //   _.each(this.walletsBtc, (wallet, index: number) => {
  //     this.profileProvider.setWalletOrder(wallet.id, index);
  //   });
  // }

  // public reorderWalletsBch(indexes): void {
  //   let element = this.walletsBch[indexes.from];
  //   this.walletsBch.splice(indexes.from, 1);
  //   this.walletsBch.splice(indexes.to, 0, element);
  //   _.each(this.walletsBch, (wallet, index: number) => {
  //     this.profileProvider.setWalletOrder(wallet.id, index);
  //   });
  // }

  // public goToDownload(): void {
  //   let url = 'https://github.com/bitpay/copay/releases/latest';
  //   let optIn = true;
  //   let title = this.translate.instant('Update Available');
  //   let message = this.translate.instant(
  //     'An update to this app is available. For your security, please update to the latest version.'
  //   );
  //   let okText = this.translate.instant('View Update');
  //   let cancelText = this.translate.instant('Go Back');
  //   this.externalLinkProvider.open(
  //     url,
  //     optIn,
  //     title,
  //     message,
  //     okText,
  //     cancelText
  //   );
  // }

  // public openTxpModal(tx): void {
  //   let modal = this.modalCtrl.create(
  //     TxpDetailsPage,
  //     { tx },
  //     { showBackdrop: false, enableBackdropDismiss: false }
  //   );
  //   modal.present();
  // }

  // public openProposalsPage(): void {
  //   this.navCtrl.push(ProposalsPage);
  // }

  // public openActivityPage(): void {
  //   this.navCtrl.push(ActivityPage);
  // }

  // public doRefresh(refresher) {
  //   refresher.pullMin = 90;
  //   this.updateAllWallets();
  //   this.getNotifications();
  //   setTimeout(() => {
  //     refresher.complete();
  //   }, 2000);
  // }

  // private listenForEvents() {
  //   // BWS Events: Update Status per Wallet
  //   // NewBlock, NewCopayer, NewAddress, NewTxProposal, TxProposalAcceptedBy, TxProposalRejectedBy, txProposalFinallyRejected,
  //   // txProposalFinallyAccepted, TxProposalRemoved, NewIncomingTx, NewOutgoingTx
  //   // this.events.subscribe('bwsEvent', (walletId: string) => {
  //   //   if (this.recentTransactionsEnabled) this.getNotifications();
  //   //   this.updateWallet(walletId);
  //   // });

  //   // // Create, Join, Import and Delete -> Get Wallets -> Update Status for All Wallets
  //   // this.events.subscribe('status:updated', () => {
  //   //   this.updateTxps();
  //   //   this.setWallets();
  //   // });

  //   this.events.subscribe('node:open', wallet => {
  //     // this.ggWallet = wallet;
  //     // this.profileProvider.needsBackup(wallet).then(value => {
  //     //   this.needsBackup = value;
  //     // });
  //     // for test
  //     // this.needsBackup = true;
  //   });

  //   this.events.subscribe('node:balance', balance => {
  //     // this.balance = balance;
  //   });

  //   // 用地址簿的第一个地址作为游戏内ID
  //   this.events.subscribe('address.first', address => {
  //     this.firstAddress = address;
  //   });
  // }

  // private unListenForEvents() {
  //   this.events.unsubscribe('node:open');
  //   this.events.unsubscribe('node:balance');
  //   this.events.unsubscribe('address.first');
  // }

  // public goGame() {
  //   let wdb = this.spvNodeProvider.getWdb();
  //   if (wdb) {
  //     wdb.rpc
  //       .execute({
  //         method: 'token.user',
  //         params: [
  //           'ca644ae0-d86f-11e8-af65-032906485980', // 游戏编号-从cplist获得
  //           this.firstAddress // 游戏内玩家编号
  //         ]
  //       })
  //       .then(token => {
  //         // 打开浏览器.
  //         this.logger.info(token);
  //         var ts = encodeURIComponent(JSON.stringify(token));
  //         setTimeout(() => {
  //           let href = `${this.gameServer}/game/${ts}`;
  //           this.externalLinkProvider.open(
  //             href,
  //             true,
  //             'Game',
  //             '打开游戏页面',
  //             'OK',
  //             'Cancel'
  //           );
  //         }, 1000);
  //       })
  //       .catch(err => {
  //         this.logger.info(err);
  //       });
  //   }
  // }
}
