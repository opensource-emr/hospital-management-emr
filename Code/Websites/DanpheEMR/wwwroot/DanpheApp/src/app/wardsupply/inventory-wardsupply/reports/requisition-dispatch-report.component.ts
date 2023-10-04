import { Component, Directive, ViewChild } from '@angular/core';
import { FormControlName } from '@angular/forms';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { WardSupplyBLService } from "../../shared/wardsupply.bl.service";
import WARDGridColumns from "../../shared/ward-grid-cloumns";
import { WARDReportsModel } from '../../shared/ward-report.model';
import { SecurityService } from '../../../security/shared/security.service';
import { Router } from '@angular/router';
import { IGridFilterParameter } from '../../../shared/danphe-grid/grid-filter-parameter.interface';
import { ItemSubCategoryModel } from '../../../inventory/settings/shared/item-subcategory.model';
import { ENUM_DanpheHTTPResponseText, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { DanpheHTTPResponse } from '../../../shared/common-models';


@Component({
  selector: 'my-app',

  templateUrl: "./requisition-dispatch-report.html"

})
export class RequisitionDispatchReportComponent {
  public CurrentStoreId: number = 0;
  RequisitionDispatchReportColumn: Array<any> = null;
  RequisitionDispatchReportData: Array<RequisitionDispatchReportModel> = new Array<RequisitionDispatchReportModel>();
  FilteredRequisitionDispatchReportData: Array<RequisitionDispatchReportModel> = new Array<RequisitionDispatchReportModel>();
  public wardReports: WARDReportsModel = new WARDReportsModel();
  dateRange: string;
  FilterParameters: IGridFilterParameter[] = [];
  SubCategoryList: ItemSubCategoryModel[] = [];
  selectedSubCategory: ItemSubCategoryModel;

  constructor(public wardBLService: WardSupplyBLService, public msgBoxServ: MessageboxService, public securityService: SecurityService, public router: Router) {
    this.GetItemSubCategory();
    this.CheckForSubstoreActivation();
  };

  CheckForSubstoreActivation() {
    this.CurrentStoreId = this.securityService.getActiveStore().StoreId;
    try {
      if (!this.CurrentStoreId) {
        //routeback to substore selection page.
        this.router.navigate(['/WardSupply']);
      }
      else {
        //write whatever is need to be initialise in constructor here.
        this.RequisitionDispatchReportColumn = WARDGridColumns.RequisitionDispatchReport;
        this.wardReports.FromDate = moment().format('YYYY-MM-DD');
        this.wardReports.ToDate = moment().format('YYYY-MM-DD');
        this.wardReports.StoreId = this.CurrentStoreId;
        this.Load();
      }
    } catch (exception) {
      this.msgBoxServ.showMessage("Error", [exception]);
    }
  }
  //Export data grid options for excel file
  gridExportOptions = {
    fileName: 'RequisitionDispatchReport' + moment().format('YYYY-MM-DD') + '.xls',
  };

  Load(): void {
    this.FilterParameters = [
      { DisplayName: "DateRange:", Value: this.dateRange }
    ]
    this.wardBLService.GetRequisitionDispatchReport(this.wardReports)
      .subscribe((res:DanpheHTTPResponse) => {
        if (res.Status == ENUM_DanpheHTTPResponseText.OK) {
          this.RequisitionDispatchReportData = res.Results;
          this.FilteredRequisitionDispatchReportData = res.Results;
          this.selectedSubCategory = null;
        }
        else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [res.ErrorMessage])
        }
      });

  }
  ngAfterViewChecked() {
    this.dateRange = "<b>From:</b>&nbsp;" + this.wardReports.FromDate + "&nbsp;<b>To:</b>&nbsp;" + this.wardReports.ToDate;
  }

  OnFromToDateChange($event): void {
    this.wardReports.FromDate = $event ? $event.fromDate : this.wardReports.FromDate;
    this.wardReports.ToDate = $event ? $event.toDate : this.wardReports.ToDate;
  }

  GetItemSubCategory(): void {
    this.wardBLService.GetItemSubCategory().subscribe(res => {
      if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
        this.SubCategoryList = [];
        let SubCategoryList = res.Results;
        SubCategoryList.unshift({ SubCategoryId: null, SubCategoryName: 'All' });
        this.SubCategoryList = SubCategoryList;
      }
    })
  }

  SubCategoryFormatter(data: any): string {
    return data["SubCategoryName"];
  }

  OnSubCategoryChange(): void {
    this.FilteredRequisitionDispatchReportData = this.selectedSubCategory.SubCategoryId !== null ? this.RequisitionDispatchReportData.filter(d => d.SubCategoryId === this.selectedSubCategory.SubCategoryId) : this.RequisitionDispatchReportData;
  }
}
export class RequisitionDispatchReportModel {
  RequisitionDate: string = null;
  DispatchDate: string = null;
  ItemName: string = '';
  SubCategoryName: string = '';
  SubCategoryId: number = 0;
  RequestQty: number = 0;
  ReceivedQuantity: number = 0;
  PendingQuantity: number = 0;
  DispatchedQuantity: number = 0;
  Remark: string = '';
}
