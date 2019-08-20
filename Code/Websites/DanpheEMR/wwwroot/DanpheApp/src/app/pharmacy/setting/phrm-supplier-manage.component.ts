import { Component, ChangeDetectorRef } from "@angular/core";

import PHRMGridColumns from '../shared/phrm-grid-columns';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";

import { PHRMSupplierModel } from "../shared/phrm-supplier.model";
import { PharmacyBLService } from "../shared/pharmacy.bl.service"
import { SecurityService } from '../../security/shared/security.service';

import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';

@Component({
    templateUrl: "../../view/pharmacy-view/Setting/PHRMSupplierManage.html" // "/PharmacyView/PHRMSupplierManage"
})
export class PHRMSupplierManageComponent {
    public CurrentSupplier: PHRMSupplierModel = new PHRMSupplierModel();
    public selectedItem: PHRMSupplierModel = new PHRMSupplierModel();
    public supplierList: Array<PHRMSupplierModel> = new Array<PHRMSupplierModel>();
    public supplierGridColumns: Array<any> = null;
    public showSupplierList: boolean = true;
    public showSupplierAddPage: boolean = false;
    public update: boolean = false;
    public index: number;

    constructor(public pharmacyBLService: PharmacyBLService,
        public changeDetector: ChangeDetectorRef,
        public securityService: SecurityService,
        public msgBoxServ: MessageboxService) {
        this.supplierGridColumns = PHRMGridColumns.PHRMSupplierList;
        this.getSupplierList();
    }

    public getSupplierList() {
        this.pharmacyBLService.GetSupplierList()
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
                this.CurrentSupplier.ContactNo = this.selectedItem.ContactNo;
                this.CurrentSupplier.Description = this.selectedItem.Description;
                this.CurrentSupplier.Email = this.selectedItem.Email;
                this.CurrentSupplier.IsActive = this.selectedItem.IsActive;
                this.CurrentSupplier.Pin = this.selectedItem.Pin;
                this.CurrentSupplier.SupplierName = this.selectedItem.SupplierName;
                this.CurrentSupplier.CreditPeriod = this.selectedItem.CreditPeriod;
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
    }

    Add() {
        for (var i in this.CurrentSupplier.SupplierValidator.controls) {
            this.CurrentSupplier.SupplierValidator.controls[i].markAsDirty();
            this.CurrentSupplier.SupplierValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentSupplier.IsValidCheck(undefined, undefined)) {
            this.CurrentSupplier.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            //this.CurrentSupplier.CreatedOn = moment().format('YYYY-MM-DD HH:mm');
            this.pharmacyBLService.AddSupplier(this.CurrentSupplier)
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
    }

    Update() {
        for (var i in this.CurrentSupplier.SupplierValidator.controls) {
            this.CurrentSupplier.SupplierValidator.controls[i].markAsDirty();
            this.CurrentSupplier.SupplierValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentSupplier.IsValidCheck(undefined, undefined)) {
            this.pharmacyBLService.UpdateSupplier(this.CurrentSupplier)
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
    }

    CallBackAddUpdate(res) {
        if (res.Status == "OK") {
            var supplier: any = {};
            supplier.SupplierId = res.Results.SupplierId;
            supplier.SupplierName = res.Results.SupplierName;
            supplier.ContactNo = res.Results.ContactNo;
            supplier.Description = res.Results.Description;
            supplier.City = res.Results.City;
            supplier.Pin = res.Results.Pin;
            supplier.ContactAddress = res.Results.ContactAddress;
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
        this.selectedItem = null;
        this.index = null;
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
}
