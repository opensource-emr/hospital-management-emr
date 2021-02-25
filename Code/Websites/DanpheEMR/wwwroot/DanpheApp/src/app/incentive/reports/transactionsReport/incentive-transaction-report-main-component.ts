import { Component, Directive, ViewChild, ChangeDetectorRef, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment/moment';
import { DLService } from '../../../shared/dl.service';
import { RPT_BIL_IncentiveReportModel } from '../incentive-report.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { CoreService } from '../../../core/shared/core.service';
import { IncentiveBLService } from '../../shared/incentive.bl.service';


@Component({
  templateUrl: "./incentive-transaction-report-main.html"
})
export class RPT_BIL_IncentiveTransactionReportMainComponent {
  public dlService: DLService = null;
  public http: HttpClient = null;
  public calType: string = "";
  public DocterList: any;
  public DocObj: any = null;
  public showDocSummary: boolean = false;
  public showItemSummary: boolean = false;
  public headerDetail: any = null;
  public curDocReportMain: RPT_BIL_IncentiveReportModel = new RPT_BIL_IncentiveReportModel();
  public selDocReportMain: RPT_BIL_IncentiveReportModel = new RPT_BIL_IncentiveReportModel();

  constructor(
    _http: HttpClient,
    _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public coreservice: CoreService,
    public changeDetector: ChangeDetectorRef,
    public incentiveBLService: IncentiveBLService) {
    this.http = _http;
    this.dlService = _dlService;
    this.LoadCalenderTypes();
    this.LoadDocterList();
    this.curDocReportMain.fromDate = this.curDocReportMain.toDate = moment().format('YYYY-MM-DD');


  }

  //sud:28May'20-removed validation from model, may have some issues. which should be resolved later.
  Load() {
    this.showDocSummary = this.showItemSummary = false;
    this.changeDetector.detectChanges();

    if (this.curDocReportMain.providerId >= 0 && this.curDocReportMain.providerId != null)
      this.selDocReportMain = this.curDocReportMain;
    else {
      this.curDocReportMain.providerId = null;
      this.selDocReportMain = this.curDocReportMain;
    }
    // check if providerId is defined by user or not,
    //if yes, showDeptDocDept=true;  else showDocSummary=true;
    if (this.selDocReportMain.providerId == null) {
      this.showDocSummary = true;
      this.showItemSummary = false;
    }
    else if (this.selDocReportMain.providerId != null) {
      this.showItemSummary = true;
      this.showDocSummary = false;
    }
    this.changeDetector.detectChanges();
  }

  LoadCalenderTypes() {
    let allParams = this.coreservice.Parameters;
    if (allParams.length) {
      let CalParms = allParams.find(a => a.ParameterName == "CalendarTypes" && a.ParameterGroupName == "Common");
      if (CalParms) {
        let Obj = JSON.parse(CalParms.ParameterValue);
        this.calType = Obj.IncentiveModule;
      }
      let HeaderParms = allParams.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader");
      if (HeaderParms) {
        this.headerDetail = JSON.parse(HeaderParms.ParameterValue);
      }
    }
  }



  LoadDocterList() {
    this.incentiveBLService.GetIncentiveApplicableDocterList()
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.allDocterList = res.Results;

          this.filteredDocterList = this.allDocterList;
        }
      });
  }


  CallBackItemSummary() {
    this.showItemSummary = false;
    this.showDocSummary = true;
    this.curDocReportMain.providerId = null;
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



  public allDocterList: any = null;
  public filteredDocterList: any = null;
  public isExternal: boolean = null;

  RadioButtonOnChange($event) {

    this.curDocReportMain.providerId = null;

    switch ($event.target.value) {
      case 'all': {
        this.filteredDocterList = this.allDocterList;
        this.isExternal = null;
        break;
      }
      case 'external': {
        this.filteredDocterList = this.allDocterList.filter(emp => emp.IsExternal == true);
        this.isExternal = true;
        break;
      }
      case 'internal': {
        this.filteredDocterList = this.allDocterList.filter(emp => emp.IsExternal == false);
        this.isExternal = false;
        break;
      }
      default: {
        this.filteredDocterList = this.allDocterList;
        break;
      }
    }
  }

  ChangeDocter(docObj) {
    this.curDocReportMain.providerId = docObj.EmployeeId;
    this.curDocReportMain.DoctorName = docObj.FullName;
  }
  EmployeeListFormatter(data: any): string {
    let html = data["FullName"];
    return html;
  }

  //sud:28May'20--For Reusable From-Date-To-Date component
  OnDateRangeChange($event) {
    if ($event) {
      this.curDocReportMain.fromDate = $event.fromDate;
      this.curDocReportMain.toDate = $event.toDate;
    }
  }
}
