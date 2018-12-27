import { Component, VERSION, ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import {
  AlertController,
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
import { Utils } from '../../../providers/utils/utils';
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
  public isToggled: boolean;
  private title: string = '设置您的支付密码';
  private title1: string = '确认您的支付密码';
  private password: string;
  public walletpassword: string;
  private index: boolean = false;
  public balance;

  constructor(
    private navCtrl: NavController,
    private logger: Logger,
    public toastCtrl: ToastController,
    private events: Events,
    private spvNodeProvider: SpvNodeProvider,
    private storage: Storage,
    private alertCtrl: AlertController,
    private utils: Utils
  ) {
    this.isToggled = false;
    this.storage.get('walletpassword').then(val => {
      this.logger.info('缓存：' + val);
      this.walletpassword = val;
      this.isToggled = val ? true : false;
      if (val == null) {
        this.index = true;
      }
    });
  }
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
  // 开关按钮事件监听
  public toggleFun() {
    this.logger.info('Toggled: ' + this.isToggled);
    if (this.isToggled && this.index) {
      this.setPassword(this.title, 0);
    } else {
      if (!this.isToggled && !this.index) {
        this.colsePassword();
      }
    }
  }

  // 取消支付密码
  colsePassword() {
    const prompt = this.alertCtrl.create({
      title: '',
      message: '请输入您的支付密码',
      enableBackdropDismiss: false,
      inputs: [
        {
          name: 'password',
          placeholder: '请输入',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: '取消',
          cssClass: 'alert-btn',
          handler: data => {
            this.isToggled = true;
          }
        },
        {
          text: '确定',
          role: null,
          handler: data => {
            if (data.password != '') {
              if (this.walletpassword == data.password) {
                this.storage.remove('walletpassword');
                this.index = true;
              } else {
                this.isToggled = true;
                let toast = this.toastCtrl.create({
                  message: '支付密码错误！',
                  duration: 2000
                });
                toast.present();
              }
            } else {
              this.isToggled = true;
              let toast = this.toastCtrl.create({
                message: '输入不能为空！',
                duration: 2000
              });
              toast.present();
            }
          }
        }
      ]
    });
    prompt.present();
  }

  // 设置支付密码
  setPassword(title: string, index: number) {
    const prompt = this.alertCtrl.create({
      title,
      message: '支付密码若丢失则无法找回，请妥善保管',
      cssClass: 'headChoice',
      enableBackdropDismiss: false,
      inputs: [
        {
          name: 'password',
          placeholder: '请输入',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: '取消',
          cssClass: 'alert-btn',
          handler: data => {
            this.isToggled = false;
          }
        },
        {
          text: '确定',
          role: null,
          handler: data => {
            if (data.password != '') {
              if (index == 0) {
                this.password = data.password;
                this.setPassword(this.title1, 1);
              } else if (index == 1) {
                if (this.password == data.password) {
                  this.walletpassword = data.password;
                  this.storage.set('walletpassword', data.password);
                  this.isToggled = true;
                  this.index = false;
                } else {
                  let toast = this.toastCtrl.create({
                    message: '两次输入的密码不一致！',
                    duration: 2000
                  });
                  toast.present();
                  this.setPassword(this.title, 0);
                }
              }
            } else {
              this.setPassword(this.title, 0);
              let toast = this.toastCtrl.create({
                message: '输入不能为空！',
                duration: 2000
              });
              toast.present();
            }
          }
        }
      ]
    });
    prompt.present();
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
    // this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length() - 5));
    this.navCtrl.popToRoot();
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
      this.balance = this.utils.toKgUnit(this.walletBalance.confirmed);
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
