import { Component, NgZone, ViewChild } from '@angular/core';
import { NavController, Content, AlertController, ToastController, ViewController } from 'ionic-angular';
import { User, AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { LoginPage } from '../login/login';
import { AwsProvider } from '../../providers/aws/aws';
import { ImageSearchProvider } from '../../providers/image-search/image-search';
import { TreasuresProvider } from '../../providers/treasure/treasure';
//import { PointsProvider } from '../../providers/points/points';
import { TextToSpeech } from "@ionic-native/text-to-speech";
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { FileTransfer } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';

declare var window;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  messages: any[] = [];
  text: string =  "";
  user: User;
  imgObj:  any[] = [];
  curProject: any;
	newyear : any;
	newbrand : string = '';
	newmodel : string = '';
	newerrorcode : string = '';
  newengine : string = '';
	projdetails : any = {};
	projectProblems: any = [];
  projectSummarys: any = [];
  projectDiagnosis: any = [];
  projectSymptoms: any = [];
  imageObj: any = [];
	projectSymptomType: string = 'symptom';
	projectDiagnoseType: string = 'diagnosis';
	projectDiagnoseEnd: string = 'diagnosisend';
	projectSummaryType: string = 'summary';
	projectYearType: string = 'year';
	projectBrandType: string = 'brand';
	projectModelType: string = 'model';
	projectErrType: string = 'error code';
	projectCameraType: string = 'Camera is open';
	projectDiagnosis1Type: string = 'your first step';
	projectDiagnosis2Type: string = 'Which part';
	projectDiagnosis3Type: string = 'how you judge';
	projectDiagnoseEndType: string = 'I finish';
	projectFinishedType: string = 'documented your diagnosis';
	UserID : string = '';
  Points: any;
  @ViewChild(Content) content: Content;

  constructor( public viewCtrl:ViewController, public toastCtrl : ToastController, public treasuresService: TreasuresProvider, public alertCtrl: AlertController, public navCtrl: NavController, public ngZone: NgZone, public auth:AuthServiceProvider,  public tts: TextToSpeech, private speechRecognition:SpeechRecognition, private camera:Camera, private imageSearch: ImageSearchProvider ,private awsprovider: AwsProvider) {
    this.UserID = this.auth.getUserid();
    this.user = this.auth.getUserInfo();
  }

  sendText(voice, messageVoice){

    let message = this.text;
    if (message !== "") {
      this.messages.push({
        text: message,
        sender: 'me'
      });
      this.content.scrollToBottom(200);
      this.text = "";
    } else {
      message = messageVoice;
    }
    //process store conversation
    this.messages
    if(this.messages.length > 3) {
      this.createProjectLocally(message, this.messages);
    }
    
    window["ApiAIPlugin"].requestText({
      query: message
    }, (response)=>{
      let messageTxt = response.result.fulfillment.speech;
      // response text speech
      if ( voice ) {
        this.tts.speak({
          text: messageTxt,
          locale: "en-US",
          rate: 1
        }).then(() => {
          if(messageTxt.indexOf("Camera is open") !== -1) {
            this.startListening();
          }
        });
      }
      
      // cycle scroll ui message
      this.ngZone.run(()=>{
        this.messages.push({
          text: messageTxt,
          sender: "api"
        });
        this.content.scrollToBottom(200);
        // handler text response and open camera
        if(messageTxt.indexOf("Camera is open") > -1) {
          this.getImage(this.projectDiagnosis);
        }
      });
    }, (error)=> {
      alert(error)
    })
  }

  startListening() {
    // Start the recognition process
    let options = {
      language: 'en-US'
    }
    this.speechRecognition.startListening(options)
    .subscribe(matches => {
      this.messages.push({
        text: matches[0],
        sender: 'me'
      });

      // handler voice text when user using voice button
      this.sendText(true,matches[0]);
    }),
    (onerror) => console.log('error:', onerror);
  }

  getImage(imageObj) {
		const options: CameraOptions = {
			quality: 100,
			correctOrientation: true,
			destinationType: this.camera.DestinationType.FILE_URI,
			encodingType: this.camera.EncodingType.JPEG,
			mediaType: this.camera.MediaType.ALLMEDIA,
			sourceType: this.camera.PictureSourceType.CAMERA
		}
		this.camera.getPicture(options).then((imageData) => {
			//this.imageURI = imageData;
      let resolvedUrl = this.getResolveUrl(imageData);
			let fileUrl = this.getResolveUrl(imageData);
			let fileName = this.getFileName(resolvedUrl);
      let fileUri = this.getFileUri(resolvedUrl);
      imageObj[imageObj.length] = {
        fileUrl: fileUrl,
        fileName: fileName,
        fileUri: fileUri
      }
      this.messages.push({
        text: "",
        sender: "me",
        resolvedUrl: resolvedUrl
      });
		}, (err) => {
			alert(err);
		});
  }

  isImageType(url) {
    if(!url) return true;
    let imageAllType = ['jpg','jpeg','png','gif'],
        type = url.split('.'),
        extension = type[type.length - 1];
    return imageAllType.indexOf(extension) > -1;
  }
  
  save() {

  	let randomId = (Math.random()*1e37).toString(36);
    let newproj = {
      Userid:this.UserID,
      year:this.newyear,
      brand:this.newbrand,
      model:this.newmodel,
      errorcode:this.newerrorcode,
      engine:this.newengine,
    };
    this.getImageBingSearch(this.newyear + ' ' + this.newbrand + ' ' + this.newmodel, 
      (data) => {
        newproj['bingSearchURL'] = data.value[0] && data.value[0].contentUrl && decodeURI(data.value[0].contentUrl);
        let fileName = this.getFileName(newproj['bingSearchURL']);
        let imageUrl = `${this.UserID}/${randomId}/${fileName}`;
        newproj['imageUrl'] = `https://s3.amazonaws.com/katcher/${imageUrl}`;
        this.treasuresService.posttreasures(newproj).then((data) => {
          // this.pointsService.updatepoints(this.UserID, "fix", 5).then(res => {
          // 	this.Points = res;
          // 	this.user.total_fix = this.Points.a_fix;
          // 	this.user.total_help = this.Points.a_answerrequest;
          // 	this.user.total_points = this.Points.a_fix + this.Points.a_request + this.Points.a_answerrequest + this.Points.a_comment;
          // 	this.auth.updateuser(this.user);
          // });
          this.curProject = data;
          let params = {
            imageDownloadUrl: newproj['bingSearchURL'],
            fileName: fileName,
            fileDestination: imageUrl,
          }
          // let fileName = this.getFileName(newproj['bingSearchURL']);
          // let imageUrl = `${this.UserID}/${this.curProject._id}/${fileName}`;
          // newproj['imageUrl'] = imageUrl;
          
          this.saveProjectDetail(this.projectSymptoms, this.projectSymptomType ,this.curProject._id, projectDetails => {
            this.treasuresService.postdetails(projectDetails);
          });
          
          this.saveProjectDetail(this.projectDiagnosis, this.projectDiagnoseType ,this.curProject._id, projectDetails => {
            this.treasuresService.postdetails(projectDetails);
          });

          this.saveProjectDetail(this.projectSummarys, this.projectSummaryType ,this.curProject._id, projectDetails => {
            this.treasuresService.postdetails(projectDetails);
          });
          
          this.prepareForUploadBase64File(this.projectDiagnosis);
          this.prepareForUploadBase64File(this.projectSymptoms);
          this.prepareForUploadBase64File(this.projectSummarys);
          this.uploadImageFromBingSearch(params);
          this.viewCtrl.dismiss(data);
        }, err => {
          alert('err save conversation' + err);
        })
    });
  }

  private uploadImageFromBingSearch(params) {
	
    this.awsprovider.uploadImageFromBingSearch(params).subscribe( (data) => {
      console.log(data);
    });
  }
  
  private getImageBingSearch(query, callback) {
    this.imageSearch.getBingSeachImage(query).subscribe(
      (data) => {
        callback && callback(data);
      }
    )
  }

  private getFileUri(url) {
    let parts = url.split('/'),
      last = parts[parts.length - 1];
    return url.substring(url.length - last.length, 0);
  }
  
  private getFileName(url) {
    // let _url = url.split('?')[0];
    let parts = url.split('/');
    return parts[parts.length - 1];
  }
  
  private getResolveUrl(url) {
    return url.indexOf('file://') == -1 ? 'file://' + url : url;
  }
  // private hanldeUploadFile(fileDirectory, fileName, fileDestination) {

  //   this.file.readAsArrayBuffer(fileDirectory, fileName).then(realFile => {
  //     this.awsprovider.getSignedUploadRequest(fileDestination, 'image/jpeg').subscribe(data => {
  //       let reqUrl = data.signedRequest;
  //       this.awsprovider.uploadFile(reqUrl, realFile).subscribe(result => {
  //         //alert(JSON.stringify(result));
  //       }, err => {
  //         //alert('Err upload 1223 file' + err);
  //       })
  //     }, err => {
  //       //alert('Err get 1223 sign api' + err);
  //     })
  //   }, err => {
  //     //alert('Err read 122 as Array' + JSON.stringify(err));
  //   });
  // }
  
  private saveProjectDetail(list, type, projectID, callback) {
    for (let i = 0; i < list.length; i++) {
      let pro = list[i];
      if (pro) {
          pro.fileDestination =  `${this.UserID}/${projectID}/${pro.fileName}`;
          let projdetails ={
            ProjectID: projectID,
            type: type,
            sentence: pro.text,
            resourceUrl: `https://s3.amazonaws.com/katcher/${pro.fileDestination}`
          };
        callback && callback(projdetails);
      }
    }
  }
  private convertFileToBase64AndSet(file, callback)
  {
      let reader = new FileReader();

        reader.onloadend = (e: Event) => {

        callback && callback(reader.result);
      }

      reader.readAsDataURL(file);
  }

  private prepareForUploadBase64File(list) {
    for (let i = 0; i < list.length; i++) {
      let project = list[i];
      if(project.fileInput && project.fileInput !== "") {
        this.convertFileToBase64AndSet(project.fileInput, (resultFile) => {
          let regData = {
            fileName: `${this.UserID}/${this.curProject._id}/${project.fileInput.name}`,
            fileType: project.fileInput.type,
            fileBase64: resultFile
          }
          this.awsprovider.uploadBase64File(regData).subscribe(res => {
            console.log(res.json());
            })
          });
      }
    }
  }

  private getKeyIntent(response) {
    let typeOfIntent: string;
    return new Promise(resolve => {
      if ( response.indexOf(this.projectSymptomType) > -1) {
        typeOfIntent = this.projectSymptomType;
      }
      if ( response.indexOf(this.projectSummaryType) > -1) {
        typeOfIntent = this.projectSummaryType;
      }
      if ( response.indexOf(this.projectYearType) > -1) {
        typeOfIntent = this.projectYearType;
      }
      if ( response.indexOf(this.projectBrandType) > -1) {
        typeOfIntent = this.projectBrandType;
      }
      if ( response.indexOf(this.projectModelType) > -1) {
        typeOfIntent = this.projectModelType;
      }
      if ( response.indexOf(this.projectErrType) > -1) {
        typeOfIntent = this.projectErrType;
      }
      if ( response.indexOf(this.projectDiagnosis1Type) > -1) {
        typeOfIntent = this.projectDiagnoseType;
      }
      if ( response.indexOf(this.projectDiagnosis2Type) > -1) {
        typeOfIntent = this.projectDiagnoseType;
      }
      if ( response.indexOf(this.projectDiagnosis3Type) > -1) {
        typeOfIntent = this.projectDiagnoseType;
      }
      if ( response.indexOf(this.projectDiagnoseEndType) > -1) {
        typeOfIntent = this.projectDiagnoseEnd;
      }
      if ( response.indexOf(this.projectFinishedType) > -1) {
        typeOfIntent = "save";
      }
      resolve(typeOfIntent);
    });
    
    
  }

  private getLastMessage(messages) {
    let mLength = messages.length;
    let lastMessage;
    if(messages[mLength-2].sender === "api") {
      lastMessage = messages[mLength-2];
    } else if(messages[mLength-2].sender === "me") {
      lastMessage = messages[mLength-3];
    }
    return lastMessage;
  }
  private createProjectLocally(message, messages) {
    if ( !message && !messages) 
      return;
    
    let lastMessage = this.getLastMessage(messages);
    this.getKeyIntent(lastMessage.text).then(type => {
      console.log(lastMessage.text);
      console.log(type);
      if(type === this.projectSymptomType) {
        this.projectSymptoms[this.projectSymptoms.length]={text: message, fileName: '', fileDestination: '', fileUri: '', fileInput: undefined};
      }
      else if(type === this.projectDiagnoseType) {
        this.projectDiagnosis[this.projectDiagnosis.length]={text: message, fileName: '', fileDestination: '', fileUri: '', fileInput: undefined};
        
      }else if(type === this.projectDiagnoseEnd) {
        this.projectDiagnosis[this.projectDiagnosis.length].fileInput = this.imageObj[this.projectDiagnosis.length].fileUrl;
      }
      else if(type === this.projectSummaryType) {
        this.projectSummarys[this.projectSummarys.length]={text: message, fileName: '', fileDestination: '', fileUri: '', fileInput: undefined};
      }
      else if(type === this.projectYearType) {
        this.newyear = message.split("is")[1];
      }
      else if(type === this.projectBrandType) {
        this.newbrand = message.split("is")[1];
      }
      else if(type === this.projectModelType) {
        this.newmodel = message.split("is")[1];
      }
      else if(type === this.projectErrType) {
        this.newerrorcode = message;
      } 
      else if (type === "save") {
        this.save();
      }
    });

  }
  // handler user sign out
  public logout() {
    this.auth.logout().subscribe(succ => {
      this.navCtrl.setRoot(LoginPage)
    });
  }

  presentAlert(mesTxt) {
    const alert = this.alertCtrl.create({
      title: 'Detail preview',
      message: mesTxt,
      buttons: ['OK'],
      enableBackdropDismiss: true
    });

    alert.present();
  }
}
