import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { NepaliDateInGridParams } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import * as moment from 'moment/moment';
import { DLService } from '../../../shared/dl.service';
import { DanpheCache } from '../../../shared/danphe-cache-service-utility/cache-services';
import { MasterType } from '../../../shared/danphe-cache-service-utility/cache-services';
import { User } from '../../../security/shared/user.model';
import { CommonFunctions } from '../../../shared/common.functions';
import { SecurityService } from '../../../security/shared/security.service';
import { SettingsBLService } from '../../../settings-new/shared/settings.bl.service';
import { CoreService } from '../../../core/shared/core.service';

@Component({
  templateUrl: "./discount-scheme-report.html"
})
export class RPT_BIL_DiscountSchemeReportComponent {
  dlService: DLService = null;

  public DiscountSchemeGridColumns: Array<any> = [];
  public DiscountSchemeGridData: Array<any> = new Array<any>();
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  public toDate: string = '';
  public fromDate: string = '';
  public dateRange: string = '';

  public DiscountSchemeList: Array<User> = new Array<User>();
  public DiscountScheme: any = null;
  public PatientName = '';

  public summaryFormatted = {
    TotalDepositReceived: 0,
    TotalDepositDeducted: 0,
    TotalDepositReturned: 0,
    Balance: 0
  }


  constructor(_dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService,
    public securityService: SecurityService,
    public settingsBLService: SettingsBLService,
    public coreService: CoreService) {
    this.dlService = _dlService;
    this.DiscountSchemeGridColumns = this.reportServ.reportGridCols.DiscountSchemeGridColumns;
    this.LoadDiscountScheme();
  }

  ngOnInit() {

  }

  Load() {
    var membershipTypeId = this.DiscountScheme ? this.DiscountScheme.MembershipTypeId : 0;
    this.dlService.Read("/BillingReports/Billing_SchemeWiseDiscountReport?FromDate="
      + this.fromDate + "&ToDate=" + this.toDate +  "&MembershipTypeId=" + membershipTypeId)
      .map(res => res)
      .subscribe(res => this.Success(res),
        res => this.Error(res));


  }

  Success(res) {
    if (res.Status == "OK") {
      let data = res.Results;
      if (data.length > 0) {
        
        this.DiscountSchemeGridData = data;
        this.getSummary(this.DiscountSchemeGridData);
      }
      else {
        this.msgBoxServ.showMessage("notice-message", ['No Data is Available Between Selected Parameters...']);
      }
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err]);
  }

  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.dateRange = "<b>Date:</b><b>From:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
  }


  gridExportOptions = {
    fileName: 'DepositTransactionReport_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  LoadDiscountScheme() {
    this.settingsBLService.GetDiscountScheme()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.DiscountSchemeList = res.Results;
          CommonFunctions.SortArrayOfObjects(this.DiscountSchemeList, "MembershipTypeName");
          //this.CurrentUser = this.securityService.loggedInUser.Employee.FullName;

        }
        else {
          alert("Failed ! " + res.ErrorMessage);
        }

      });
  }

  DiscountSchemeListFormatter(data: any): string {
    var discountScheme = data["MembershipTypeName"] + ' (' + data["DiscountPercent"] + ')';
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
