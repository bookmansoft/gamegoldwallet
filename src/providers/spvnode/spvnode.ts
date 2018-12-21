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
  // 登记启动时候是否设置了助记词
  private mnemonicConfig: boolean;
  // 登记启动时候设置的助记词
  private bootstrapMnemonic: string;
  // 厂商列表
  private cplist: any;
  // 道具列表
  private props: any;
  // 自定义一个events
  private eventNotification: Events;
  // 余额
  private balance: any;
  // TODO: 定义调用钱包的默认参数,目前写固定值,待优化
  private walletConfig =
    {
      cid: "xxxxxxxx-game-gold-root-xxxxxxxxxxxx",
      user: {
        auth: false,
        password: "bookmansoft",
        username: "bitcoinrpc"
      },
      wid: "primary"
    }

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
      seeds: [`40.73.114.235:17333`],
      'node-uri': 'http://40.73.114.235:17332',
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
            this.logger.info('ChainDB new');
          } else {
            // 链库是已有的
            this.logger.info('ChainDB exist');
          }
          break;
      }
    });
    // 默认没有设置助记词
    this.mnemonicConfig = false;
    this.bootstrapMnemonic = '';
    // 读取当前的钱包插件-必须在open之前进行.
    // 判断是否装载钱包插件,理论上不可能没有
    this.wdb = this.node.require('walletdb');
    if (!this.wdb) {
      throw new Error('wallet plugin is not installed');
    }
  }
  /**
   * 打开当前node,并且监听交易事件
   * 该函数应该在进入home之前调用;
   * 此时,如果首次运行app,并且设置了助记词,系统会根据助记词生成钱包,否则则生成随机钱包.
   * 非首次运行,直接运行open即可,spvNode会自动打开已有的钱包
   */
  public async open() {
    this.node.chain.on('block', (item, entry) => {
      this.logger.info('block in hash: ' + item.rhash());
      this.events.publish('receive:block', item, entry);
    });
    // 增加测试钱包数据库的建立
    await this.node.ensure();
    await this.wdb.checkNewRecord();
    if (this.wdb.newRecord) {
      // 当前尚未建立钱包数据库，根据之前引导用户进入创建钱包流程，      
      if (this.mnemonicConfig && this.bootstrapMnemonic.length > 0) {
        this.wdb.setmnemonicByWords(this.bootstrapMnemonic);
      }
      else {
        this.wdb.setmnemonicByLen(128);
      }
      // 设置wdb的语言环境--TODO:语种可切换
      this.wdb.setlanguage('simplified chinese');
    }
    try { await this.node.open(); }
    catch (e) {
      this.logger.info('primary:' + e);
    }
    await this.node.connect();
    this.node.startSync();
    this.wallet = this.wdb.primary;
    this.wallet.name = '我的游戏钱包';
    this.wallet.corlor = '#647ce8';
    this.logger.info('wallet id:' + this.wallet.id);
    this.events.publish('node:open', this.wallet);

    this.wdb.primary.on('balance', () => {
      this.logger.info('primary:' + this.wdb.primary);
      this.logger.info('get balance:' + JSON.stringify(this.balance));
    });
    await this.getBalance();
    // getCplist必须在getBalance后调用
    this.getCpList();
    this.getFirstAddress();
  }

  // 根据配置创建一个钱包 -- 目前不需要
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
  // 根据配置导入一个已有钱包 -- 目前不需要
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
  // 创建默认钱包 -- 目前不需要
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
  // 设置初始助记词,返回true,设置成功,返回false,助记词非法,需要重新设置.
  // 仅在第一次进入钱包app引导页时候调用
  public setMnemonic(mnemonic: string): boolean {
    let ret = this.wdb.testmnemonic(mnemonic);
    // 判断助记词的合法性,校验不通过,不允许创建钱包
    if (ret.code != 0) {
      return false;
    }
    this.mnemonicConfig = true;
    this.bootstrapMnemonic = mnemonic;
    return true;
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
  // 获取当前接收地址
  getFirstAddress(): any {
    this.wdb.rpc
      .execute({
        method: 'address.receive',
      })
      .then(address => {
        if (!!address) {
          let firstAddress = address;
          this.events.publish('address.first', firstAddress);
          return firstAddress;
        }
      });
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
   * 发送游戏金到指定的地址,如果成功,返回构造的交易信息.
   * @param addr:为接收方地址
   * @param amout:为转账金额-单位为尘(10-8),不包含手续费
   * @return tx:返回生成的交易信息.
   */
  public sendGGD(addr: string, amount: number): any {
    this.wdb.rpc.execute({ method: 'tx.send', params: [addr, amount] }).then(tx => {
      this.events.publish('tx.send', tx);
      return tx;
    });
  }
  /** 
   * wallet-details页面使用
   * 获取钱包内交易明细-支持页码查询,目前每页最多返回10条
   */
  public getTxDetails(page: number): any {
    this.wdb.rpc.execute({ method: 'tx.history', params: [page] }).then(txs => {
      this.events.publish('tx.history', txs);
      return txs;
    });
  }
  /**
   * 获得钱包的助记词
   */
  public getMnemonicPhrase(): string {
    if (this.wallet) {
      return this.wallet.master.mnemonic.phrase;
    }
  }
  /**
   * 加密钱包
   * @param phrase: 加密钱包的密钥
   * @return 是否加密成功
   */
  public async encryptWallet(phrase: string): Promise<boolean> {
    try {
      await this.wdb.rpc.execute({ method: 'wallet.encrypt', params: [phrase] });
      return true;
    }
    catch (err) {
      this.logger.info('encryptWallet error:' + err);
      return false;
    }
  }
  /**
   * 解密钱包
   * @param phrase: 解密钱包的密钥
   * @return 是否解密成功
   */
  public async decryptWallet(phrase: string): Promise<boolean> {
    try {
      await this.wdb.rpc.execute({ method: 'wallet.decrypt', params: [phrase] });
      return true;
    }
    catch (err) {
      this.logger.info('decryptWallet error:' + err);
      return false;
    }
  }
  /**
   * 临时解密钱包-该函数在任何加密过的钱包执行资金类交易之前都需要调用
   * @param phrase: 解密钱包的密钥
   * @param unlockSecond: 解密的时限(单位是秒)
   * @return 是否解密成功
   */
  public async unlockWallet(phrase: string, unlockSecond: number): Promise<boolean> {
    try {
      await this.wdb.rpc.execute({ method: 'wallet.unlock', params: [phrase] });
      return true;
    }
    catch (err) {
      this.logger.info('unlockWallet error:' + err);
      return false;
    }
  }
  /**
   * 重新锁上临时解密钱包-该函数在任何加密过的钱包执行资金类交易之后都需要调用   
   * @return 是否解密成功
   */
  public async lockWallet(): Promise<boolean> {
    try {
      await this.wdb.rpc.execute({ method: 'wallet.lock', params: [] });
      return true;
    }
    catch (err) {
      this.logger.info('lockWallet error:' + err);
      return false;
    }
  }
  /**
   * 修改钱包的加密密码-实际等于用oldPhrase解密,然后用newPhrase加密
   * @return 是否解密成功
   */
  public async changePassWallet(oldPhrase: string, newPhrase: string): Promise<boolean> {
    try {
      await this.wdb.rpc.execute({ method: 'wallet.changepassphrase', params: [oldPhrase, newPhrase] });
      return true;
    }
    catch (err) {
      this.logger.info('changePassWallet error:' + err);
      return false;
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
        params: [prop.current.rev, prop.current.index, np]
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
  promiseContract(contractId): any {
    this.wdb.rpc
      .execute({
        method: 'contract.promise',
        params: [contractId]
      })
      .then(contract => {
        this.events.publish('contract.promise', contract);
        return contract;
      });
  }

  // 查询交易对
  listContract(type = 1): any {
    this.node.rpc
      .execute({
        method: 'contract.list',
        params: [type]
      })
      .then(contracts => {
        // TODO:出错怎么办?
        if (typeof contracts != 'string')
          this.events.publish('contract.list', contracts);
        return contracts;
      });
  }

  // 查询我参与的交易对
  listMineContract(): any {
    this.wdb.rpc
      .execute({
        method: 'contract.mine',
      })
      .then(myContracts => {
        this.events.publish('contract.mine', myContracts);
        return myContracts;
      });
  }


}
