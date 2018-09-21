import { Component, ViewChild } from '@angular/core';
import { GameMarketPage } from '../gamemarket/gamemarket';
import { GoldMarketPage } from '../goldmarket/goldmarket';
import { HomePage } from '../home/home';
import { MinePage } from '../mine/mine';
import { PropMarketPage } from '../propmarket/propmarket';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  @ViewChild('tabs') tabs;

  homeRoot = HomePage;
  GameMarketRoot = GameMarketPage;
  PropMarketRoot = PropMarketPage;
  GoldMarketRoot = GoldMarketPage;
  mineRoot = MinePage;

  constructor() {}
}
