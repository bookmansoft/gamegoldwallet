import { FormControl } from '@angular/forms';

export class AddressValidator {
  constructor() {}

  isValid(control: FormControl) {
    // let b = AddressValidator.bitcore.getBitcore();

    // let URI = b.URI;
    // let Address = b.Address;

    // Regular url
    if (/^https?:\/\//.test(control.value)) {
      return null;
    }

    // Bip21 uri
    // let uri, isAddressValidLivenet, isAddressValidTestnet;
    if (/^bitcoin:/.test(control.value)) {
      // let isUriValid = URI.isValid(control.value);
      // if (isUriValid) {
      //   uri = new URI(control.value);
      //   isAddressValidLivenet = Address.isValid(
      //     uri.address.toString(),
      //     'livenet'
      //   );
      //   isAddressValidTestnet = Address.isValid(
      //     uri.address.toString(),
      //     'testnet'
      //   );
      // }
      // if (isUriValid && (isAddressValidLivenet || isAddressValidTestnet)) {
      return null;
      // }
    }

    // Regular Address: try Bitcoin and Bitcoin Cash
    // let regularAddressLivenet = Address.isValid(control.value, 'livenet');
    // let regularAddressTestnet = Address.isValid(control.value, 'testnet');
    let regularAddressLivenet = true;
    let regularAddressTestnet = true;
    if (regularAddressLivenet || regularAddressTestnet) {
      return null;
    }

    return {
      'Invalid Address': true
    };
  }
}
