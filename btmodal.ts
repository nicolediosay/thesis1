import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';



@IonicPage()
@Component({
  selector: 'page-btmodal',
  templateUrl: 'btmodal.html',
})
export class BtmodalPage {

  public BTList;
  constructor(public navCtrl: NavController, public navParams: NavParams,public viewCtrl: ViewController) {
    this.BTList = navParams.get('btlist');
  }

  btDismiss(address: any = null) {
    this.viewCtrl.dismiss(address);
  }

}
