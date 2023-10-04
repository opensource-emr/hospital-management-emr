import { Component, Input, Output, EventEmitter, ChangeDetectorRef, Renderer2 } from "@angular/core";
import { SecurityService } from '../../../security/shared/security.service';
import { Ward } from '../../../adt/shared/ward.model';
import { SettingsBLService } from '../../shared/settings.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { PHRMStoreModel } from "../../../pharmacy/shared/phrm-store.model";
import { WardSupplyBLService } from "../../../wardsupply/shared/wardsupply.bl.service";

@Component({
  selector: "ward-add",
  templateUrl: "./ward-add.html"
})
export class WardAddComponent {

  public CurrentWard: Ward = new Ward();

  public showAddPage: boolean = false;
  @Input("selectedItem")
  public selectedItem: Ward;
  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
  public update: boolean = false;

  public wardList: Array<Ward> = new Array<Ward>();
  public subStoreList: Array<PHRMStoreModel> = new Array<PHRMStoreModel>();
  public selectedSubStore: PHRMStoreModel = new PHRMStoreModel();
  public ESCAPE_KEYCODE = 27;//to close the window on click of ESCape.
  constructor(
    public settingsBLService: SettingsBLService,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public renderer: Renderer2,
  ) {
    this.GetActiveSubStore();
    this.SetFocusById('WardName'); 
    this.globalListenFunc = this.renderer.listen('document', 'keydown', e => {
      if (e.keyCode == this.ESCAPE_KEYCODE) {
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
      this.CurrentWard = Object.assign(this.CurrentWard, this.selectedItem);
      this.CurrentWard.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.selectedSubStore = this.subStoreList.find(a => a.StoreId == this.CurrentWard.StoreId);
    }
    else {
      this.CurrentWard = new Ward();
      this.CurrentWard.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;

      this.update = false;
    }
    this.SetFocusById('WardName');  
  }

  GetActiveSubStore() {
    this.settingsBLService.GetActiveStoreList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.subStoreList = res.Results;
          if (this.update) {
            this.selectedSubStore = this.subStoreList.find(a => a.StoreId == this.CurrentWard.StoreId);
          }
        }
      });
  }
  Add() {
    for (var i in this.CurrentWard.WardValidator.controls) {
      this.CurrentWard.WardValidator.controls[i].markAsDirty();
      this.CurrentWard.WardValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentWard.IsValidCheck(undefined, undefined)) {
      this.settingsBLService.AddWard(this.CurrentWard)
        .subscribe(
          res => {
            if (res.Status == "OK") {
              this.showMessageBox("Success", "Ward Added");
              this.CallBackAddUpdate(res)
              this.CurrentWard = new Ward();
            }
            else {
              this.showMessageBox("Failed", res.ErrorMessage);
              this.SetFocusById('WardName');
            }
          },
          err => {
            this.logError(err);
          });
    }
  }

  Update() {
    for (var i in this.CurrentWard.WardValidator.controls) {
      this.CurrentWard.WardValidator.controls[i].markAsDirty();
      this.CurrentWard.WardValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentWard.IsValidCheck(undefined, undefined)) {
      this.settingsBLService.UpdateWard(this.CurrentWard)
        .subscribe(
          res => {
            if (res.Status == "OK") {
              this.showMessageBox("Success", "Ward Details Updated");
              this.CallBackAddUpdate(res)
              this.CurrentWard = new Ward();
            }
            else{
              this.showMessageBox("Failed",res.ErrorMessage);
            }
          },
          err => {
            this.logError(err);
          });
    }
  }


  CallBackAddUpdate(res) {
    if (res.Status == "OK") {
      var ward: any = {};
      ward.WardId = res.Results.WardId;
      ward.StoreId = res.Results.StoreId;
      ward.WardName = res.Results.WardName;
      ward.WardCode = res.Results.WardCode;
      ward.WardLocation = res.Results.WardLocation;
      ward.IsActive = res.Results.IsActive;
      ward.CreatedOn = res.Results.CreatedOn;
      ward.CreatedBy = res.Results.CreatedBy;
      this.callbackAdd.emit({ ward: ward });
      this.Close();
    }
    else {
      this.showMessageBox("Error", "Check log for details");
      console.log(res.ErrorMessage);
    }
  }
  logError(err: any) {
    console.log(err);
  }
  Close() {
    this.selectedItem = null;
    this.selectedSubStore = null;
    this.update = false;
    this.showAddPage = false;
  }
  showMessageBox(status: string, message: string) {
    this.msgBoxServ.showMessage(status, [message]);
  }

  SubStoreListFormatter(data: any): string {
    let html = "<font color=blue size=03>" + data['Name'] + "</font>(" + data['Code'] + ")";
    return html;
  }
  onChangeSubstore($event) {
    this.CurrentWard.StoreId = $event.StoreId;
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
