import { Component, ChangeDetectorRef } from "@angular/core";

import PHRMGridColumns from '../shared/phrm-grid-columns';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";

import { PHRMDispensaryModel } from "../shared/phrm-dispensary.model";
import { PharmacyBLService } from "../shared/pharmacy.bl.service"
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { SecurityService } from '../../security/shared/security.service';
import * as moment from 'moment/moment';

@Component({
  templateUrl: "../../view/pharmacy-view/Setting/PHRMDispensaryManage.html" //"/PharmacyView/PHRMDispensaryManage"

})
export class PHRMDispensaryManageComponent {
  public CurrentDispensary: PHRMDispensaryModel = new PHRMDispensaryModel();
  public selectedItem: PHRMDispensaryModel = new PHRMDispensaryModel();
  public dispensaryList: Array<PHRMDispensaryModel> = new Array<PHRMDispensaryModel>();
  public dispensaryGridColumns: Array<any> = null;
  public showDispensaryList: boolean = true;
  public showDispensaryAddPage: boolean = false;
  public update: boolean = false;
  public index: number;

  constructor(
    public pharmacyBLService: PharmacyBLService,
    public changeDetector: ChangeDetectorRef,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService) {
    this.dispensaryGridColumns = PHRMGridColumns.PHRMDispensaryList;
    this.getDispensaryList();
  }

  public getDispensaryList() {
    this.pharmacyBLService.GetDispensaryList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.dispensaryList = res.Results;
        }
        else {
          alert("Failed ! " + res.ErrorMessage);
          console.log(res.ErrorMessage)
        }
      });
  }

  DispensaryGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "edit": {
        this.selectedItem = null;
        this.update = true;
        this.index = $event.RowIndex;
        this.showDispensaryAddPage = false;
        this.changeDetector.detectChanges();
        this.selectedItem = $event.Data;
        this.CurrentDispensary.DispensaryId = this.selectedItem.DispensaryId;
        this.CurrentDispensary.Name = this.selectedItem.Name;
        this.CurrentDispensary.Address = this.selectedItem.Address;
        this.CurrentDispensary.ContactNo = this.selectedItem.ContactNo;
        this.CurrentDispensary.Email = this.selectedItem.Email;
        this.CurrentDispensary.DispensaryLabel = this.selectedItem.DispensaryLabel;
        this.CurrentDispensary.DispensaryDescription = this.selectedItem.DispensaryDescription;
        this.CurrentDispensary.IsActive = this.selectedItem.IsActive;
        this.showDispensaryAddPage = true;

        break;
      }
      case "activateDeactivateIsActive": {
        if ($event.Data != null) {
          this.selectedItem = null;
          this.selectedItem = $event.Data;
          this.ActivateDeactivateStatus(this.selectedItem);
          this.selectedItem = null;
        }
        break;
      }
      default:
        break;
    }
  }

  AddDispensary() {
    this.showDispensaryAddPage = false;
    this.changeDetector.detectChanges();
    this.showDispensaryAddPage = true;
  }

  Add() {
    for (var i in this.CurrentDispensary.DispensaryValidator.controls) {
      this.CurrentDispensary.DispensaryValidator.controls[i].markAsDirty();
      this.CurrentDispensary.DispensaryValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentDispensary.IsValidCheck(undefined, undefined)) {
      this.CurrentDispensary.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.CurrentDispensary.IsActive = true;
      this.pharmacyBLService.AddDispensary(this.CurrentDispensary)
        .subscribe(
          res => {
            if (res.Status == "OK") {
              this.msgBoxServ.showMessage("success", ["Dispensary Added."]);
              this.CallBackAddUpdate(res)
              this.CurrentDispensary = new PHRMDispensaryModel();
            }
            else {
              this.msgBoxServ.showMessage("error", ["Something Wrong" + res.ErrorMessage]);
            }
          },
          err => {
            this.msgBoxServ.showMessage("error", ["Something Wrong" + err.ErrorMessage]);
          });
    }
  }
  DispensaryValidator(DispensaryValidator: any): any {
        throw new Error("Method not implemented.");
    }

  Update() {
    for (var i in this.CurrentDispensary.DispensaryValidator.controls) {
      this.CurrentDispensary.DispensaryValidator.controls[i].markAsDirty();
      this.CurrentDispensary.DispensaryValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentDispensary.IsValidCheck(undefined, undefined)) {
      this.pharmacyBLService.UpdateDispensary(this.CurrentDispensary)
        .subscribe(
          res => {
            if (res.Status == "OK") {
              this.msgBoxServ.showMessage("success", ['Dispensary Details Updated.']);
              this.CallBackAddUpdate(res)
              this.CurrentDispensary = new PHRMDispensaryModel();
            }
            else {
              this.msgBoxServ.showMessage("failed", ["Something Wrong " + res.ErrorMessage]);
            }
          },
          err => {
            this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
          });
    }
  }

  CallBackAddUpdate(res) {
    if (res.Status == "OK") {
      var dispensary: any = {};
      dispensary.DispensaryId = res.Results.DispensaryId;
      dispensary.Name = res.Results.Name;
      dispensary.ContactNo = res.Results.ContactNo;
      dispensary.Description = res.Results.Description;
      dispensary.Label = res.Results.Label;
      dispensary.Address = res.Results.Address;
      dispensary.Email = res.Results.Email;
      dispensary.IsActive = res.Results.IsActive;
      this.getDispensaryList();
      this.CallBackAdd(dispensary);
    }
    else {
      this.msgBoxServ.showMessage("error", ['some error ' + res.ErrorMessage]);
    }
  }

  CallBackAdd(compny: PHRMDispensaryModel) {
    this.dispensaryList.push(compny);
    if (this.index != null)
      this.dispensaryList.splice(this.index, 1);
    this.dispensaryList = this.dispensaryList.slice();
    this.changeDetector.detectChanges();
    this.showDispensaryAddPage = false;
    this.selectedItem = null;
    this.index = null;
  }
  ActivateDeactivateStatus(currDispensary: PHRMDispensaryModel) {
    if (currDispensary != null) {
      let status = currDispensary.IsActive == true ? false : true;
      let msg = status == true ? 'Activate' : 'Deactivate';
      if (confirm("Are you Sure want to " + msg + ' ' + currDispensary.Name + ' ?')) {
        currDispensary.IsActive = status;
        this.pharmacyBLService.UpdateDispensary(currDispensary)
          .subscribe(
            res => {
              if (res.Status == "OK") {
                let responseMessage = res.Results.IsActive ? "Dispensary is now activated." : "Dispensary is now Deactivated.";
                this.msgBoxServ.showMessage("success", [responseMessage]);
                this.getDispensaryList();
              }
              else {
                this.msgBoxServ.showMessage("error", ['Something wrong' + res.ErrorMessage]);
              }
            },
            err => {
              this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
            });
      }
      //to refresh the checkbox if we cancel the prompt
      //this.getDispensaryList();
    }
  }
  Close() {
    this.CurrentDispensary = new PHRMDispensaryModel();
    this.selectedItem = null;
    this.update = false;
    this.showDispensaryAddPage = false;
  }
}
