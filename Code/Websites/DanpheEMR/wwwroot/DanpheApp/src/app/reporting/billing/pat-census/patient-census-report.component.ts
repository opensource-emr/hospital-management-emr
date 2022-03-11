import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../shared/reporting-service";
import { DLService } from "../../../shared/dl.service";
import { HttpClient } from '@angular/common/http';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { RPT_BIL_PatientCensusReport } from './patient-census.model';
import { CoreService } from '../../../core/shared/core.service';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { CommonFunctions } from '../../../shared/common.functions';

@Component({
  templateUrl: "./patient-census-report.html"
})
export class RPT_BIL_PatientCensusReportComponent {
  public dlService: DLService = null;
  public http: HttpClient = null;
  public fromDate: string = null;
  public toDate: string = null;
  public providerId: number = null;
  public departmentId: number = null;
  public currentDate: string = "";
  public calType: string = "";
  public showReport: boolean = false;
  public headerDetail: any = null;
  public PatientCensusReportColumns: Array<any> = new Array<any>();
  public ReportData: Array<any> = new Array<any>();
  public doctorList: any;
  public departmentList: any;
  public depositsummary: any = null;
  public headerDetailParam = { "showPANNo": false, "showPhoneNumber": false };
  public headerProperties: any;
  public paramData = null;
  public paramExportToExcelData = null;
  public summary: any = {
    tot_Count: 0, tot_Amount: 0, tot_UnConfCount: 0, tot_UnConfAmt: 0,
    tot_ConfCount: 0, tot_ConfAmt: 0, tot_TotalCount: 0, tot_TotalAmount: 0
  };
  public currentPatCensusReport: RPT_BIL_PatientCensusReport = new RPT_BIL_PatientCensusReport();
  public loading: boolean = false;

  constructor(
    _http: HttpClient,
    _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService,
    public coreService: CoreService,
    public coreservice: CoreService) {
    this.http = _http;
    this.dlService = _dlService;
    this.LoadHeaderDetailsCalenderTypes();
    this.LoadDoctorList();
    this.LoadDepartmentList();
    this.currentPatCensusReport.fromDate = moment().format('YYYY-MM-DD');
    this.currentPatCensusReport.toDate = moment().format('YYYY-MM-DD');
    this.currentDate = moment().format('YYYY-MM-DD');
  }

  ngAfterViewInit() {
    //this.GridPrintAndExportSetting();
  }

