import { HttpClient, HttpParams } from '@angular/common/http';
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
import { PropDetailPage } from '../../../propmarket/prop-detail/prop-detail';
@Component({
  selector: 'page-allprops',
  templateUrl: './allprops.html'
})
export class AllPropsPage {
  public propList: any;
  public page = 1;
  constructor(
    private navCtrl: NavController,
    private logger: Logger,
    public toastCtrl: ToastController,
    private events: Events,
    private spvNodeProvider: SpvNodeProvider,
    private storage: Storage,
    public navParams: NavParams,
    private http: HttpClient
  ) {
    // 进行事件监听
    this.listenForEvents();
  }


  ionViewWillEnter() {
    this.logger.info('ionViewWillEnter');
    this.spvNodeProvider.getPropList(this.page);
  }

  ngOnDestroy() {
    this.unListenForEvents();
  }

  private listenForEvents() {
    this.events.subscribe('node:prop.list', props => {
      this.logger.info("proplist" + JSON.stringify(props));
      this.tranformPropList(props);
    });
  }

  private unListenForEvents() {
    this.events.unsubscribe('node:prop.list');
  }

  /**
   * 转换返回的道具信息为可显示的proplist
   * 从链上获取了在售道具列表,还需要进行下面几步操作.
   * 1.根据cid获取prop对应的cp信息
   * 2.根据cp信息中url,拼接道具propurl,获取厂商prop信息
   * 3.组合链上prop和厂商prop,形成prop的完整信息.
   * @param proplist 链上的在售道具列表
   */
  private async tranformPropList(proplist) {
    this.propList = [];
    for (var i = 0; i < proplist.length; i++) {
      let prop = proplist[i];
      let cpChain = await this.spvNodeProvider.getCpById(prop.cid);
      // for test 
      if (prop.cid == 'xxxxxxxx-game-gold-boss-xxxxxxxxxxxx') {
        cpChain.url = 'http://114.116.148.48:9701/mock/cp0104';
      }
      if (!!cpChain.url) {
        let propDetailUrl = `${cpChain.url}/prop/${prop.oid}`;
        this.logger.info("Prop url" + JSON.stringify(propDetailUrl));
        this.http.get(propDetailUrl).subscribe(
          propDetail => {
            propDetail['game'] = cpChain;
            propDetail['detailOnChain'] = prop;
            this.propList.push(propDetail);
            this.logger.info("propDetail: " + JSON.stringify(propDetail));
          },
          error => {
            this.logger.error("get PropDetail error :" + JSON.stringify(error));
          });
      }
    }
  }

  gotoDetailPage(propDetail) {
    this.navCtrl.push(PropDetailPage, {
      'prop': propDetail,
      'fromMine': true
    });

  }
}
