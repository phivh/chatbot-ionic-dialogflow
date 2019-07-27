import {
  Injectable
} from '@angular/core';
import {
  Http,
  Headers
} from '@angular/http';
import 'rxjs/add/operator/map';
import { Constants } from '../constants/constants';

/*
  Generated class for the TreasuresProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class TreasuresProvider {

  data: any;
  url = this.constants.BASE_URL;

  constructor(public http: Http, private constants: Constants) {
    this.data = null;
  }

  getonetreasure(id) {
    return new Promise(resolve => {
      this.http.get(this.url + '/api/Project/id/' + id)
        .map(res => res.json())
        .subscribe(proj => {
          console.log(proj)
          resolve(proj);
        })
    })
  }

  getprojtreasuresdetail(id) {

    return new Promise(resolve => {

      this.http.get(this.url + '/api/Detail/ProjID/' + id)
        .map(res => res.json())
        .subscribe(data => {
          this.data = data;
          resolve(this.data);
          console.log(data);
        });
    });
  }

  getusertreasures(id) {

    return new Promise(resolve => {

      this.http.get(this.url + '/api/Project/UserID/' + id)
        .map(res => res.json())
        .subscribe(data => {
          this.data = data;
          resolve(this.data);
          console.log(data);
        });
    });
  }

  getusertreasuresuploaded(id) {

    return new Promise(resolve => {

      this.http.get(this.url + '/api/Project/alluploaded/id/' + id)
        .map(res => res.json())
        .subscribe(data => {
          this.data = data;
          resolve(this.data);
          console.log(data);
        });
    });
  }

  getuploadedtreasures() {

    return new Promise(resolve => {

      this.http.get(this.url + '/api/Project/alluploaded')
        .map(res => res.json())
        .subscribe(data => {
          this.data = data;
          resolve(this.data);
          console.log(data);
        });
    });
  }

  posttreasures(project) {
    let headers = new Headers();
    //project.uploaded="yes"

    // console.log(project);

    headers.append('Content-Type', 'application/json');

    return new Promise(resolve => {

      this.http.post(this.url + '/api/Project', JSON.stringify(project), {
          headers: headers
        })
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
          console.log(data);
        });

    });

  }

  getdata() {
    return this.data;
  }

  postdetails(details) {
    let headers = new Headers();

    console.log(details);

    headers.append('Content-Type', 'application/json');

    this.http.post(this.url + '/api/Detail', JSON.stringify(details), {
        headers: headers
      })

      .subscribe(res => {
        //console.log(res.json());
      });
  }

}
