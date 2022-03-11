import { Component, ChangeDetectorRef, OnInit, Renderer2 } from "@angular/core";
import PHRMGridColumns from '../../shared/phrm-grid-columns';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { SecurityService } from '../../../security/shared/security.service';
import { DispensaryService } from "../../../dispensary/shared/dispensary.service";
import { ENUM_DispensaryType } from "../../../shared/shared-enums";
import { PHRMStoreModel } from "../../shared/phrm-store.model";
import * as moment from "moment";
import { Permission } from "../../../security/shared/permission.model";
import { Validators } from "@angular/forms";

@Component({
  templateUrl: "./phrm-dispensary-manage.html"

})
export class PHRMDispensaryManageComponent implements OnInit {
  public CurrentDispensary: PHRMStoreModel = new PHRMStoreModel();
  public selectedItem: PHRMStoreModel = new PHRMStoreModel();
  public dispensaryList: Array<PHRMStoreModel> = new Array<PHRMStoreModel>();
  public dispensaryGridColumns: Array<any> = null;
  public showDispensaryList: boolean = true;
  public showDispensaryAddPage: boolean = false;
  public update: boolean = false;
  public index: number;
  public dispensaryTypes;
  public globalListenFunc: Function;
  public ESCAPE_KEYCODE = 27; //to close the window on click of ESCape.
  showPaymentModesPopUp: boolean = false;

