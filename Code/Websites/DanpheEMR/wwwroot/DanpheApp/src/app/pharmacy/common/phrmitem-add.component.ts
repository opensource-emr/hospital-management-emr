
import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { Router } from '@angular/router';
import PHRMGridColumns from '../shared/phrm-grid-columns';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";

import { PHRMItemMasterModel } from "../shared/phrm-item-master.model";
import { PHRMItemTypeModel } from "../shared/phrm-item-type.model";
import { PHRMCompanyModel } from "../shared/phrm-company.model";
import { PHRMSupplierModel } from "../shared/phrm-supplier.model";
import { PHRMUnitOfMeasurementModel } from "../shared/phrm-unit-of-measurement.model";
import { PHRMGenericModel } from '../shared/phrm-generic.model';
import { PharmacyBLService } from "../shared/pharmacy.bl.service";
import { SecurityService } from '../../security/shared/security.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { PHRMSalesCategoryModel } from "../shared/phrm-sales-category.model";

@Component({
    selector: "phrmitem-add",
    templateUrl: "./phrmitem-add.html"
})

export class phrmitemaddComponent {
    abcCategory = [
        { value: 'A', text: 'Category A' },
        { value: 'B', text: 'Category B' },
        { value: 'C', text: 'Category C' },
    ];
    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
    public CurrentItem: PHRMItemMasterModel = new PHRMItemMasterModel();
    public selectedItem: PHRMItemMasterModel = new PHRMItemMasterModel();
    public itemList: Array<PHRMItemMasterModel> = new Array<PHRMItemMasterModel>();
    public companyList: Array<PHRMCompanyModel> = new Array<PHRMCompanyModel>();
    public categoryList: Array<PHRMCompanyModel> = new Array<PHRMCompanyModel>();
    public supplierList: Array<PHRMSupplierModel> = new Array<PHRMSupplierModel>();
    public itemtypeList: Array<PHRMItemTypeModel> = new Array<PHRMItemTypeModel>();
    public uomList: Array<PHRMUnitOfMeasurementModel> = new Array<PHRMUnitOfMeasurementModel>();
    public genericList: Array<PHRMGenericModel> = new Array<PHRMGenericModel>();
    public itemGridColumns: Array<any> = null;
    public showItemAddPage: boolean = false;
    public update: boolean = false;
    public index: number;
    public showAddPage: boolean = false;
    public selCompany: PHRMCompanyModel = new PHRMCompanyModel;
    public selItemType: PHRMItemTypeModel = new PHRMItemTypeModel;
    public selGenName: PHRMGenericModel = new PHRMGenericModel;
    public checkSelectedGenId: Boolean = false;
    public selCategory: PHRMSalesCategoryModel = new PHRMSalesCategoryModel;
    public CategoryId: number = 0;
    //for Item Popup purpose
    public showAddCompanyPopUp: boolean = false;
    //public company: PHRMCompanyModel = new PHRMCompanyModel;

    constructor(
        public pharmacyBLService: PharmacyBLService,
        public securityService: SecurityService,
        public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService) {
        this.itemGridColumns = PHRMGridColumns.PHRMItemList;
        this.getItemList();
        this.getCompanies();
        this.getItemTypes();
        this.getUOMs();
        this.getGenericList();
        this.getSalesCategoryList();
    }

