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
import { LoginPage } from '../login/login';
@Component({
  selector: 'page-mygame',
  templateUrl: './mygame.html'
})
export class MyGamePage {
  private authoriedGames: any;
  private index: number = 1;
  constructor(
    private navCtrl: NavController,
    private logger: Logger,
    public toastCtrl: ToastController,
    private events: Events,
    private spvNodeProvider: SpvNodeProvider,
    private storage: Storage,
    public navParams: NavParams
  ) {
    this.storage.get('authorizedGame').then(val => {
      if (val == null) {
        this.storage.set('authorizedGame', '');
        this.authoriedGames = [];
      }
      else {
        this.authoriedGames = val;
      }
    });
  }

  openLoginPage() {
    this.navCtrl.push(LoginPage, {});
  }

  // 选项卡切换
  onSelect(index) {
    this.index = index;
  }
}
