import { Component, NgZone, ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage';
import {
  Events,
  ModalController,
  NavController,
  Platform
} from 'ionic-angular';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';

// Pages

// Providers
import { HttpClient } from '@angular/common/http';
import { Logger } from '../../providers/logger/logger';
import { SpvNodeProvider } from '../../providers/spvnode/spvnode';
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

  private onResumeSubscription: Subscription;
  private onPauseSubscription: Subscription;

  public gameServer: string;
  public firstAddress: string;

  constructor(
    private navCtrl: NavController,
    private logger: Logger,
    private events: Events,
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
      //console.log("165");
      //console.log(response);


    });
  }

 
}
