import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { SecurityService } from '../../../security/shared/security.service';
import { Membership } from '../../shared/membership.model';
import { SettingsBLService } from '../../shared/settings.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { CommonFunctions } from "../../../shared/common.functions";

@Component({
  selector: "membership-add",
  templateUrl: "./membership-add.html",
  host: { '(window:keydown)': 'KeysPressed($event)' }
})

export class MembershipAddComponent {
  public CurrentMembership: Membership = new Membership();

  public showAddPage: boolean = false;

  @Input("community-list")
  communityLists: Array<string> = [];

  @Input("selectedItem")
  public selectedItem: Membership;
  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
  public update: boolean = false;

  constructor(
    public settingsBLService: SettingsBLService,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef) {
      this.GoToNextInput("CommunityName");
  }

  ngOnInit() {
    CommonFunctions.SortArrayOfString(this.communityLists);//this sorts the membershipList by CommunityName.
  }

  @Input("showAddPage")
  public set value(val: boolean) {
    this.showAddPage = val;
    if (this.selectedItem) {
      this.update = true;
      this.CurrentMembership = new Membership();
      this.CurrentMembership = Object.assign(this.CurrentMembership, this.selectedItem);
      this.CurrentMembership.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.CurrentMembership.ModifiedOn = moment().format('YYYY-MM-DD HH:mm');
    }
    else {
      this.CurrentMembership = new Membership();
      this.CurrentMembership.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.CurrentMembership.CreatedOn = moment().format('YYYY-MM-DD HH:mm');
      this.update = false;
    }
  }

  Add() {
    for (var i in this.CurrentMembership.MembershipValidator.controls) {
      this.CurrentMembership.MembershipValidator.controls[i].markAsDirty();
      this.CurrentMembership.MembershipValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentMembership.IsValidCheck(undefined, undefined)) {
      this.settingsBLService.AddMembership(this.CurrentMembership)
        .subscribe(
          res => {
            this.showMessageBox("Success", "Membership Detail Updated.");
            this.CallBackAddUpdate(res);
            this.CurrentMembership = new Membership();
          },
          err => {
            this.logError(err);
          });
    }
  }

  Update() {
    for (var i in this.CurrentMembership.MembershipValidator.controls) {
      this.CurrentMembership.MembershipValidator.controls[i].markAsDirty();
      this.CurrentMembership.MembershipValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentMembership.IsValidCheck(undefined, undefined)) {
      this.settingsBLService.UpdateMembership(this.CurrentMembership)
        .subscribe(
          res => {
            this.showMessageBox("Success", "Membership Detail Updated.");
            this.CallBackAddUpdate(res)
            this.CurrentMembership = new Membership();
          },
          err => {
            this.logError(err);

          });
    }
  }

  CallBackAddUpdate(res) {
    if (res.Status == "OK") {
      this.callbackAdd.emit({ membership: res.Results });
    }
    else {
      this.showMessageBox("Error", res.ErrorMessage);
      console.log(res.ErrorMessage);
    }
  }
  logError(err: any) {
    console.log(err);
  }
  Close() {
    this.selectedItem = null;
    this.update = false;
    this.showAddPage = false;
  }
  showMessageBox(status: string, message: string) {
    this.msgBoxServ.showMessage(status, [message]);
  }

  private GoToNextInput(id: string) {
    window.setTimeout(function () {
      let itmNameBox = document.getElementById(id);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 600);
  }
  KeysPressed(event){
    if(event.keyCode == 27){ // For ESCAPE_KEY =>close pop up
      this.Close(); 
    }
  }
}
