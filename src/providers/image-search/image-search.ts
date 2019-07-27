import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the ImageSearchProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class ImageSearchProvider {

  _url: string = 'https://api.cognitive.microsoft.com/bing/v5.0/images/search';
  _contentKey: string = 'e694a4c54e664c6a9cf1daf9d41f02ff';
  constructor(public http: Http) {
    console.log('Hello ImageSearchProvider Provider');
  }

  getBingSeachImage(query) {
    let headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Ocp-Apim-Subscription-Key', this._contentKey);
    let params = new URLSearchParams();
    params.append('q', query);
    params.append('count', '1');
    params.append('offset', '0');
    params.append('format', 'JSON');
    let option = new RequestOptions({ headers: headers, params: params});
    return this.http.get(this._url, option).map(res => res.json());
  }

}
