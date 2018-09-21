import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Logger } from '../../providers/logger/logger';
import { PersistenceProvider } from '../../providers/persistence/persistence';

import * as _ from 'lodash';

// 地址簿管理,实现保存转账的地址簿.暂不实现
@Injectable()
export class AddressBookProvider {
  constructor(
    // private bwcProvider: BwcProvider,
    private logger: Logger,
    private persistenceProvider: PersistenceProvider,
    private translate: TranslateService
  ) {
    this.logger.info('AddressBookProvider initialized.');
  }
  // 从一个地址转义为当前网络情况.
  private getNetwork(address: string): string {
    // let network;
    // try {
    //   network = this.bwcProvider.getBitcore().Address(address).network.name;
    // } catch (e) {
    //   this.logger.warn('No valid bitcoin address. Trying bitcoin cash...');
    //   network = this.bwcProvider.getBitcoreCash().Address(address).network.name;
    // }
    // return network;
    return address;
  }

  public get(addr: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.persistenceProvider
        .getAddressBook('testnet')
        .then(ab => {
          if (ab && _.isString(ab)) ab = JSON.parse(ab);
          if (ab && ab[addr]) return resolve(ab[addr]);

          this.persistenceProvider
            .getAddressBook('livenet')
            .then(ab => {
              if (ab && _.isString(ab)) ab = JSON.parse(ab);
              if (ab && ab[addr]) return resolve(ab[addr]);
              return resolve();
            })
            .catch(() => {
              return reject();
            });
        })
        .catch(() => {
          return reject();
        });
    });
  }

  public list(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.persistenceProvider
        .getAddressBook('testnet')
        .then(ab => {
          if (ab && _.isString(ab)) ab = JSON.parse(ab);

          ab = ab || {};
          this.persistenceProvider
            .getAddressBook('livenet')
            .then(ab2 => {
              if (ab2 && _.isString(ab)) ab2 = JSON.parse(ab2);

              ab2 = ab2 || {};
              return resolve(_.defaults(ab2, ab));
            })
            .catch(err => {
              return reject(err);
            });
        })
        .catch(() => {
          let msg = this.translate.instant('Could not get the Addressbook');
          return reject(msg);
        });
    });
  }

  public add(entry): Promise<any> {
    return new Promise((resolve, reject) => {
      var network = this.getNetwork(entry.address);
      if (_.isEmpty(network)) {
        let msg = this.translate.instant('Not valid bitcoin address');
        return reject(msg);
      }
      this.persistenceProvider
        .getAddressBook(network)
        .then(ab => {
          if (ab && _.isString(ab)) ab = JSON.parse(ab);
          ab = ab || {};
          if (_.isArray(ab)) ab = {}; // No array
          if (ab[entry.address]) {
            let msg = this.translate.instant('Entry already exist');
            return reject(msg);
          }
          ab[entry.address] = entry;
          this.persistenceProvider
            .setAddressBook(network, JSON.stringify(ab))
            .then(() => {
              this.list()
                .then(ab => {
                  return resolve(ab);
                })
                .catch(err => {
                  return reject(err);
                });
            })
            .catch(() => {
              let msg = this.translate.instant('Error adding new entry');
              return reject(msg);
            });
        })
        .catch(err => {
          return reject(err);
        });
    });
  }

  public remove(addr): Promise<any> {
    return new Promise((resolve, reject) => {
      var network = this.getNetwork(addr);
      if (_.isEmpty(network)) {
        let msg = this.translate.instant('Not valid bitcoin address');
        return reject(msg);
      }
      this.persistenceProvider
        .getAddressBook(network)
        .then(ab => {
          if (ab && _.isString(ab)) ab = JSON.parse(ab);
          ab = ab || {};
          if (_.isEmpty(ab)) {
            let msg = this.translate.instant('Addressbook is empty');
            return reject(msg);
          }
          if (!ab[addr]) {
            let msg = this.translate.instant('Entry does not exist');
            return reject(msg);
          }
          delete ab[addr];
          this.persistenceProvider
            .setAddressBook(network, JSON.stringify(ab))
            .then(() => {
              this.list()
                .then(ab => {
                  return resolve(ab);
                })
                .catch(err => {
                  return reject(err);
                });
            })
            .catch(() => {
              let msg = this.translate.instant('Error deleting entry');
              return reject(msg);
            });
        })
        .catch(err => {
          return reject(err);
        });
    });
  }

  public removeAll(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.persistenceProvider
        .removeAddressbook('livenet')
        .then(() => {
          this.persistenceProvider.removeAddressbook('testnet').then(() => {
            return resolve();
          });
        })
        .catch(() => {
          let msg = this.translate.instant('Error deleting addressbook');
          return reject(msg);
        })
        .catch(() => {
          let msg = this.translate.instant('Error deleting addressbook');
          return reject(msg);
        });
    });
  }
}
