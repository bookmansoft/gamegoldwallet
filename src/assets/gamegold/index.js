; (function () {

  'use strict';

  var util = gamegold.util;
  var body = document.getElementsByTagName('body')[0];
  var log = document.getElementById('log');
  var wdiv = document.getElementById('wallet');
  var tdiv = document.getElementById('tx');
  var floating = document.getElementById('floating');
  var newcp = document.getElementById('newcp');
  var chainState = document.getElementById('state');
  var rpc = document.getElementById('rpc');
  var cmd = document.getElementById('cmd');
  var items = [];
  var scrollback = 0;
  var logger, node, wdb;

  //region 生成新的地址功能，暂时屏蔽
  // wdb.primary.createReceive().then(function() {
  //   formatWallet(wdb);
  // });
  //endregion

  //region 新增厂商功能 暂时屏蔽
  // wdb.rpc.execute({method:'cp.create', params:['slg' + Math.random(), '920.cc']}).then( tx => {
  //   console.log('cp.create', tx);
  // });
  //endregion

  //region 发起一个厂商修改交易，暂时屏蔽
  // wdb.rpc.execute({method:'cp.change', params:[
  //   cp.name,                //当前厂商名称
  //   'slg' + Math.random(),  //修改后的名称
  //   'bookman.cc'            //修改后的URL
  // ]}).then(tx => {
  //   console.log('cp.change', tx);
  // });
  //endregion

  window.onunhandledrejection = function (event) {
    throw event.reason;
  };

  body.onmouseup = function () {
    floating.style.display = 'none';
  };

  floating.onmouseup = function (ev) {
    ev.stopPropagation();
    return false;
  };

  function show(obj) {
    floating.innerHTML = escape(util.inspectify(obj, false));
    floating.style.display = 'block';
  }

  logger = new gamegold.logger({ level: 'debug', console: true });
  logger.writeConsole = function (level, module, args) {
    var name = gamegold.logger.levelsByVal[level];
    var msg = util.format(args, false);
    if (++scrollback > 1000) {
      log.innerHTML = '';
      scrollback = 1;
    }
    log.innerHTML += '<span style="color:blue;">' + util.now() + '</span> ';
    if (name === 'error') {
      log.innerHTML += '<span style="color:red;">';
      log.innerHTML += '[';
      log.innerHTML += name
      log.innerHTML += '] ';
      if (module)
        log.innerHTML += '(' + module + ') ';
      log.innerHTML += '</span>';
    } else {
      log.innerHTML += '[';
      log.innerHTML += name
      log.innerHTML += '] ';
      if (module)
        log.innerHTML += '(' + module + ') ';
    }
    log.innerHTML += escape(msg) + '\n';
    log.scrollTop = log.scrollHeight;
  };

  rpc.onsubmit = function (ev) {
    var text = cmd.value || '';
    var argv = text.trim().split(/\s+/);
    var method = argv.shift();
    var params = [];
    var i, arg, param;

    cmd.value = '';

    for (i = 0; i < argv.length; i++) {
      arg = argv[i];
      try {
        param = JSON.parse(arg);
      } catch (e) {
        param = arg;
      }
      params.push(param);
    }

    //内部调用本地节点的RPC指令，这些指令还可以通过 Restful 接口远程调用
    node.rpc.execute({ method: method, params: params }).then(show, show);

    ev.preventDefault();
    ev.stopPropagation();

    return false;
  };

  /**
   * 列表厂商
   */
  newcp.onmouseup = function () {
    formatCP(wdb);
  };

  function listOrder() {
    let wallet = wdb.primary;
    var html = '';
    var json = wallet.master.toJSON(true);
    var el;

    html += '当前地址: <b>' + wallet.getAddress() + '</b><br>';
    html += '扩展私钥: <b>' + json.key.xprivkey + '</b><br>';
    html += '助 记 符: <b>' + json.mnemonic.phrase + '</b><br>';

    wallet.getBalance().then(function (balance) {
      html += '余额（已确认）: <b>' + gamegold.amount.btc(balance.confirmed) + '</b><br>';
      html += '余额（未确认）: <b>' + gamegold.amount.btc(balance.unconfirmed) + '</b><br>';

      html += '订单列表:<br>';
      wdiv.innerHTML = html;

      $.get("/order/list/1", function (data, status) {
        for (let it of data.data) {
          if (it.confirm < 0) {
            el = create(`<a href="#">点击支付：${it.sn}:${it.content}</a>`);
            wdiv.appendChild(el);
            el.onmouseup = function (ev) {
              wdb.rpc.execute({ method: 'order.pay', params: [it.cid, it.uid, it.sn, it.price] }).then(tx => {
                console.log('order.pay: ', tx);
                listOrder();
              });
              ev.stopPropagation();
              return false;
            };
          }
          else if (it.confirm < 6) {
            el = create(`<p>等待确认：${it.sn}:${it.content} 确认数: ${it.confirm}</p>`);
            wdiv.appendChild(el);
          }
          else {
            el = create(`<p>已经兑付：${it.sn}:${it.content}</p>`);
            wdiv.appendChild(el);
          }

          el = create('<br/>');
          wdiv.appendChild(el);
        }
      });
    });
  }

  function kb(size) {
    size /= 1000;
    return size.toFixed(2) + 'kb';
  }

  function create(html) {
    var el = document.createElement('div');
    el.innerHTML = html;
    return el.firstChild;
  }

  function escape(html, encode) {
    return html
      .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function addItem(item, entry) {
    var height = entry ? entry.height : -1;
    var el;

    if (items.length === 20) {
      el = items.shift();
      tdiv.removeChild(el);
      el.onmouseup = null;
    }

    el = create('<a style="display:block;" href="#'
      + item.rhash() + '">' + item.rhash() + ' (' + height
      + ' - ' + kb(item.getSize()) + ')</a>');
    tdiv.appendChild(el);

    setMouseup(el, item);

    items.push(el);

    chainState.innerHTML = ''
      + 'tx=' + node.chain.db.state.tx
      + ' coin=' + node.chain.db.state.coin
      + ' value=' + gamegold.amount.btc(node.chain.db.state.value);
  }

  function setMouseup(el, obj) {
    el.onmouseup = function (ev) {
      show(obj);
      ev.stopPropagation();
      return false;
    };
  }

  function formatWallet(wdb) {
    let wallet = wdb.primary;
    var html = '';
    var json = wallet.master.toJSON(true);
    var i, tx, el;

    html += '当前地址: <b>' + wallet.getAddress() + '</b><br>';
    html += '扩展私钥: <b>' + json.key.xprivkey + '</b><br>';
    html += '助 记 符: <b>' + json.mnemonic.phrase + '</b><br>';

    wallet.getBalance().then(function (balance) {
      html += '余额（已确认）: <b>' + gamegold.amount.btc(balance.confirmed) + '</b><br>';
      html += '余额（未确认）: <b>' + gamegold.amount.btc(balance.unconfirmed) + '</b><br>';

      return wallet.getHistory();
    }).then(function (txs) {
      return wallet.toDetails(txs);
    }).then(function (txs) {
      html += '交易列表:\n';
      wdiv.innerHTML = html;
      for (i = 0; i < txs.length; i++) {
        tx = txs[i];
        el = create('<a style="display:block;" href="#' + tx.hash + '">' + tx.hash + '</a>');
        wdiv.appendChild(el);
        setMouseup(el, tx.toJSON());
      }
    });
  }

  function formatProps(wdb, cid) {
    let wallet = wdb.primary;
    var html = '';
    var json = wallet.master.toJSON(true);
    var i, tx, el;

    html += '当前地址: <b>' + wallet.getAddress() + '</b><br>';
    html += '扩展私钥: <b>' + json.key.xprivkey + '</b><br>';
    html += '助 记 符: <b>' + json.mnemonic.phrase + '</b><br>';

    wallet.getBalance().then(function (balance) {
      html += '余额（已确认）: <b>' + gamegold.amount.btc(balance.confirmed) + '</b><br>';
      html += '余额（未确认）: <b>' + gamegold.amount.btc(balance.unconfirmed) + '</b><br>';

      html += '\n道具列表:\n';
      wdiv.innerHTML = html;

      el = create('<br/>');
      wdiv.appendChild(el);

      return wdb.rpc.execute({ method: 'prop.list', params: [] });
    }).then(function (props) {
      //打印道具列表
      console.log('props', props);
      for (i = 0; i < props.length; i++) {
        let prop = props[i];
        if (prop.cid != cid) { //只打印当前游戏的道具
          continue;
        }

        el = create('<br/>');
        wdiv.appendChild(el);

        el = create('<a href="#' + prop.pid + '">' + prop.pid + '</a>');
        wdiv.appendChild(el);
        setMouseup(el, JSON.stringify(prop));

        el = create(`<a href="#">[熔铸]</a>`);
        wdiv.appendChild(el);
        el.onmouseup = function (ev) {
          let p = [prop.current.rev, prop.current.index];
          console.log(p);
          //将道具转移到一个地址，目前的写法是自动转移到了创建道具时的地址上
          wdb.rpc.execute({ method: 'prop.found', params: p }).then(tx => {
            console.log('found', tx);
            setTimeout(() => {
              //转移成功，列表现有的道具
              formatProps(wdb, cid);
            }, 1000);
          });
          ev.stopPropagation();
          return false;
        };

        el = create(`<a href="#">[拍卖]</a>`);
        wdiv.appendChild(el);
        el.onmouseup = function (ev) {
          wdb.rpc.execute({ method: 'prop.sale', params: [prop.current.rev, (prop.gold * 1.2) | 0] }).then(tx => {
            console.log('sale', tx);
            setTimeout(() => {
              formatSales(wdb, cid);
            }, 1000);
          });
          ev.stopPropagation();
          return false;
        };
      }
    });
  }

  /**
   * 查询并列表厂商信息, 添加相关操作的超链
   * @param {*} wdb 
   */
  function formatCP(wdb) {
    let wallet = wdb.primary;
    var html = '';
    var json = wallet.master.toJSON(true);
    var i, tx, el;

    html += '当前地址: <b>' + wallet.getAddress() + '</b><br>';
    html += '扩展私钥: <b>' + json.key.xprivkey + '</b><br>';
    html += '助 记 符: <b>' + json.mnemonic.phrase + '</b><br>';

    wallet.getBalance().then(function (balance) {
      html += '余额（已确认）: <b>' + gamegold.amount.btc(balance.confirmed) + '</b><br>';
      html += '余额（未确认）: <b>' + gamegold.amount.btc(balance.unconfirmed) + '</b><br>';
      html += '\n游戏列表:';
      wdiv.innerHTML = html;

      //region 刷新厂商列表
      el = create(`<a href="#">[刷新]</a>`);
      wdiv.appendChild(el);
      el.onmouseup = function (ev) {
        node.rpc.execute({ method: 'cp.flush', params: [] }).then(() => {
          setTimeout(() => {
            formatCP(wdb);
          }, 2000);
        });
        ev.stopPropagation();
        return false;
      };
      //endregion

      //通过RPC接口查询厂商信息列表
      node.rpc.execute({ method: 'cp.list', params: [] }).then(cps => {
        console.log('cp.list', cps);
        for (i = 0; i < cps.length; i++) {
          el = create('<br/>');
          wdiv.appendChild(el);

          //region 添加一个超链，点击后显示cp详情
          let cp = cps[i];
          el = create('<a href="#' + cp.name + '">' + cp.name + '</a>');
          wdiv.appendChild(el);
          setMouseup(el, JSON.stringify(cp));
          //endregion

          //region 向游戏发起登录请求
          el = create(`<a href="#">[登录]</a>`);
          wdiv.appendChild(el);
          el.onmouseup = function (ev) {
            wdb.rpc.execute({
              method: 'token.user', params: [
                cp.cid,       //游戏编号
                '10000001'    //游戏内玩家编号
              ]
            }).then(token => {
              //延迟显示新的厂商列表
              var ts = encodeURIComponent(JSON.stringify(token));
              //`{"data":{addr","cid","pubkey","time","uid",},"sig"}`;
              setTimeout(() => {
                location.href = `/game/${ts}`;
              }, 1000);
            });
            ev.stopPropagation();
            return false;
          };
          //endregion

          //region 查询订单列表
          el = create(`<a href="#">[订单]</a>`);
          wdiv.appendChild(el);
          el.onmouseup = function (ev) {
            listOrder();
            ev.stopPropagation();
            return false;
          };
          //endregion

          //region 查询道具列表
          el = create(`<a href="#">[背包]</a>`);
          wdiv.appendChild(el);
          el.onmouseup = function (ev) {
            formatProps(wdb, cp.cid);
            ev.stopPropagation();
            return false;
          };
          //endregion

          //region 查询拍卖列表
          el = create(`<a href="#">[竞拍]</a>`);
          wdiv.appendChild(el);
          el.onmouseup = function (ev) {
            formatSales(wdb, cp.cid);
            ev.stopPropagation();
            return false;
          };
          //endregion
        }
      });
    });
  }

  /**
   * 列表拍卖交易
   * @param {*} wdb 
   */
  function formatSales(wdb, cid) {
    let wallet = wdb.primary;
    var html = '';
    var json = wallet.master.toJSON(true);
    var i, tx, el;

    html += '当前地址: <b>' + wallet.getAddress() + '</b><br>';
    html += '扩展私钥: <b>' + json.key.xprivkey + '</b><br>';
    html += '助 记 符: <b>' + json.mnemonic.phrase + '</b><br>';

    wallet.getBalance().then(function (balance) {
      html += '余额（已确认）: <b>' + gamegold.amount.btc(balance.confirmed) + '</b><br>';
      html += '余额（未确认）: <b>' + gamegold.amount.btc(balance.unconfirmed) + '</b><br>';

      html += '\n拍卖交易列表:\n';
      wdiv.innerHTML = html;

      //发起针对指定厂商的拍卖交易列表查询
      node.rpc.execute({
        method: 'prop.list.market', params: [
          cid,        //厂商编码
        ]
      }).then(orders => {
        console.log('sale list:', orders);
        for (i = 0; i < orders.length; i++) {
          el = create('<br/>');
          wdiv.appendChild(el);

          //region 添加一个超链，点击显示交易详情
          let order = orders[i];
          el = create('<a href="#' + order.pid + '">' + order.pid + '</a>');
          wdiv.appendChild(el);
          setMouseup(el, JSON.stringify(order));
          //region

          //region 添加一个超链，点击提交新的竞价
          el = create(`<a href="#">[竞价]</a>`);
          wdiv.appendChild(el);
          el.onmouseup = function (ev) {
            //发起竞价，模拟价格上浮10%
            let np = (Math.max(order.price/*起拍价*/, order.bid/*当前最新竞拍价*/) * 1.1) | 0; // 利用 |0 取整
            wdb.rpc.execute({
              method: 'prop.buy', params: [
                order.pid,  //拍卖物品编码
                np,         //新的竞拍价格
              ]
            }).then(tx => {
              setTimeout(() => {
                formatSales(wdb, cid);
              }, 1000);
            });
            ev.stopPropagation();
            return false;
          };
          //endregion
        }
      });
    });
  }

  //region 创建spv节点
  node = new gamegold.spvnode({
    config: false, //是否载入外部配置文件 - Web 环境下不支持外部配置文件
    hash: true,
    query: true,
    prune: true,
    network: 'testnet',
    db: 'leveldb',
    coinCache: 30000000,
    persistent: true,
    logConsole: true,
    workers: true,
    //workerFile: '/gamegold-worker.js', //会覆盖 process.env.GAMEGOLD_WORKER_FILE，视情况运用
    logger: logger,
    /**
     * 为当前节点(Cordava SPV)传入默认seeds列表
     */
    seeds: [
      `112.74.65.55`
    ],
    //插件列表
    plugins: [ //2018.5.3 当前版本要求：钱包插件最后载入
      gamegold.wallet.plugin,    //钱包管理插件，可以在全节点或SPV节点加载
    ],
    'http-remote-host': '112.74.65.55',
    'api-key': 'bookmansoft',
  });

  //获取钱包中间件句柄
  wdb = node.require('walletdb');
  //endregion

  //新增：监听插件打开事件，检测数据库打开模式
  node.on('plugin open', ret => {
    switch (ret.type) {
      case 'chaindb':
        if (ret.result == 'new') {
          //链库是新建的
          console.log('chaindb new');
        }
        else {
          //链库是已有的
          console.log('chaindb exist');
        }
        break;
    }
  });

  //侦听block事件
  node.chain.on('block', addItem);

  node.ensure().then(() => {
    //测试钱包数据库是否已经建立
    return wdb.checkNewRecord();
  }).then(() => {
    if (wdb.newRecord) {
      //当前尚未建立钱包数据库，引导用户进入创建钱包流程，补充输入必要的前导信息，例如 passphrase
      console.log('new wallet db.');

      //选择助记符设置方式, 可以分配配置为 1、2或者3
      let sel = 3;
      switch (sel) {
        case 1: {
          //选择1：引导用户导入助记符
          let phrase = '紧 成 剪 性 域 伐 济 等 阿 宪 圈 球';
          let rt = wdb.testmnemonic(phrase); // rt的结构 {code: Number, msg: String}
          if (rt.code == 0) {
            wdb.setmnemonicByWords(phrase);
          }
          else {
            //提示助记符错误
            //@note：为了维护良好的用户体验，需要提示具体的错误原因，例如长度不足等等
            throw rt.msg;
          }
          break;
        }
        case 2: {
          //选择2：系统自动生成随机的熵字节序列，并引导用户离线记录对应的助记符
          wdb.setmnemonicByEntropy('11111111111111111111111111111111');
          //@note 此处为了方便测试，使用了固定的熵字节序列
          break;
        }
        case 3: {
          //选择3：指定熵的长度（位），内部自动生成助记符，然后引导用户离线记录对应的助记符
          wdb.setmnemonicByLen(128);
          break;
        }
      }

      //钱包的语言版本，注意该设定只是决定了 primary 的语言版本，后续创建的钱包还得单独设定
      wdb.setlanguage('simplified chinese');

      /**
       * 衍生键所用的盐（可以为空串），系统创建初始数据库时要求用户输入，之后随 MasterKey 写入 walletdb
       * @note：脑钱包组成成分，不可存储，即使助记符泄漏，wallet-passphrase仍旧可以确保密钥安全
       */
      wdb.setpassphrase('bookmansoft');
    }
    else {
      //当前已经建立了钱包数据库，可以做一些进一步的判断，例如钱包是否已备份等
      console.log('wallet db exists.');
    }

    return node.open();
  }).then(() => {
    return node.connect();
  }).then(() => {
    node.startSync();

    wdb.primary.on('balance', function () {
      formatWallet(wdb);
    });

    formatWallet(wdb);
  }).catch(err => {
    console.error(err);
    throw err;
  });

})();
