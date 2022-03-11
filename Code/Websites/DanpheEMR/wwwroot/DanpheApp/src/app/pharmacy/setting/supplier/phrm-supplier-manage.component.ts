import { Component, ChangeDetectorRef, Output, EventEmitter, Input, Renderer2 } from "@angular/core";
import PHRMGridColumns from '../../shared/phrm-grid-columns';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { PHRMSupplierModel } from "../../shared/phrm-supplier.model";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service"
import { SecurityService } from '../../../security/shared/security.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
@Component({
  selector: "phrm-supplier-add",
  templateUrl: "./phrm-supplier-manage.html"
})
export class PHRMSupplierManageComponent {
  public CurrentSupplier: PHRMSupplierModel = new PHRMSupplierModel();
  public selectedItem: PHRMSupplierModel = new PHRMSupplierModel();
  public supplierList: Array<PHRMSupplierModel> = new Array<PHRMSupplierModel>();
  public supplierGridColumns: Array<any> = null;
  public showSupplierList: boolean = true;
  public showSupplierAddPage: boolean = false;
  public update: boolean = false;

  public globalListenFunc: Function;
  public ESCAPE_KEYCODE = 27;//to close the window on click of ESCape.

  public index: number;
  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
  @Input("showAddPage")
  public set value(val: boolean) {
    this.showSupplierAddPage = val;
  }
  loading: boolean = false;
  constructor(public pharmacyBLService: PharmacyBLService,
    public changeDetector: ChangeDetectorRef,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService, public renderer2: Renderer2) {
    this.supplierGridColumns = PHRMGridColumns.PHRMSupplierList;
    this.getSupplierList();
  }

