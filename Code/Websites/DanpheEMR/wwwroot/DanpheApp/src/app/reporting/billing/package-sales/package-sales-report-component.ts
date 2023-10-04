import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { RPT_BIL_PackageSalesModel } from "./package-sales.model"
import * as moment from 'moment/moment';
import { DLService } from "../../../shared/dl.service"
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({
  templateUrl: "./package-sales-report.html"
})
export class RPT_BIL_PackageSalesReportComponent {

  public FromDate: string = null;
  public ToDate: string = null;
  public showSticker: boolean = false;
  public billingTransactionId = 0;

  PackageSalesDetailsColumns: Array<any> = null;
  PackageSalesDetailsData: Array<any> = new Array<RPT_BIL_PackageSalesModel>();
  public currentPackageSales: RPT_BIL_PackageSalesModel = new RPT_BIL_PackageSalesModel();
  dlService: DLService = null;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  constructor(_dlService: DLService, public msgBoxServ: MessageboxService, public reportServ: ReportingService) {
    this.dlService = _dlService;
    this.currentPackageSales.FromDate = moment().format('YYYY-MM-DD');
    this.currentPackageSales.ToDate = moment().format('YYYY-MM-DD');
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("IssuedDate", false));
  }


  gridExportOptions = {
    fileName: 'PackageSalesList_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  Load() {
    if (this.currentPackageSales.FromDate != null && this.currentPackageSales.ToDate != null) {
      this.dlService.Read("/BillingReports/PackageSalesDetail?FromDate="
        + this.currentPackageSales.FromDate + "&ToDate=" + this.currentPackageSales.ToDate)
        .map(res => res)
        .subscribe(res => this.Success(res),
          res => this.Error(res));
    } else {
      this.msgBoxServ.showMessage("error", ['Dates Provided is not Proper']);
    }


  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err.ErrorMessage]);


  }
  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {
      this.PackageSalesDetailsColumns = this.reportServ.reportGridCols.PackageSalesReport;
      this.PackageSalesDetailsData = res.Results;
    }
    else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected Parameters...Try Different'])
      this.PackageSalesDetailsColumns = this.reportServ.reportGridCols.PackageSalesReport;
      this.PackageSalesDetailsData = res.Results;
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }

  }
  //Grid actions fires this method
  PackageSaleGridActions($event: GridEmitModel) {
    try {
      switch ($event.Action) {
        case "sticker": {
          if ($event.Data != null) {
            this.billingTransactionId = $event.Data.BillingTransactionId;
            this.showSticker = true;

          }
          break;
        }
        default:
          break;
      }
    }
    catch (exception) {
      this.ErrorMsg(exception);
    }
  }

  //on click grid export button we are catching in component an event.. 
  //and in that event we are calling the server excel export....
  OnGridExport($event: GridEmitModel) {
    this.dlService.ReadExcel("/ReportingNew/ExportToExcelPackageSalesReport?FromDate="
      + this.currentPackageSales.FromDate + "&ToDate=" + this.currentPackageSales.ToDate)
      .map(res => res)
      .subscribe(data => {
        let blob = data;
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "PackageSalesDetail_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
        document.body.appendChild(a);
        a.click();
      },

        res => this.ErrorMsg(res));
  }
  ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }

  AfterStickerPrintAction() {
    /////passing empty event to reusable component 
  }
  Close() {
    this.showSticker = false;
  }
  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.FromDate = $event ? $event.fromDate : this.FromDate;
    this.ToDate = $event ? $event.toDate : this.ToDate;

    this.currentPackageSales.FromDate = this.FromDate;
    this.currentPackageSales.ToDate = this.ToDate;
  }
}
