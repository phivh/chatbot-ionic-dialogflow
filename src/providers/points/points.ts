import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Constants } from '../constants/constants';

/*
  Generated class for the PointsProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
export class Points{
    Userid: string;
    a_comment: number;
    a_fix: number;
    a_request: number;
    date: string;
}

@Injectable()
export class PointsProvider {
  points: Array<Points>;
  url = this.constants.BASE_URL;
	oPoints = {
		_id: '',
		Userid: '',
		a_comment: '',
		a_fix: '',
		a_request: '',
		a_answerrequest: '',
		date: ''
	};
  constructor(public http: Http, private constants: Constants) {
    console.log('Hello PointsProvider Provider');
  }

  getpoints(id){
    return new Promise(resolve => {
      this.http.get(this.url + '/api/points/id/'+ id)
        .map(res => res.json())
        .subscribe(data => {
          this.points = data;
          resolve(this.points);
        });
    });
  }

  updatepoints(userid: string, activity: string, n: number){
    
    //add activity points for that
		return new Promise(resolve => {
			let headers = new Headers();
			headers.append('Content-Type', 'application/json');
			//get points for today
			this.oPoints.Userid = userid; 
			this.getpoints(userid).then(data => {

				if(Object.keys(data).length > 0) {
					this.oPoints._id = data[0]._id;
					this.oPoints.a_fix = data[0].a_fix;
					this.oPoints.a_request = data[0].a_request;
					this.oPoints.a_answerrequest = data[0].a_answerrequest;
					this.oPoints.a_comment = data[0].a_comment;
				} 
				switch (activity) {
					case "fix" :
						this.oPoints.a_fix += n;
						break;
					case "request" :
						this.oPoints.a_request += n;
						break;
					case "answerrequest" :
						this.oPoints.a_request += n;
						break;
					case "comment" :
						this.oPoints.a_comment += n;
						break;
					default:
						break;
				}
				this.http.post(this.url + '/api/points', JSON.stringify(this.oPoints), {headers : headers})
				.map(res => res.json())
				.subscribe(res => {
					this.points = res[0];
					resolve(res);
				});
			});
			
		});
  }

}
