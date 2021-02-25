import { Component, ChangeDetectorRef } from "@angular/core";

import PHRMGridColumns from '../../shared/phrm-grid-columns';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import { PharmacyBLService } from "../../shared/pharmacy.bl.service"

import { PharmacyService } from "../../shared/pharmacy.service"
import { MessageboxService } from "../../../shared/messagebox/messagebox.service"
import { CommonFunctions } from "../../../shared/common.functions"
import * as moment from 'moment/moment';
import { Router } from '@angular/router';
import { PHRMReportsModel } from "../../shared/phrm-reports-model";
import { PHRMSalesCategoryModel } from "../../shared/phrm-sales-category.model"
@Component({
  selector: 'sales-category-details-list',
  templateUrl: "./phrm-sales-category-list.html"
})
export class PHRMSalesDetailsListComponent {

  public salescategory: Array<PHRMSalesCategoryModel> = new Array<PHRMSalesCategoryModel>();
  salesDetailsGridColumns: ({ headerName: string; field: string; width: number; template?: undefined; } | { headerName: string; field: string; width: number; template: string; })[];
  public salesDetailsList: Array<PHRMSalesCategoryModel> = new Array<PHRMSalesCategoryModel>();
  public showCategoryAddPage: boolean = false;
  public CurrentCategory: PHRMSalesCategoryModel = new PHRMSalesCategoryModel();

  constructor(
    public pharmacyBLService: PharmacyBLService, public pharmacyService: PharmacyService,
    public changeDetector: ChangeDetectorRef, public router: Router,
    public msgBoxServ: MessageboxService) {
    this.salesDetailsGridColumns = PHRMGridColumns.SalesCategoryList;
    this.GetCategoryDetails();
    this.getSalesCategoryList();
     }

  GetCategoryDetails() {
    this.salescategory.push(new PHRMSalesCategoryModel());
  }

  PostSalesCategoryDetails() {
    this.pharmacyBLService.PostSalesCategoryDetails(this.CurrentCategory)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.salescategory.push(res.Results);
          this.salescategory = this.salescategory.slice();
          this.msgBoxServ.showMessage("Success", ["Sales Category added."]);
        }
        else {
          this.msgBoxServ.showMessage("Failed", ["Add failed."]);
        }
        this.showCategoryAddPage = false;
      });
  }
  public getSalesCategoryList() {
    this.pharmacyBLService.GetSalesCategoryList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.salescategory = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("error", ["Failed to get Sales Category. " + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["Failed to get Sales Category111. " + err.ErrorMessage]);
        });
  }

  SalesDetailsGridActions($event: GridEmitModel) {
    
  }

  
  AddCategory() {
    this.showCategoryAddPage = false;
    this.changeDetector.detectChanges();
    this.showCategoryAddPage = true;
  }
  Close() {
    this.showCategoryAddPage = false;
  }
}