    @Input("showAddPage")
    public set value(val: boolean) {
        this.showAddPage = val;

        this.CurrentItem = new PHRMItemMasterModel();
        this.CurrentItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        this.update = false;
    }
    public getGenericList() {
        this.pharmacyBLService.GetGenericList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.genericList = res.Results;
                }
            });
    }

    public getItemList() {
        this.pharmacyBLService.GetItemList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.itemList = res.Results;
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                    console.log(res.ErrorMessage)
                }
            },
            err => {
                this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
            });
    }

    public getCompanies() {
        this.pharmacyBLService.GetCompanyList()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    if (res.Results.length) {
                        this.companyList = res.Results;
                    }
                }
                else {
                    this.msgBoxServ.showMessage("error", ["Something Wrong " + res.ErrorMessage]);
                }
            },
            err => {
                this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
            });
    }
    public getItemTypes() {
        this.pharmacyBLService.GetItemTypeList()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    if (res.Results.length) {
                        this.itemtypeList = res.Results;
                    }
                }
                else {
                    this.msgBoxServ.showMessage("error", ["Something Wrong " + res.ErrorMessage]);
                }
            },
            err => {
                this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
            });
    }
    public getUOMs() {
        this.pharmacyBLService.GetUnitOfMeasurementList()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    if (res.Results.length) {
                        this.uomList = res.Results;
                    }
                }
                else {
                    this.msgBoxServ.showMessage("error", ["Something Wrong " + res.ErrorMessage]);
                }
            },
            err => {
                this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
            });
    }
    ItemGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "edit": {
                this.selectedItem = null;
                this.update = true;
                this.index = $event.RowIndex;
                this.showItemAddPage = false;
                this.changeDetector.detectChanges();
                this.selectedItem = $event.Data;
                this.CurrentItem.ItemId = this.selectedItem.ItemId;
                this.CurrentItem.ItemName = this.selectedItem.ItemName;
                this.CurrentItem.ItemCode = this.selectedItem.ItemCode;
                this.CurrentItem.CompanyId = this.selectedItem.CompanyId;
                //this.CurrentItem.SupplierId = this.selectedItem.SupplierId;
                this.CurrentItem.ItemTypeId = this.selectedItem.ItemTypeId;
                this.CurrentItem.UOMId = this.selectedItem.UOMId;
                this.CurrentItem.ReOrderQuantity = this.selectedItem.ReOrderQuantity;
                this.CurrentItem.MinStockQuantity = this.selectedItem.MinStockQuantity;
                this.CurrentItem.BudgetedQuantity = this.selectedItem.BudgetedQuantity;
                this.CurrentItem.PurchaseVATPercentage = this.selectedItem.PurchaseVATPercentage;
                this.CurrentItem.IsVATApplicable = this.selectedItem.IsVATApplicable;
                this.CurrentItem.IsActive = this.selectedItem.IsActive;
                this.CurrentItem.GenericId = this.selectedItem.GenericId;
                this.CurrentItem.IsInternationalBrand = this.selectedItem.IsInternationalBrand;
                this.CurrentItem.ABCCategory = this.selectedItem.ABCCategory;
                this.CurrentItem.Dosage = this.selectedItem.Dosage;
                this.showItemAddPage = true;

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
    AddItem() {
        this.showItemAddPage = false;
        this.changeDetector.detectChanges();
        this.showItemAddPage = true;
    }
    Add() {
        for (var i in this.CurrentItem.ItemValidator.controls) {
            this.CurrentItem.ItemValidator.controls[i].markAsDirty();
            this.CurrentItem.ItemValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentItem.GenericId == 0 || this.CurrentItem.ItemTypeId == 0 || this.CurrentItem.CompanyId == 0) {
            this.msgBoxServ.showMessage("error", ["Generic name or type or company is missing "]);

        }
        else {

            if (this.CurrentItem.IsValidCheck(undefined, undefined)) {
                this.CurrentItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                this.pharmacyBLService.AddItem(this.CurrentItem)
                    .subscribe(
                    res => {
                        if (res.Status == "OK") {
                            this.msgBoxServ.showMessage("success", ["Item Added."]);
                            this.CallBackAddItem(res)
                            this.CurrentItem = new PHRMItemMasterModel();
                            this.showAddPage = false;
                        }
                        else {
                            this.msgBoxServ.showMessage("error", ["Something Wrong " + res.ErrorMessage]);
                        }
                    },
                    err => {
                        this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
                    });
            }
        }
    }
    //Update() {
    //    for (var i in this.CurrentItem.ItemValidator.controls) {
    //        this.CurrentItem.ItemValidator.controls[i].markAsDirty();
    //        this.CurrentItem.ItemValidator.controls[i].updateValueAndValidity();
    //    }
    //    if (this.CurrentItem.IsValidCheck(undefined, undefined)) {
    //        this.CurrentItem.ModifiedOn = moment().format('YYYY-MM-DD HH:mm');
    //        this.CurrentItem.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
    //        this.pharmacyBLService.UpdateItem(this.CurrentItem)
    //            .subscribe(
    //            res => {
    //                if (res.Status == "OK") {
    //                    this.msgBoxServ.showMessage("success", ['Item Type Details Updated.']);
    //                    this.CallBackAddUpdate(res)
    //                    this.CurrentItem = new PHRMItemMasterModel();
    //                }
    //                else {
    //                    this.msgBoxServ.showMessage("failed", ["Something Wrong " + res.ErrorMessage]);
    //                }
    //            },
    //            err => {
    //                this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
    //            });
    //    }
    //}
    CallBackAddUpdate(res) {
        if (res.Status == "OK") {
            var item: any = {};
            item.ItemId = res.Results.ItemId;
            item.ItemName = res.Results.ItemName;
            item.ItemCode = res.Results.ItemCode;
            item.CompanyId = res.Results.CompanyId;
            item.SupplierId = res.Results.SupplierId;
            item.ItemTypeId = res.Results.ItemTypeId;
            item.UOMId = res.Results.UOMId;
            item.StandardPrice = res.Results.StandardPrice;
            item.SellingPrice = res.Results.SellingPrice;
            item.ReOrderQuantity = res.Results.ReOrderQuantity;
            item.MinStockQuantity = res.Results.MinStockQuantity;
            item.BudgetedQuantity = res.Results.BudgetedQuantity;
            item.VATPercentage = res.Results.VATPercentage;
            item.IsVATApplicable = res.Results.IsVATApplicable;
            item.IsActive = res.Results.IsActive;
            item.IsInternationalBrand = res.Results.IsInternationalBrand;
            item.Dosage = res.Results.Dosage;
            for (let compny of this.companyList) {
                if (compny.CompanyId == res.Results.CompanyId) {
                    item.CompanyName = compny.CompanyName;
                    break;
                }
            };
            for (let sup of this.supplierList) {
                if (sup.SupplierId == res.Results.SupplierId) {
                    item.SupplierName = sup.SupplierName;
                    break;
                }
            };
            for (let unit of this.uomList) {
                if (unit.UOMId == res.Results.UOMId) {
                    item.UOMName = unit.UOMName;
                    break;
                }
            };
            for (let itmtype of this.itemtypeList) {
                if (itmtype.ItemTypeId == res.Results.ItemTypeId) {
                    item.ItemTypeName = itmtype.ItemTypeName;
                    break;
                }
            };
            this.CallBackAdd(item);
        }
        else {
            this.msgBoxServ.showMessage("error", ['some error ' + res.ErrorMessage]);
        }
    }
    CallBackAdd(itm: PHRMItemMasterModel) {
        this.itemList.push(itm);
        if (this.index != null)
            this.itemList.splice(this.index, 1);
        this.itemList = this.itemList.slice();
        this.changeDetector.detectChanges();
        this.showItemAddPage = false;
        this.selectedItem = null;
        this.index = null;
    }

    ActivateDeactivateStatus(currItem: PHRMItemMasterModel) {
        if (currItem != null) {
            let status = currItem.IsActive == true ? false : true;
            let msg = status == true ? 'Activate' : 'Deactivate';
            if (confirm("Are you Sure want to " + msg + ' ' + currItem.ItemName + ' ?')) {
                currItem.IsActive = status;
                this.pharmacyBLService.UpdateItem(currItem)
                    .subscribe(
                    res => {
                        if (res.Status == "OK") {
                            let responseMessage = res.Results.IsActive ? "Item is now activated." : "Item is now Deactivated.";
                            this.msgBoxServ.showMessage("success", [responseMessage]);
                            this.getItemList();
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
            //this.getItemList();
        }
    }
    CallBackAddItem(res) {
        if (res.Status == "OK") {
            this.callbackAdd.emit({ item: res.Results });
        }
        else {
            //this.showMessageBox("error", "Check log for details");
            console.log(res.ErrorMessage);
        }
  }
  public getSalesCategoryList() {
    this.pharmacyBLService.GetSalesCategoryList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.categoryList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("error", ["Something Wrong " + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
        });
  }
    Close() {
        this.selectedItem = null;
        this.update = false;
        //this.itemList = this.completeitemList;
        this.showAddPage = false;
    }
    public AssignSelectedCompany() {
        try {
            if (this.selCompany.CompanyId) {
                if ((this.selCompany.CompanyId != 0) && (this.selCompany.CompanyId != null)) {
                    this.CurrentItem.CompanyId = this.selCompany.CompanyId;

                }
            }
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }
    public ShowCatchErrMessage(exception) {
        if (exception) {
            let ex: Error = exception;
            this.msgBoxServ.showMessage("error", ["Check error in Console log !"]);
            console.log("Error Messsage =>  " + ex.message);
            console.log("Stack Details =>   " + ex.stack);
        }
    }

    CompaniesListFormatter(data: any): string {
        return data["CompanyName"];
    }

    
    public AssignSelectedItemType() {
        try {
            if (this.selItemType.ItemTypeId) {
                if ((this.selItemType.ItemTypeId != 0) && (this.selItemType.ItemTypeId != null)) {
                    this.CurrentItem.ItemTypeId = this.selItemType.ItemTypeId;

                }
            }
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
  }
  public AssignSelectedCategory() {
    try {
      if (this.selCategory.SalesCategoryId) {
        if ((this.selCategory.SalesCategoryId != 0) && (this.selCategory.SalesCategoryId != null)) {
          this.CurrentItem.SalesCategoryId = this.selCategory.SalesCategoryId;
        }
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

    ItemTypesListFormatter(data: any): string {
        return data["ItemTypeName"];
  }

    public AssignSelectedGenName() {
        try {
            if (this.selGenName.GenericId) {
                if ((this.selGenName.GenericId != 0) && (this.selGenName.GenericId != null)) {
                    this.CurrentItem.GenericId = this.selGenName.GenericId;

                }
            }
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }
    GenNamesListFormatter(data: any): string {
        return data["GenericName"];
  }


  SalesCategoryListFormatter(data: any): string {
    return data["Name"];
  }

    CheckProperSelectedGenName(selGenName) {
        try {
            for (var i = 0; i < this.genericList.length; i++) {
                if (this.genericList[i].GenericId == selGenName.GenericId) {
                    this.checkSelectedGenId = false;
                    break;
                }
                else {
                    if (selGenName.GenericId == undefined) {
                        this.checkSelectedGenId = true;
                        break;
                    }
                }
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
    //for item add popup page to turn on

    AddCompanyPopUp(i) {
        this.showAddCompanyPopUp = false;
        this.index = i;
        //this.changeDetectorRef.detectChanges();
        this.showAddCompanyPopUp = true;
    }
    OnNewCompanyAdded($event) {
        this.showAddCompanyPopUp = false;
        var item = $event.compny;


        this.companyList.unshift(item);
        //this.selCompany = new PHRMCompanyModel();
    }
}
