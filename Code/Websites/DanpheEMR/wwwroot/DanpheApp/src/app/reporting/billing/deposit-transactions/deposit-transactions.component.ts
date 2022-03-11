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
  templateUrl: "./deposit-transactions.html"
})
export class RPT_BIL_DepositTransactionComponent {
  dlService: DLService = null;

  DepositTransactionsColumns: Array<any> = [];
  DepositTransactionsData: Array<any> = new Array<any>();
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  public counterlist: any;
  public toDate: string = '';
  public fromDate: string = '';
  public dateRange: string = '';

  public userList: Array<User> = new Array<User>();
  public SelectedUser: any = null;
  public PatientName = '';

  public summaryFormatted = {
    TotalDepositReceived: 0,
    TotalDepositDeducted: 0,
    TotalDepositReturned: 0,
    Balance: 0
  }
  public loading: boolean = false;

  constructor(_dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService,
    public securityService: SecurityService,
    public settingsBLService: SettingsBLService,
    public coreService: CoreService) {
    this.dlService = _dlService;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("DepositDate", false));
    this.LoadCounter();
    this.LoadUser();
  }

  ngOnInit() {

  }


  Load() {
    var patname = this.PatientName;
    var employeeId = this.SelectedUser ? this.SelectedUser.EmployeeId : 0;
    this.dlService.Read("/BillingReports/Billing_DepositTransationsReport?FromDate="
      + this.fromDate + "&ToDate=" + this.toDate + "&patSearchText=" + patname + "&employeeId=" + employeeId)
      .map(res => res)
      .finally(()=>{this.loading=false;})
      .subscribe(res => this.Success(res),
        res => this.Error(res));


  }
  LoadCounter(): void {
    this.counterlist = DanpheCache.GetData(MasterType.BillingCounter, null);
  }
  Success(res) {
    if (res.Status == "OK") {
      let data = res.Results;
      if (data.length > 0) {
        this.DepositTransactionsColumns = this.reportServ.reportGridCols.DepositTransactionsColumns;
        this.DepositTransactionsData = data;
        this.getSummary(this.DepositTransactionsData);
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

  LoadUser() {
    this.settingsBLService.GetUserList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.userList = res.Results;
          CommonFunctions.SortArrayOfObjects(this.userList, "EmployeeName");
          //this.CurrentUser = this.securityService.loggedInUser.Employee.FullName;

        }
        else {
          alert("Failed ! " + res.ErrorMessage);
        }

      });
  }

  UserListFormatter(data: any): string {
    return data["EmployeeName"];
  }

  getSummary(data: any) {
    this.summaryFormatted.TotalDepositReturned = 0;
    this.summaryFormatted.TotalDepositDeducted = 0;
    this.summaryFormatted.TotalDepositReceived = 0;
    this.summaryFormatted.Balance = 0;

    data.forEach(a => {
      this.summaryFormatted.TotalDepositReceived += a.DepositReceived;
      this.summaryFormatted.TotalDepositDeducted += a.DepositDeducted;
      this.summaryFormatted.TotalDepositReturned += a.DepositReturned;
    });
    this.summaryFormatted.Balance = this.summaryFormatted.TotalDepositReceived - (this.summaryFormatted.TotalDepositDeducted + this.summaryFormatted.TotalDepositReturned);
  }
}
