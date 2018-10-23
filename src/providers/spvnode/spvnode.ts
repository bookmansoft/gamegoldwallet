import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
// import * as gamegold from 'gamegold';
// TODO: 用更为Typescirpt方式,而非全局变量引入
declare var gamegold: any;
import { Events } from 'ionic-angular';
import * as lodash from 'lodash';
import { Observable } from 'rxjs/Observable';
import encoding from 'text-encoding';
import { Logger } from '../../providers/logger/logger';
import { ConfigProvider } from '../config/config';
// Providers
import { ErrorProvider } from '../error/error';
import { FeeProvider } from '../fee/fee';
import { FilterProvider } from '../filter/filter';
import { LanguageProvider } from '../language/language';
import { OnGoingProcessProvider } from '../on-going-process/on-going-process';
import { PersistenceProvider } from '../persistence/persistence';
import { PopupProvider } from '../popup/popup';
import { RateProvider } from '../rate/rate';
import { TxFormatProvider } from '../tx-format/tx-format';

@Injectable()
export class SpvNodeProvider {
  // Ratio low amount warning (fee/amount) in incoming TX
  private LOW_AMOUNT_RATIO: number = 0.15;

  // Ratio of "many utxos" warning in total balance (fee/amount)
  private TOTAL_LOW_WARNING_RATIO: number = 0.3;

  private WALLET_STATUS_MAX_TRIES: number = 7;
  private WALLET_STATUS_DELAY_BETWEEN_TRIES: number = 1.4 * 1000;
  private SOFT_CONFIRMATION_LIMIT: number = 12;
  private SAFE_CONFIRMATIONS: number = 6;

  private progressFn = {};

  private isPopupOpen: boolean;

  // spv节点
  private node: any;
  private nodeOpened: boolean;

  // wallet钱包数据库
  private wdb: any;
  // wallet钱包
  private wallet: any;
  // 厂商列表
  private cplist: any;
  // 道具列表
  private props: any;
  // 自定义一个events
  private eventNotification: Events;
  // 余额
  private balance: any;

  constructor(
    private logger: Logger,
    private txFormatProvider: TxFormatProvider,
    private configProvider: ConfigProvider,
    private persistenceProvider: PersistenceProvider,
    private errorProvider: ErrorProvider,
    private rateProvider: RateProvider,
    private filter: FilterProvider,
    private languageProvider: LanguageProvider,
    private popupProvider: PopupProvider,
    private onGoingProcessProvider: OnGoingProcessProvider,
    private events: Events,
    private feeProvider: FeeProvider,
    private translate: TranslateService
  ) {
    this.logger.info('SPVNode Service initialized.');
    this.isPopupOpen = false;
    this.eventNotification = events;
    var nodeLogger = gamegold.logger({ level: 'debug', console: true });
    // TODO:这些配置可以放config里面,特别是语种.
    this.node = new gamegold.spvnode({
      hash: true,
      query: true,
      prune: true,
      network: 'testnet',
      // network: 'main',
      db: 'leveldb',
      coinCache: 30000000,
      logConsole: true,
      workers: false,
      // workerFile: '/gamegold - worker.js', //会覆盖 process.env.GAMEGOLD_WORKER_FILE，视情况运用
      // logger: nodeLogger,
      logger: null,
      // 为当前的Cordava SPV节点传入seeds列表，当前节点在连接具体的seed时，将首先连接到其WS桥接端口上，透过该端口桥接其socket端口，进而实现数据交换
      seeds: [`127.0.0.1:17333`],
      'node-uri': 'http://127.0.0.1:17332',
      'api-key': 'bookmansoft',
      // 钱包的默认语言版本
      'wallet-language': 'simplified chinese',
      // 插件列表
      plugins: [
        // 2018.5.3 当前版本要求：钱包插件最后载入
        gamegold.wallet.plugin // 钱包管理插件，可以在全节点或SPV节点加载
      ]
    });
    // 新增：监听插件打开事件，检测数据库打开模式
    this.node.on('plugin open', ret => {
      switch (ret.type) {
        case 'chaindb':
          if (ret.result == 'new') {
            // 链库是新建的
            this.logger.info('1111 ChainDB new');
          } else {
            // 链库是已有的
            this.logger.info('22222 ChainDB exist');
          }
          break;

        case 'walletdb':
          if (ret.result == 'new') {
            // 钱包库是新建的
            this.logger.info('33333 WalletDB new');
          } else {
            // 钱包是已有的
            this.logger.info('44444 WalletDB exist');
          }
          break;
      }
    });
    // 读取当前的钱包插件
    // 判断是否装载钱包插件,理论上不可能没有
    this.wdb = this.node.require('walletdb');
    if (!this.wdb) {
      throw new Error('wallet plugin is not installed');
    }
  }
  /**
   * 打开当前node,并且监听交易事件
   *
   */
  public async open() {
    this.node.chain.on('block', (item, entry) => {
      this.logger.info('block in hash: ' + item.rhash());
      this.events.publish('receive:block', item, entry);
    });
    await this.node.open();
    await this.node.connect();
    this.node.startSync();
    this.wallet = this.wdb.primary;
    this.wallet.name = '我的游戏钱包';
    this.wallet.corlor = '#647ce8';
    this.logger.info('wallet id:' + this.wallet.id);
    this.events.publish('node:open', this.wallet);

    this.logger.info(this.getmnemonicPhrase());
    this.wdb.primary.on('balance', () => {
      this.logger.info('primary:' + this.wdb.primary);
      this.logger.info('get balance:' + JSON.stringify(this.balance));
    });
    await this.getBalance();
    // getCplist必须在getBalance后调用
    // this.getCpList();
  }

