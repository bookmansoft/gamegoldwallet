import { Injectable } from '@angular/core';
import { Logger } from '../../providers/logger/logger';

// providers
import { PersistenceProvider } from '../persistence/persistence';

import * as _ from 'lodash';

@Injectable()
export class AppIdentityProvider {
  constructor(
    private logger: Logger,
    private persistenceProvider: PersistenceProvider
  ) {
    this.logger.info('AppIdentityProvider initialized.');
  }

  public getIdentity(network, cb) {
    let isNew;
    this.persistenceProvider.getAppIdentity(network).then(data => {
      let appIdentity = data || {};

      if (_.isEmpty(appIdentity) || (appIdentity && !appIdentity.priv)) {
        isNew = true;
      }
      try {
        if (isNew)
          this.persistenceProvider.setAppIdentity(network, appIdentity);
      } catch (e) {
        return cb(e);
      }
      return cb(null, appIdentity);
    });
  }
}
