import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { NavController } from 'ionic-angular';
import { Logger } from '../../../providers/logger/logger';

// pages

// providers
import { AppProvider } from '../../../providers/app/app';
import { ExternalLinkProvider } from '../../../providers/external-link/external-link';
import { ReplaceParametersProvider } from '../../../providers/replace-parameters/replace-parameters';

@Component({
  selector: 'page-poundage',
  templateUrl: 'poundage.html'
})
export class PoundagePage {
  langs;
  langForm;
  private time: number = 30;
  private byte: number = 20;
  constructor(
    private navCtrl: NavController,
    private appProvider: AppProvider,
    private logger: Logger,
    private externalLinkProvider: ExternalLinkProvider,
    private replaceParametersProvider: ReplaceParametersProvider,
    private translate: TranslateService,
    private storage: Storage
  ) {
    this.storage.get('poundage').then(val => {
      this.langForm = new FormGroup({
        langs: new FormControl({ value: val, disabled: false })
      });
    });
  }
  ionViewDidEnter() {}
  langSelect() {
    this.logger.info('langSelect: ' + this.langForm.value.langs);
    if (this.langForm.value.langs == 'veryfast') {
      this.time = 20;
      this.byte = 77;
    } else if (this.langForm.value.langs == 'givepriority') {
      this.time = 20;
      this.byte = 52;
    } else if (this.langForm.value.langs == 'conventional') {
      this.time = 30;
      this.byte = 20;
    } else if (this.langForm.value.langs == 'slower') {
      this.time = 60;
      this.byte = 14;
    } else if (this.langForm.value.langs == 'slow') {
      this.time = 240;
      this.byte = 11;
    }
    this.storage.set('poundage', this.langForm.value.langs);
  }
}
