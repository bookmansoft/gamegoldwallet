import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Api is a generic REST Api handler. Set your API url first.
 * 实现从远端获取数据.
 */
@Injectable()
export class Api {
  public static API_URL: string = 'http://localhost:8100';
  public static Game_API_URL: string = 'http://localhost:8100/mock';
  constructor(public http: HttpClient) { }

  get<T>(endpoint: string, params?: any, reqOpts?: any, gameOpt = false) {
    if (!reqOpts) {
      reqOpts = {
        params: new HttpParams()
      };
    }
    // 强制返回json
    reqOpts.responseType = 'json';

    // Support easy query params for GET requests
    if (params) {
      reqOpts.params = new HttpParams();
      for (let k in params) {
        reqOpts.params.set(k, params[k]);
      }
    }
    if (!gameOpt)
      return this.http.get<T>(Api.API_URL + '/' + endpoint, reqOpts);
    else return this.http.get<T>(Api.Game_API_URL + '/' + endpoint, reqOpts);
  }

  post(endpoint: string, body: any, reqOpts?: any, gameOpt = false) {
    if (!gameOpt)
      return this.http.post(Api.API_URL + '/' + endpoint, body, reqOpts);
    else
      return this.http.post(Api.Game_API_URL + '/' + endpoint, body, reqOpts);
  }

  put(endpoint: string, body: any, reqOpts?: any, gameOpt = false) {
    if (!gameOpt)
      return this.http.put(Api.API_URL + '/' + endpoint, body, reqOpts);
    else return this.http.put(Api.Game_API_URL + '/' + endpoint, body, reqOpts);
  }

  delete(endpoint: string, reqOpts?: any, gameOpt = false) {
    if (!gameOpt)
      return this.http.delete(Api.API_URL + '/' + endpoint, reqOpts);
    else return this.http.delete(Api.Game_API_URL + '/' + endpoint, reqOpts);
  }

  patch(endpoint: string, body: any, reqOpts?: any, gameOpt = false) {
    if (!gameOpt)
      return this.http.put(Api.API_URL + '/' + endpoint, body, reqOpts);
    else return this.http.put(Api.Game_API_URL + '/' + endpoint, body, reqOpts);
  }
}
