import { Component, VERSION, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Events, ModalController, NavController } from 'ionic-angular';
import { Logger } from '../../../providers/logger/logger';

// providers
import { Api } from '../../../providers/api/api';
import { ExternalLinkProvider } from '../../../providers/external-link/external-link';
import { IncomingDataProvider } from '../../../providers/incoming-data/incoming-data';
import { PlatformProvider } from '../../../providers/platform/platform';
import { SpvNodeProvider } from '../../../providers/spvnode/spvnode';
import { WalletProvider } from '../../../providers/wallet/wallet';

// pages
// import { ImportWalletPage } from '../../add/import-wallet/import-wallet';
import { AmountPage } from '../../send/amount/amount';
import { AddressbookAddPage } from '../../settings/addressbook/add/add';
import { ImportWalletPage } from '../importwallet/importwallet';
import { SetPasswordPage } from '../setpassword/setpassword';

import { from } from 'rxjs/observable/from';
import env from '../../../environments';
import { PropDetailPage } from '../../propmarket/prop-detail/prop-detail';
@Component({
  selector: 'page-createwallet',
  templateUrl: './createwallet.html'
})
export class CreateWalletPage {
  constructor(private navCtrl: NavController) { }
  // 跳转新建钱包
  gotoSetPassword() {
    this.navCtrl.push(SetPasswordPage, {});
  }

  // 跳转到导入钱包
  gotoImportWallePage() {
    this.navCtrl.push(ImportWalletPage, {});
  }
}
