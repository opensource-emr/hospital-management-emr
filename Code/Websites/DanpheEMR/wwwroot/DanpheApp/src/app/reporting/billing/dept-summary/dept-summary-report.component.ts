import { Component, Directive, ViewChild, ChangeDetectorRef } from '@angular/core';
import { DLService } from "../../../shared/dl.service";
import { HttpClient } from '@angular/common/http';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { CoreService } from '../../../core/shared/core.service';
import { RPT_BIL_DepartmentSummaryReportModel } from './dept-summary-report.model';
import { CommonFunctions } from '../../../shared/common.functions';
@Component({
  templateUrl: "./dept-summary-report.html"
})
export class RPT_BIL_DepartmentSummaryComponent {
  public dlService: DLService = null;
  public http: HttpClient = null;
  public calType: string = "";
  public showAllDeptSummary: boolean = false;
  public showDeptSummary: boolean = false;
  public headerDetails: any = null;
  public reportData: Array<any> = [];
  public servDeptsList: any = null;
  public selServDept: any = null;
  public showBackBtn: boolean = false;
  public currentDate: string = "";
  public selBillingTypeName: string = "all";
  public summary = {
    tot_SubTotal: 0, tot_Discount: 0, tot_NetSales: 0,
    tot_Credit: 0, tot_SalesReturn: 0, tot_CashSales: 0,
    tot_ReturnDiscount: 0, tot_CashSaleDiscount: 0, tot_ReturnCashSales: 0,
    tot_ReturnCashDiscount: 0, tot_NetCashSales: 0,
    tot_DepositRecived: 0, tot_DepositRefunded: 0, tot_DepositDeducted: 0,
    tot_CollectionFromRecivables: 0, tot_CashSettlementDiscount: 0,
    tot_NetCashCollection: 0
  };

  public currentModel: RPT_BIL_DepartmentSummaryReportModel = new RPT_BIL_DepartmentSummaryReportModel();
  public selectedModel: RPT_BIL_DepartmentSummaryReportModel = new RPT_BIL_DepartmentSummaryReportModel();
  public headerProperties: any;

  public loading: boolean = false;

  constructor(
    _http: HttpClient,
    _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public coreservice: CoreService,
    public changeDetector: ChangeDetectorRef) {
    this.dlService = _dlService;
    this.LoadHeaderCalenderDetails();
    //this.LoadDeptList();
    this.currentModel.fromDate = this.currentModel.toDate = this.currentDate = moment().format('YYYY-MM-DD');
  }

  Load() {
    this.showAllDeptSummary = this.showDeptSummary = false;
    this.changeDetector.detectChanges();
    for (var i in this.currentModel.BillDeptSummaryValidator.controls) {
      this.currentModel.BillDeptSummaryValidator.controls[i].markAsDirty();
      this.currentModel.BillDeptSummaryValidator.controls[i].updateValueAndValidity();
    }
    if (this.currentModel.fromDate != null && this.currentModel.toDate != null) {
      //assigning selectedmodel values with currentmodel values
      this.selectedModel.fromDate = this.currentModel.fromDate;
      this.selectedModel.toDate = this.currentModel.toDate;
      //this.selectedModel.ServiceDepartmentName = this.currentModel.ServiceDepartmentName;
      //checking if servDeptName is given by user or not (taking call accordingly)
      // if (this.selectedModel.ServiceDepartmentName.length > 0) {
      //     this.showBackBtn = false;
      //     this.showDeptSummary = true;
      // }
      // else {

      ///called /BillingReports/IncomeSegregationStaticReport to use same data source of Current Income Segregation Report.
      this.dlService.Read("/BillingReports/DepartmentSummaryReport?FromDate=" + this.selectedModel.fromDate
        + "&ToDate=" + this.selectedModel.toDate + "&billingType=" + this.selBillingTypeName)
        .map(res => res)
        .finally(() => { this.loading = false; })
        .subscribe(res => {
          if (res.Status == "OK") {
            let data = res.Results;
            //JSON.parse(res.Results.JsonData);
            if (data.DepartmentSummary && data.DepartmentSummary.length > 0) {
              this.reportData = data.DepartmentSummary;
              this.CalculateSummaryAmounts(this.reportData, data.DepositInfo, data.SettlementInfo);
              this.showAllDeptSummary = true;
            }
            else {
              this.msgBoxServ.showMessage("notice-message", ['No Data is Available for Selected Parameters...']);
            }
          }
          else {
            this.msgBoxServ.showMessage("notice-message", ["dates are not proper."]);
          }
        });
      //}
    }
  }

