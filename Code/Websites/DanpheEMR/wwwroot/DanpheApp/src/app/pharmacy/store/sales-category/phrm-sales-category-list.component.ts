import { ChangeDetectorRef, Component } from "@angular/core";

import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import PHRMGridColumns from '../../shared/phrm-grid-columns';

import { PharmacyBLService } from "../../shared/pharmacy.bl.service";

import { Router } from '@angular/router';
import * as moment from "moment";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { PharmacyService } from "../../shared/pharmacy.service";
import { PHRMSalesCategoryModel } from "../../shared/phrm-sales-category.model";
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
    this.CurrentCategory.CreatedOn = moment().format('YYYY-MM-DD');
    this.pharmacyBLService.PostSalesCategoryDetails(this.CurrentCategory)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == ENUM_DanpheHTTPResponses.OK) {
          this.salescategory.push(res.Results);
          this.salescategory = this.salescategory.slice();
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Sales Category added."]);
        }
        else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Add failed."]);
        }
        this.showCategoryAddPage = false;
      });
  }
  public getSalesCategoryList() {
    this.pharmacyBLService.GetSalesCategoryList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == ENUM_DanpheHTTPResponses.OK) {
          this.salescategory = res.Results;
        }
        else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to get Sales Category. " + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to get Sales Category111. " + err.ErrorMessage]);
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



