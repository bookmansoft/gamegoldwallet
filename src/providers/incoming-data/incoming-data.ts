import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Events } from 'ionic-angular';
import { Logger } from '../../providers/logger/logger';

// providers
// import { AppProvider } from '../app/app';
import { PayproProvider } from '../paypro/paypro';
import { PopupProvider } from '../popup/popup';

@Injectable()
export class IncomingDataProvider {
  constructor(
    private events: Events,
    private payproProvider: PayproProvider,
    private popupProvider: PopupProvider,
    private logger: Logger,
    // private appProvider: AppProvider,
    private translate: TranslateService
  ) {
    this.logger.info('IncomingDataProvider initialized.');
  }

  public showMenu(data): void {
    this.events.publish('showIncomingDataMenuEvent', data);
  }

  public redir(data: string, activePage?: string): boolean {
    if (activePage) {
    }
    // data extensions for Payment Protocol with non-backwards-compatible request
    // data extensions for Payment Protocol with non-backwards-compatible request
    if (/^bitcoin(cash)?:\?r=[\w+]/.exec(data)) {
      let coin = 'btc';
      if (data.indexOf('bitcoincash') === 0) coin = 'bch';

      data = decodeURIComponent(data.replace(/bitcoin(cash)?:\?r=/, ''));

      this.payproProvider
        .getPayProDetails(data, coin)
        .then(details => {
          this.handlePayPro(details, coin);
        })
        .catch(err => {
          this.popupProvider.ionicAlert(this.translate.instant('Error'), err);
        });

      return true;
    }

    data = this.sanitizeUri(data);
    let amount: string;
    let message: string;
    let addr: string;
    let parsed;
    let coin: string;

    // Bitcoin  URL
    // 验证合法性
    // if (this.bwcProvider.getBitcore().URI.isValid(data)) {
    this.logger.debug('Handling Bitcoin URI');
    // 暂时先用简单的规则
    if (data.length >= 50 && data.substring(0, 12) === 'bitcoin:tb1q') {
      this.logger.debug('Handling Bitcoin URI');
      coin = 'btc';
      parsed = this.parseURI(data);
      addr = parsed.address ? parsed.address.toString() : '';
      message = parsed.message;
      amount = parsed.amount ? parsed.amount : '';

      this.goSend(addr, amount, message, coin);

      return true;
      // 正常的地址是从这里进去的.调用了isValid方法,
      // TODO: 自定义的,后续修改
    } else if (data.length === 42 && data.substring(0, 4) === 'tb1q') {
      addr = data;
      coin = 'btc';
      this.goSend(addr, amount, message, coin);
    }
  }

  private sanitizeUri(data): string {
    // Fixes when a region uses comma to separate decimals
    let regex = /[\?\&]amount=(\d+([\,\.]\d+)?)/i;
    let match = regex.exec(data);
    if (!match || match.length === 0) {
      return data;
    }
    let value = match[0].replace(',', '.');
    let newUri = data.replace(regex, value);

    // mobile devices, uris like ://glidera
    newUri.replace('://', ':');

    return newUri;
  }

  // private getParameterByName(name: string, url: string): string {
  //   if (!url) return undefined;
  //   name = name.replace(/[\[\]]/g, '\\$&');
  //   let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
  //     results = regex.exec(url);
  //   if (!results) return null;
  //   if (!results[2]) return '';
  //   return decodeURIComponent(results[2].replace(/\+/g, ' '));
  // }

  // private checkPrivateKey(privateKey: string): boolean {
  //   if (privateKey) {
  //   }
  //   // try {
  //   //   this.bwcProvider.getBitcore().PrivateKey(privateKey, 'livenet');
  //   // } catch (err) {
  //   //   return false;
  //   // }
  //   return true;
  // }

  private goSend(
    addr: string,
    amount: string,
    message: string,
    coin: string
  ): void {
    if (amount) {
      let stateParams = {
        amount,
        toAddress: addr,
        description: message,
        coin
      };
      let nextView = {
        name: 'ConfirmPage',
        params: stateParams
      };
      this.events.publish('IncomingDataRedir', nextView);
    } else {
      let stateParams = {
        toAddress: addr,
        description: message,
        coin
      };
      let nextView = {
        name: 'AmountPage',
        params: stateParams
      };
      this.events.publish('IncomingDataRedir', nextView);
    }
  }

  // private goToAmountPage(toAddress: string, coin: string): void {
  //   let stateParams = {
  //     toAddress,
  //     coin
  //   };
  //   let nextView = {
  //     name: 'AmountPage',
  //     params: stateParams
  //   };
  //   this.events.publish('IncomingDataRedir', nextView);
  // }

  private handlePayPro(payProDetails, coin?: string): void {
    if (!payProDetails) {
      this.popupProvider.ionicAlert(
        this.translate.instant('Error'),
        this.translate.instant('No wallets available')
      );
      return;
    }

    const stateParams = {
      amount: payProDetails.amount,
      toAddress: payProDetails.toAddress,
      description: payProDetails.memo,
      paypro: payProDetails,
      coin,
      requiredFeeRate: payProDetails.requiredFeeRate
        ? Math.ceil(payProDetails.requiredFeeRate * 1024)
        : undefined
    };
    const nextView = {
      name: 'ConfirmPage',
      params: stateParams
    };
    this.events.publish('IncomingDataRedir', nextView);
  }

  // 自己写的URL解析,怎么调用公用方法?
  private parseURI(data: string): any {
    // 长度不足,直接返回空
    if (data.length < 50) {
      return {
        amount: '',
        message: '',
        address: ''
      };
    }
    // 去掉前面bitcoin:
    let addr = data.slice(8, 50);
    let amount: string;
    let cut = data.slice(51);
    let params = new URLSearchParams(cut);
    let num = Number(params.get('amount'));
    num *= 100000000;
    if (num > 0) {
      amount = num.toString();
    }
    let url = {
      amount,
      message: params.get('message'),
      address: addr
    };
    return url;
  }
}
