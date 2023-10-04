import { Component, ChangeDetectorRef } from "@angular/core";
import * as moment from 'moment/moment';
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { CoreService } from "../../../core/shared/core.service";
import { DLService } from "../../../shared/dl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { BillingGridColumnSettings } from "../../shared/billing-grid-columns";
import { BillingBLService } from "../../shared/billing.bl.service";
import { BillingFiscalYear } from "../../shared/billing-fiscalyear.model";

@Component({
  templateUrl: './bill-denomination-summary-reports.html'
})

export class BillingDenominationSummaryReportComponent {

  public HandOverSummaryReportGridColumns: Array<any> = [];
  public HandOverSummaryReportList: Array<any> = [];
  public summaryFormatted = {
    PreviousDueAmount: 0,
    CollectionTillDate: 0,
    HandoverTillDate: 0,
    DueAmount: 0,
    ReceivePendingAmount: 0,
    TotalDueAmount:0
  }
  public footer: any = null;
  public billing: string = "billing";
  public allFiscalYrs: Array<BillingFiscalYear> = [];
  public selFiscYrId: number = 5;//remove this hardcode later

  constructor(public billingBLService: BillingBLService,
    public dLService: DLService,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService) {
    this.HandOverSummaryReportGridColumns = BillingGridColumnSettings.HandOverSummaryReportList;
    this.GetAllFiscalYrs();
    this.SetCurrentFiscalYear();

  }

  ngOnInit() {
    this.loadHandoverSummaryReport();
  }

  ngAfterViewChecked() {
    var myElement = document.getElementById("summaryFooter");
    if (myElement) {
      this.footer = document.getElementById("summaryFooter").innerHTML;
    }

  }

  loadHandoverSummaryReport() {
    this.billingBLService.GetHandoverSummaryReport(this.selFiscYrId)
      .subscribe(
        res => {
          if (res.Status == "OK") {
            //this.HandOverSummaryReportList = res.Results
            this.getSummary(res.Results);
            let reportList = Object.assign([], res.Results);
            reportList.forEach(r => {
              r.CollectionTillDate = +r.CollectionTillDate.toFixed(4);
              r.HandoverTillDate = +r.HandoverTillDate.toFixed(4);
              r.DueAmount = +r.DueAmount.toFixed(4);
            });
            this.HandOverSummaryReportList = reportList;
          }
          else {
            this.msgBoxServ.showMessage("failed", ["Something Wrong."]);
            console.log(res.ErrorMessage);
          }
        });
  }
  getSummary(data: any) {
    this.summaryFormatted.PreviousDueAmount = data.reduce(function (acc, obj) { return acc + obj.PreviousDueAmount; }, 0);
    this.summaryFormatted.CollectionTillDate = data.reduce(function (acc, obj) { return acc + obj.CollectionTillDate; }, 0);
    this.summaryFormatted.HandoverTillDate = data.reduce(function (acc, obj) { return acc + obj.HandoverTillDate; }, 0);
    this.summaryFormatted.DueAmount = data.reduce(function (acc, obj) { return acc + obj.DueAmount; }, 0);
    this.summaryFormatted.ReceivePendingAmount = data.reduce(function(acc, obj){ return acc + obj.ReceivePendingAmount; }, 0);
    this.summaryFormatted.TotalDueAmount = data.reduce(function(acc, obj){ return acc + obj.TotalDueAmount; }, 0);
  }

  gridExportOptions = {
    fileName: 'HandoverSummaryReport_' + moment().format('YYYY-MM-DD') + '.xls'
  };


  GetAllFiscalYrs() {
    this.billingBLService.GetAllFiscalYears()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.allFiscalYrs = res.Results;
        }
      });
  }
  SetCurrentFiscalYear() {
    //We may do this in client side itself since we already have list of all fiscal years with us. [Part of optimization.]
    this.billingBLService.GetCurrentFiscalYear()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          let fiscYr: BillingFiscalYear = res.Results;
          if (fiscYr) {
            this.selFiscYrId = fiscYr.FiscalYearId;
          }
        }
      });
  }
}
