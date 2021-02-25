import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { RPT_BIL_DoctorReferralModel } from "./doctor-referral.model"
import { DLService } from "../../../shared/dl.service"
import { HttpClient } from '@angular/common/http';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import * as moment from 'moment/moment';

@Component({
  templateUrl: "./doctor-referral.html"
})
export class RPT_BIL_DoctorReferralComponent {
  public fromDate: string = null;
  public toDate: string = null;
  public selProvider: any = null;
  public doctorList: any;
  DoctorReferralColumns: Array<any> = null;
  DoctorReferralData: Array<any> = new Array<RPT_BIL_DoctorReferralModel>();
  public currentdoctorreferral: RPT_BIL_DoctorReferralModel = new RPT_BIL_DoctorReferralModel();
  public showRefDetail: boolean = false;
  public selReferalItem: any;

  constructor(
    public http: HttpClient,
    public dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService) {
    this.currentdoctorreferral.fromDate = moment().format('YYYY-MM-DD');
    this.currentdoctorreferral.toDate = moment().format('YYYY-MM-DD');
    this.loadDoctorsList();
  }

  Load() {
    if (this.currentdoctorreferral.fromDate != null && this.currentdoctorreferral.toDate != null) {
      this.dlService.Read("/BillingReports/DoctorReferral?FromDate="
        + this.currentdoctorreferral.fromDate + "&ToDate=" + this.currentdoctorreferral.toDate + "&ProviderName=" + this.currentdoctorreferral.ProviderName)
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
      this.DoctorReferralColumns = this.reportServ.reportGridCols.DoctorReferral;
      this.DoctorReferralData = res.Results;
    }
    else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("notice-message", ['No Data is Available Between Selected Parameters....Try Different Dates'])
      this.DoctorReferralColumns = this.reportServ.reportGridCols.DoctorReferral;
      this.DoctorReferralData = res.Results;
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
  }

  ReferralGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "details":
        {
          //cloning the object inorder to change the reference from original object, to avoid changing the original object.
          this.selReferalItem = Object.create($event.Data);
          this.showRefDetail = true;

          break;
        }
      default:
        break;
    }
  }

  HideReferralDetail() {
    this.showRefDetail = false;
  }

  gridExportOptions = {
    fileName: 'DoctorReferrals_' + moment().format('YYYY-MM-DD') + '.xls',
    //displayColumns: ['Date', 'Doctor', 'Department', 'Total']
  };

  //on click grid export button we are catching in component an event.. 
  //and in that event we are calling the server excel export....
  OnGridExport($event: GridEmitModel) {
    this.dlService.ReadExcel("/ReportingNew/ExportToExcelDoctorReferral?FromDate="
      + this.currentdoctorreferral.fromDate + "&ToDate=" + this.currentdoctorreferral.toDate + "&ProviderName=" + this.currentdoctorreferral.ProviderName)
      .map(res => res)
      .subscribe(data => {
        let blob = data;
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "DoctorReferral_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
        document.body.appendChild(a);
        a.click();
      },
        res => {
          console.log(res);
        });
  }

  loadDoctorsList() {
    this.dlService.Read("/BillingReports/GetDoctorList")
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.doctorList = res.Results;
        }
      });
  }

  myListFormatter(data: any): string {
    let html = data["FullName"];
    return html;
  }

  providerChanged() {
    this.currentdoctorreferral.ProviderName = this.selProvider ? this.selProvider.FirstName + ' ' + this.selProvider.LastName : "";
  }
  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.currentdoctorreferral.fromDate = this.fromDate;
    this.currentdoctorreferral.toDate = this.toDate;
  }
}