  ngOnInit() {
    this.globalListenFunc = this.renderer2.listen('document', 'keydown', e => {
      if (e.keyCode == this.ESCAPE_KEYCODE) {
        this.Close()
      }
    });
  }
  public getSupplierList() {
    this.pharmacyBLService.GetAllSupplierList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.supplierList = res.Results;
        }
        else {
          alert("Failed ! " + res.ErrorMessage);
          console.log(res.ErrorMessage)
        }
      });
  }

  SupplierGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "edit": {
        this.selectedItem = null;
        this.update = true;
        this.index = $event.RowIndex;
        this.showSupplierAddPage = false;
        this.changeDetector.detectChanges();
        this.selectedItem = $event.Data;
        this.CurrentSupplier.SupplierId = this.selectedItem.SupplierId;
        this.CurrentSupplier.City = this.selectedItem.City;
        this.CurrentSupplier.ContactAddress = this.selectedItem.ContactAddress;
        this.CurrentSupplier.AdditionalContactInformation = this.selectedItem.AdditionalContactInformation;
        this.CurrentSupplier.ContactNo = this.selectedItem.ContactNo;
        this.CurrentSupplier.Description = this.selectedItem.Description;
        this.CurrentSupplier.Email = this.selectedItem.Email;
        this.CurrentSupplier.IsActive = this.selectedItem.IsActive;
        this.CurrentSupplier.PANNumber = this.selectedItem.PANNumber;
        this.CurrentSupplier.DDA = this.selectedItem.DDA;
        this.CurrentSupplier.SupplierName = this.selectedItem.SupplierName;
        this.CurrentSupplier.CreditPeriod = this.selectedItem.CreditPeriod;
        this.CurrentSupplier.IsLedgerRequired = this.selectedItem.IsLedgerRequired;
        this.CurrentSupplier.CreatedBy = this.selectedItem.CreatedBy;
        this.CurrentSupplier.CreatedOn = this.selectedItem.CreatedOn;
        this.showSupplierAddPage = true;

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

  AddSupplier() {
    this.showSupplierAddPage = false;
    //this.changeDetector.detectChanges();
    this.showSupplierAddPage = true;
    this.setFocusById('supplier');
  }

  Add() {
    this.loading = true;
    for (var i in this.CurrentSupplier.SupplierValidator.controls) {
      this.CurrentSupplier.SupplierValidator.controls[i].markAsDirty();
      this.CurrentSupplier.SupplierValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentSupplier.IsValidCheck(undefined, undefined)) {
      this.CurrentSupplier.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.pharmacyBLService.AddSupplier(this.CurrentSupplier)
        .finally(() => this.loading = false)
        .subscribe(
          res => {
            if (res.Status == "OK") {
              this.msgBoxServ.showMessage("success", ["Supplier Added."]);
              this.CallBackAddUpdate(res)
              this.CurrentSupplier = new PHRMSupplierModel();
            }
            else {
              this.msgBoxServ.showMessage("error", ["Something Wrong" + res.ErrorMessage]);
            }
          },
          err => {
            this.msgBoxServ.showMessage("error", ["Something Wrong" + err.ErrorMessage]);
          });
    }
    else {
      this.loading = false;
    }
  }

  Update() {
    this.loading = true
    for (var i in this.CurrentSupplier.SupplierValidator.controls) {
      this.CurrentSupplier.SupplierValidator.controls[i].markAsDirty();
      this.CurrentSupplier.SupplierValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentSupplier.IsValidCheck(undefined, undefined)) {
      this.pharmacyBLService.UpdateSupplier(this.CurrentSupplier)
        .finally(() => this.loading = false)
        .subscribe(
          res => {
            if (res.Status == "OK") {
              this.msgBoxServ.showMessage("success", ['Supplier Details Updated.']);
              this.CallBackAddUpdate(res)
              this.CurrentSupplier = new PHRMSupplierModel();
            }
            else {
              this.msgBoxServ.showMessage("failed", ["Something Wrong " + res.ErrorMessage]);
            }
          },
          err => {
            this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
          });
    }
    else {
      this.loading = false;
    }
  }

  CallBackAddUpdate(res) {
    if (res.Status == "OK") {
      var supplier: any = {};
      supplier.SupplierId = res.Results.SupplierId;
      supplier.SupplierName = res.Results.SupplierName;
      supplier.ContactNo = res.Results.ContactNo;
      supplier.Description = res.Results.Description;
      supplier.City = res.Results.City;
      supplier.PANNumber = res.Results.PANNumber;
      supplier.DDA = res.Results.DDA;
      supplier.ContactAddress = res.Results.ContactAddress;
      supplier.AdditionalContactInformation = res.Results.AdditionalContactInformation;
      supplier.Email = res.Results.Email;
      supplier.IsActive = res.Results.IsActive;
      this.getSupplierList();
      this.CallBackAdd(supplier);
    }
    else {
      this.msgBoxServ.showMessage("error", ['some error ' + res.ErrorMessage]);
    }
  }

  CallBackAdd(suplyr: PHRMSupplierModel) {
    this.supplierList.push(suplyr);
    if (this.index != null)
      this.supplierList.splice(this.index, 1);
    this.supplierList = this.supplierList.slice();
    this.changeDetector.detectChanges();
    this.showSupplierAddPage = false;
    this.supplierList.unshift(suplyr);
    this.selectedItem = null;
    this.index = null;
    this.callbackAdd.emit({ supplier: suplyr });
  }
  ActivateDeactivateStatus(currSupplier: PHRMSupplierModel) {
    if (currSupplier != null) {
      let status = currSupplier.IsActive == true ? false : true;
      let msg = status == true ? 'Activate' : 'Deactivate';
      if (confirm("Are you Sure want to " + msg + ' ' + currSupplier.SupplierName + ' ?')) {
        currSupplier.IsActive = status;
        this.pharmacyBLService.UpdateSupplier(currSupplier)
          .subscribe(
            res => {
              if (res.Status == "OK") {
                let responseMessage = res.Results.IsActive ? "Supplier is now activated." : "Supplier is now Deactivated.";
                this.msgBoxServ.showMessage("success", [responseMessage]);
                this.getSupplierList();
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
      //this.getSupplierList();
    }
  }
  Close() {
    this.CurrentSupplier = new PHRMSupplierModel();
    this.selectedItem = null;
    this.update = false;
    this.showSupplierAddPage = false;
  }

  setFocusById(IdToBeFocused) {
    window.setTimeout(function () {
      document.getElementById(IdToBeFocused).focus();
    }, 20);
  }
}
