import { Component, Input, OnInit } from '@angular/core';
import { DonationModel } from '../donation.model';

@Component({
  selector: 'app-donation-edit',
  templateUrl: './donation-edit.component.html',
  styleUrls: ['./donation-edit.component.css']
})
export class DonationEditComponent implements OnInit {

  @Input('edit-mode') editMode: boolean = false;
  @Input('loadmodel') model: DonationModel;
  constructor() { }

  ngOnInit() {
  }

}
