import { Component, ChangeDetectorRef } from "@angular/core";
import * as moment from 'moment/moment';
import { CoreService } from "../../../core/shared/core.service";
import { DLService } from "../../../shared/dl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { NepaliDateInGridColumnDetail } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { NepaliDateInGridParams } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { BillingGridColumnSettings } from "../../shared/billing-grid-columns";
import { BillingBLService } from "../../shared/billing.bl.service";

@Component({
  templateUrl: './bill-denomination-reports.html'
})
export class BillingDenominationReportComponent {

  public FromDate: string = null;
  public ToDate: string = null;
  public dateRange: string = "";

  public HandOverReportGridColumns: Array<any> = [];
  public HandOverReportList: Array<any> = [];
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public summaryFormatted = {
    GrossHandOver: 0,
    GrossDueAmount: 0
  }
  public footer: any = null;
  public billing: string = "billing";

  constructor(public billingBLService: BillingBLService,
    public dLService: DLService,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService) {
    this.HandOverReportGridColumns = BillingGridColumnSettings.HandOverReportList;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('VoucherDate', false));
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('ReceivedOn', true));
    this.FromDate = moment().format('YYYY-MM-DD');
    this.ToDate = moment().format('YYYY-MM-DD');
  }

  ngOnInit() {
    //this.loadHandoverReport();
  }

  ngAfterViewChecked() {
    var myElement = document.getElementById("summaryFooter");
    if (myElement) {
      this.footer = document.getElementById("summaryFooter").innerHTML;
    }

  }
  loadHandoverReport() {
    if (this.FromDate && this.ToDate && (moment(this.FromDate).isBefore(this.ToDate) || moment(this.FromDate).isSame(this.ToDate))) {
      this.dateRange = "<b>Date:</b>&nbsp;" + this.FromDate + "&nbsp;<b>To</b>&nbsp;" + this.ToDate;
      this.billingBLService.GetHandoverReceivedReport(this.FromDate, this.ToDate)
        .subscribe(
          res => {
            if (res.Status == "OK") {
              this.HandOverReportList = res.Results;
              // if(this.HandOverReportList && this.HandOverReportList.length>0){
              //   this.HandOverReportList.forEach(itm=>{
              //   });
              // }
              this.getSummary(res.Results);
            }
            else {
              this.msgBoxServ.showMessage("failed", ["Something Wrong."]);
              console.log(res.ErrorMessage);
            }
          });
    }
  }
  getSummary(data: any) {
    this.summaryFormatted.GrossHandOver = data.reduce(function (acc, obj) { return acc + obj.HandoverAmount; }, 0);
    this.summaryFormatted.GrossDueAmount = data.reduce(function (acc, obj) { return acc + obj.DueAmount; }, 0);
  }

  OnDateRangeChange($event) {
    if ($event) {
      this.FromDate = $event.fromDate;
      this.ToDate = $event.toDate;
    }
    //this.loadHandoverReport();
  }

  gridExportOptions = {
    fileName: 'ReceiveTransactionReport_' + moment().format('YYYY-MM-DD') + '.xls'
  };
}
