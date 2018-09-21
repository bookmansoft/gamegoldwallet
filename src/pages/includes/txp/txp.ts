import { Component, Input } from '@angular/core';
import { Events, ModalController } from 'ionic-angular';
import { TimeProvider } from '../../../providers/time/time';

import { TxpDetailsPage } from '../../txp-details/txp-details';

@Component({
  selector: 'page-txp',
  templateUrl: 'txp.html'
})
export class TxpPage {
  private _tx;
  private _addressbook;

  constructor(
    private timeProvider: TimeProvider,
    private events: Events,
    private modalCtrl: ModalController
  ) {}

  @Input()
  set tx(tx) {
    this._tx = tx;
  }

  get tx() {
    return this._tx;
  }

  @Input()
  set addressbook(addressbook) {
    this._addressbook = addressbook;
  }

  get addressbook() {
    return this._addressbook;
  }

  public createdWithinPastDay(time) {
    return this.timeProvider.withinPastDay(time);
  }

  public openTxpModal(txp): void {
    let modal = this.modalCtrl.create(
      TxpDetailsPage,
      { tx: txp },
      { showBackdrop: false, enableBackdropDismiss: false }
    );
    modal.present();
    modal.onDidDismiss(() => {
      this.events.publish('status:updated');
    });
  }
}
