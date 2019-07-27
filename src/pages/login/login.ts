import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController, Loading } from 'ionic-angular';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { HomePage } from '../home/home';


//IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  loading: Loading;
  registerCredentials = { email: '', password: '' };
 
  constructor(private nav: NavController, private auth: AuthServiceProvider, private alertCtrl: AlertController, private loadingCtrl: LoadingController) { }
 
  public createAccount() {
    //this.nav.push(RegisterPage); 
  }
 
  public login() {
    this.showLoading();
    this.auth.login(this.registerCredentials).then((data) => {
      if(data[0] == "notfound"){
        this.showError("This user does not exist. Please create a new account");
      }
      // alert(JSON.stringify(data));
      if (data[0].password==this.registerCredentials.password) {
          this.nav.setRoot(HomePage);
        } else {
          this.showError("Access Denied");
        }
      })
      .catch(err => {
        this.showError("This user does not exist. Please create a new account");
      });
  }
 
  showLoading() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...',
      dismissOnPageChange: true
    });
    this.loading.present();
  }
 
  showError(text) {
    this.loading.dismiss();
 
    let alert = this.alertCtrl.create({
      title: 'Fail',
      subTitle: text,
      buttons: ['OK']
    });
    alert.present();
  }
}