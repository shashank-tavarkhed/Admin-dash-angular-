import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import details from "../assets/data.json"

@Injectable({
  providedIn: 'root'
})
export class DataService {
  data:any={};
  dataSub = new Subject();
  constructor() {
    // this.data = this.getDataFromFile();
    // this.dataSub.next(this.data);
    // console.log(details);
    this.data = this.getDataFromFile();
    this.brodcastData();
  }

  getDataFromFile(){
    return details;
  }

  brodcastData(){
    this.dataSub.next(this.data);
  }
}
