import { Component, Input, Output, EventEmitter, ChangeDetectorRef, Renderer2 } from "@angular/core";

import { SecurityService } from '../../../security/shared/security.service';
import { BedFeature } from '../../../adt/shared/bedfeature.model';
import { Ward } from '../../../adt/shared/ward.model';

import { SettingsBLService } from '../../shared/settings.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { BillItemPriceModel } from "../../shared/bill-item-price.model";
import { ReturnToVendorComponent } from "../../../inventory/reports/return-to-vendor/return-to-vendor-report.component";
import { SettingsService } from "../../shared/settings-service";
import { ServiceDepartment } from "../../shared/service-department.model";

@Component({
  selector: "bed-feature-add",
  templateUrl: "./bed-feature-add.html" //"/app/settings/adt/bed-feature-add.html"

})
export class BedFeatureAddComponent {

  public CurrentBedFeature: BedFeature = new BedFeature();

  public showAddPage: boolean = false;
  @Input("selectedItem")
  public selectedItem: BedFeature;
  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
  public update: boolean = false;

  public wardList: Array<Ward> = new Array<Ward>();
  public ESCAPE_KEYCODE = 27;//to close the window on click of ESCape.
  constructor(
    public settingsBLService: SettingsBLService,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef, public settingsService: SettingsService,
    public renderer: Renderer2,) {
      this.SetFocusById('BedFeatureName'); 
      this.globalListenFunc = this.renderer.listen('document', 'keydown', e => {
        if (e.keyCode == this.ESCAPE_KEYCODE) {
          //this.onClose.emit({ CloseWindow: true, EventName: "close" });
          this.Close();
        }
      });  
  }
  globalListenFunc: Function;
  @Input("showAddPage")
  public set value(val: boolean) {
    this.showAddPage = val;
    if (this.selectedItem) {
      this.update = true;
      this.CurrentBedFeature = Object.assign(this.CurrentBedFeature, this.selectedItem);
      this.CurrentBedFeature.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.SetFocusById('BedFeatureFullName')
    }
    else {
      this.CurrentBedFeature = new BedFeature();
      this.CurrentBedFeature.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;

      this.update = false;
    }

    this.GetSrvDeptList();
    this.SetFocusById('BedFeatureName'); 
  }

  Add() {
    //for checking validations, marking all the fields as dirty and checking the validity.
    for (var i in this.CurrentBedFeature.BedFeatureValidator.controls) {
      this.CurrentBedFeature.BedFeatureValidator.controls[i].markAsDirty();
      this.CurrentBedFeature.BedFeatureValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentBedFeature.IsValidCheck(undefined, undefined)) {
      this.settingsBLService.AddBedFeature(this.CurrentBedFeature)
        .subscribe(
          (res: DanpheHTTPResponse) => {
            if (res.Status == "OK") {
              this.showMessageBox("success", "Bed Feature Added");
              this.PostToBilling(res.Results);
            }
            else {
              this.showMessageBox("error", "Check log for details");
              console.log(res.ErrorMessage);
              this.SetFocusById('BedFeatureName'); 
            }

          },
          err => {
            this.logError(err);
          });
    }
  }

  Update() {
    //for checking validations, marking all the fields as dirty and checking the validity.
    for (var i in this.CurrentBedFeature.BedFeatureValidator.controls) {
      this.CurrentBedFeature.BedFeatureValidator.controls[i].markAsDirty();
      this.CurrentBedFeature.BedFeatureValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentBedFeature.IsValidCheck(undefined, undefined)) {
      this.settingsBLService.UpdateBedFeature(this.CurrentBedFeature)
        .subscribe(
          (res: DanpheHTTPResponse) => {
            if (res.Status == "OK" && res.Results) {
              this.showMessageBox("success", "Bed Details Updated");
              this.CallBackAddUpdate(res.Results.BedFeature);
              this.CurrentBedFeature = new BedFeature();
            }
            else {
              this.logError(res.ErrorMessage);
              this.showMessageBox("failed", "Bed Details cannot be updated now");
            }
          },
          err => {
            this.logError(err);
          });
    }
  }


  PostToBilling(bedFeatureItem: BedFeature) {

    let billItem: BillItemPriceModel = this.settingsService.MAP_GetBillItemFromBedFeature(bedFeatureItem);

    if (!this.bedChargeSrvDeptId) {
      this.msgBoxServ.showMessage("failed", ["Billing Service Department Not found for Bed Charges"]);
      return;
    }  

    billItem.ServiceDepartmentId = this.bedChargeSrvDeptId;

    


    this.settingsBLService.AddBillingItem(billItem)
      .subscribe((res: DanpheHTTPResponse) => {

        if (res.Status == "OK") {
          //after posting to billing, we've to send back same bedfeature item to : bedFeature list component.
          this.CallBackAddUpdate(bedFeatureItem);
          this.CurrentBedFeature = new BedFeature();
        }
        else {
          this.showMessageBox("failed", "failed to add billing item for bed feature.");
          console.log(res.ErrorMessage);
          //write something here..
        }

      });



  }


  CallBackAddUpdate(bf_Server: BedFeature) {

    var bedFeature: any = {};
    bedFeature.BedFeatureId = bf_Server.BedFeatureId;
    bedFeature.BedFeatureName = bf_Server.BedFeatureName;
    bedFeature.BedFeatureFullName = bf_Server.BedFeatureFullName;
    bedFeature.BedPrice = bf_Server.BedPrice;
    bedFeature.IsActive = bf_Server.IsActive;
    bedFeature.CreatedOn = bf_Server.CreatedOn;
    bedFeature.CreatedBy = bf_Server.CreatedBy;
    bedFeature.TaxApplicable = bf_Server.TaxApplicable; //yubraj 11 oct 2018

    this.callbackAdd.emit({ bedFeature: bedFeature });

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


  public srvdeptList: Array<ServiceDepartment> = [];
  public bedChargeSrvDeptId: number = null;

  public GetSrvDeptList() {
    try {
      this.settingsBLService.GetServiceDepartments()
        .subscribe(res => {
          if (res.Status == 'OK') {
            if (res.Results.length) {
              this.srvdeptList = res.Results;
              if (this.srvdeptList && this.srvdeptList.length > 0) {
                let srvDpt = this.srvdeptList.find(a => a.IntegrationName == "Bed Charges");
                if (srvDpt) {
                  this.bedChargeSrvDeptId = srvDpt.ServiceDepartmentId;
                }
              }
              //this.srvdeptList = this.srvdeptList.filter(t => t.DepartmentName == this.selectedDepName);
            }
            else {
              this.showMessageBox("failed", "Check log for error message.");
              this.logError(res.ErrorMessage);
            }
          }
        },
          err => {
            this.showMessageBox("Failed to get service departments", "Check log for error message.");
            this.logError(err.ErrorMessage);
          });
    } catch (exception) {
      this.logError(exception);
    }

  }
  public SetFocusById(id: string) {
    window.setTimeout(function () {
        let elementToBeFocused = document.getElementById(id);
        if (elementToBeFocused) {
            elementToBeFocused.focus();
        }
    }, 600);
}


}
