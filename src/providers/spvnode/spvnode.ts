import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
// import * as gamegold from 'gamegold';
// TODO: 用更为Typescirpt方式,而非全局变量引入
declare var gamegold: any;
import { HttpClient, HttpParams } from '@angular/common/http';
import { createContentChild } from '@angular/compiler/src/core';
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
  private SOFT_CONFIRMATION_LIMIT: number = 12;
  private SAFE_CONFIRMATIONS: number = 6;

  private isPopupOpen: boolean;
  private serverIP: string;
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
  // 定义调用钱包的默认参数,目前写固定值,待优化
  // private walletConfig =
  //   {
  //     cid: "xxxxxxxx-game-gold-root-xxxxxxxxxxxx",
  //     user: {
  //       auth: false,
  //       password: "bookmansoft",
  //       username: "bitcoinrpc"
  //     },
  //     wid: "primary"
  //   }

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
    private translate: TranslateService,
    public http: HttpClient
  ) {
    this.logger.info('SPVNode Service initialized.');
    this.serverIP = '40.73.114.235';
    this.isPopupOpen = false;
    this.nodeOpened = false;
    this.eventNotification = events;
    var nodeLogger = new gamegold.logger({ level: 'debug', console: true });
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
      logger: nodeLogger,
      // 为当前的Cordava SPV节点传入seeds列表，当前节点在连接具体的seed时，将首先连接到其WS桥接端口上，透过该端口桥接其socket端口，进而实现数据交换
      seeds: [`${this.serverIP}`],
      // only: [''],
      'node-uri': `http://${this.serverIP}:17332`,
      'api-key': 'bookmansoft',
      // 钱包的默认语言版本
      'wallet-language': 'simplified chinese',
      'http-remote-host': `${this.serverIP}`,
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
    this.node.chain.on('block', (item, entry) => {
      this.logger.info('block in hash: ' + item.rhash());
      this.events.publish('receive:block', item, entry);
    });
    this.node.chain.on('tx', (item, entry) => {
      this.logger.info('tx in hash: ' + item.rhash());
      this.events.publish('receive:block', item, entry);
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
    if (this.nodeOpened)
      return true;
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
    await this.node.startSync();
    this.wallet = this.wdb.primary;
    this.wallet.name = '我的游戏钱包';
    this.wallet.corlor = '#647ce8';
    this.logger.info('wallet id:' + this.wallet.id);
    this.events.publish('node:open', this.wallet);

    this.wdb.primary.on('balance', (balance) => {
      // 此时wdb中已经更新了新的余额了
      this.balance = balance;
      this.events.publish('node:balance', balance);
      this.logger.info('get balance:' + JSON.stringify(this.balance));
    });
    // 登录成功,查询余额,保证余额始终可用
    await this.getBalance();
    // this.getFirstAddress();
    // 最后置上打开状态,保证后续动作的可靠性.
    await this.node.rpc.execute({ method: 'miner.setsync', params: [] });
    this.nodeOpened = true;
  }

  // 根据配置创建一个钱包 -- 目前不需要使用
  public createWallet(opt): Promise<any> {
    return new Promise((resolve, reject) => {
      this.wdb.isNewRecord().then(isNew => {
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
  // 根据配置导入一个已有钱包 -- 目前不需要使用
  public importWallet(opt): boolean {
    // 判断助记词的合法性
    let ret = this.wdb.testmnemonic(opt.passphrase);
    if (ret.code == 0) {
      // 选择1：引导用户导入助记符
      this.wdb.setmnemonicByWords(opt.passphrase);
      // 设置wdb的语言环境
      this.wdb.setlanguage('simplified chinese');
      return true;
    };
    return false;
  }
  // 创建默认钱包 -- 目前不需要使用
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
    if (this.nodeOpened) {
      // 钱包的样式和名字,应该从spv移除.
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
  public async sendTX(tx): Promise<any> {
    return this.node.sendTX(tx);
  }

  /**
   * 获取当前以获取的块高度
   * 
   */
  public async getBlockCount(): Promise<any> {
    if (this.nodeOpened) {
      const count = await this.node.rpc.execute({ method: 'block.count', params: [] });
      this.events.publish('node:block.count', count);
      return count;
    }
  }
  /**
   * 获取当前钱包余额
   * 
   */
  public async getBalance(): Promise<any> {
    if (this.nodeOpened) {
      const balance = await this.wallet.getBalance();
      this.balance = balance;
      this.events.publish('node:balance', balance);
      return balance;
    }
  }
  // 获取当前接收地址
  public async getFirstAddress(): Promise<any> {
    if (this.nodeOpened) {
      let address = await this.wdb.rpc.execute({
        method: 'address.receive',
      })
      if (!!address) {
        let firstAddress = address;
        this.events.publish('node:address.first', firstAddress);
        return firstAddress;
      }
    }
  }
  /**
   * 获取一个未使用的新地址
   * 
   */
  public async getNewAddress(): Promise<any> {
    if (this.nodeOpened) {
      let address = this.wallet.createReceive();
      if (!!address) {
        this.events.publish('node:address.new', address);
        return address;
      };
    }
  }
  /**
   * 发送游戏金到指定的地址,如果成功,返回构造的交易信息.
   * @param addr:为接收方地址
   * @param amout:为转账金额-单位为尘(10-8),不包含手续费
   * @return tx:返回生成的交易信息.
   */
  public async sendGGD(addr: string, amount: number): Promise<any> {
    // TODO:定义成modal.
    let ret = { code: 0, msg: "", data: {} };
    try {
      const tx = await this.wdb.rpc.execute({ method: 'tx.send', params: [addr, amount] })
      ret.code = 0;
      ret.data = tx;
    }
    catch (err) {
      ret.code = 1;
      ret.msg = err.message;
    }
    this.events.publish('node:tx.send', ret);
    return ret;
  }
  /** 
   * wallet-details页面使用
   * 获取钱包内交易明细-支持页码查询,目前每页最多返回10条
   */
  public async getTxDetails(page: number): Promise<any> {
    const txs = await this.wdb.rpc.execute({ method: 'tx.history', params: [page] });
    this.events.publish('node:tx.history', txs);
    return txs;
  }
  /**
   * 获得钱包的助记词
   */
  public getMnemonicPhrase(): string {
    if (this.nodeOpened) {
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
      await this.wdb.rpc.execute({
        method: 'wallet.changepassphrase',
        params: [oldPhrase, newPhrase]
      });
      return true;
    }
    catch (err) {
      this.logger.info('changePassWallet error:' + err);
      return false;
    }
  }
  // 获取厂商列表,List,
  // XXX:目前采用http方式,待spv方式修复后,可恢复为spv方式
  public async getCpList(page = 1): Promise<any> {
    try {
      let cps = await this.node.rpc.execute({
        method: 'cp.list',
        params: [page]
      });
      if (cps) {
        this.events.publish('node:cp.list', cps);
        return cps;
      }
    }
    catch (err) {
      this.logger.error("get CP List Err" + err);
    }
  }

  /**
   * 获取背包中道具列表-app应用,无需传openid
   * @param page 查询的页码,默认为1
   * @returns 当前页道具列表信息
   */
  public async getPropList(page = 1): Promise<any> {
    const props = await this.node.rpc.execute({
      method: 'prop.list',
      params: [page]
    });
    if (props) {
      this.props = props;
      this.events.publish('node:prop.list', props);
      return this.props;
    }
  }


  /**
   * 拍卖背包中道具,需要传入商品与价格,目前仅提供一口价的拍卖模式.
   * @param prop 要卖出的商品
   * @param np 卖出的价格 
   * @returns 卖出道具的交易信息
   */
  public async saleProp(prop, np): Promise<any> {
    const tx = await this.node.rpc.execute({
      method: 'prop.sale',
      params: [prop.current.rev, prop.current.index, np]
    });
    if (tx) {
      this.events.publish('node:prop.sale', tx);
      return tx;
    }
  }

  /**
   * 熔铸背包中道具,需要传入道具
   * @param prop 要被熔铸的道具
   * @returns 熔铸的交易信息
   */
  public async foundProp(prop): Promise<any> {
    const tx = await this.node.rpc.execute({
      method: 'prop.found',
      params: [prop.current.rev]
    });
    if (tx) {
      this.events.publish('node:prop.found', tx);
      return tx;
    }
  }


  /**
   * 参与竞价,需要传入商品与出价
   * @param bid 拍卖中的商品订单
   * @param np 出价
   * @returns 新的拍卖的交易信息
   */
  public async buyProp(bid, np): Promise<any> {
    try {
      const tx = await this.node.rpc.execute({
        method: 'prop.buy',
        params: [bid.pid, // 拍卖物品编码
          np // 新的竞拍价格
        ]
      });
      if (tx) {
        this.events.publish('node:prop.buy', tx);
        return tx;
      }
    }
    catch (error) {
      this.logger.error("buy prop error" + JSON.stringify(error));
    }

  }

  /**
   * 列出市场道具
   * @param cp 需要查询的具体厂商
   * @param page 页码,默认为1
   * @param pids 指定的查询道具列表
   * @returns 道具列表
   */
  public async listMarket(cid?: string, page = 1, pids = []): Promise<any> {
    const props = await this.node.rpc.execute({
      method: 'prop.list.market',
      params: [
        cid, page, pids
      ]
    });
    if (props) {
      this.events.publish('node:prop.list.market', props);
      return props;
    }
  }
  /**
   * 查询自己正在拍卖的道具信息
   * @param page 查询的具体页码,默认为1
   * @returns 道具列表
   */
  public async listAuction(page = 1): Promise<any> {
    const props = await this.node.rpc.execute({
      method: 'prop.list.auction',
      params: [
        page
      ]
    });
    if (props) {
      this.events.publish('node:prop.list.auction', props);
      return props;
    }
  }
  /**
   * 查询自己正在拍卖的道具信息
   * @param page 查询的具体页码,默认为1
   * @returns 道具列表
   */
  public async listBid(page = 1): Promise<any> {
    const props = await this.node.rpc.execute({
      method: 'prop.list.bid',
      params: [
        page
      ]
    });
    if (props) {
      this.events.publish('node:prop.list.bid', props);
      return props;
    }
  }

  /**
   * 计算自己所拥有的道具数量
   */
  public async getPropCount(): Promise<any> {
    const count = await this.node.rpc.execute({
      method: 'prop.count',
      params: []
    });
    if (count) {
      this.events.publish('prop.count', count);
      return count;
    }
  }

  // 支付订单
  public async orderPay(order): Promise<any> {
    const tx = await this.node.rpc.execute({
      method: 'order.pay',
      params: [order.cid, order.uid, order.sn, order.price]
    });
    if (tx) {
      this.events.publish('node:order.pay', tx);
      return tx;
    }
  }

  // 创建交易对-目前仅btc,type默认1
  public async createContract(ggAmount, btcAmount, btcAddress, type = 1): Promise<any> {
    const contract = await this.node.rpc.execute({
      method: 'contract.create',
      params: [type, ggAmount, btcAmount, btcAddress]
    });
    if (contract) {
      this.events.publish('node:contract.create', contract);
      return contract;
    }
  }

  // 承诺兑换交易对-目前仅btc,type默认1
  public async promiseContract(contractId): Promise<any> {
    const contract = await this.node.rpc.execute({
      method: 'contract.promise',
      params: [contractId]
    });
    if (contract) {
      this.events.publish('node:contract.promise', contract);
      return contract;
    }
  }

  // 查询交易对
  public async listContract(type = 1): Promise<any> {
    const contracts = await this.node.rpc.execute({
      method: 'contract.list',
      params: [type]
    });
    if (contracts) {
      if (typeof contracts != 'string')
        this.events.publish('contract.list', contracts);
      return contracts;
    }
  }

  // 查询我参与的交易对
  public async listMineContract(): Promise<any> {
    const myContracts = await this.node.rpc.execute({
      method: 'contract.mine',
    });
    if (myContracts) {
      this.events.publish('node:contract.mine', myContracts);
      return myContracts;
    }
  }

  // 执行交易对
  public async executeContract(contracId, master: number): Promise<any> {
    const contract = await this.node.rpc.execute({
      method: 'contract.execute',
      params: [contracId, master]
    });
    if (contract) {
      this.events.publish('contract.execute', contract);
      return contract;
    }
  }

  /**
   * 验证一个地址是否是我所有的
   * @param addr 需要验证的地址-base58编码
   */
  public async verifyMyAddress(addr: any): Promise<boolean> {
    // 有可能为null输入..
    if (!addr)
      return false;
    let isMine = false;
    try {
      let base58Address: string = typeof addr === 'string' ? addr : addr.toString(addr.network);
      const privateKey = await this.node.rpc.execute({
        method: 'address.wif',
        params: [base58Address]
      });
      // 仅当能正确获取地址的私钥时,该地址属于自己
      if (!!privateKey) {
        isMine = true;
      }
    }
    catch (err) {
      return isMine;
    }
    return isMine;
  }
  /**
   * 根据编码查询厂商记录
   * @param cpId 厂商Id
   * @returns 厂商信息
   * @usage 返回示例
   * {                                                       
   *   "cid": "eb9d03c0-0ff9-11e9-a575-21541098fe6c",        
   *   "cls": "SLG",                                         
   *   "name": "EatChicken",                                 
   *   "url": "http://114.116.148.48:9701/mock/EatChicken",  
   *   "ip": "",                                             
   *   "grate": 15                                           
   * }                                                       
   */
  public async getCpById(cpId: string): Promise<any> {
    const cp = await this.node.rpc.execute({
      method: 'cp.byId',
      params: [cpId]
    });
    if (cp) {
      this.events.publish('node:cp.byId', cp);
      return cp;
    }
  }
  /**
   * 生成登录令牌,传递给游戏厂商cp进行验证
   * 在钱包里面调用,不会用到openId
   * @param cpId 游戏cpId
   * @param gameUid 游戏内玩家Id
   * @param referrer 推荐人地址,可为空
   * @returns 生成的token令牌串
   */
  public async tokenUser(cpId: string, gameUid: string, referrer?: string): Promise<any> {
    if (!cpId || !gameUid)
      return null;
    // 先判断地址合法性  
    if (referrer) {
      let verify = await this.verifyMyAddress(referrer);
      if (!verify)
        return null;
    }
    const token = await this.node.rpc.execute({
      method: 'token.user',
      params: [cpId, gameUid, referrer]
    });
    if (token) {
      this.events.publish('node:token.user', token);
      return token;
    }
  }
  /**
   * 获取支付订单列表
   * @param cpId 厂商编码,可为空,查询全部
   * @param page 页码,默认为1
   * @returns 用户的订单列表
   */
  public async getOrder(cpId?: string, page = 1): Promise<any> {
    const orders = await this.node.rpc.execute({
      method: 'order.list',
      params: [cpId, page]
    });
    if (orders) {
      this.events.publish('node:order.list', orders);
      return orders;
    }
  }
  /**
   * 接收捐赠道具-手机app不需要openid
   * @param raw 捐赠的原始数据-通常通过二维码传递
   * @returns 接收到的道具信息.
   */
  public async receiveProp(raw: string): Promise<any> {
    const prop = await this.node.rpc.execute({
      method: 'prop.receive',
      params: [raw]
    });
    if (prop) {
      this.events.publish('prop.receive', prop);
      return prop;
    }
  }
}
