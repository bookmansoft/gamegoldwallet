import { fakeAsync, tick } from '@angular/core/testing';
import { Events } from 'ionic-angular';
import { AppProvider, PopupProvider } from '..';
import { TestUtils } from '../../test';
import { BwcProvider } from '../bwc/bwc';
import { Logger } from '../logger/logger';
import { PayproProvider } from '../paypro/paypro';
import { IncomingDataProvider } from './incoming-data';

describe('Provider: Incoming Data Provider', () => {
  let incomingDataProvider: IncomingDataProvider;
  let payproProvider: PayproProvider;
  let bwcProvider: BwcProvider;
  let logger: Logger;
  let events: Events;
  let loggerSpy;
  let eventsSpy;

  class AppProviderMock {
    public info = {};
    constructor() {
      this.info = { name: 'bitpay', _enabledExtensions: { debitcard: true } };
    }
  }

  class PopupProviderMock {
    constructor() {}
    ionicConfirm() {
      return Promise.resolve(true);
    }
    ionicAlert() {
      return Promise.resolve();
    }
  }

  beforeEach(() => {
    const testBed = TestUtils.configureProviderTestingModule([
      { provide: AppProvider, useClass: AppProviderMock },
      { provide: PopupProvider, useClass: PopupProviderMock }
    ]);
    incomingDataProvider = testBed.get(IncomingDataProvider);
    payproProvider = testBed.get(PayproProvider);
    bwcProvider = testBed.get(BwcProvider);
    logger = testBed.get(Logger);
    events = testBed.get(Events);
    loggerSpy = spyOn(logger, 'debug');
    eventsSpy = spyOn(events, 'publish');
  });

  describe('Function: SCANNER Redir', () => {
    it('Should handle plain text', () => {
      let data = [
        'xprv9s21ZrQH143K24Mfq5zL5MhWK9hUhhGbd45hLXo2Pq2oqzMMo63o StZzF93Y5wvzdUayhgkkFoicQZcP3y52uPPxFnfoLZB21Teqt1VvEHx', // BIP 32 mainnet xprivkey
        'cNJFgo1driFnPcBdBX8BrJrpxchBW XwXCvNH5SoSkdcF6JXXwHMm', // WIF Testnet Privkey (compressed pubkey)
        'tprv8ZgxMBicQKsPcsbCVeqqF1KVdH7gwDJbxbzpCxDUsoXHdb6SnTPY xdwSAKDC6KKJzv7khnNWRAJQsRA8BBQyiSfYnRt6zuu4vZQGKjeW4YF', // BIP 32 testnet xprivkey
        'Jason was here'
      ];
      data.forEach(element => {
        expect(incomingDataProvider.redir(element, 'ScanPage')).toBe(true);
        expect(loggerSpy).toHaveBeenCalledWith('Handling plain text');
        expect(eventsSpy).toHaveBeenCalledWith('showIncomingDataMenuEvent', {
          data: element,
          type: 'text'
        });
      });
    });
    it(
      'Should handle Plain URL',
      fakeAsync(() => {
        spyOn(payproProvider, 'getPayProDetails').and.returnValue(
          Promise.reject(true)
        );
        let data = [
          'http://bitpay.com/', // non-SSL URL Handling
          'https://bitpay.com/' // SSL URL Handling
        ];
        data.forEach(element => {
          expect(incomingDataProvider.redir(element, 'ScanPage')).toBe(true);
          expect(loggerSpy).toHaveBeenCalledWith('Handling Plain URL');
          tick();
          expect(eventsSpy).toHaveBeenCalledWith('showIncomingDataMenuEvent', {
            data: element,
            type: 'url'
          });
        });
      })
    );
    it('Should handle Join Wallet', () => {
      let data =
        'gamegold:RTpopkn5KBnkxuT7x4ummDKx3Lu1LvbntddBC4ssDgaqP7DkojT8ccxaFQEXY4f3huFyMewhHZLbtc';
      let stateParams = { url: data, fromScan: true };
      let nextView = {
        name: 'JoinWalletPage',
        params: stateParams
      };

      expect(incomingDataProvider.redir(data, 'ScanPage')).toBe(true);
      expect(loggerSpy).toHaveBeenCalledWith('Handling Join Wallet');
      expect(eventsSpy).toHaveBeenCalledWith('IncomingDataRedir', nextView);
    });
    it('Should handle Old Join Wallet', () => {
      let data =
        'RTpopkn5KBnkxuT7x4ummDKx3Lu1LvbntddBC4ssDgaqP7DkojT8ccxaFQEXY4f3huFyMewhHZLbtc';
      let stateParams = { url: data, fromScan: true };
      let nextView = {
        name: 'JoinWalletPage',
        params: stateParams
      };

      expect(incomingDataProvider.redir(data, 'ScanPage')).toBe(true);
      expect(loggerSpy).toHaveBeenCalledWith('Handling Old Join Wallet');
      expect(eventsSpy).toHaveBeenCalledWith('IncomingDataRedir', nextView);
    });
    it('Should handle QR Code Export feature', () => {
      let data = [
        "1|sick arch glare wheat anchor innocent garbage tape raccoon already obey ability|testnet|m/44'/1'/0'|false",
        '2|',
        '3|'
      ];
      data.forEach(element => {
        let stateParams = { code: element, fromScan: true };
        let nextView = {
          name: 'ImportWalletPage',
          params: stateParams
        };
        expect(incomingDataProvider.redir(element, 'ScanPage')).toBe(true);
        expect(loggerSpy).toHaveBeenCalledWith(
          'Handling QR Code Export feature'
        );
        expect(eventsSpy).toHaveBeenCalledWith('IncomingDataRedir', nextView);
      });
    });
    it('Should handle BTC and BCH BitPay Invoices', () => {
      let data = ['bitcoin:?r=https://bookman.com/i/CtcM753gnZ4Wpr5pmXU6i9'];
      data.forEach(element => {
        expect(incomingDataProvider.redir(element, 'ScanPage')).toBe(true);
        expect(loggerSpy).toHaveBeenCalledWith(
          'Handling Payment Protocol with non-backwards-compatible request'
        );
      });
    });
    it('Should handle GameGold format and CashAddr format plain Address', () => {
      let data = [
        'qr00upv8qjgkym8zng3f663n9qte9ljuqqcs8eep5w',
        'CcnxtMfvBHGTwoKGPSuezEuYNpGPJH6tjN'
      ];
      data.forEach(element => {
        expect(incomingDataProvider.redir(element, 'ScanPage')).toBe(true);
        expect(loggerSpy).toHaveBeenCalledWith(
          'Handling Bitcoin Cash Plain Address'
        );
        expect(eventsSpy).toHaveBeenCalledWith('showIncomingDataMenuEvent', {
          data: element,
          type: 'bitcoinAddress',
          coin: 'bch'
        });
      });
    });

    it('Should handle Bitcoin Livenet and Testnet Plain Address', () => {
      let data = [
        '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Genesis Bitcoin Address
        'mpXwg4jMtRhuSpVq4xS3HFHmCmWp9NyGKt' // Genesis Testnet3 Bitcoin Address
      ];
      data.forEach(element => {
        expect(incomingDataProvider.redir(element, 'ScanPage')).toBe(true);
        expect(loggerSpy).toHaveBeenCalledWith(
          'Handling Bitcoin Plain Address'
        );
        expect(eventsSpy).toHaveBeenCalledWith('showIncomingDataMenuEvent', {
          data: element,
          type: 'bitcoinAddress',
          coin: 'btc'
        });
      });
    });
    it('Should handle private keys', () => {
      let data = [
        '6PnSQd4UamkL5LDZrAsmymQrAgj1jywES6frfp5DeFGWni7VouwjxeJ68z', // BIP 38 Encrypt Private Key
        '5Hwgr3u458GLafKBgxtssHSPqJnYoGrSzgQsPwLFhLNYskDPyyA', // WIF Mainnet Privkey (uncompressed pubkey)
        'L1aW4aubDFB7yfras2S1mN3bqg9nwySY8nkoLmJebSLD5BWv3ENZ' // WIF Mainnet Privkey (compressed pubkey)
      ];
      data.forEach(element => {
        expect(incomingDataProvider.redir(element, 'ScanPage')).toBe(true);
        expect(loggerSpy).toHaveBeenCalledWith('Handling private key');
        expect(eventsSpy).toHaveBeenCalledWith('showIncomingDataMenuEvent', {
          data: element,
          type: 'privateKey'
        });
      });
    });
    it('Should handle Glidera URI', () => {
      let data = ['://glidera', '://glidera'];
      data.forEach(element => {
        let stateParams = { code: null };
        let nextView = {
          name: 'GlideraPage',
          params: stateParams
        };
        expect(incomingDataProvider.redir(element, 'ScanPage')).toBe(true);
        expect(loggerSpy).toHaveBeenCalledWith('Handling Glidera URL');
        expect(eventsSpy).toHaveBeenCalledWith('IncomingDataRedir', nextView);
      });
    });
    it('Should handle Coinbase URI', () => {
      let data = ['bitpay://coinbase', '://coinbase'];
      data.forEach(element => {
        let stateParams = { code: null };
        let nextView = {
          name: 'CoinbasePage',
          params: stateParams
        };
        expect(incomingDataProvider.redir(element, 'ScanPage')).toBe(true);
        expect(loggerSpy).toHaveBeenCalledWith('Handling Coinbase URL');
        expect(eventsSpy).toHaveBeenCalledWith('IncomingDataRedir', nextView);
      });
    });
    it('Should handle BitPay Card URI', () => {
      let data = 'bitpay://';
      let stateParams = { secret: null, email: null, otp: null };
      let nextView = {
        name: 'BitPayCardIntroPage',
        params: stateParams
      };
      expect(incomingDataProvider.redir(data, 'ScanPage')).toBe(true);
      expect(loggerSpy).toHaveBeenCalledWith('Handling BitPayCard URL');
      expect(eventsSpy).toHaveBeenCalledWith('IncomingDataRedir', nextView);
    });
  });
});