  // 根据配置创建一个钱包
  public createWallet(opt): Promise<any> {
    return new Promise((resolve, reject) => {
      this.wdb
        .isNewRecord()
        .then(isNew => {
          if (!isNew) {
            // 目前仅登记一个游戏金钱包, 删除现有数据库
            this.wdb.rpc
              .execute({ method: 'destroywallet', params: [] })
              .then(() => {
                return resolve(this.doCreateDefaultWallet(opt));
              });
          } else {
            return resolve(this.doCreateDefaultWallet(opt));
          }
        })
        .catch(err => {
          this.logger.error(err);
        });
    });
  }
  // 根据配置导入一个已有钱包
  public importWallet(opt): Promise<any> {
    return new Promise((resolve, reject) => {
      // 判断助记词的合法性
      let ret = this.wdb.testmnemonic(opt.passphrase);
      if (ret.code == 0) {
        // 选择1：引导用户导入助记符
        this.wdb.setmnemonicByWords(opt.passphrase);
        // 设置wdb的语言环境
        this.wdb.setlanguage('simplified chinese');
        return resolve(this.wdb);
      } else {
        reject(ret.msg);
      }
    });
  }

  private doCreateDefaultWallet(opt): Promise<any> {
    return new Promise((resolve, reject) => {
      // 选择3：指定熵的长度（位），内部自动生成助记符，然后引导用户离线记录对应的助记符
      this.wdb.setmnemonicByLen(opt.phraseLength);
      // this.wdb.setmnemonic('腿 侧 极 仁 庙 泡 右 峡 巴 驱 迫 被');
      // 设置wdb的语言环境
      this.wdb.setlanguage('simplified chinese');
      return resolve(this.wdb);
    });
  }
  /**
   * 获取当前使用的主钱包
   */
  public getWallet() {
    if (this.wallet) {
      this.wallet.color = '#647ce8';
      this.wallet.name = '我的游戏钱包';

      return this.wallet;
    }
  }
  /**
   * 获取当前使用的钱包数据库
   */
  public getWdb() {
    return this.wdb;
  }
  /**
   * 获取spvNode节点
   */
  public getNode() {
    return this.node;
  }
  /**
   * 发送转账交易
   */
  public sendTX(tx): Promise<any> {
    return this.node.sendTX(tx);
  }

