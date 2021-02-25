import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { DLService } from "../../../shared/dl.service"
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import * as moment from 'moment/moment';
import { HandOverModel } from '../../../billing/shared/hand-over.model';
import { BillingBLService } from '../../../billing/shared/billing.bl.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { HandoverDenominationVM } from './HandoverDenominationVM.model';
import { Employee } from '../../../employee/shared/employee.model';
import { CommonFunctions } from "../../../shared/common.functions";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
@Component({
  selector: 'denomination-report',
  templateUrl: "./bil-denomination-report.html"

})
export class RPT_BIL_BilDenominationReportComponent {
  public fromDate: string = null;
  public toDate: string = null;
  public selUser: any = null;
  public userList: Array<any>;
  BilDenominationColumns: Array<any> = null;
  BilDenominationReportData: Array<HandoverDenominationVM> = new Array<HandoverDenominationVM>();
  public currentDenominationReport: HandoverDenominationVM = new HandoverDenominationVM();
  dlService: DLService = null;
  public DoctorsList: Array<any> = [];
  uId: any;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  constructor(
    _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService,
    public billingBLService: BillingBLService) {
    this.BilDenominationColumns = this.reportServ.reportGridCols.HandoverDenominationReport;
    this.dlService = _dlService;
    this.currentDenominationReport.fromDate = moment().format('YYYY-MM-DD');
    this.currentDenominationReport.toDate = moment().format('YYYY-MM-DD');
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("CreatedOn", false));
    this.GetUsersList();
    this.LoadAllLHandoverList();
  }
  ShowGridDetail() {
    let UserId = this.uId;
    if (UserId) {
      this.Load();
    }
    else {
      this.LoadAllLHandoverList();
    }
  }

  Load() {
    let UserId = this.uId;
    if (this.currentDenominationReport.fromDate != null && this.currentDenominationReport.toDate != null) {
      this.dlService.Read("/BillingReports/BilDenominationReport?FromDate=" + this.currentDenominationReport.fromDate +
        "&ToDate=" + this.currentDenominationReport.toDate +
        "&UserId=" + UserId)
        .map(res => res)
        .subscribe(res => this.Success(res),
          res => this.Error(res));
    }
    else {
      this.msgBoxServ.showMessage("error", ['Dates Provided is not Proper']);
    }
  }

  LoadAllLHandoverList() {
    if (this.currentDenominationReport.fromDate != null && this.currentDenominationReport.toDate != null) {
      this.dlService.Read("/BillingReports/BilDenominationReportAllList?FromDate=" + this.currentDenominationReport.fromDate +
        "&ToDate=" + this.currentDenominationReport.toDate)
        .map(res => res)
        .subscribe(res => this.Success(res),
          res => this.Error(res));
    }
    else {
      this.msgBoxServ.showMessage("error", ['Dates Provided is not Proper']);
    }
  }

  Error(err) {
    this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
  }

  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {
      this.BilDenominationColumns = this.reportServ.reportGridCols.HandoverDenominationReport;
      this.BilDenominationReportData = res.Results;
    }
    else if (res.Status == "OK" && res.Results.length == 0) {
      //this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates'])
      this.BilDenominationColumns = this.reportServ.reportGridCols.HandoverDenominationReport;
      this.BilDenominationReportData = res.Results;
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage])
    }
  }

  ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }

  public GetUsersList() {
    this.billingBLService.GetUserList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          if (res.Results.length) {
            this.userList = res.Results;
            CommonFunctions.SortArrayOfObjects(this.userList, "ShortName");//this sorts the empRoleList by EmployeeRoleName.
          }

        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to get deposit detail"]);
          console.log(res.ErrorMessage);
        }
      });
  }

  myListFormatter(data: any): string {
    let html = data["ShortName"] + "&nbsp;&nbsp;" + "(<i>" + data["DepartmentName"] + "</i>)" + "&nbsp;&nbsp;";
    //let html = data["UserName"];
    return html;
  }

  SelectedUser() {
    let user = null;
    // check if user has given proper input string for item name
    //or has selected object properly from the dropdown list.
    if (this.selUser) {
      if (typeof (this.selUser) == 'string' && this.userList) {
        user = this.userList.find(a => a.ShortName.toLowerCase() == this.selUser.toLowerCase());
      }
      else if (typeof (this.selUser) == 'object')
        user = this.selUser;
      if (user) {
        this.uId = user.UserId;
        this.selUser = user.ShortName;
      }
    }
    //else {
    //  this.msgBoxServ.showMessage("failed", ["no data found."]);
    //}
  }

  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.currentDenominationReport.fromDate = this.fromDate;
    this.currentDenominationReport.toDate = this.toDate;
  }
}