  constructor(
    public dispensaryService: DispensaryService,
    public changeDetector: ChangeDetectorRef,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService, public renderer2: Renderer2) {
    this.dispensaryGridColumns = PHRMGridColumns.PHRMDispensaryList;
    this.loadDispensaryTypes();
    this.getDispensaryList();
  }
  ngOnInit() {
    this.globalListenFunc = this.renderer2.listen('document', 'keydown', e => {
      if (e.keyCode == this.ESCAPE_KEYCODE) {
        this.Close()
      }
    });
  }
  public loadDispensaryTypes() {
    this.dispensaryTypes = ENUM_DispensaryType;
  }
  public getDispensaryList() {
    this.dispensaryService.GetAllDispensaryList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.dispensaryList = res.Results;
          this.dispensaryList = this.dispensaryList.slice();
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
        this.CurrentDispensary.StoreId = this.selectedItem.StoreId;
        this.CurrentDispensary.Name = this.selectedItem.Name;
        this.CurrentDispensary.Address = this.selectedItem.Address;
        this.CurrentDispensary.ContactNo = this.selectedItem.ContactNo;
        this.CurrentDispensary.Email = this.selectedItem.Email;
        this.CurrentDispensary.StoreLabel = this.selectedItem.StoreLabel;
        this.CurrentDispensary.StoreDescription = this.selectedItem.StoreDescription;
        this.CurrentDispensary.IsActive = this.selectedItem.IsActive;
        this.CurrentDispensary.SubCategory = this.selectedItem.SubCategory;
        this.CurrentDispensary.Category = this.selectedItem.Category;
        this.CurrentDispensary.ParentStoreId = this.selectedItem.ParentStoreId;
        this.CurrentDispensary.PermissionId = this.selectedItem.PermissionId;
        this.CurrentDispensary.PanNo = this.selectedItem.PanNo;
        this.CurrentDispensary.UseSeparateInvoiceHeader = this.selectedItem.UseSeparateInvoiceHeader;
        this.CurrentDispensary.AvailablePaymentModes = this.selectedItem.AvailablePaymentModes;
        this.CurrentDispensary.DefaultPaymentMode = this.selectedItem.DefaultPaymentMode;
        this.checkIfValidationNeededForBillingHeaderInfo();
        
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
      case "showPaymentModes": {
        this.selectedItem = $event.Data;
        this.openPaymentModesPopUp();
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
    this.setFocusById('dispensaryName');
  }

  Add() {
    for (var i in this.CurrentDispensary.StoreValidator.controls) {
      this.CurrentDispensary.StoreValidator.controls[i].markAsDirty();
      this.CurrentDispensary.StoreValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentDispensary.StoreValidator.valid) {
      this.CurrentDispensary.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.CurrentDispensary.CreatedOn = moment().format('YYYY-MM-DD HH:mm:ss');
      this.CurrentDispensary.IsActive = true;
      this.dispensaryService.AddDispensary(this.CurrentDispensary)
        .subscribe(
          res => {
            if (res.Status == "OK") {
              this.msgBoxServ.showMessage("success", ["Dispensary Added."]);
              this.AddNewStorePermissionToClientSide(this.CurrentDispensary);
              this.CallBackAddUpdate(res)
              this.CurrentDispensary = new PHRMStoreModel();
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

  Update() {
    for (var i in this.CurrentDispensary.StoreValidator.controls) {
      this.CurrentDispensary.StoreValidator.controls[i].markAsDirty();
      this.CurrentDispensary.StoreValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentDispensary.StoreValidator.valid) {
      this.CurrentDispensary.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.CurrentDispensary.CreatedOn = moment().format('YYYY-MM-DD HH:mm:ss');
      this.dispensaryService.UpdateDispensary(this.CurrentDispensary)
        .subscribe(
          res => {
            if (res.Status == "OK") {
              this.msgBoxServ.showMessage("success", ['Dispensary Details Updated.']);
              this.CallBackAddUpdate(res)
              this.CurrentDispensary = new PHRMStoreModel();
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
      this.getDispensaryList();
      this.changeDetector.detectChanges();
      this.showDispensaryAddPage = false;
      this.selectedItem = null;
      this.index = null;
    }
    else {
      this.msgBoxServ.showMessage("error", ['some error ' + res.ErrorMessage]);
    }
  }
  private AddNewStorePermissionToClientSide(dispensary: PHRMStoreModel) {
    var newStorePermission = new Permission();
    newStorePermission.PermissionName = 'dispensary-' + dispensary.Name;
    this.securityService.UserPermissions.push(newStorePermission);
  }

  ActivateDeactivateStatus(currDispensary: PHRMStoreModel) {
    if (currDispensary != null) {
      let status = currDispensary.IsActive == true ? false : true;
      let msg = status == true ? 'Activate' : 'Deactivate';
      if (confirm("Are you Sure want to " + msg + ' ' + currDispensary.Name + ' ?')) {
        currDispensary.IsActive = status;
        this.dispensaryService.UpdateDispensary(currDispensary)
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
    this.CurrentDispensary = new PHRMStoreModel();
    this.selectedItem = null;
    this.update = false;
    this.showDispensaryAddPage = false;
  }
  checkIfValidationNeededForBillingHeaderInfo(){
    if(this.CurrentDispensary.UseSeparateInvoiceHeader == true){
      this.CurrentDispensary.StoreValidator.get("StoreLabel").setValidators([Validators.required, Validators.maxLength(50)]);
      this.CurrentDispensary.StoreValidator.get("ContactNo").setValidators([Validators.required, Validators.pattern('^[a-zA-Z0-9_@./#)(&+-]+$'), Validators.maxLength(20)]);
    }
    else{
      this.CurrentDispensary.StoreValidator.get("StoreLabel").setValidators(null);
      this.CurrentDispensary.StoreValidator.get("ContactNo").setValidators([Validators.pattern('^[a-zA-Z0-9_@./#)(&+-]+$'), Validators.maxLength(20)]);
    }
  }
  openPaymentModesPopUp() {
    this.showPaymentModesPopUp = true;
  }
  onPaymentModesPopUpClose() {
    this.showPaymentModesPopUp = false;
  }
  OnCategoryChange() {
    this.setFocusById('label');
  }
  setFocusById(id: string) {
    var Timer = setTimeout(() => {
      if (document.getElementById(id)) {
        let nextEl = <HTMLInputElement>document.getElementById(id);
        nextEl.focus();
        clearTimeout(Timer);
      }
    }, 50)
  }
}
