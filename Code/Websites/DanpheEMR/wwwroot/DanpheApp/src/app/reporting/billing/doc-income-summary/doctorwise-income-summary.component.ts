import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../shared/reporting-service";
import { DLService } from "../../../shared/dl.service";
import { HttpClient } from '@angular/common/http';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { CoreService } from '../../../core/shared/core.service';
import { RPT_BIL_DoctorwiseIncomeSummaryModel } from './doctorwise-income-summary.model';
import * as moment from 'moment/moment';
import { CommonFunctions } from "../../../shared/common.functions";
@Component({
  templateUrl: "./doctorwise-income-summary.html"
})
export class RPT_BIL_DoctorwiseIncomeSummaryComponent {
    public dlService: DLService = null;
    public http: HttpClient = null;
    public fromDate: string = "";
    public toDate: string = "";
    public currentDate: string = "";
    public calType: string = "";
    public showReport: boolean = false;
    public headerDetail: any = null;
    public reportData: Array<any> = new Array<any>();
    public doctorList: any;
    public providerId: number = 0;
    public selDoctor: any = "";
    public currentDrIncome: RPT_BIL_DoctorwiseIncomeSummaryModel = new RPT_BIL_DoctorwiseIncomeSummaryModel();
    public summary: any = {
        tot_SubTotal: 0, tot_Discount: 0, tot_Refund: 0, tot_Provisonal: 0,
        tot_Cancel: 0, tot_Credit: 0, tot_NetTotal: 0, tot_SalesTotal: 0, tot_CashCollection: 0
    };
    public headerProperties:any;

    constructor(
        _http: HttpClient,
        _dlService: DLService,
        public msgBoxServ: MessageboxService,
        public reportServ: ReportingService,
        public coreservice: CoreService) {
        this.http = _http;
        this.dlService = _dlService;
        this.LoadHeaderDetailsCalenderTypes();
        this.LoadDoctorList();
        this.currentDrIncome.fromDate = moment().format('YYYY-MM-DD');
        this.currentDrIncome.toDate = moment().format('YYYY-MM-DD');
        this.currentDate = moment().format('YYYY-MM-DD');
    }

    LoadDoctorList() {
        this.dlService.Read("/BillingReports/GetDoctorList")
            .map(res => res)
            .subscribe(res => {
                if (res.Status == "OK") {
                  this.doctorList = res.Results;
                  var noDoctor = { "EmployeeId": 0, "FullName": "No Doctor" };
                  this.doctorList.splice(0, 0, noDoctor);
                }
            });
    }

