import { Injectable } from '@angular/core';
// TODO:换成import方式
declare var gamegold: any;
// Providers

@Injectable()
export class AddressProvider {
  private Address;
  constructor() {
    this.Address = gamegold.address;
  }

  // 获得币种类型,注意,传递的是一个NetWork类型
  public getCoin(address: string) {
    // 目前,始终返回GameGold
    return 'GGD';
  }

  private translateAddress(address: string) {
    var origCoin = this.getCoin(address);
    if (!origCoin) return undefined;

    // var origAddress = new this.Bitcore[origCoin].lib.Address(address);
    // var origObj = origAddress.toObject();

    // var resultCoin = this.Bitcore[origCoin].translateTo;
    // var resultAddress = this.Bitcore[resultCoin].lib.Address.fromObject(
    //   origObj
    // );
    // TODO: 返回一个对象,应该封装起来-modal
    return {
      origCoin,
      origAddress: address
      // resultCoin,
      // resultAddress: resultAddress.toString()
    };
  }

  // 判断一个地址是否合法,
  public validateAddress(address: string, network: any) {
    let valid = false;
    let addr = this.Address.fromString(address, network);
    if (!!addr) valid = true;
    // TODO: 返回一个对象,应该封装起来-modal
    return {
      address,
      isValid: valid,
      network: network.type,
      coin: this.getCoin(address),
      translation: this.translateAddress(address)
    };
  }
}
