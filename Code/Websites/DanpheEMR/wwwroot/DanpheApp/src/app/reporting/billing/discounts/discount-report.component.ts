import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { CommonFunctions } from '../../../shared/common.functions';
import { RPT_BIL_DiscountReportModel } from "./discount-report.model";

import { DLService } from "../../../shared/dl.service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';

import * as moment from 'moment/moment';
import { CoreService } from "../../../core/shared/core.service";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { CoreBLService } from "../../../core/shared/core.bl.service"
import { DanpheCache, MasterType } from '../../../shared/danphe-cache-service-utility/cache-services';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
@Component({
  templateUrl: "./discount-report.html"

})
export class RPT_BIL_DiscountReportComponent {

  public fromDate: string = null;
  public toDate: string = null;
  public dateRange: string = "";

  public CounterId: number = 0;
  public CreatedBy: string = "";
  public tot_Subtotal: number = 0;
  public tot_DiscountAmt: number = 0;
  public tot_Tax: number = 0;
  public tot_TotalAmt: number = 0;
  DiscountReportColumns: Array<any> = null;
  DiscountReportData: Array<any> = new Array<RPT_BIL_DiscountReportModel>();
  dynamicColumns: Array<string> = new Array<string>();
  public currentdiscount: RPT_BIL_DiscountReportModel = new RPT_BIL_DiscountReportModel();
  dlService: DLService = null;
  public counterlist: any;
  public gridExportOptions: any;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  public UserName: any = null;
  public EmployeeList: Array<any> = [];

  public loading: boolean = false;

  constructor(_dlService: DLService, public msgBoxServ: MessageboxService, public reportServ: ReportingService, public coreService: CoreService, public coreBlService: CoreBLService) {
    this.dlService = _dlService;
    this.currentdiscount.fromDate = moment().format('YYYY-MM-DD');
    this.currentdiscount.toDate = moment().format('YYYY-MM-DD');
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("Date", false));
    this.LoadExportOptions();
    this.LoadCounter();
  }


  Load() {
    this.tot_Subtotal = this.tot_DiscountAmt = this.tot_Tax = this.tot_TotalAmt = 0;

    if (this.currentdiscount.fromDate != null && this.currentdiscount.toDate != null) {
      this.dlService.Read("/BillingReports/DiscountReport?FromDate="
        + this.currentdiscount.fromDate + "&ToDate=" + this.currentdiscount.toDate
        + "&CounterId=" + this.currentdiscount.CounterId + "&CreatedBy=" + this.currentdiscount.CreatedBy)
        .map(res => res)
        .finally(() => { this.loading = false; })
        .subscribe(res => this.Success(res),
          res => this.Error(res));
    } else {
      this.msgBoxServ.showMessage("error", ['Dates Provided is not Proper']);
    }
  }
  LoadCounter(): void {
    this.counterlist = DanpheCache.GetData(MasterType.BillingCounter, null);
    // this.coreBlService.GetCounter()
    //     .subscribe(res => {
    //         if (res.Status == "OK") {
    //             this.counterlist = res.Results;
    //         }
    //         else {
    //             this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
    //             console.log(res.ErrorMessage);
    //         }

    //     });
  }
  Success(res) {

    if (res.Status == "OK" && res.Results.length > 0) {
      this.DiscountReportColumns = this.reportServ.reportGridCols.DiscountReport;
      this.DiscountReportData = res.Results;
      //load export options to set frodate and to date as custom headers..
      this.LoadExportOptions();
      this.CalculateSummaryofDifferentColoumnForSum();
    }
    else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("notice-message", ['No Data is Available Between Selected Parameters...'])
      this.DiscountReportColumns = this.reportServ.reportGridCols.DiscountReport;
      this.DiscountReportData = res.Results;
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }

  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err]);
  }

  LoadExportOptions() {

    this.gridExportOptions = {
      fileName: 'DiscountReportList_' + moment().format('YYYY-MM-DD') + '.xls',
      customHeader: "FromDate: " + this.currentdiscount.fromDate + "--ToDate:" + this.currentdiscount.toDate

    };
  }

  //on click grid export button we are catching in component an event.. 
  //and in that event we are calling the server excel export....
  OnGridExport($event: GridEmitModel) {
    this.dlService.ReadExcel("/ReportingNew/ExportToExcelDiscountReport?FromDate="
      + this.currentdiscount.fromDate + "&ToDate=" + this.currentdiscount.toDate
      + "&CounterId=" + this.currentdiscount.CounterId + "&CreatedBy=" + this.currentdiscount.CreatedBy)
      .map(res => res)
      .subscribe(data => {
        let blob = data;
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "DiscountReport_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
        document.body.appendChild(a);
        a.click();
      },

        res => this.ErrorMsg(res));
  }
  ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }

  CalculateSummaryofDifferentColoumnForSum() {

    this.DiscountReportData.forEach(SumVariable => {
      this.tot_Subtotal += SumVariable.Price;
      this.tot_DiscountAmt += SumVariable.DiscountAmount;
      this.tot_Tax += SumVariable.Tax
      this.tot_TotalAmt += SumVariable.TotalAmount

    }
    );
    this.tot_Subtotal = CommonFunctions.parseAmount(this.tot_Subtotal);
    this.tot_DiscountAmt = CommonFunctions.parseAmount(this.tot_DiscountAmt);
    this.tot_Tax = CommonFunctions.parseAmount(this.tot_Tax);
    this.tot_TotalAmt = CommonFunctions.parseAmount(this.tot_TotalAmt);

  }

  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.currentdiscount.fromDate = this.fromDate;
    this.currentdiscount.toDate = this.toDate;
    this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
  }

  UserListFormatter(data: any): string {
    let html = data["ItemName"];
    return html;
  }
}
