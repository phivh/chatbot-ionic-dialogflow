import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Constants } from '../constants/constants';

/*
  Generated class for the AwsProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class AwsProvider {

  _url: string = this.constants.BASE_URL;
  constructor(public http: Http, private constants: Constants) {
    console.log('Hello AwsProvider Provider');
  }

  getSignedUploadRequest(fileName, fileType) {
    return this.http.get(`${this._url}/api/getSignedRequest?file-name=${fileName}&file-type=${fileType}`).map(res => res.json());
  }

  uploadFile(url, file) {
    return this.http.put(url, file);
  }

  uploadBase64File(regData){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/api/uploadfile', JSON.stringify(regData), {headers: headers});
  }

  uploadImageFromBingSearch(regData){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/api/uploadImageFromBingSearch', JSON.stringify(regData), {headers: headers});
  }
}
