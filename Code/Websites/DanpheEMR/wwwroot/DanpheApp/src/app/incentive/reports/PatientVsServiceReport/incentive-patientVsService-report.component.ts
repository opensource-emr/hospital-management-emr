import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import * as moment from 'moment/moment';
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { DLService } from "../../../shared/dl.service";
import { CoreService } from "../../../core/shared/core.service";
import { IncentiveBLService } from "../../shared/incentive.bl.service";
import { CommonFunctions } from "../../../shared/common.functions";
import { RPT_BIL_IncentiveReportModel } from "../incentive-report.model";


@Component({
  selector: 'PatientVsService',
  templateUrl: './incentive-patientVsService-report.html'
})
export class INCTV_RPT_IncentivePatientVsServiceComponent {


  public curDocReportMain: RPT_BIL_IncentiveReportModel = new RPT_BIL_IncentiveReportModel();
  public allDocterList: any = null;
  public calType: string = "";
  public headerDetail: any = null;
  public currentDate: string = "";
  public selectedEmpName: string = "";
  public reportData: Array<any> = [];

  public allReportData: Array<PatientGroupVM> = [];
  public DocObj: any = { EmployeeId: null, FullName: '' };
  public isDateFormatBS = true;

  public showReport: boolean = false;
  constructor(
    public msgBoxServ: MessageboxService,
    public dlService: DLService,
    public coreService: CoreService,
    public incentiveBLService: IncentiveBLService,
    public changeDetector: ChangeDetectorRef, ) {

    this.LoadCalenderTypes();
    this.LoadDocterList();
    this.currentDate = this.curDocReportMain.fromDate = this.curDocReportMain.toDate = moment().format('YYYY-MM-DD');

  }

  ngOnInit() {

  }

  LoadDocterList() {
    this.incentiveBLService.GetIncentiveApplicableDocterList()
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.allDocterList = res.Results;

        }
      });
  }

  LoadCalenderTypes() {
    let allParams = this.coreService.Parameters;
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

  LoadDocDeptItemSummary() {
    //let srvDept = this.ServDeptName.replace(/&/g, '%26');//this is URL-Encoded value for character  '&'    --see: URL Encoding in Google for details.
    if (this.curDocReportMain.providerId != null && this.curDocReportMain.providerId != 0) {
      this.dlService.Read("/BillingReports/INCTV_DocterItemSummary?FromDate=" + this.curDocReportMain.fromDate + "&ToDate=" + this.curDocReportMain.toDate + "&employeeId=" + this.curDocReportMain.providerId)
        .map(res => res)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.showReport = false;
            this.changeDetector.detectChanges();

            let data = JSON.parse(res.Results.JsonData);
            if (data && data.Table1 && data.Table1[0]) {
              this.reportData = data.Table1;

              this.MapReportData(this.reportData);
              this.finalCalculation();
              this.showReport = true;
            }
            else {
              //this.showReport = false;
              this.msgBoxServ.showMessage("notice-message", ['Data Not Available for Selected Parameters...']);
            }
          }
        });
    }
    else {
      this.showReport = false;
      this.msgBoxServ.showMessage("notice-message", ['Select Doctor to see the report']);
    }
  }


  ExportToExcel(tableId) {
    if (tableId) {
      let workSheetName = 'Incentive Patient Vs Service Report';
      let Heading = 'Incentive Patient Vs Service Report';
      let filename = 'incentivePatientVsServiceReport';
      //NBB-send all parameters for now 
      //need enhancement in this function 
      //here from date and todate for show date range for excel sheet data
      CommonFunctions.ConvertHTMLTableToExcel(tableId, this.curDocReportMain.fromDate, this.curDocReportMain.toDate, workSheetName,
        Heading, filename);
    }
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

  MapReportData(reportData: any) {
    this.allReportData = [];
    let PatientGroup = reportData.map(itm => itm.PatientId).filter((value, index, self) => self.indexOf(value) === index);
    if (PatientGroup) {
      PatientGroup.forEach(i => {
        let tempData = new PatientGroupVM();
        tempData.PatientId = i;
        tempData.report = reportData.filter(t => t.PatientId == i);
        if (tempData.report) {
          tempData.PatientName = tempData.report[0].PatientName;

          tempData.report.forEach(i => {
            tempData.Sub_IncentiveAmount += i.IncentiveAmount;
            tempData.Sub_TDSAmount += i.TDSAmount;
            tempData.Sub_NetPayableAmt += i.NetPayableAmt;
          });
        }

        this.allReportData.push(tempData);
      });

    }
  }

  public tot_IncentiveAmount: number = 0;
  public tot_TDSAmount: number = 0;
  public tot_NetPayable: number = 0;

  public finalCalculation() {
    this.tot_IncentiveAmount = this.tot_TDSAmount = this.tot_NetPayable = 0;
    if (this.reportData) {
      this.reportData.forEach(a => {
        this.tot_IncentiveAmount += a.IncentiveAmount;
        this.tot_TDSAmount += a.TDSAmount;
        this.tot_NetPayable += a.NetPayableAmt;

      });
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
  ChangeDateFormate() {
    this.isDateFormatBS = !this.isDateFormatBS;
  }

  //sud:28May'20--For Reusable From-Date-To-Date component
  OnDateRangeChange($event) {
    if ($event) {
      this.curDocReportMain.fromDate = $event.fromDate;
      this.curDocReportMain.toDate = $event.toDate;
    }
  }

}


export class PatientGroupVM {
  public PatientId: number = null;
  public PatientName: number = null;

  public report: Array<any> = new Array<any>();

  public Sub_IncentiveAmount: number = null;
  public Sub_TDSAmount: number = null;
  public Sub_NetPayableAmt: number = null;


}
