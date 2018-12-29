import { Component, VERSION, ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import {
  AlertController,
  Events,
  ModalController,
  NavController,
  NavParams,
  ToastController
} from 'ionic-angular';
import { Logger } from '../../../providers/logger/logger';
import { SpvNodeProvider } from '../../../providers/spvnode/spvnode';
import { MyWalletPage } from '../../mine/mywallet/mywallet';
import { SendPage } from '../send';
@Component({
  selector: 'page-confirmresult',
  templateUrl: './confirmresult.html'
})
export class ConFirmResultPage {
  public result: number;
  public content: string;
  constructor(
    private spvNodeProvider: SpvNodeProvider,
    public toastCtrl: ToastController,
    private navCtrl: NavController,
    private logger: Logger,
    private storage: Storage,
    public alertCtrl: AlertController,
    public navParams: NavParams,
    private events: Events
  ) {
    this.result = this.navParams.data.resutl;
    this.content = this.navParams.data.content;
  }

  // 点击按钮事件
  onResultClick() {
    if (this.result == 1) {
      this.navCtrl.push(MyWalletPage, {});
    } else {
      this.navCtrl.popTo(this.navCtrl.getByIndex(2));
    }
  }
}