  /**
   * 获取最新的地址,这个由wallet记录,实际并没有生成新地址
   * --TODO:移动到wallet中
   */
  public getRecentAddress(): string {
    if (this.wallet) {
      return this.wallet.getRecentAddress;
    }
  }
  /**
   * 获取当前钱包余额
   * --TODO:移动到wallet中
   */
  public getBalance(): any {
    if (this.wallet) {
      return this.wallet.getBalance().then(balance => {
        this.balance = balance;
        this.events.publish('node:balance', balance);
        return balance;
      });
    }
  }
  /**
   * 获取一个未使用的新地址
   * --TODO:移动到wallet中
   */
  public getNewAddress(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.wallet) {
        this.wallet.createReceive().then(address => {
          return resolve(address);
        });
      } else {
        return reject();
      }
    });
  }
  /**
   * 获取钱包内交易明细
   * --TODO:移动到wallet中
   */
  public getTxDetails(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.wallet) {
        this.wallet
          .getHistory()
          .then(txs => {
            return this.wallet.toDetails(txs);
          })
          .then(txs => {
            return resolve(txs);
          });
      } else {
        return reject();
      }
    });
  }
  /**
   * 获得钱包的助记词
   * --TODO:移动到wallet中
   */
  public getmnemonicPhrase(): string {
    if (this.wallet) {
      return this.wallet.master.mnemonic.phrase;
    }
  }
  // 获取厂商列表,先要Flush,然后再List
  getCpList(): any {
    this.node.rpc
      .execute({ method: 'cp.flush', params: [] })
      .then(() => {
        return this.node.rpc.execute({ method: 'cp.list', params: [] });
      })
      .then(cps => {
        if (cps) {
          this.cplist = cps;
          this.events.publish('node:cplist', cps);
          return cps;
        }
      });
  }

  // 获取背包中道具列表
  getPropList(): any {
    this.wdb.rpc.execute({ method: 'prop.list', params: [] }).then(props => {
      this.props = props;
      this.events.publish('prop.list', props);
      return this.props;
    });
  }

  // 拍卖背包中道具,需要传入商品与价格
  // 目前仅提供一口价的拍卖模式.
  saleProp(prop, np): any {
    this.wdb.rpc
      .execute({
        method: 'prop.sale',
        params: [prop.current.rev, np]
      })
      .then(tx => {
        this.events.publish('prop.sale', tx);
        return tx;
      });
  }

  // 熔铸背包中道具,需要传入商品
  foundProp(prop): any {
    this.wdb.rpc
      .execute({
        method: 'prop.found',
        params: [prop]
      })
      .then(tx => {
        this.events.publish('prop.found', tx);
        return tx;
      });
  }

  // 参与竞价,需要传入商品与价格
  buyProp(order, np): any {
    this.wdb.rpc
      .execute({
        method: 'prop.buy',
        params: [
          order.pid, // 拍卖物品编码
          np // 新的竞拍价格
        ]
      })
      .then(tx => {
        this.events.publish('prop.buy', tx);
        return tx;
      });
  }
  // 列出市场道具
  listMarket(cp): any {
    this.node.rpc
      .execute({
        method: 'prop.list.market',
        params: [
          cp.cid // 厂商编码
        ]
      })
      .then(props => {
        this.events.publish('prop.list.market', props);
        return props;
      });
  }

  // 支付订单
  orderPay(order): any {
    this.wdb.rpc
      .execute({
        method: 'order.pay',
        params: [order.cid, order.uid, order.sn, order.price]
      })
      .then(tx => {
        this.events.publish('order.pay', tx);
        return tx;
      });
  }

  // 创建交易对-目前仅btc,type默认1
  createContract(ggAmount, btcAmount, btcAddress, type = 1): any {
    this.wdb.rpc
      .execute({
        method: 'contract.create',
        params: [type, ggAmount, btcAmount, btcAddress]
      })
      .then(contract => {
        this.events.publish('contract.create', contract);
        return contract;
      });
  }

  // 承诺兑换交易对-目前仅btc,type默认1
  promiseContract(btcAddress, type = 1): any {
    let id = type.toString() + btcAddress;
    this.wdb.rpc
      .execute({
        method: 'contract.promise',
        params: [id]
      })
      .then(contract => {
        this.events.publish('contract.promise', contract);
        return contract;
      });
  }

  // 查询交易对
  listContract(): any {
    this.wdb.rpc
      .execute({
        method: 'contract.list',
      })
      .then(contracts => {
        this.events.publish('contract.list', contracts);
        return contracts;
      });
  }

  // 查询我参与的交易对
  listMineContract(): any {
    this.wdb.rpc
      .execute({
        method: 'contract.list.mine',
      })
      .then(myContracts => {
        this.events.publish('contract.list.mine', myContracts);
        return myContracts;
      });
  }
}
