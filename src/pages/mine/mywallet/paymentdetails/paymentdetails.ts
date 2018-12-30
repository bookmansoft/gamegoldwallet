import { Component, VERSION, ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import {
  Events,
  ModalController,
  Navbar,
  NavController,
  NavParams,
  ToastController
} from 'ionic-angular';
import { from } from 'rxjs/observable/from';
import { Logger } from '../../../../providers/logger/logger';
import { SpvNodeProvider } from '../../../../providers/spvnode/spvnode';
import { BillingDetailsPage } from '../billingdetails/billingdetails';
@Component({
  selector: 'page-paymentdetails',
  templateUrl: './paymentdetails.html'
})
export class PaymentDetailsPage {
  public datas: any[];
  public total: number; // 总交易数
  public currentPageNum: number; // 当前页交易数
  public pageSize: number; // 每页交易数
  public totalPages: number;

  constructor(
    private navCtrl: NavController,
    private logger: Logger,
    public toastCtrl: ToastController,
    private events: Events,
    private spvNodeProvider: SpvNodeProvider,
    private storage: Storage
  ) {
    this.datas = [
      {
        month: '2018-11',
        info: [
          {
            date: '2018-10-01   15:00:00',
            detail: '支出 - 购买道具',
            amount: '-30.00',
            type: 0,
            order: '12121110225546227811220',
            note: '换取道具',
            balance: 1020.0
          },
          {
            date: '2018-10-01   15:00:00',
            detail: '收入 - 系统奖励',
            amount: '+130.00',
            type: 1,
            order: '12121110225546227811220',
            note: '转出道具',
            balance: 1050.0
          },
          {
            date: '2018-10-01   15:00:00',
            detail: '收入 - 卖出道具',
            amount: '+150.00',
            type: 1,
            order: '12121110225546227811220',
            note: '转出道具',
            balance: 920.0
          }
        ]
      },
      {
        month: '2018-10',
        info: [
          {
            date: '2018-10-01   15:00:00',
            detail: '支出 - 购买道具',
            amount: '-30.00',
            type: 0,
            order: '12121110225546227811220',
            note: '换取道具',
            balance: 770.0
          },
          {
            date: '2018-10-01   15:00:00',
            detail: '收入 - 卖出道具',
            amount: '+130.00',
            type: 1,
            order: '12121110225546227811220',
            note: '转出道具',
            balance: 800.0
          }
        ]
      },
      {
        month: '2018-09',
        info: [
          {
            date: '2018-10-01   15:00:00',
            detail: '支出 - 购买道具',
            amount: '-30.00',
            type: 0,
            order: '12121110225546227811220',
            note: '换取道具',
            balance: 670.0
          },
          {
            date: '2018-10-01   15:00:00',
            detail: '收入 - 卖出道具',
            amount: '+130.00',
            type: 1,
            order: '12121110225546227811220',
            note: '转出道具',
            balance: 700.0
          }
        ]
      },
      {
        month: '2018-08',
        info: [
          {
            date: '2018-10-01   15:00:00',
            detail: '支出 - 购买道具',
            amount: '-30.00',
            type: 0,
            order: '12121110225546227811220',
            note: '换取道具',
            balance: 570.0
          },
          {
            date: '2018-10-01   15:00:00',
            detail: '收入 - 卖出道具',
            amount: '+130.00',
            type: 1,
            order: '12121110225546227811220',
            note: '转出道具',
            balance: 600.0
          }
        ]
      },
      {
        month: '2018-07',
        info: [
          {
            date: '2018-10-01   15:00:00',
            detail: '支出 - 购买道具',
            amount: '-30.00',
            type: 0,
            order: '12121110225546227811220',
            note: '换取道具',
            balance: 470.0
          },
          {
            date: '2018-10-01   15:00:00',
            detail: '收入 - 卖出道具',
            amount: '+130.00',
            type: 1,
            order: '12121110225546227811220',
            note: '转出道具',
            balance: 500.0
          }
        ]
      }
    ];
  }

  ionViewWillEnter() {
    // 从第一页开始.
    this.spvNodeProvider.getTxDetails(1).then(txs => {
      this.pageSize = txs.pageSize;
      this.currentPageNum = txs.pageNum;
      this.total = txs.total;
      this.totalPages = this.total % this.pageSize == 0 ? Math.floor(this.total / this.pageSize) : Math.floor(this.total / this.pageSize) + 1;
      // 重新获取最后一页内容
      if (this.total > 0)
        // TODO: 这个应该做滚屏,转载多页信息.
        this.spvNodeProvider.getTxDetails(this.totalPages).then(lastPage => {
          // TODO:更新当前列表,请开德帮忙显示
          this.filterTx(lastPage).then(datas => {
            this.logger.info("get Tx DATA:" + JSON.stringify(datas));
          });
        });
    });
  }

  // 跳转到流水详情
  gotoBillingDetailsPage(item: any) {
    this.logger.info('>>>流水：' + JSON.stringify(item));
    this.navCtrl.push(BillingDetailsPage, { data: item });
  }
  // 过滤链上返回的交易信息,
  async filterTx(txs): Promise<any[]> {
    let datas = [];
    let i;
    let txsArray = txs.items;
    for (i = 0; i < txsArray.length; i++) {
      let item = txsArray[i];
      let itemJson = item.toJSON();
      // 比较麻烦的是判断交易的方向,目前钱包没有这些信息,需要遍历每个inputs和outputs
      let txDirection: number;           // 转账方向 0-转出,1-转入,2-自己转自己
      let txValue: number = 0;             // 交易金额(有效金额-不记手续费)

      // 等它返回才继续.
      let txAmout = await this.getTxAmout(item.inputs, item.outputs);
      this.logger.info("Now TX txAmout:" + JSON.stringify(txAmout));

      // 如果自己有输入金额,说明是转出
      if (txAmout.inputSelf > 0) {
        if (txAmout.OutpuOthert == 0) {
          // 没有给别人转钱,自己转自己.
          txDirection = 2;
          txValue = txAmout.OutpuSelft;
        }
        else {
          txDirection = 0;
          txValue = txAmout.OutpuOthert;
        }

      }
      else {
        txDirection = 1;
        txValue = txAmout.OutpuSelft;
      }
      let txData = {
        hash: item.hash, // hash值
        block: item.block, // 所在块
        date: itemJson.date, // 交易时间
        fee: itemJson.fee, // 手续费
        direction: txDirection, // 转账方向,
        value: txValue   // 交易金额
      };
      // this.logger.info("Now TX ITEM:" + JSON.stringify(txData));
      datas.push(txData);
    }

    // 这时候datas是当前过滤的明细
    return datas;
  }


  async getTxAmout(inputs, outputs) {
    let nowInput: any;
    let nowOutput: any;
    let inputSelfAmout: number = 0;  // 当前交易自己的输入金额(付出)
    let inputOtherAmout: number = 0; // 当前交易别人的输入金额(付出)
    let OutpuSelftAmout: number = 0; // 当前交易自己的输出金额(收入)
    let OutpuOthertAmout: number = 0; // 当前交易自己的输入金额(收入)

    let i = 0;
    for (i = 0; i < inputs.length; i++) {
      nowInput = inputs[i];
      if (await this.spvNodeProvider.verifyMyAddress(nowInput.address)) {
        inputSelfAmout += nowInput.value;
      }
      else {
        inputOtherAmout += nowInput.value;
      }
    }
    for (i = 0; i < outputs.length; i++) {
      nowOutput = outputs[i];
      if (await this.spvNodeProvider.verifyMyAddress(nowOutput.address.toString())) {
        OutpuSelftAmout += nowOutput.value;
      }
      else {
        OutpuOthertAmout += OutpuOthertAmout;
      }
    }
    return {
      inputSelf: inputSelfAmout,
      inputOther: inputOtherAmout,
      OutpuSelft: OutpuSelftAmout,
      OutpuOthert: OutpuOthertAmout
    }
  }
}
