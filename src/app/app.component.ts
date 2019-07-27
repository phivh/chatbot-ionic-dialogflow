import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { LoginPage } from '../pages/login/login';

declare var window;

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = LoginPage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      window["ApiAIPlugin"].init(
        {
            clientAccessToken: "98f854eb1514402691623725985c7a86", // insert your client access key here
            //clientAccessToken: "b7c06d1ec5b24a20b0ed5d2be488f706", // insert your client access key here
            lang: "en" // set lang tag from list of supported languages
        }, 
        function(result) { 
          /* success processing */ 
          //alert(JSON.stringify(result));
        },
        function(error) { 
          /* error processing */ 
          alert(error);
        }
      );
    });
  }
}

