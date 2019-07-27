import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { HttpModule } from '@angular/http'

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';

import { TextToSpeech } from '@ionic-native/text-to-speech';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { AuthServiceProvider } from '../providers/auth-service/auth-service';
import { Camera } from '@ionic-native/camera';
import { TreasuresProvider } from '../providers/treasure/treasure';
import { AwsProvider } from '../providers/aws/aws';
import { ImageSearchProvider } from '../providers/image-search/image-search';
import { Constants } from '../providers/constants/constants';

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    HomePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    HomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    SpeechRecognition,
    TextToSpeech,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthServiceProvider,
    Camera,
    TreasuresProvider,
    AwsProvider,
    ImageSearchProvider,
    Constants,

  ]
})
export class AppModule {}