  // public ExportToExcelBilDeptSummary() {
  //     this.dlService.ReadExcel("/ReportingNew/ExportToExcelBilDeptSummary?FromDate=" + this.selectedModel.fromDate
  //         + "&ToDate=" + this.selectedModel.toDate)
  //         .map(res => res)
  //         .subscribe(data => {
  //             let blob = data;
  //             let a = document.createElement("a");
  //             a.href = URL.createObjectURL(blob);
  //             a.download = "BilDeptSummaryReport_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
  //             document.body.appendChild(a);
  //             a.click();
  //         },
  //             err => this.ErrorMsg(err));
  // }



  ExportToExcelBilDeptSummary(tableId) {
    if (tableId) {
      let workSheetName = 'Department Summary Report';
      //let Heading = 'DEPARTMENT SUMMARY REPORT';
      let filename = 'DepartmentSummaryReport';
      var Heading;
      var phoneNumber;
      var hospitalName;
      var address;
      if (this.headerProperties.HeaderTitle != null) {
        Heading = this.headerProperties.HeaderTitle;
      } else {
        Heading = 'DEPARTMENT SUMMARY REPORT';
      }

      if (this.headerProperties.ShowHeader == true) {
        hospitalName = this.headerDetails.hospitalName;
        address = this.headerDetails.address;
      } else {
        hospitalName = null;
        address = null;
      }

      if (this.headerProperties.ShowPhone == true) {
        phoneNumber = this.headerDetails.tel;
      } else {
        phoneNumber = null;
      }
      //   let hospitalName = this.headerDetails.hospitalName;
      //   let address = this.headerDetails.address;
      //NBB-send all parameters for now 
      //need enhancement in this function 
      //here from date and todate for show date range for excel sheet data
      CommonFunctions.ConvertHTMLTableToExcelForBilling(tableId, this.currentModel.fromDate, this.currentModel.toDate, workSheetName,
        Heading, filename, hospitalName, address, phoneNumber, this.headerProperties.ShowHeader, this.headerProperties.ShowDateRange);
    }

  }

