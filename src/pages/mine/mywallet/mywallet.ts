import { Component, VERSION, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  Events,
  ModalController,
  NavController,
  ToastController
} from 'ionic-angular';
import { Logger } from '../../../providers/logger/logger';
import { BackupWalletPage } from '../mywallet/backupwallet/backupwallet';
@Component({
  selector: 'page-mywallet',
  templateUrl: './mywallet.html'
})
export class MyWalletPage {
  constructor(private navCtrl: NavController) {}
  // 跳转到备份钱包
  gotoBackupWalletPage() {
    this.navCtrl.push(BackupWalletPage, {});
  }
}