    Load() {
        for (var i in this.currentDrIncome.DoctorwisIncomeSummaryReportValidator.controls) {
            this.currentDrIncome.DoctorwisIncomeSummaryReportValidator.controls[i].markAsDirty();
            this.currentDrIncome.DoctorwisIncomeSummaryReportValidator.controls[i].updateValueAndValidity();
      }
      if (this.currentDrIncome.fromDate != null && this.currentDrIncome.toDate != null) {
            this.fromDate = this.currentDrIncome.fromDate;
            this.toDate = this.currentDrIncome.toDate;
            this.providerId = this.currentDrIncome.providerId;
            this.dlService.Read("/BillingReports/DoctorwiseIncomeSummaryOPIP?FromDate=" + this.fromDate + "&ToDate=" + this.toDate + "&ProviderId=" + this.providerId)
                .map(res => res)
                .subscribe(res => this.Success(res),
                    err => this.Error(err));
        }
        else {
            this.msgBoxServ.showMessage("notice-message", ["dates are not proper."]);
        }
    }
    myListFormatter(data: any): string {
    let html = data["FullName"];
    return html;
    }
    Success(res) {
        if (res.Status == "OK") {
            let data = JSON.parse(res.Results.JsonData);
            if (data.ReportData.length > 0) {
                this.reportData = data.ReportData;
                this.CalculateSummaryAmounts();
                this.summary.tot_Provisonal = data.Summary[0].ProvisionalAmount;
                this.summary.tot_Cancel = data.Summary[0].CancelledAmount;
                this.summary.tot_Credit = data.Summary[0].CreditAmount;
                this.summary.tot_SalesTotal = CommonFunctions.parseAmount(this.summary.tot_NetTotal - this.summary.tot_Provisonal);
                this.summary.tot_CashCollection = CommonFunctions.parseAmount(this.summary.tot_NetTotal + data.Summary[0].AdvanceReceived - data.Summary[0].AdvanceSettled - this.summary.tot_Credit - this.summary.tot_Provisonal);
                this.showReport = true;
            }
            else {
                this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates']);
            }
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
                this.calType = Obj.DoctorwiseIncomeSummary;
            }
            let HeaderParms = allParams.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader");
            if (HeaderParms) {
                this.headerDetail = JSON.parse(HeaderParms.ParameterValue);
                let header = allParams.find(a => a.ParameterGroupName == 'BillingReport' && a.ParameterName == 'TableExportSetting');
                if(header){
                    this.headerProperties = JSON.parse(header.ParameterValue)["DoctorwiseIncomeSummary"];
                }
            }
        }
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
    //     this.dlService.ReadExcel("/ReportingNew/ExportToExcelDoctorwiseIncomeSummary?FromDate="
    //         + this.fromDate + "&ToDate=" + this.toDate)
    //         .map(res => res)
    //         .subscribe(data => {
    //             let blob = data;
    //             let a = document.createElement("a");
    //             a.href = URL.createObjectURL(blob);
    //             a.download = "DoctorwiseIncomeSummary_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
    //             document.body.appendChild(a);
    //             a.click();
    //         },
    //             err => this.ErrorMsg(err));
    // }
    ExportToExcel(tableId){
        if(tableId){
          let workSheetName = 'Doctor wise income summary Report';
          //let Heading = 'Doctor Wise Income Summary';
          let filename = 'DoctorWiseIncomeSummary';
          var Heading;
          var phoneNumber;
          var hospitalName;
          var address;
          if(this.headerProperties.HeaderTitle!=null){
            Heading = this.headerProperties.HeaderTitle;
          }else{
            Heading = 'Doctor Wise Income Summary';
          }
    
          if(this.headerProperties.ShowHeader == true){
             hospitalName = this.headerDetail.hospitalName;
             address = this.headerDetail.address;
          }else{
            hospitalName = null;
            address = null;
          }
    
          if(this.headerProperties.ShowPhone == true){
            phoneNumber = this.headerDetail.tel; 
          }else{
            phoneNumber = null;
          }
        //   let hospitalName = this.headerDetail.hospitalName;
        //   let address = this.headerDetail.address;
          //NBB-send all parameters for now 
          //need enhancement in this function 
          //here from date and todate for show date range for excel sheet data
          CommonFunctions.ConvertHTMLTableToExcelForBilling(tableId, this.fromDate, this.toDate, workSheetName,
            Heading, filename, hospitalName,address,phoneNumber,this.headerProperties.ShowHeader,this.headerProperties.ShowDateRange);
        }
        
      }

    ErrorMsg(err) {
        this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
        console.log(err.ErrorMessage);
  }
    doctorChanged() {
      this.currentDrIncome.providerId = this.selDoctor ? this.selDoctor.EmployeeId : null;
    }

    CalculateSummaryAmounts() {
        this.summary.tot_SubTotal = this.summary.tot_Discount = this.summary.tot_Refund = this.summary.tot_NetTotal = this.summary.tot_Credit = this.summary.tot_Provisional = this.summary.tot_Cancel = 0;

        this.reportData.forEach(a => {
            this.summary.tot_SubTotal += (a.IP_Collection + a.OP_Collection);
            this.summary.tot_Discount += (a.IP_Discount + a.OP_Discount);
            this.summary.tot_Refund += (a.IP_Refund + a.OP_Refund);
            this.summary.tot_NetTotal += (a.IP_NetTotal + a.OP_NetTotal);
        });

        this.summary.tot_SubTotal = CommonFunctions.parseAmount(this.summary.tot_SubTotal);
        this.summary.tot_Discount = CommonFunctions.parseAmount(this.summary.tot_Discount);
        this.summary.tot_Refund = CommonFunctions.parseAmount(this.summary.tot_Refund);
        this.summary.tot_NetTotal = CommonFunctions.parseAmount(this.summary.tot_NetTotal);
  }
  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.currentDrIncome.fromDate = this.fromDate;
    this.currentDrIncome.toDate = this.toDate;
  }
}
