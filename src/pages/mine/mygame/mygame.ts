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
@Component({
  selector: 'page-mygame',
  templateUrl: './mygame.html'
})
export class MyGamePage { 
  private authoriedGames: any;
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
}
