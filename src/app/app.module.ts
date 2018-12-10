import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicStorageModule } from '@ionic/storage';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

/* Modules */
import { TranslatePoHttpLoader } from '@biesbjerg/ngx-translate-po-http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { MomentModule } from 'angular2-moment';
import { NgxQRCodeModule } from 'ngx-qrcode2';

/* GgWalletApp App */
import env from '../environments';
import { GgWalletApp } from './app.component';

import { PAGES } from './../pages/pages';

/* Pipes */
import { FiatToUnitPipe } from '../pipes/fiatToUnit';
import { KeysPipe } from '../pipes/keys';
import { OrderByPipe } from '../pipes/order-by';
import { SatToFiatPipe } from '../pipes/satToFiat';
import { SatToUnitPipe } from '../pipes/satToUnit';

/* Directives */
import { Animate } from '../directives/animate/animate';
import { CopyToClipboard } from '../directives/copy-to-clipboard/copy-to-clipboard';
import { IosScrollBgColor } from '../directives/ios-scroll-bg-color/ios-scroll-bg-color';
import { LongPress } from '../directives/long-press/long-press';
import { NavbarBg } from '../directives/navbar-bg/navbar-bg';
import { NoLowFee } from '../directives/no-low-fee/no-low-fee';

/* Components */
import { COMPONENTS } from './../components/components';

/* Providers */
import { from } from 'rxjs/observable/from';
import { ProvidersModule } from './../providers/providers.module';

/* Read translation files */
export function createTranslateLoader(http: HttpClient) {
  return new TranslatePoHttpLoader(http, 'assets/i18n/po', '.po');
}

@NgModule({
  declarations: [
    GgWalletApp,
    ...PAGES,
    ...COMPONENTS,
    /* Directives */
    CopyToClipboard,
    IosScrollBgColor,
    LongPress,
    NavbarBg,
    NoLowFee,
    Animate,
    /* Pipes */
    SatToUnitPipe,
    SatToFiatPipe,
    FiatToUnitPipe,
    KeysPipe,
    OrderByPipe
  ],
  imports: [
    IonicModule.forRoot(GgWalletApp, {
      animate: env.enableAnimations,
      tabsHideOnSubPages: true,
      tabsPlacement: 'bottom',
      backButtonIcon: 'ios-arrow-back',
      backButtonText: ''
    }),
    IonicStorageModule.forRoot(),
    BrowserModule,
    HttpClientModule,
    MomentModule,
    NgxQRCodeModule,
    ProvidersModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    ZXingScannerModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [GgWalletApp, ...PAGES, ...COMPONENTS],
  providers: [
    {
      provide: ErrorHandler,
      useClass: IonicErrorHandler
    }
  ]
})
export class AppModule {}
