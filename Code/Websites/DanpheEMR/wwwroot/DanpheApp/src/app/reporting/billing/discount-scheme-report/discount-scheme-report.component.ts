import { Component } from '@angular/core';
import * as moment from 'moment/moment';
import { CoreService } from '../../../core/shared/core.service';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { SettingsBLService } from '../../../settings-new/shared/settings.bl.service';
import { CommonFunctions } from '../../../shared/common.functions';
import { NepaliDateInGridParams } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { DLService } from '../../../shared/dl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { DiscountSchemeReport_DTO } from '../../shared/discount-scheme-report.dto';

@Component({
  templateUrl: "./discount-scheme-report.html"
})
export class RPT_BIL_DiscountSchemeReportComponent {
  public dlService: DLService = null;
  public DiscountSchemeGridColumns = [];
  public DiscountSchemeGridData = new Array<DiscountSchemeReport_DTO>();
  public NepaliDateInGridSettings = new NepaliDateInGridParams();
  public toDate: string = '';
  public fromDate: string = '';
  public dateRange: string = '';
  public SchemeList = new Array<{ SchemeId: number, SchemeName: string }>();
  public DiscountScheme = { SchemeId: 0, SchemeName: "" };
  public PatientName = '';

  public summaryFormatted = {
    TotalDepositReceived: 0,
    TotalDepositDeducted: 0,
    TotalDepositReturned: 0,
    Balance: 0
  }


  constructor(
    private _dlService: DLService,
    private _messageBoxService: MessageboxService,
    private _reportService: ReportingService,
    private _settingsBLService: SettingsBLService,
    public coreService: CoreService
  ) {
    this.dlService = _dlService;
    this.DiscountSchemeGridColumns = this._reportService.reportGridCols.DiscountSchemeGridColumns;
    this.LoadSchemeList();
  }

  ngOnInit() {

  }

  public Load(): void {
    let SchemeId = this.DiscountScheme ? this.DiscountScheme.SchemeId : 0;
    this.dlService.Read("/BillingReports/Billing_SchemeWiseDiscountReport?FromDate="
      + this.fromDate + "&ToDate=" + this.toDate + "&SchemeId=" + SchemeId)
      .map(res => res)
      .subscribe(res => this.Success(res),
        res => this.Error(res));
  }

  public Success(res): void {
    if (res.Status === ENUM_DanpheHTTPResponses.OK) {
      let data = res.Results;
      if (data.length > 0) {
        this.DiscountSchemeGridData = data;
        this.DiscountSchemeGridData.forEach(a => {
          a.CashAmount = CommonFunctions.parseAmount(a.CashAmount);
          a.CreditAmount = CommonFunctions.parseAmount(a.CreditAmount);
          a.Total = CommonFunctions.parseAmount(a.Total);
          a.Free_Cons_Amount = CommonFunctions.parseAmount(a.Free_Cons_Amount);
          a.NetRefundAmount = CommonFunctions.parseAmount(a.NetRefundAmount);
          a.DiscountRefund = CommonFunctions.parseAmount(a.DiscountRefund);
          a.NetAmount = CommonFunctions.parseAmount(a.NetAmount);
        });
        this.getSummary(this.DiscountSchemeGridData);
      }
      else {
        this._messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ['No Data is Available Between Selected Parameters...']);
        this.DiscountSchemeGridData = new Array<DiscountSchemeReport_DTO>();
      }
    }
    else {
      this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [res.ErrorMessage]);
    }
  }

  public Error(err): void {
    this._messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [err]);
  }

  public OnFromToDateChange($event): void {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.dateRange = "<b>Date:</b><b>From:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
  }

  gridExportOptions = {
    fileName: 'DepositTransactionReport_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  public LoadSchemeList(): void {
    this._settingsBLService.GetSchemeList()
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.SchemeList = res.Results;
          CommonFunctions.SortArrayOfObjects(this.SchemeList, "SchemeName");
        }
        else {
          alert("Failed ! " + res.ErrorMessage);
        }

      });
  }

  public DiscountSchemeListFormatter(data: any): string {
    let discountScheme = data["SchemeName"];
    return discountScheme;
  }

  getSummary(data: any) {
    // this.summaryFormatted.TotalDepositReturned = 0;
    // this.summaryFormatted.TotalDepositDeducted = 0;
    // this.summaryFormatted.TotalDepositReceived = 0;
    // this.summaryFormatted.Balance = 0;

    // data.forEach(a => {
    //   this.summaryFormatted.TotalDepositReceived += a.DepositReceived;
    //   this.summaryFormatted.TotalDepositDeducted += a.DepositDeducted;
    //   this.summaryFormatted.TotalDepositReturned += a.DepositReturned;
    // });
    // this.summaryFormatted.Balance = this.summaryFormatted.TotalDepositReceived - (this.summaryFormatted.TotalDepositDeducted + this.summaryFormatted.TotalDepositReturned);
  }

}
