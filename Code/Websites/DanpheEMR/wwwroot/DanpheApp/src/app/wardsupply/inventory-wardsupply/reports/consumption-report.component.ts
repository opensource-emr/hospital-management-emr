import { Component } from '@angular/core';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { WardSupplyBLService } from "../../shared/wardsupply.bl.service";
import WARDGridColumns from "../../shared/ward-grid-cloumns";
import { WARDReportsModel } from '../../shared/ward-report.model';
import { SecurityService } from '../../../security/shared/security.service';
import { Router } from '@angular/router';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { IGridFilterParameter } from '../../../shared/danphe-grid/grid-filter-parameter.interface';
import { InventoryBLService } from '../../../inventory/shared/inventory.bl.service';
import { ItemSubCategory } from '../../shared/SubCategory.model';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { ENUM_DanpheHTTPResponseText, ENUM_MessageBox_Status } from '../../../shared/shared-enums';


@Component({
  selector: 'my-app',

  templateUrl: "./consumption-report.html"

})
export class ConsumptionReportComponent {
  public CurrentStoreId: number = 0;
  ConsumptionReportColumn: Array<any> = null;
  ConsumptionReportData: Array<any> = new Array<WARDReportsModel>();
  public wardReports: WARDReportsModel = new WARDReportsModel();
  public dateRange: string = null;
  NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  FilterParameters: IGridFilterParameter[] = [];
  NewWardConsumptionData: Array<any> = new Array<WARDReportsModel>();
  public isInternalConsumption: boolean = false;
  public isPatientConsumption: boolean = false;
  public fromDate: string = null;
  public toDate: string = null;
  public selectedSubCategoryId: number = null;
  public SubCategoryList: ItemSubCategory[] = [];

  constructor(public wardBLService: WardSupplyBLService, public msgBoxServ: MessageboxService, public securityService: SecurityService, public router: Router, public inventoryBLService: InventoryBLService) {
    this.dateRange = 'last1Week';
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('Date', false));
    this.CheckForSubstoreActivation();
    this.getSubCategoryList();
  };

  CheckForSubstoreActivation() {
    this.CurrentStoreId = this.securityService.getActiveStore().StoreId;
    try {
      if (!this.CurrentStoreId) {
        //routeback to substore selection page.
        this.router.navigate(['/WardSupply']);
      }
      else {
        this.ConsumptionReportColumn = WARDGridColumns.ConsumptionReport;
        this.wardReports.FromDate = moment().format('YYYY-MM-DD');
        this.wardReports.ToDate = moment().format('YYYY-MM-DD');
        this.wardReports.StoreId = this.CurrentStoreId;
      }
    } catch (exception) {
      this.msgBoxServ.showMessage("Error", [exception]);
    }
  }
  OnFromToDateChange($event) {
    this.wardReports.FromDate = $event.fromDate;
    this.wardReports.ToDate = $event.toDate;
  }
  //Export data grid options for excel file
  gridExportOptions = {
    fileName: 'ConsumptionReport' + moment().format('YYYY-MM-DD') + '.xls',
  };

  ngAfterViewChecked() {
    this.dateRange = "<b>From:</b>&nbsp;" + this.wardReports.FromDate + "&nbsp;<b>To:</b>&nbsp;" + this.wardReports.ToDate;
  }

  Load() {
    if (this.wardReports.FromDate != null && this.wardReports.ToDate != null) {
      this.FilterParameters = [
        { DisplayName: "DateRange:", Value: this.dateRange }
      ]
      this.isInternalConsumption = false;
      this.isPatientConsumption = false;
      this.wardBLService.GetConsumptionReport(this.wardReports)
          .subscribe((res: DanpheHTTPResponse) => {
              if (res.Status == ENUM_DanpheHTTPResponseText.OK) {
            this.ConsumptionReportData = res.Results;
            this.NewWardConsumptionData = res.Results;
          }
          else {
                  this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [res.ErrorMessage])
          }
        });
    }
    else {
      this.msgBoxServ.showMessage('failed', ['Please enter valid From date and To date']);
    }

  }
  ShowInternalConsumption() {
    this.isPatientConsumption = false;
    if (this.isInternalConsumption == true && this.selectedSubCategoryId == null) {
      this.NewWardConsumptionData = this.ConsumptionReportData.filter(a => a.ConsumptionReceiptId == null);
    } else if (this.isInternalConsumption == false && this.selectedSubCategoryId == null) {
      this.NewWardConsumptionData = this.ConsumptionReportData;
    }
    else if (this.isInternalConsumption == true && this.selectedSubCategoryId !== null) {
      this.NewWardConsumptionData = this.ConsumptionReportData.filter(a => a.ConsumptionReceiptId == null && a.SubCategoryId == this.selectedSubCategoryId);
    }
    else {
      this.NewWardConsumptionData = this.ConsumptionReportData.filter(a => a.SubCategoryId == this.selectedSubCategoryId);
    }
  }
  ShowPatientConsumption() {
    this.isInternalConsumption = false;
    if (this.isPatientConsumption == true && this.selectedSubCategoryId == null) {
      this.NewWardConsumptionData = this.ConsumptionReportData.filter(a => a.ConsumptionReceiptId !== null);
    } else if (this.isPatientConsumption == false && this.selectedSubCategoryId == null) {
      this.NewWardConsumptionData = this.ConsumptionReportData;
    }
    else if (this.isPatientConsumption == true && this.selectedSubCategoryId !== null) {
      this.NewWardConsumptionData = this.ConsumptionReportData.filter(a => a.ConsumptionReceiptId !== null && a.SubCategoryId == this.selectedSubCategoryId);
    }
    else {
      this.NewWardConsumptionData = this.ConsumptionReportData.filter(a => a.SubCategoryId == this.selectedSubCategoryId);
    }
  }
  filterStockBySubCategory() {
    if (this.isPatientConsumption == true && this.selectedSubCategoryId == null) {
      this.NewWardConsumptionData = this.ConsumptionReportData.filter(a => a.ConsumptionReceiptId !== null);
    } else if (this.isPatientConsumption == false && this.selectedSubCategoryId == null) {
      this.NewWardConsumptionData = this.ConsumptionReportData;
    }
    else if (this.isPatientConsumption == true && this.selectedSubCategoryId !== null) {
      this.NewWardConsumptionData = this.ConsumptionReportData.filter(a => a.ConsumptionReceiptId! == null && a.SubCategoryId == this.selectedSubCategoryId);
    }
    else {
      this.NewWardConsumptionData = this.ConsumptionReportData.filter(a => a.SubCategoryId == this.selectedSubCategoryId);
    }
  }
  public getSubCategoryList() {
    this.inventoryBLService.GetSubCategoryList().subscribe(res => {
      if (res.Status == "OK" && res.Results && res.Results.length > 0) {
        this.SubCategoryList = res.Results;
      }
      else {
        if (res.Results && res.Results.length == 0) {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ["SubCategory Not Found. "]);
        }
      }
    },
      err => {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Failed to get SubCategoryList. " + err.ErrorMessage]);
      })
  }
}
