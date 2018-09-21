import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { Logger } from '../../../providers/logger/logger';

// Native
import { SocialSharing } from '@ionic-native/social-sharing';

// providers
import { PlatformProvider } from '../../../providers/platform/platform';
import { ProfileProvider } from '../../../providers/profile/profile';
import { SpvNodeProvider } from '../../../providers/spvnode/spvnode';
import { TxFormatProvider } from '../../../providers/tx-format/tx-format';
import { WalletProvider } from '../../../providers/wallet/wallet';

@Component({
  selector: 'page-custom-amount',
  templateUrl: 'custom-amount.html',
})
export class CustomAmountPage {

  public protocolHandler: string;
  public address: string;
  public qrAddress: string;
  public wallet: any;
  public showShareButton: boolean;
  public amountUnitStr: string;
  public amountCoin: string;
  public altAmountStr: string;

  constructor(
    private navParams: NavParams,
    private profileProvider: ProfileProvider,
    private platformProvider: PlatformProvider,
    private walletProvider: WalletProvider,
    private logger: Logger,
    private socialSharing: SocialSharing,
    private txFormatProvider: TxFormatProvider,
    private spvNodeProvider: SpvNodeProvider
  ) {
    let walletId = this.navParams.data.id;
    this.showShareButton = this.platformProvider.isCordova;

    this.wallet = spvNodeProvider.getWallet();

    this.address = this.wallet.getAddress();

    let parsedAmount = this.txFormatProvider.parseAmount(
      'BTC',
      this.navParams.data.amount,
      this.navParams.data.currency
    );

    // Amount in USD or BTC
    let _amount = parsedAmount.amount;
    let _currency = parsedAmount.currency;
    this.amountUnitStr = parsedAmount.amountUnitStr;

    if (_currency != 'BTC' && _currency != 'BCH') {
      // Convert to BTC or BCH
      let amountUnit = this.txFormatProvider.satToUnit(parsedAmount.amountSat);
      var btcParsedAmount = this.txFormatProvider.parseAmount('BTC', amountUnit, 'BTC');

      this.amountCoin = btcParsedAmount.amount;
      this.altAmountStr = btcParsedAmount.amountUnitStr;
    } else {
      this.amountCoin = _amount; // BTC or BCH
      this.altAmountStr = this.txFormatProvider.formatAlternativeStr('BTC', parsedAmount.amountSat);
    }
    this.qrAddress = "bitcoin:" + this.address + "?amount=" + this.amountCoin;
  }

  ionViewDidLoad() {
    this.logger.info('ionViewDidLoad CustomAmountPage');
  }

  public shareAddress(): void {
    this.socialSharing.share(this.qrAddress);
  }

}
