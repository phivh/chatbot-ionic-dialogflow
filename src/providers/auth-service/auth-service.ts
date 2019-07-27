import {
  Injectable
} from '@angular/core';
import {
  Http,
  Headers
} from '@angular/http';
import {
  Observable
} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import { Constants } from '../constants/constants';

export class User {
  _id: string;
  email: string;
  fname: string;
  lname: string;
  shop: string;
  password: string;
  last_active: Date;
  joined: Date;
  expertise: string;
  experience: string;
  total_points: number;
  level: string;
  total_fix: number;
  total_help: number;
  last_viewed: string;
  constructor(email: string, fname: string, lname: string, shop: string, pass: string) {
    this.email = email;
    this.fname = fname;
    this.lname = lname;
    this.shop = shop;
    this.password = pass;
  }
}

@Injectable()
export class AuthServiceProvider {
  currentUser: User;
  data: any;
  url = this.constants.BASE_URL;
  constructor(private http: Http, private constants: Constants) {
    this.data = null;
  }

  public login(credentials) {
    if (credentials.email === null || credentials.password === null) {
      return Promise.reject("Please insert credentials");
    }
    return new Promise(resolve => {
      this.http.get(this.url + '/api/email/' + credentials.email)
        .map(res => res.json())
        .subscribe(data => {
          console.log(data)
          this.data = data;
          this.currentUser = data[0];
          resolve(this.data);
        });
    });
  }


  public register(credentials) {
    if (credentials.email === null || credentials.password === null) {
      return Promise.reject("Please fill all fields.");
    }
    return new Promise(resolve => {
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      this.http.post(this.url + '/api/user', JSON.stringify(credentials), {
          headers: headers
        })
        .subscribe(res => {
          this.currentUser = res[0];
          resolve(res);
        });
      console.log("will this be visible?");
    });
  }

  public updateuser(info) {
    console.log(info)
    return new Promise(resolve => {
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      this.http.post(this.url + '/api/user/update', JSON.stringify(info), {
          headers: headers
        })
        .map(res => res.json())
        .subscribe(res => {
          console.log(res)
          this.currentUser = res;
          console.log(this.currentUser)
          resolve(res);
        });
    });
  }

  public getUserInfo(): User {
    return this.currentUser;
  }

  public getUserid() {
    return this.currentUser._id;
  }

  public getUserName() {
    return this.currentUser.fname.toString() + " " + this.currentUser.lname.toString();
  }

  public getusernamebyid(id) {
    var user;
    return new Promise(resolve => {
      this.http.get(this.url + '/api/user/id/' + id)
        .map(res => res.json())
        .subscribe(res => {
          user = res
          let name = user.fname.toString() + " " + user.lname.toString();
          console.log(name);
          resolve(name);
        })
    })
  }


  public getuserbyid(id) {
    var user;
    return new Promise(resolve => {
      this.http.get(this.url + '/api/user/id/' + id)
        .map(res => res.json())
        .subscribe(res => {
          user = res
          console.log(user);
          resolve(user);
        })
    })
  }

  public searchbyexpertise(ex) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    let details = ex;
    return new Promise(resolve => {
      this.http.get(this.url + '/api/user/search/' + details)
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        })
    })
  }

  public logout() {
    return Observable.create(observer => {
      this.currentUser = null;
      observer.next(true);
      observer.complete();
    });
  }
}