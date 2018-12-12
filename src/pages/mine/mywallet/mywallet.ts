import { Component, VERSION, ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import {
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
import { ContractPage } from '../../contract/contract';
import { ReceivePage } from '../../receive/receive';
import { ScanPage } from '../../scan/scan';
import { SendPage } from '../../send/send';
import { AddressbookPage } from '../../settings/addressbook/addressbook';
import { BackupWalletPage } from '../mywallet/backupwallet/backupwallet';
import { PaymentDetailsPage } from './paymentdetails/paymentdetails';
@Component({
  selector: 'page-mywallet',
  templateUrl: './mywallet.html'
})
export class MyWalletPage {
  public walletBalance;
  // 是否已经备份过钱包标记
  private backup: string;
  constructor(
    private navCtrl: NavController,
    private logger: Logger,
    public toastCtrl: ToastController,
    private events: Events,
    private spvNodeProvider: SpvNodeProvider,
    private storage: Storage
  ) {}
  @ViewChild(Navbar) navBar: Navbar;
  ionViewDidLoad() {
    this.navBar.backButtonClick = this.backButtonClick;
  }
  ionViewWillEnter() {
    this.storage.get('backup').then(val => {
      this.backup = val;
    });
    this.listenForEvents();
  }
  ionViewDidEnter() {
    this.spvNodeProvider.getBalance();
  }

  public openAddressBookPage(): void {
    this.navCtrl.push(AddressbookPage);
  }

  ionViewWillLeave() {
    this.unListenForEvents();
  }
  // 跳转到收支明细
  gotoPaymentDetailsPage() {
    this.navCtrl.push(PaymentDetailsPage, {});
  }

  // 返回到我的页面
  backButtonClick = (e: UIEvent) => {
    this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length() - 5));
  };

  // 跳转到备份钱包
  gotoBackupWalletPage() {
    this.navCtrl.push(BackupWalletPage, {});
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
  // 接收
  public openReceivePage(): void {
    this.navCtrl.push(ReceivePage, {
      balance: this.walletBalance
    });
  }
  // 扫一扫
  public openScanPage(): void {
    this.navCtrl.push(ScanPage);
  }
  // 发送
  public openSendPage(): void {
    this.navCtrl.push(SendPage);
  }
  // 交易对
  public openContractPage(): void {
    this.navCtrl.push(ContractPage);
  }
}
