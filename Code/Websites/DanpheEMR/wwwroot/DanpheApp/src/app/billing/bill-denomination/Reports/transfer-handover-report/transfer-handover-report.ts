import { Component } from "@angular/core";
import * as moment from 'moment/moment';
import { MessageboxService } from "../../../../shared/messagebox/messagebox.service";
import { NepaliDateInGridColumnDetail } from "../../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { NepaliDateInGridParams } from "../../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { BillingGridColumnSettings } from "../../../shared/billing-grid-columns";
import { BillingBLService } from "../../../shared/billing.bl.service";
import { ENUM_DanpheHTTPResponseText, ENUM_DateTimeFormat, ENUM_HandOver_Type, ENUM_MessageBox_Status } from "../../../../shared/shared-enums";

@Component({
  templateUrl: "./transfer-handover-report.html"
})
export class TransferHandoverReportComponent {

  public FromDate: string = null;
  public ToDate: string = null;
  public dateRange: string = "";
  public HandOverReportGridColumns: Array<any> = [];
  public HandOverReportList: [] = [];
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public billing: string = "billing";
  public status: string = "all";
  public handoverType: string = "all";

  constructor(public billingBLService: BillingBLService,public msgBoxServ: MessageboxService) {
    this.HandOverReportGridColumns = BillingGridColumnSettings.UserwiseHandoverReportList;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('HandoverDate', true));
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('ReceivedDate', true));
    this.FromDate = moment().format(ENUM_DateTimeFormat.Year_Month_Day);
    this.ToDate = moment().format(ENUM_DateTimeFormat.Year_Month_Day);
  }

  ngOnInit() {

  }

  LoadReport() {
    if (this.FromDate && this.ToDate && (moment(this.FromDate).isBefore(this.ToDate) || moment(this.FromDate).isSame(this.ToDate))) {
      this.dateRange = `<b>Date:</b>&nbsp;${this.FromDate}&nbsp;<b>To</b>&nbsp;${this.ToDate}`;
      this.billingBLService.GetTransferHandoverReceivedReport(this.FromDate, this.ToDate,this.status,this.handoverType)
        .subscribe(
          res => {
            if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
              this.HandOverReportList = res.Results;
            }
            else {
              this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Something Wrong."]);
            }
          });
    }
  }

  OnDateRangeChange($event) {
    if ($event) {
      this.FromDate = $event.fromDate;
      this.ToDate = $event.toDate;
    }
  }

  gridExportOptions = {
    fileName: `TransferHandoverReport_${ moment().format(ENUM_DateTimeFormat.Year_Month_Day) }.xls`
  };
}
