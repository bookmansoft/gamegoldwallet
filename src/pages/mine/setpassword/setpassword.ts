import { Component, VERSION, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  Events,
  ModalController,
  NavController,
  ToastController
} from 'ionic-angular';
import { Logger } from '../../../providers/logger/logger';

// providers
import { Api } from '../../../providers/api/api';
import { ExternalLinkProvider } from '../../../providers/external-link/external-link';
import { IncomingDataProvider } from '../../../providers/incoming-data/incoming-data';
import { PlatformProvider } from '../../../providers/platform/platform';
import { SpvNodeProvider } from '../../../providers/spvnode/spvnode';
import { WalletProvider } from '../../../providers/wallet/wallet';

// pages
import { AmountPage } from '../../send/amount/amount';
import { AddressbookAddPage } from '../../settings/addressbook/add/add';

import env from '../../../environments';
import { PropDetailPage } from '../../propmarket/propdetail/propdetail';
@Component({
  selector: 'page-setpassword',
  templateUrl: './setpassword.html'
})
export class SetPasswordPage {
  constructor(
    private spvNodeProvider: SpvNodeProvider,
    public toastCtrl: ToastController
  ) {}
  ionViewDidEnter(password: HTMLInputElement, password1: HTMLInputElement) {
    /** this.spvNodeProvider.createWallet(opt); */
    const toast = this.toastCtrl.create({
      message: password.value,
      duration: 3000
    });
    toast.present();
  }
}
