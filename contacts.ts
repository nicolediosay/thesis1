import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';


@IonicPage()
@Component({
  selector: 'page-contacts',
  templateUrl: 'contacts.html',
})
export class ContactsPage {
  public isReady: boolean = false;
  public contactList = [];

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    private storage: Storage
  ) {

  }

  ionViewDidLoad() {
    this.storage.ready().then(data => {
      // console.log(JSON.stringify(data));
      this.storage.get("_saved").then(data => {
        this.contactList = (data !== null) ? data : [];
        console.log(JSON.stringify(data));
      }).catch(error => {
        console.log("Error: " + JSON.stringify(error));
      })
    }).catch(error => {
      console.log(error);
    })
  }


  addContact() {
    const alert = this.alertCtrl.create({
      title: "Add Contact",
      message: "This will be your trusted contact.",
      inputs: [
        {
          name: "name",
          placeholder: "Contact name"
        },
        {
          name: "number",
          placeholder: "11 Digit Mobile Number",
          type: "number",
        }
      ],
      buttons: [
        {
          text: "Cancel",
          handler: data => {
            console.log("Cancelled")
          }
        },
        {
          text: "Save",
          handler: data => {
            this.saveContact(data);
          }
        }
      ]
    });
    alert.present();
  }

  clearContact() {
    this.storage.clear();
  }


  saveContact(data:any) {
    if (data.name !== "" && data.number !== "") {

      this.alertCtrl.create({
        title: "Saved"
      }).present();
      this.contactList.push(data);
      this.storage.set("_saved", this.contactList).then(data => {
        console.log(JSON.stringify(data));
        this.contactList = data;
      }).catch(error => {
        console.log(error.message);
      });
    } else {
      this.alertCtrl.create({
        title: "Not Save",
      }).present();
    }
  }


}