  public ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }

  //calendertypes and header from parameter table
  public LoadHeaderCalenderDetails() {
    let allParams = this.coreservice.Parameters;
    if (allParams.length) {
      let CalParms = allParams.find(a => a.ParameterName == "CalendarTypes" && a.ParameterGroupName == "Common");
      if (CalParms) {
        let Obj = JSON.parse(CalParms.ParameterValue);
        this.calType = Obj.DepartmentSummary;
      }
      let HeaderParms = allParams.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader");
      if (HeaderParms) {
        this.headerDetails = JSON.parse(HeaderParms.ParameterValue);
        let header = allParams.find(a => a.ParameterGroupName == 'BillingReport' && a.ParameterName == 'TableExportSetting');
        if (header) {
          this.headerProperties = JSON.parse(header.ParameterValue)["DepartmentSummary"];
        }
      }
    }
  }
  //getting service departments name from FN_BIL_GetTxnItemsInfoWithDateSeparation
  // public LoadDeptList() {
  //     this.dlService.Read("/BillingReports/LoadDeptListFromFN")
  //         .map(res => res)
  //         .subscribe(res => {
  //             if (res.Status == "OK") {
  //               this.servDeptsList = res.Results;
  //               CommonFunctions.SortArrayOfObjects(this.servDeptsList, "ServiceDepartmentName");//this sorts the servDeptsList by ServiceDepartmentName.
  //             }
  //             else
  //                 this.msgBoxServ.showMessage('notice-message', ["Failed to load Service departments"]);
  //         });
  // }

  // myListFormatter(data: any): string {
  //     let html = data["ServiceDepartmentName"];
  //     return html;
  // }

  // public ServDeptChanged() {
  //     this.currentModel.ServiceDepartmentName = this.selServDept ? this.selServDept.ServiceDepartmentName : "";
  // }

  public CallBackFromDeptItem() {
    this.showDeptSummary = false;
    this.showAllDeptSummary = true;
    this.changeDetector.detectChanges();
  }

  public LoadDeptItems(row) {
    this.selectedModel.ServiceDepartmentName = row.ServDeptName;
    this.showAllDeptSummary = false;
    this.showBackBtn = true;
    this.showDeptSummary = true;
    this.changeDetector.detectChanges();
  }

  public CalculateSummaryAmounts(data, depositInfo, settlementInfo) {
    //initailize to zero
    this.summary.tot_SubTotal = this.summary.tot_CashSales = this.summary.tot_NetSales = this.summary.tot_SalesReturn = this.summary.tot_Credit
      = this.summary.tot_ReturnDiscount = this.summary.tot_Discount = this.summary.tot_CashSaleDiscount = this.summary.tot_ReturnCashSales =
      this.summary.tot_ReturnCashDiscount = this.summary.tot_NetCashSales = this.summary.tot_DepositRecived = this.summary.tot_DepositDeducted =
      this.summary.tot_DepositRefunded = this.summary.tot_CollectionFromRecivables = this.summary.tot_CashSettlementDiscount = this.summary.tot_CashSettlementDiscount = 0;

    data.forEach(a => {
      this.summary.tot_CashSales += a.CashSales;
      this.summary.tot_Credit += a.CreditSales;
      this.summary.tot_SubTotal += a.GrossSales;
      this.summary.tot_Discount += a.TotalDiscount;
      this.summary.tot_SalesReturn += a.TotalSalesReturn;
      this.summary.tot_ReturnDiscount += a.TotalReturnDiscount;
      this.summary.tot_NetSales += a.NetSales;

      this.summary.tot_CashSaleDiscount += a.CashDiscount;
      this.summary.tot_ReturnCashSales += a.ReturnCashSales;
      this.summary.tot_ReturnCashDiscount += a.ReturnCashDiscount;

    });
    if (depositInfo.length > 0) {
      depositInfo.forEach(a => {
        this.summary.tot_DepositDeducted += a.Tot_DepositDeduct;
        this.summary.tot_DepositRecived += a.Tot_DepReceived;
        this.summary.tot_DepositRefunded += a.Tot_DepReturned;
      });
    }
    if (settlementInfo.length > 0) {
      settlementInfo.forEach(a => {
        this.summary.tot_CollectionFromRecivables += a.CollectionFromRecivables
        this.summary.tot_CashSettlementDiscount += a.CashSettlementDiscount;
      });
    }


    this.summary.tot_NetCashSales = this.summary.tot_CashSales - this.summary.tot_CashSaleDiscount - this.summary.tot_ReturnCashSales + this.summary.tot_ReturnCashDiscount;
    this.summary.tot_NetCashCollection = this.summary.tot_NetCashSales + this.summary.tot_DepositRecived - this.summary.tot_DepositDeducted - this.summary.tot_DepositRefunded
      + this.summary.tot_CollectionFromRecivables - this.summary.tot_CashSettlementDiscount;
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

  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.currentModel.fromDate = $event.fromDate;
    this.currentModel.toDate = $event.toDate;
  }
}