  LoadDoctorList() {
    this.dlService.Read("/BillingReports/GetDoctorList")
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.doctorList = res.Results;
        }
      });
  }

  LoadDepartmentList() {
    this.dlService.Read("/BillingReports/GetDepartmentList")
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.departmentList = res.Results;
        }
      });
  }

  Load() {
    for (var i in this.currentPatCensusReport.PatientCensusValidator.controls) {
      this.currentPatCensusReport.PatientCensusValidator.controls[i].markAsDirty();
      this.currentPatCensusReport.PatientCensusValidator.controls[i].updateValueAndValidity();
    }
    if (this.currentPatCensusReport.fromDate != null && this.currentPatCensusReport.toDate != null) {
      this.fromDate = this.currentPatCensusReport.fromDate;
      this.toDate = this.currentPatCensusReport.toDate;
      this.providerId = this.currentPatCensusReport.providerId;
      this.departmentId = this.currentPatCensusReport.departmentId;
      this.dlService.Read("/BillingReports/PatientCensusReport?FromDate=" + this.fromDate + "&ToDate=" + this.toDate + "&ProviderId=" + this.providerId + "&DepartmentId=" + this.departmentId)
        .map(res => res)
        .finally(() => { this.loading = false; })
        .subscribe(res => this.Success(res),
          err => this.Error(err));
    }
    else {
      this.msgBoxServ.showMessage("notice-message", ["dates are not proper."]);
    }
  }

  Success(res) {
    if (res.Status == "OK" && res.Results.JsonData) {
      let data = JSON.parse(res.Results.JsonData);
      if (data.ReportData.length > 0) {
        //this.ReportData = data.ReportData;
        this.MapReportData(data.ReportData);
        this.SummaryCalculation(data.ReportData);
        this.showReport = true;
      }
    }
    else if (res.Status == "OK") {
      this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates']);
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
  }

  Error(err) {
    this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
  }

  LoadHeaderDetailsCalenderTypes() {
    let allParams = this.coreservice.Parameters;
    if (allParams.length) {
      let CalParms = allParams.find(a => a.ParameterName == "CalendarTypes" && a.ParameterGroupName == "Common");
      if (CalParms) {
        let Obj = JSON.parse(CalParms.ParameterValue);
        this.calType = Obj.PatientCensusReport;
      }
      let HeaderParms = allParams.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader");
      if (HeaderParms) {
        this.headerDetail = JSON.parse(HeaderParms.ParameterValue);
        let header = allParams.find(a => a.ParameterGroupName == 'BillingReport' && a.ParameterName == 'TableExportSetting');
        if (header) {
          this.headerProperties = JSON.parse(header.ParameterValue)["PatientCensusReport"];
        }
      }
    }
  }

  MapReportData(rprtData: Array<any>) {
    this.ReportData = [];
    let docNameList = rprtData.map(itm => itm.Provider).filter((value, index, self) => self.indexOf(value) === index);
    if (docNameList) {
      docNameList.forEach(i => {
        let docData = rprtData.filter(a => a.Provider == i);
        this.ReportData.push({ Provider: i, Data: docData });
      });
    }
  }

  SummaryCalculation(Data: Array<any>) {
    //initializing all counts to zero
    this.summary.tot_Count = this.summary.tot_Amount = this.summary.tot_UnConfCount = this.summary.tot_UnConfAmt =
      this.summary.tot_ConfCount = this.summary.tot_ConfAmt = this.summary.tot_TotalCount = this.summary.tot_TotalAmount = 0;

    Data.forEach(a => {
      this.summary.tot_Count += (a.totC1 - a.retC1);
      this.summary.tot_Amount += (a.totA1 - a.retA1);
      this.summary.tot_UnConfCount += (a.totC2);
      this.summary.tot_UnConfAmt += (a.totA2);
      this.summary.tot_ConfCount += (a.totC3 - a.retC3);
      this.summary.tot_ConfAmt += (a.totA3 - a.retA3);
      this.summary.tot_TotalCount += a.totTC;
      this.summary.tot_TotalAmount += a.totTA;
    });

    this.summary.tot_Count = CommonFunctions.parseAmount(this.summary.tot_Count);
    this.summary.tot_Amount = CommonFunctions.parseAmount(this.summary.tot_Amount);
    this.summary.tot_UnConfCount = CommonFunctions.parseAmount(this.summary.tot_UnConfCount);
    this.summary.tot_UnConfAmt = CommonFunctions.parseAmount(this.summary.tot_UnConfAmt);
    this.summary.tot_ConfCount = CommonFunctions.parseAmount(this.summary.tot_ConfCount);
    this.summary.tot_ConfAmt = CommonFunctions.parseAmount(this.summary.tot_ConfAmt);
    this.summary.tot_TotalCount = CommonFunctions.parseAmount(this.summary.tot_TotalCount);
    this.summary.tot_TotalAmount = CommonFunctions.parseAmount(this.summary.tot_TotalAmount);
  }

  Print() {
    let popupWinindow;
    var printContents = document.getElementById("printPage").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    let documentContent = "<html><head>";
    documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../../themes/theme-default/DanphePrintStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../../themes/theme-default/DanpheStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
    documentContent += '</head>';
    documentContent += '<body onload="window.print()">' + printContents + '</body></html>'
    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();
  }

  // ExportToExcel() {
  //   let summaryData = JSON.stringify(this.depositsummary);
  //   this.dlService.ReadExcel("/ReportingNew/ExportToExcelPatientCensus?FromDate=" + this.fromDate + "&ToDate=" + this.toDate
  //     + "&providerId=" + this.providerId)
  //     .map(res => res)
  //     .subscribe(data => {
  //       let blob = data;
  //       let a = document.createElement("a");
  //       a.href = URL.createObjectURL(blob);
  //       a.download = "PatientCensusReport_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
  //       document.body.appendChild(a);
  //       a.click();
  //     },
  //       err => this.ErrorMsg(err));
  // }

  ExportToExcel(tableId) {
    if (tableId) {
      let workSheetName = 'Patient Census Report';
      var Heading;
      var phoneNumber;
      if (this.headerProperties.HeaderTitle != null) {
        Heading = this.headerProperties.HeaderTitle;
      } else {
        Heading = 'PATIENT CENSUS REPORT';
      }

      let filename = 'PatinetCensusReport';
      var hospitalName;
      var address;
      if (this.headerProperties.ShowHeader == true) {
        hospitalName = this.headerDetail.hospitalName;
        address = this.headerDetail.address;
      } else {
        hospitalName = null;
        address = null;
      }

      if (this.headerProperties.ShowPhone == true) {
        phoneNumber = this.headerDetail.tel;
      } else {
        phoneNumber = null;
      }
      //NBB-send all parameters for now 
      //need enhancement in this function 
      //here from date and todate for show date range for excel sheet data
      CommonFunctions.ConvertHTMLTableToExcelForBilling(tableId, this.fromDate, this.toDate, workSheetName,
        Heading, filename, hospitalName, address, phoneNumber, this.headerProperties.ShowHeader, this.headerProperties.ShowDateRange);
    }

  }


  ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }

  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.currentPatCensusReport.fromDate = this.fromDate;
    this.currentPatCensusReport.toDate = this.toDate;
  }

  // private GridPrintAndExportSetting(){
  //   var x=this.coreservice.Parameters.find(p => p.ParameterGroupName == "BillingReport" && p.ParameterName == "BillingReportPrintSetting");
  //   if(x!=null)
  //   var printSettingParameter = JSON.parse(x.ParameterValue);

  //       var y=this.coreservice.Parameters.find(p => p.ParameterGroupName == "BillingReport" && p.ParameterName == "BillingReportGridExportToExcelSetting");
  // 	if(y!=null)
  // 	var exportToExcelSettingParameter = JSON.parse(y.ParameterValue);

  // 	if(!!printSettingParameter || !!exportToExcelSettingParameter){
  //        this.paramData=null;
  //        this.paramExportToExcelData=null;
  // 	  if(!!printSettingParameter) 
  // 	  this.paramData=printSettingParameter["BillItemSummaryReport"];
  //           if(exportToExcelSettingParameter)
  //           this.paramExportToExcelData = exportToExcelSettingParameter["BillItemSummaryReport"];
  //   }
  // }

  // private GetHeaderDetailsParam(){
  //         var headerParamValue = this.coreService.Parameters.find(a => a.ParameterGroupName == "BillingReport" && a.ParameterName == "BillingReportHeader");
  //         if(headerParamValue!=null){
  //           var paramValue = headerParamValue.ParameterValue;
  //           if(paramValue){
  //             var headerParams = JSON.parse(paramValue);
  //             this.headerDetailParam.showPANNo = headerParams.showPan;
  //             this.headerDetailParam.showPhoneNumber = headerParams.showPhoneNumber;
  //           }
  //         }
  //       }
}
