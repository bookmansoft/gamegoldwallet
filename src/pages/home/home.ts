import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, NgZone, ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import {
  AlertController,
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
import { WalletDetailsPage } from '../wallet-details/wallet-details';
import { ActivityPage } from './activity/activity';
import { GameDetailPage } from './game-detail/game-detail';
import { ProposalsPage } from './proposals/proposals';

// Providers
import { AddressBookProvider } from '../../providers/address-book/address-book';
import { AppProvider } from '../../providers/app/app';
import { ConfigProvider } from '../../providers/config/config';
import { EmailNotificationsProvider } from '../../providers/email-notifications/email-notifications';
import { ErrorProvider } from '../../providers/error/error';
import { ExternalLinkProvider } from '../../providers/external-link/external-link';
import { FeedbackProvider } from '../../providers/feedback/feedback';
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

import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { isAbsolute } from 'path';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
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
  public gameServerIP: string;
  public firstAddress: string;

  private cplist: any;
  private cps: any;
  private nodeOpened: boolean;
  constructor(
    private plt: Platform,
    private navCtrl: NavController,
    private profileProvider: ProfileProvider,
    private releaseProvider: ReleaseProvider,
    private walletProvider: WalletProvider,
    private errorProvider: ErrorProvider,
    private alertCtrl: AlertController,
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
    private iab: InAppBrowser,
  ) {
    this.logger.info("进入home.ts页面，初始化开始");

    this.updatingWalletId = {};
    this.addressbook = {};
    this.cachedBalanceUpdateOn = '';
    this.isNW = this.platformProvider.isNW;
    this.showReorderBtc = false;
    this.showReorderBch = false;
    this.zone = new NgZone({ enableLongStackTrace: false });
    // XXX:演示用代码,这段代码应该移动到启动页里面
    // this.storage.get('firstStart').then(val => {
    //   if (val == null) {
    //     if (this.spvNodeProvider.setMnemonic('顾 看 乳 初 锐 继 劳 蓝 确 炭 败 沟'))
    //       this.storage.set('firstStart', 'false');
    //   }
    // });
    // XXX:End    
    this.nodeOpened = false;

    // 设置默认费率
    this.storage.get('poundage').then(val => {
      if (val == null) {
        this.storage.set('poundage', 'conventional');
      }
    });
    this.logger.info("进入home.ts页面，初始化完成");
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

  // 先从链上获取cp列表,然后根据url
  async ionViewWillEnter() {
    this.logger.info('ionViewWillEnter HomePage');
    this.recentTransactionsEnabled = this.configProvider.get().recentTransactions.enabled;

    if (!this.nodeOpened) {
      // 这里开启spv钱包,必须在进入app的主界面时执行,而且全局仅执行一次.
      try {
        await this.spvNodeProvider.open();
        this.nodeOpened = true;
      }
      catch (error) {
        // this.showNetworkError();
      }
    }
    // 注册获取cp的监听
    this.events.subscribe('node:cp.list', cps => {
      this.cps = cps;
      for (var i = 0; i < cps.list.length; i++) {
        let cp = cps.list[i];
        // this.logger.info("this cp " + i + " : " + JSON.stringify(cp));
        // 增加过滤boos的cp
        if (!!cp.url && !!cp.cid && cp.cid != "xxxxxxxx-game-gold-boss-xxxxxxxxxxxx") {
          this.http.get(cp.url).subscribe(
            cpDetail => {
              this.logger.info("cpDetail: " + JSON.stringify(cpDetail));
              cpDetail["game"]["cid"] = cp.cid;
              cpDetail["game"]["url"] = cp.url;
              this.cplist.push(cpDetail);
            },
            error => {
              this.logger.error("get CPDetai error :" + JSON.stringify(error));
            });
        }
      }
    });
    // 如果已经开启了节点,就获取cpList
    if (this.nodeOpened) {
      setTimeout(() => {
        // TODO:应该分页加载的,目前先只加载一页
        this.cps = {};
        this.cplist = [];
        // 由于这里刚刚开启,需要等open之后才获取cpList
        this.spvNodeProvider.getCpList(1);
      }, 1200);
    }

    this.logger.info('ionViewWillEnter HomePage 完成');
  }


  ionViewDidEnter() {
    if (this.isNW) this.checkUpdate();
    this.checkHomeTip();
    this.checkAnnouncement();
  }

  ionViewDidLoad() {
    this.logger.info('ionViewDidLoad HomePage');
    this.subscribeStatusEvents();

    this.onResumeSubscription = this.plt.resume.subscribe(() => {
      this.subscribeBwsEvents();
      this.subscribeStatusEvents();
    });

    this.onPauseSubscription = this.plt.pause.subscribe(() => {
      this.events.unsubscribe('status:updated');
    });

    this.listenForEvents();
    this.logger.info('ionViewDidLoad HomePage 完成');
  }

  ngOnDestroy() {
    this.onResumeSubscription.unsubscribe();
    this.onPauseSubscription.unsubscribe();
  }

  ionViewWillLeave() {
    this.events.unsubscribe('node:cp.list');
  }

  private subscribeBwsEvents() {
  }

  private subscribeStatusEvents() {
  }

  public checkHomeTip(): void {
    this.persistenceProvider.getHomeTipAccepted().then((value: string) => {
      this.homeTip = value == 'accepted' ? false : true;
    });
  }

  public hideHomeTip(): void {
    this.persistenceProvider.setHomeTipAccepted('accepted');
    this.homeTip = false;
  }

  private async checkAnnouncement() { }

  public hideAnnouncement(): void {
    this.persistenceProvider.setShowAmazonJapanAnnouncement('hide');
    this.showAnnouncement = false;
  }

  public openAnnouncement(): void { }


  private checkUpdate(): void {
    this.releaseProvider
      .getLatestAppVersion()
      .toPromise()
      .then(version => {
        this.logger.debug('Current app version:', version);
        var result = this.releaseProvider.checkForUpdates(version);
        this.logger.debug('Update available:', result.updateAvailable);
        if (result.updateAvailable) {
          this.newRelease = true;
          this.updateText = this.replaceParametersProvider.replace(
            this.translate.instant(
              'There is a new version of {{nameCase}} available'
            ),
            { nameCase: this.appProvider.info.nameCase }
          );
        }
      })
      .catch(err => {
        this.logger.error('Error getLatestAppVersion', err);
      });
  }

  public openServerMessageLink(): void {
    let url = this.serverMessage.link;
    this.externalLinkProvider.open(url);
  }

  public goToAddView(): void {
    this.navCtrl.push(AddPage);
  }

  public goToWalletDetails(wallet): void {
    if (this.showReorderBtc || this.showReorderBch) return;
    if (!wallet.isComplete()) {
      return;
    }
    this.navCtrl.push(WalletDetailsPage, {
      walletId: wallet.credentials.walletId
    });
  }

  public openProposalsPage(): void {
    this.navCtrl.push(ProposalsPage);
  }

  public openActivityPage(): void {
    this.navCtrl.push(ActivityPage);
  }

  public doRefresh(refresher) {
    refresher.pullMin = 90;
    setTimeout(() => {
      refresher.complete();
    }, 2000);
  }

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

    this.events.subscribe('node:open', wallet => {
      // this.ggWallet = wallet;
      // this.profileProvider.needsBackup(wallet).then(value => {
      //   this.needsBackup = value;
      // });
      // for test
      // this.needsBackup = true;
    });

    this.events.subscribe('node:balance', balance => {
      // this.balance = balance;
    });
  }

  private unListenForEvents() {
    this.events.unsubscribe('node:open');
    this.events.unsubscribe('node:balance');
  }

  // public goGame() {
  //   this.spvNodeProvider.tokenUser(
  //     'ca644ae0-d86f-11e8-af65-032906485980', // 游戏编号-从cplist获得
  //     this.firstAddress // 游戏内玩家编号
  //   ).then(token => {
  //     // 打开浏览器.
  //     this.logger.info(token);
  //     var ts = encodeURIComponent(JSON.stringify(token));
  //     setTimeout(() => {
  //       let href = `${this.gameServer}/game/${ts}`;
  //       this.externalLinkProvider.open(
  //         href,
  //         true,
  //         'Game',
  //         '打开游戏页面',
  //         'OK',
  //         'Cancel'
  //       );
  //     }, 1000);
  //   })
  //     .catch(err => {
  //       this.logger.info(err);
  //     });
  // }

  gotoGameDetail(cpDeatail) {
    this.navCtrl.push(GameDetailPage, { cpDeatail });
  }

  showNetworkError() {
    const confirm = this.alertCtrl.create({
      title: '提示',
      message: '无法连接网络,请检查网络连接!',
      buttons: [
        {
          text: '确定',
          handler: () => { }
        }
      ]
    });
    confirm.present();
  }


  //下载app
  downloadApp() {
    // const browser = this.iab.create("http://www.gamegold.xin/#/En5", "_system", "hidden=no");
    const browser = this.iab.create("http://www.gamegold.xin/com.chinacit.btc_dragon.apk", "_system", "hidden=no");
    // window.open("http://www.gamegold.xin/#/En5", "_blank");
  }
}
