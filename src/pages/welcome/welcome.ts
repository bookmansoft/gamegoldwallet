import { Component, VERSION, ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import {
  AlertController,
  App,
  Events,
  ModalController,
  NavController,
  ToastController
} from 'ionic-angular';
import { from } from 'rxjs/observable/from';
import { ImportWalletPage } from '../mine/importwallet/importwallet';
import { TabsPage } from '../tabs/tabs';
@Component({
  selector: 'page-welcome',
  templateUrl: './welcome.html'
})
export class WelcomePage {
  constructor(
    private navCtrl: NavController,
    public toastCtrl: ToastController,
    private events: Events,
    private storage: Storage,
    private app: App
  ) {}
  // 直接进入主页
  openTabs() {
    this.storage.set('firstIn', true);
    this.app.getRootNav().push(TabsPage);
  }
  // 进入导入钱包
  openImportWalletPage() {
    this.navCtrl.push(ImportWalletPage, {});
  }
}
