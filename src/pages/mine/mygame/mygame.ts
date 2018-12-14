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
  private datas: any;
  constructor(
    private navCtrl: NavController,
    private logger: Logger,
    public toastCtrl: ToastController,
    private events: Events,
    private spvNodeProvider: SpvNodeProvider,
    private storage: Storage,
    public navParams: NavParams
  ) {
    this.datas = [
      {
        gamename: 'Forza Horizon 3',
        publisher: 'Playground Games',
        src: 'assets/img/u146.png',
        address: ''
      },
      {
        gamename: 'Age of Empires: Definitive test',
        publisher: 'Forgotten Empires',
        src: 'assets/img/u145.png',
        address: ''
      },
      {
        gamename: 'ARK:Survival Evolved',
        publisher: 'Studio Wildcard',
        src: 'assets/img/u147.png',
        address: ''
      },
      {
        gamename: 'Rise of Nations:Extended E Test',
        publisher: 'Big Huge Game & SkyBox Labs',
        src: 'assets/img/u152.png',
        address: ''
      },
      {
        gamename: 'Paradise City Island Sim',
        publisher: 'Sparkling Society Game B.V',
        src: 'assets/img/u147.png',
        address: ''
      }
    ];
  }
}
