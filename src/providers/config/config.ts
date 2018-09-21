import { Injectable } from '@angular/core';
import { Logger } from '../../providers/logger/logger';
import { PersistenceProvider } from '../persistence/persistence';

import * as _ from 'lodash';

export interface Config {
  limits: {
   
    mPlusN: number;
  };

  wallet: {
    useLegacyAddress: boolean;
    spendUnconfirmed: boolean;
    reconnectDelay: number;
    idleDurationMin: number;
    settings: {
      unitName: string;
      unitToSatoshi: number;
      unitDecimals: number;
      unitCode: string;
      alternativeName: string;
      alternativeIsoCode: string;
      defaultLanguage: string;
      feeLevel: string;
    };
  };

  bws: {
    url: string;
  };

  download: {
    ggwallet: {
      url: string;
    };
  };

  rateApp: {
    ggwallet: {
      ios: string;
      android: string;
      wp: string;
    };
  };

  lock: {
    method: any;
    value: any;
    bannedUntil: any;
  };

  recentTransactions: {
    enabled: boolean;
  };

  showIntegration: {
    coinbase: boolean;
    glidera: boolean;
    debitcard: boolean;
    amazon: boolean;
    mercadolibre: boolean;
    shapeshift: boolean;
  };

  rates: {
    url: string;
  };

  release: {
    url: string;
  };

  pushNotificationsEnabled: boolean;

  confirmedTxsNotifications: {
    enabled: boolean;
  };

  emailNotifications: {
    enabled: boolean;
    email: string;
  };

  emailFor?: any;
  bwsFor?: any;
  aliasFor?: any;
  colorFor?: any;
  touchIdFor?: any;

  log: {
    weight: number;
  };

  blockExplorerUrl: {
    btc: string;
    bch: string;
  };
}

const configDefault: Config = {
  // wallet limits
  limits: {
    mPlusN: 100
  },

  // wallet default config
  wallet: {
    useLegacyAddress: false,
    spendUnconfirmed: false,
    reconnectDelay: 5000,
    idleDurationMin: 4,
    settings: {
      unitName: 'BTC',
      unitToSatoshi: 100000000,
      unitDecimals: 8,
      unitCode: 'btc',
      alternativeName: 'US Dollar',
      alternativeIsoCode: 'USD',
      defaultLanguage: '',
      feeLevel: 'normal'
    }
  },

  // Bitcore wallet service URL
  bws: {
    url: 'https://bws.bitpay.com/bws/api'
  },

  download: {
    ggwallet: {
      url: 'https://bitpay.com/wallet'
    }
  },

  rateApp: {
    ggwallet: {
      ios:
        'https://itunes.apple.com/app/bitpay-secure-bitcoin-wallet/id1149581638',
      android:
        'https://play.google.com/store/apps/details?id=com.bitpay.wallet',
      wp: ''
    }
  },

  lock: {
    method: null,
    value: null,
    bannedUntil: null
  },

  // External services
  recentTransactions: {
    enabled: true
  },

  showIntegration: {
    coinbase: true,
    glidera: true,
    debitcard: true,
    amazon: true,
    mercadolibre: true,
    shapeshift: true
  },

  rates: {
    url: 'https://insight.bitpay.com:443/api/rates'
  },

  release: {
    url: 'https://api.github.com/repos/bitpay/copay/releases/latest'
  },

  pushNotificationsEnabled: true,

  confirmedTxsNotifications: {
    enabled: true
  },

  emailNotifications: {
    enabled: false,
    email: ''
  },

  log: {
    weight: 3
  },

  blockExplorerUrl: {
    btc: 'insight.bitpay.com',
    bch: 'bch-insight.bitpay.com/#'
  }
};

@Injectable()
export class ConfigProvider {
  private configCache: Config;

  constructor(
    private logger: Logger,
    private persistence: PersistenceProvider
  ) {
    this.logger.info('ConfigProvider initialized.');
  }

  public load() {
    return new Promise((resolve, reject) => {
      this.persistence
        .getConfig()
        .then((config: Config) => {
          if (!_.isEmpty(config)) {
            this.configCache = _.clone(config);
            this.backwardCompatibility();
          } else {
            this.configCache = _.clone(configDefault);
          }
          resolve();
        })
        .catch(err => {
          this.logger.error('Error Loading Config');
          reject(err);
        });
    });
  }

  /**
   * @param newOpts object or string (JSON)
   */
  public set(newOpts) {
    let config = _.cloneDeep(configDefault);

    if (_.isString(newOpts)) {
      newOpts = JSON.parse(newOpts);
    }
    _.merge(config, this.configCache, newOpts);
    this.configCache = config;
    this.persistence.storeConfig(this.configCache).then(() => {
      this.logger.info('Config saved');
    });
  }

  public get(): Config {
    return this.configCache;
  }

  public getDefaults(): Config {
    return configDefault;
  }

  private backwardCompatibility() {
    // these ifs are to avoid migration problems
    if (this.configCache.bws) {
      this.configCache.bws = configDefault.bws;
    }
    if (!this.configCache.wallet) {
      this.configCache.wallet = configDefault.wallet;
    }
    if (!this.configCache.wallet.settings.unitCode) {
      this.configCache.wallet.settings.unitCode =
        configDefault.wallet.settings.unitCode;
    }

    if (!this.configCache.showIntegration) {
      this.configCache.showIntegration = configDefault.showIntegration;
    }

    if (!this.configCache.recentTransactions) {
      this.configCache.recentTransactions = configDefault.recentTransactions;
    }
    if (!this.configCache.pushNotificationsEnabled) {
      this.configCache.pushNotificationsEnabled =
        configDefault.pushNotificationsEnabled;
    }

    if (this.configCache.wallet.settings.unitCode == 'bit') {
      // Convert to BTC. Bits will be disabled
      this.configCache.wallet.settings.unitName =
        configDefault.wallet.settings.unitName;
      this.configCache.wallet.settings.unitToSatoshi =
        configDefault.wallet.settings.unitToSatoshi;
      this.configCache.wallet.settings.unitDecimals =
        configDefault.wallet.settings.unitDecimals;
      this.configCache.wallet.settings.unitCode =
        configDefault.wallet.settings.unitCode;
    }
  }
}
