import { Component, Directive, ViewChild, ChangeDetectorRef, Input } from '@angular/core';
import { ReportingService } from "../../shared/reporting-service";
import { DLService } from "../../../shared/dl.service";
import { HttpClient } from '@angular/common/http';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { CoreService } from '../../../core/shared/core.service';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { RPT_BIL_BilRefMainModel } from './bill-referral-main.model';
import { CommonFunctions } from '../../../shared/common.functions';
//import { RPT_BIL_BilDocMainModel } from './bill-doc-main.model';

@Component({
  templateUrl: "./bill-referral-report-main.html"
})
export class RPT_BIL_ReferralSummaryMainComponent {
  public dlService: DLService = null;
  public http: HttpClient = null;
  public calType: string = "";
  public ReferralList: any;
  public showRefSummary: boolean = false;
  public showItemSummary: boolean = false;
  public headerDetail: any = null;
  public selReferrer: any = "";
  public curRefReportMain: RPT_BIL_BilRefMainModel = new RPT_BIL_BilRefMainModel();
  public selRefReportMain: RPT_BIL_BilRefMainModel = new RPT_BIL_BilRefMainModel();

  constructor(
    _http: HttpClient,
    _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService,
    public coreservice: CoreService, public changeDetector: ChangeDetectorRef) {
    this.http = _http;
    this.dlService = _dlService;
    this.LoadCalenderTypes();
    this.LoadReferralList();
    this.curRefReportMain.fromDate = this.curRefReportMain.toDate = moment().format('YYYY-MM-DD');
   

  }

  Load() {
    this.showRefSummary = this.showItemSummary = false;
    this.changeDetector.detectChanges();
    for (var i in this.curRefReportMain.BilRefMainReportValidator.controls) {
      this.curRefReportMain.BilRefMainReportValidator.controls[i].markAsDirty();
      this.curRefReportMain.BilRefMainReportValidator.controls[i].updateValueAndValidity();
    }
    if (this.curRefReportMain.fromDate != null && this.curRefReportMain.toDate != null) {
      if (this.curRefReportMain.providerId >= 0 && this.curRefReportMain.providerId != null)
        this.selRefReportMain = this.curRefReportMain;
      else {
        this.curRefReportMain.providerId = null;
        this.selRefReportMain = this.curRefReportMain;
      }
      // check if providerId is defined by user or not,
      //if yes, showDeptRefDept=true;  else showRefSummary=true;
      if (this.selRefReportMain.providerId == null) {
        this.showRefSummary = true;
        this.showItemSummary = false;
      }
      else if (this.selRefReportMain.providerId != null) {
        this.showItemSummary = true;
        this.showRefSummary = false;
      }
      this.changeDetector.detectChanges();
    }
    else {
      this.msgBoxServ.showMessage("notice-message", ["dates are not proper."]);
    }
  }

  LoadCalenderTypes() {
    let allParams = this.coreservice.Parameters;
    if (allParams.length) {
      let CalParms = allParams.find(a => a.ParameterName == "CalendarTypes" && a.ParameterGroupName == "Common");
      if (CalParms) {
        let Obj = JSON.parse(CalParms.ParameterValue);
        this.calType = Obj.DoctorSummary;
      }
      let HeaderParms = allParams.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader");
      if (HeaderParms) {
        this.headerDetail = JSON.parse(HeaderParms.ParameterValue);
      }
    }
  }



  LoadReferralList() {
    this.dlService.Read("/BillingReports/GetReferralList")
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.allReferrerList = res.Results;
          var noReferrer =  { "EmployeeId":0, "FullName":"No Referrer" };
          this.allReferrerList.splice(0, 0, noReferrer);
          this.filteredReferrerList = this.allReferrerList;
          CommonFunctions.SortArrayOfObjects(this.filteredReferrerList, "FirstName");//this sorts the filteredReferrerList by ERefererFirstName.
        }
      });
  }


  CallBackItemSummary() {
    this.showItemSummary = false;
    this.showRefSummary = true;
    this.curRefReportMain.providerId = null;
    this.changeDetector.detectChanges();
  }


  Print() {
    let popupWinindow;
    var printContents = document.getElementById("printPage").innerHTML;
    var HeaderContent = document.getElementById("headerForPrint").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    let documentContent = "<html><head>";
    documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../../themes/theme-default/DanphePrintStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../../themes/theme-default/DanpheStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
    documentContent += '</head><style> .non-printable { visibility: hidden; }</style>';
    documentContent += '<body onload="window.print()">' + HeaderContent + printContents + '</body></html>'
    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();
  }



  public allReferrerList: Array<any> = null;
  public filteredReferrerList: any = null;
  public isExternal: boolean = null;

  
  myListFormatter(data: any): string {
    if (data.FullName == "No Referrer") {
      let html = data["FullName"]; return html;
    }
    if (data.IsExternal) {
      let html = data["FullName"] + " (External)"; return html;
    }
    else {
      let html = data["FullName"] + " (Internal)";
    return html;
    }
  }
  referrerChanged() {
    this.curRefReportMain.providerId = this.selReferrer ? this.selReferrer.EmployeeId : null;
  }
  RadioButtonOnChange($event) {

    this.curRefReportMain.providerId = null;

    switch ($event.target.value) {
      case 'all': {
        this.filteredReferrerList = this.allReferrerList;
        this.isExternal = null;
        break;
      }
      case 'external': {
        this.isExternal = true;
        this.filteredReferrerList = this.allReferrerList.filter(emp => emp.IsExternal == true);
        var noReferrer = { "EmployeeId": 0, "FullName": "No Referrer" };
        this.filteredReferrerList.splice(0, 0, noReferrer);
        break;
      }
      case 'internal': {
        this.isExternal = false;
        this.filteredReferrerList = this.allReferrerList.filter(emp => emp.IsExternal == false);
        var noReferrer = { "EmployeeId": 0, "FullName": "No Referrer" };
        this.filteredReferrerList.splice(0, 0, noReferrer);
        break; 
      }
      default: {
        this.filteredReferrerList = this.allReferrerList; 
        break;
      }
    }
  }

  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.curRefReportMain.fromDate = $event.fromDate;
    this.curRefReportMain.toDate = $event.toDate;
  }
}
