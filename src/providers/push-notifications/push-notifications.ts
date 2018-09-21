import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { Logger } from '../../providers/logger/logger';

// providers
import { AppProvider } from '../app/app';
// import { BwcProvider } from '../bwc/bwc';
import { ConfigProvider } from '../config/config';
import { PlatformProvider } from '../platform/platform';
import { ProfileProvider } from '../profile/profile';

import * as _ from 'lodash';

@Injectable()
export class PushNotificationsProvider {
  private isIOS: boolean;
  private isAndroid: boolean;
  private usePushNotifications: boolean;
  private _token = null;

  constructor(
    public http: HttpClient,
    public profileProvider: ProfileProvider,
    public platformProvider: PlatformProvider,
    public configProvider: ConfigProvider,
    public logger: Logger,
    public appProvider: AppProvider,
    // private bwcProvider: BwcProvider,
    private events: Events
  ) {
    this.logger.info('PushNotificationsProvider initialized.');
    this.isIOS = this.platformProvider.isIOS;
    this.isAndroid = this.platformProvider.isAndroid;
    this.usePushNotifications = this.platformProvider.isCordova;
  }

  public init(): void {
    if (!this.usePushNotifications || this._token) return;
    this.configProvider.load().then(() => {
      if (!this.configProvider.get().pushNotificationsEnabled) return;

      this.logger.debug('Starting push notification registration...');
    });
  }

  public handlePushNotifications(): void {
    if (this.usePushNotifications) {
    }
  }

  public updateSubscription(walletClient): void {
    if (!this._token) {
      this.logger.warn(
        'Push notifications disabled for this device. Nothing to do here.'
      );
      return;
    }
    this._subscribe(walletClient);
  }

  public enable(): void {
    if (!this._token) {
      this.logger.warn(
        'No token available for this device. Cannot set push notifications. Needs registration.'
      );
      return;
    }

    var wallets = this.profileProvider.getWallets();
    _.forEach(wallets, walletClient => {
      this._subscribe(walletClient);
    });
  }

  public disable(): void {
    if (!this._token) {
      this.logger.warn(
        'No token available for this device. Cannot disable push notifications.'
      );
      return;
    }

    var wallets = this.profileProvider.getWallets();
    _.forEach(wallets, walletClient => {
      this._unsubscribe(walletClient);
    });
    this._token = null;
  }

  public unsubscribe(walletClient): void {
    if (!this._token) return;
    this._unsubscribe(walletClient);
  }

  private _subscribe(walletClient): void {
    let opts = {
      token: this._token,
      platform: this.isIOS ? 'ios' : this.isAndroid ? 'android' : null,
      packageName: this.appProvider.info.packageNameId
    };
    walletClient.pushNotificationsSubscribe(opts, err => {
      if (err)
        this.logger.error(
          walletClient.name + ': Subscription Push Notifications error. ',
          JSON.stringify(err)
        );
      else
        this.logger.debug(
          walletClient.name + ': Subscription Push Notifications success.'
        );
    });
  }

  private _unsubscribe(walletClient): void {
    walletClient.pushNotificationsUnsubscribe(this._token, err => {
      if (err)
        this.logger.error(
          walletClient.name + ': Unsubscription Push Notifications error. ',
          JSON.stringify(err)
        );
      else
        this.logger.debug(
          walletClient.name + ': Unsubscription Push Notifications Success.'
        );
    });
  }

  private _openWallet(walletIdHashed): void {
    if (walletIdHashed) {
    }
    // let walletIdHash;
    // let sjcl = this.bwcProvider.getSJCL();
    let nextView: { name?: string; params?: { walletId: any } } = {};

    // let wallets = this.profileProvider.getWallets();
    // let wallet = _.find(wallets, w => {
    //   walletIdHash = sjcl.hash.sha256.hash(w.credentials.walletId);
    //   return _.isEqual(walletIdHashed, sjcl.codec.hex.fromBits(walletIdHash));
    // });

    // if (!wallet) return;

    // nextView.name = 'WalletDetailsPage';
    // nextView.params = { walletId: wallet.credentials.walletId };

    this.events.publish('OpenWalletEvent', nextView);
  }
}
