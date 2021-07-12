import { Component, NgZone } from '@angular/core';
import { NavController, Platform, ToastController, ModalController, LoadingController } from 'ionic-angular';
import { Sim } from '@ionic-native/sim';
import { SMS } from '@ionic-native/sms';
import { Geolocation } from '@ionic-native/geolocation';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';

import { BtmodalPage } from '../btmodal/btmodal';
import { ContactsPage } from '../contacts/contacts';
// import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Storage } from '@ionic/storage';
import { AngularFireDatabase } from 'angularfire2/database';


declare var SignalStrength: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public contactList = [];
  public numbers = [];

  signalData: any;
  signalRaw: any;
  dpm: any;
  bloodPressure: any;

  simInfo = {};
  simCarrier: any;
  simNumber: any;

  longitude: any;
  latitude: any;
  heartBeat: string = 'heart-outline';
  btConnected: boolean = false;
  public on: string = "1";

  fullname: string = "";

  constructor(
    public navCtrl: NavController,
    public platform: Platform,
    public toastCtrl: ToastController,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    private sim: Sim,
    private sms: SMS,
    private geolocation: Geolocation,
    public bluetoothSerial: BluetoothSerial,
    private zone: NgZone,
    private storage: Storage,
    public fbd: AngularFireDatabase

  ) {
    let loading = this.loader();
    loading.present();
    platform.ready().then(() => {
      /*this.sqlite.create({
        name: "__contacts",
        location:"default"
      }).then((db: SQLiteObject) => {
        db.executeSql("CREATE TABLE contacts(name VARCHAR(255), number VARCHAR(255))", []).then(data => {
          console.log("Created");
        }).catch(error => {
          console.log(error.message);
        })
      }).catch(error => {
        console.log(error.message);
      })*/
      // this.signalTracking();
      this.getSimInfo();
      bluetoothSerial.isEnabled().then(() => {
        bluetoothSerial.isConnected().then(() => {
          this.btConnected = true;
          this.BTFlush();
          this.toastMessage("Connected!").present();
        }).catch((error) => {
          this.toastMessage(error).present();
        })
      }).catch(error => {
        this.toastMessage(error).present();
        console.log("BT Error " + error);
      });
      loading.dismiss();
    }).catch(error => {
      loading.dismiss();
      this.toastMessage("Platform Error: " + error);
    });
  }

  saveName() {
    this.storage.get("_fullname").then(data => {

      if (!this.fullname) {
        this.toastMessage("Please enter your name!", false, 1000).present();
      } else {
        this.storage.set("_fullname", this.fullname).then(name => {
          this.toastMessage("Name saved!", false, 2000).present();
        })
      }
    }).catch(error => {
      console.log(error)
    })
  }


  ionViewDidLoad() {
    /*let ysa = "100.5 95";
    console.log(JSON.stringify(ysa.split(' ')));*/



    this.storage.ready().then(data => {
      // console.log(JSON.stringify(data));
      this.storage.get("_fullname").then(data => {
        this.fullname = data;
      })
      this.storage.get("_saved").then(data => {
        this.contactList = (data !== null) ? data : [];
        console.log(JSON.stringify(data));
        for(let i = 0; i < data.length; i++){
          this.numbers.push(data[i].number);
        }

        console.log(JSON.stringify(this.numbers));
      }).catch(error => {
        console.log("Error: " + JSON.stringify(error));
      })
    }).catch(error => {
      console.log(error);
    })
    // this.fireTest();
  }


  BTList() {
    console.log("Bluetooth list open.");
    this.bluetoothSerial.list().then(list => {
      let modal = this.modalCtrl.create(BtmodalPage, { btlist: list });
      modal.onDidDismiss(BTaddr => { this.BTConnect(BTaddr); });
      modal.present();
    })
  }

  BTConnect(mcAddress: string = null) {

    let loading = this.loader("Connecting please wait...");
    if (mcAddress == null) {
      // loading.dismiss();
      this.toastMessage("You didn't choose a device.").present();
      return;
    }
    loading.present();

    this.bluetoothSerial.connectInsecure(mcAddress).subscribe(data => {
      this.toastMessage("Connected: " + data).present().then(() => {
        loading.dismiss();
        this.BTFlush();
      });
      this.btConnected = true;
    }, error => {
      this.toastMessage("Connection Error: " + error.message).present();
      loading.dismiss();
      this.btConnected = false;
    });
  }

  BTFlush() {
    console.log('Flushing data....');
    let ars = [];
    this.bluetoothSerial.subscribe("\n").subscribe((res) => {
      console.log(res)
      let cc = res.length;

      // console.log(res.length);
      // console.log(JSON.stringify(res));
      // when button pressed
      if (cc == 3){
        this.geolocationTest();
      }

      /*let a = res.split(',')[1];
      this.zone.run(() => {
        this.dpm = a;
      })*/

      /**
       * @TODO
       * Trigger button signal here
       * Maybe turn this into array? or write a condition
       * that if split is undefined then trigger the geolocationTest() method.
       */

      let a = res.split(' ');
      // updates the UI
      this.zone.run(() => {
        this.dpm = a[0];
        this.bloodPressure = a[1];
      })
      if (a[0] > 120.0) {
        ars.push(a[0]);
      }
      // console.log(ars.length);
      if (ars.length >= 10) {
        // alert(a[0]);
        ars = [];
        this.geolocationTest(); // sendnotif
      }

    }, (error) => {
      console.log(JSON.stringify(error));
      });

  }

  contacts() {
    this.navCtrl.push(ContactsPage);
  }

  LEDTest() {
    this.on = (this.on == "1") ? "0" : "1";
    this.bluetoothSerial.write(this.on).then(data => {
      console.log(data);
      this.toastMessage("BT Send & Receive Test: Complete!").present();
    }, error => {
      console.log(error);
      this.toastMessage("BT Send & Receive Test: " + error).present();
    })
  }

  // https://www.google.com/maps/place/@Latitude,Longitude,15z
  // https://www.google.com/maps/place/14.6647252,120.9428356/@14.6647252,120.9428356

  geolocationTest() {
    // this.sendSMS("Hello");
    let loading = this.loader("Locating...");
    loading.present();
    // this.geolocation.watchPosition
    this.geolocation.getCurrentPosition().then((resp) => {
      loading.dismiss();
    // resp.coords.latitude
    // resp.coords.longitude
      // this.coords = resp.coords;
      this.latitude = resp.coords.latitude;
      this.longitude = resp.coords.longitude;
      let lat = resp.coords.latitude;
      let long = resp.coords.longitude;
      // https://www.google.com/maps/place/lat,long/@lat,long


      /*alert("Location: " + resp.coords.latitude + " / " + resp.coords.longitude);
      alert(`https://www.google.com/maps/place/${lat},${long}/@${lat},${long}`);*/
      this.sendSMS(`https://www.google.com/maps/place/${lat},${long}/@${lat},${long}`, lat, long);

      console.log(resp.coords.latitude)
      console.log(resp.coords.longitude)
    }).catch((error) => {
      loading.dismiss();
      console.log('Error getting location', error.message);
      alert(error.message);
    });
  }

  eMessage(msg: string) {
    return `Attention`;
  }


  sendToFire(lat, long) {
    // this.fbd.createPushId('/pulseria/')
    this.fbd.list('/pulseria/').push({
      "name": this.fullname,
      "message": `Attention! ${this.fullname} detected with a high pulse rate! <br>
      <b>Heart Rate:</b><i>${this.dpm} dpm</i>,<br/>he might be in trouble! contact him or go to this coordinates: <br/>
      <b>Mobile:</b><i>${this.simNumber}</i>
      <b>Coordinates:</b><i>Latitude: ${lat}, Longitude: ${long}</i>`,
      "lat": lat,
      "long": long
    });
  }

  sendSMS(msg?: string, lat?:any, long?:any) {
    let loading = this.loader("Sending message...");
    loading.present();
    if (msg == null || msg == undefined) {
      alert("null and undefined");
      loading.dismiss();
    } else {
      this.sendToFire(lat, long);

      this.sms.hasPermission().then((res) => {
        console.log(this.numbers)
        if (this.numbers.length <= 0) {
          this.toastMessage("you don't have contact listed!").present();
          return;
        }

        console.log("Permission " + res);
          for (let i = 0; i < this.numbers.length; i++) {
            this.sms.send(this.numbers[i], "Heart rate: "+ this.dpm + " \n Last known location: " + msg).then((res) => {
            loading.dismiss();
            this.toastMessage("Message sent!", true, 5000).present();
          }).catch(error => {
            loading.dismiss();
            this.toastMessage("Error: " + error.message, true).present();
          });
        }
      }).catch(error => {
        loading.dismiss();
        this.toastMessage("Permission: " + error.message, true).present();
      })
    }
  }


  getSimInfo() {
    this.sim.hasReadPermission().then((info) => {
      if (!info) {
        this.sim.requestReadPermission().then(
          () => {
            this.getSimInfoGranted();
            this.toastMessage("Granted!", true, 5000).present();
          },
          () => {
            this.toastMessage("Denied!", true).present();
          }
        );
        return;
      }
      this.getSimInfoGranted();

    })
  }

  getSimInfoGranted() {
    this.sim.getSimInfo().then(info => {
      this.simInfo = info;
      this.simCarrier = info.cards[0].carrierName;
      this.simNumber = info.cards[0].phoneNumber;
      console.log(JSON.stringify(info.cards));
      console.log("Info: OK");
      // console.log(JSON.stringify(info))
    }).catch(error => {
      console.log("Error: " + error)
    })
  }


  signalTracking() {

    /*setInterval(() => {
      SignalStrength.dbm((signal) => {
        this.signalRaw = signal;
        signal = -100;
        console.log("SIgnal " + JSON.stringify(signal));
        if (signal >= -60) {
          this.signalData = 5;
        } else if (signal <= -70 || signal >= -84) {
          this.signalData = 4;
        } else if (signal <= -85 || signal >= -99) {
          this.signalData = 3;
        } else if (signal <= -100) {
          this.signalData = 2;
        } else {
          this.signalData = 0;
        }
        // this.signalData = signal;
        // console.log("Signal: " + test);
      })
    }, 300);*/
  }

  beatAnim() {
    setInterval(() => {
      if (this.heartBeat == 'heart-outline') {
        this.heartBeat = 'heart';
      } else {
        this.heartBeat = 'heart-outline';
      }
    }, 500);
  }


  toastMessage(msg?: string,closeBtn:boolean = false,dur:number=1000) {
    let m = (msg === null || msg === undefined) ? "Operation Success!" : msg;
    return this.toastCtrl.create({
      message: m,
      duration: dur,
      position: 'bottom',
      showCloseButton:closeBtn
    })
  }

  loader(message?:string) {
    return this.loadingCtrl.create({
      content: (message == null || message == undefined) ? "Please wait..." : message,
      showBackdrop: true,
      spinner:"bubbles"
    })
  }
}
