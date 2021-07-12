import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { BtmodalPage } from '../pages/btmodal/btmodal';
import { ContactsPage } from '../pages/contacts/contacts';


import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Sim } from '@ionic-native/sim';
import { SMS } from '@ionic-native/sms';
import { Geolocation } from '@ionic-native/geolocation';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
// import { SQLite } from '@ionic-native/sqlite';

const firebaseConfig = {
  apiKey: "AIzaSyCjbVnyWt56-UODgtJK0JpT96s3QY9ZfRs",
  authDomain: "pulseria-dbb04.firebaseapp.com",
  databaseURL: "https://pulseria-dbb04-default-rtdb.firebaseio.com",
  projectId: "pulseria-dbb04",
  storageBucket: "pulseria-dbb04.appspot.com",
  messagingSenderId: "375277892160",
  appId: "1:375277892160:web:a5d04504008c1583aa65a5"
};

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    BtmodalPage,
    ContactsPage
  ],
  imports: [

    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule,
    AngularFireDatabaseModule,
    AngularFireModule.initializeApp(firebaseConfig),
    IonicStorageModule.forRoot({
      name: '_contacts',
         driverOrder: ['sqlite', 'indexeddb', 'websql']
    }),

  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    BtmodalPage,
    ContactsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    Sim,
    SMS,
    BluetoothSerial,
    Geolocation,
    // SQLite,
  ]
})
export class AppModule {}
