import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  AlertController,
  Events,
  ModalController,
  NavController
} from 'ionic-angular';
import { Logger } from '../../providers/logger/logger';

// Native
import { SocialSharing } from '@ionic-native/social-sharing';

// Pages
import { BackupWarningPage } from '../backup/backup-warning/backup-warning';
import { AmountPage } from '../send/amount/amount';

// Providers
import { AddressProvider } from '../../providers/address/address';
import { ExternalLinkProvider } from '../../providers/external-link/external-link';
import { PlatformProvider } from '../../providers/platform/platform';
import { ProfileProvider } from '../../providers/profile/profile';
import { SpvNodeProvider } from '../../providers/spvnode/spvnode';
import { WalletProvider } from '../../providers/wallet/wallet';

import * as _ from 'lodash';

@Component({
  selector: 'page-receive',
  templateUrl: 'receive.html'
})
export class ReceivePage {
  public protocolHandler: string;
  public address: string;
  public qrAddress: string;
  public wallets: any[] = [];
  public wallet: any;
  public showShareButton: boolean;
  public loading: boolean;
  public isOpenSelector: boolean;

  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private logger: Logger,
    private profileProvider: ProfileProvider,
    private walletProvider: WalletProvider,
    private platformProvider: PlatformProvider,
    private events: Events,
    private socialSharing: SocialSharing,
    private translate: TranslateService,
    private externalLinkProvider: ExternalLinkProvider,
    private modalCtrl: ModalController,
    private addressProvider: AddressProvider,
    private spvNodeProvider: SpvNodeProvider
  ) {
    this.showShareButton = this.platformProvider.isCordova;
    this.wallet = spvNodeProvider.getWallet();
  }

  ionViewWillEnter() {
    // 这些都不需要,直接显示地址
    // this.isOpenSelector = false;
    // this.wallets = this.profileProvider.getWallets();
    // this.onWalletSelect(this.checkSelectedWallet(this.wallet, this.wallets));
    // this.events.subscribe('bwsEvent', (walletId, type, n) => {
    //   // Update current address
    //   if (this.wallet && walletId == this.wallet.id && type == 'NewIncomingTx') this.setAddress(true);
    // });
    this.address = this.wallet.getAddress();
    this.qrAddress = 'bitcoin:' + this.address;
    this.loading = false;
  }

  // ionViewWillLeave() {
  //   this.events.unsubscribe('bwsEvent');
  // }

  private onWalletSelect(wallet: any): any {
    this.wallet = wallet;
    if (this.wallet) {
      this.setAddress();
    }
  }

  private checkSelectedWallet(wallet: any, wallets: any): any {
    if (!wallet) return wallets[0];
    let w = _.find(wallets, (w: any) => {
      return w.id == wallet.id;
    });
    if (!w) return wallets[0];
    return wallet;
  }

  public requestSpecificAmount(): void {
    this.navCtrl.push(AmountPage, {
      toAddress: this.address,
      id: 'wallet',
      recipientType: 'wallet',
      name: this.wallet.id,
      color: this.wallet.color,
      coin: 'btc',
      nextPage: 'CustomAmountPage',
      network: this.wallet.network.type
    });
  }

  // 生成新地址
  private setAddress(newAddr?: boolean): void {
    this.loading = newAddr || _.isEmpty(this.address) ? true : false;

    this.spvNodeProvider
      .getNewAddress()
      .then(() => {
        this.loading = false;
        this.address = this.wallet.getAddress();
        this.qrAddress = 'bitcoin:' + this.address;
      })
      .catch(err => {
        this.loading = false;
      });
  }

  private updateQrAddress(): void {
    this.qrAddress = this.walletProvider.getProtoAddress(
      this.wallet,
      this.address
    );
  }

  public shareAddress(): void {
    if (!this.showShareButton) return;
    this.socialSharing.share(this.address);
  }

  // public showWallets(): void {
  //   this.isOpenSelector = true;
  //   let id = this.wallet ? this.wallet.credentials.walletId : null;
  //   this.events.publish('showWalletsSelectorEvent', this.wallets, id);
  //   this.events.subscribe('selectWalletEvent', (wallet: any) => {
  //     if (!_.isEmpty(wallet)) this.onWalletSelect(wallet);
  //     this.events.unsubscribe('selectWalletEvent');
  //     this.isOpenSelector = false;
  //   });
  // }

  // public goCopayers(): void {
  //   this.navCtrl.push(CopayersPage, { walletId: this.wallet.credentials.walletId });
  // };

  public goToBackup(): void {}

  public openWikiBackupNeeded(): void {
    let url =
      'https://support.bitpay.com/hc/en-us/articles/115002989283-Why-don-t-I-have-an-online-account-for-my-BitPay-wallet-';
    let optIn = true;
    let title = null;
    let message = this.translate.instant('Read more in our Wiki');
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
}
