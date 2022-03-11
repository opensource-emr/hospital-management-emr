import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../shared/reporting-service";
import { DLService } from "../../../shared/dl.service";
import { HttpClient } from '@angular/common/http';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { CoreService } from '../../../core/shared/core.service';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { RPT_BIL_DailyMISReportModel } from './daily-mis-report.model';
import { CommonFunctions } from '../../../shared/common.functions';

@Component({
  templateUrl: "./daily-mis-report.html"
})
export class RPT_BIL_DailyMISReportComponent {
  public dlService: DLService = null;
  public http: HttpClient = null;
  public currentDate: string = "";
  public calType: string = "";
  public showDetailedReport: boolean = false;
  public showSummaryReport: boolean = false;
  public headerDetail: any = null;
  public allReportData: Array<SubTotalVM> = [];
  public unpaidItems: Array<SubTotalVM> = [];//sud: 30Aug'18
  public paidItems: Array<SubTotalVM> = [];//sud:30Aug'18
  public unpaidTotal: number = 0;//sud:30Aug (Now we'll add only totalamount of unpaid items.ie. status having: provisional, unpaid, credit, etc.)

  public drPatientCounts: any = [];
  public filteredReportData: MISreportVM = new MISreportVM();
  public curDailyMIS: RPT_BIL_DailyMISReportModel = new RPT_BIL_DailyMISReportModel();
  public selDailyMIS: RPT_BIL_DailyMISReportModel = new RPT_BIL_DailyMISReportModel();
  public dailyMISreportData: MISreportVM = new MISreportVM();
  public dailyMISsummaryData: Array<MISreportSummaryVM> = [];
  public healthCardData: Array<any> = [];
  public labData: Array<any> = [];
  public radiologyData: Array<any> = [];
  public healthClinicData: Array<any> = [];
  public OTData: Array<any> = [];
  public laborData: Array<any> = [];
  public IPDData: Array<any> = [];
  public otherServiceDept: Array<any> = [];
  public pharmacyData: Array<any> = [];
  public totalOPD: TotalVM = new TotalVM();
  public totalHealthCard: TotalVM = new TotalVM();
  public totalOT: TotalVM = new TotalVM();
  public totalHealthClinic: TotalVM = new TotalVM();
  public totalBilling: number = 0;
  public totalPharmacy: number = 0;
  public headerProperties:any;
  public loading: boolean = false;

  constructor(
    _http: HttpClient,
    _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService,
    public coreservice: CoreService) {
    this.http = _http;
    this.dlService = _dlService;
    this.LoadHeaderDetailsCalenderTypes();
    this.curDailyMIS.fromDate = this.curDailyMIS.toDate = this.currentDate = moment().format('YYYY-MM-DD');
  }

  Load() {
    for (var i in this.curDailyMIS.DailyMISReportValidator.controls) {
      this.curDailyMIS.DailyMISReportValidator.controls[i].markAsDirty();
      this.curDailyMIS.DailyMISReportValidator.controls[i].updateValueAndValidity();
    }
    if (this.curDailyMIS.fromDate != null && this.curDailyMIS.toDate != null) {
      this.selDailyMIS.fromDate = this.curDailyMIS.fromDate;
      this.selDailyMIS.toDate = this.curDailyMIS.toDate;
      this.dlService.Read("/BillingReports/DailyMISReport?FromDate=" + this.selDailyMIS.fromDate + "&ToDate=" + this.selDailyMIS.toDate)
        .map(res => res)
        .finally(() => { this.loading = false; })
        .subscribe(res => {
          this.Success(res);
        },
          err => {
            this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
          });
    }
    else {
      this.msgBoxServ.showMessage("notice-message", ["dates are not proper."]);
    }
  }

  Success(res) {
    if (res.Status == "OK" && res.Results.JsonData) {
      let data = JSON.parse(res.Results.JsonData);

      this.allReportData = data.ReportData;
      this.drPatientCounts = data.OPDData;
      this.drPatientCounts = this.drPatientCounts.filter(a => a.ProviderName != 'NoDoctor');
      this.healthCardData = data.HealthCardData;
      this.labData = data.LabData;
      this.radiologyData = data.RadiologyData;
      this.healthClinicData = data.HealthClinicData;
      this.OTData = data.OTData;
      this.laborData = data.LaborData;
      this.IPDData = data.IPDData;
      this.otherServiceDept = data.OtherServiceDept;
      this.pharmacyData = data.PharmacyData;

      this.CalculateTotal();
      //this.GetDoctorPatientCount();
      //this.allReportData = res.Results;
      this.dailyMISreportData = new MISreportVM();
      this.filteredReportData = new MISreportVM();
      this.dailyMISsummaryData = [];
      //sud: 30Aug'18: For now items other than provisional are paid..<NEEDS REVISION> 
      this.paidItems = this.allReportData.filter(itm => itm.billStatus != "provisional" && itm.billStatus != 'credit' && itm.billStatus != 'unpaid' && itm.billStatus != 'cancelled');
      this.unpaidItems = this.allReportData.filter(itm => itm.billStatus == "provisional" || itm.billStatus == 'credit' || itm.billStatus == 'unpaid' || itm.billStatus == 'cancelled');
      this.MapReportData_Paid(this.paidItems);
      this.MapReportData_Provisional(this.unpaidItems);
      this.showDetailedReport = false;
      this.showSummaryReport = true;
    }
    else if (res.Status == "OK") {
      this.msgBoxServ.showMessage("notice-message", ['Data is Not Available for Selected date...Try Different Date.']);
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
  }

  //Error(err) {

  //}

  //GetDoctorPatientCount() {
  //    this.drPatientCounts = [];
  //    this.dlService.Read("/BillingReports/DoctorPatientCount?FromDate=" + this.selDailyMIS.fromDate + "&ToDate=" + this.selDailyMIS.toDate)
  //        .map(res => res)
  //        .subscribe(res => {
  //            if (res.Status == "OK") {
  //                this.drPatientCounts = res.Results;
  //            }
  //        });
  //}
  CalculateTotal() {
    let count = 0;
    let amount = 0;
    let provisional = 0;
    let credit = 0;

    this.drPatientCounts.forEach(a => {
      count += a.Count;
      amount += a.TotalAmount;
    });
    this.totalOPD.count = count;
    this.totalOPD.amount = amount;

    count = 0;
    amount = 0;
    this.healthCardData.forEach(a => {
      count += a.Count;
      amount += a.TotalAmount;
    });
    this.totalHealthCard.count = count;
    this.totalHealthCard.amount = amount;


    count = 0;
    amount = 0;
    provisional = 0;
    credit = 0;

    this.OTData.forEach(a => {
      count += a.Quantity;
      amount += a.TotalAmount;
      provisional += a.Prov_Amount;
      credit += a.Credit_Amount;
    });
    this.totalOT.count = count;
    this.totalOT.amount = amount;
    this.totalOT.provAmount = provisional;
    this.totalOT.creditAmount = credit;

    count = 0;
    amount = 0;
    this.healthClinicData.forEach(a => {
      count += a.Unit;
      amount += a.TotalAmount;
    });
    this.totalHealthClinic.count = count;
    this.totalHealthClinic.amount = amount;

    amount = 0;
    this.otherServiceDept.forEach(a => {
      amount += a.TotalAmount
    });
    this.totalBilling = amount;
    this.totalPharmacy = this.pharmacyData.find(a => a.Type == 'Total').TotalAmount;
    //calculation for labordata total
    if (this.laborData.length > 0) {
      let tempLaborData = CommonFunctions.getGrandTotalData(this.laborData)[0];
      tempLaborData.ItemName = "Total";
      this.laborData.push(tempLaborData);
    }
  }
  LoadHeaderDetailsCalenderTypes() {
    let allParams = this.coreservice.Parameters;
    if (allParams.length) {
      let CalParms = allParams.find(a => a.ParameterName == "CalendarTypes" && a.ParameterGroupName == "Common");
      if (CalParms) {
        let Obj = JSON.parse(CalParms.ParameterValue);
        this.calType = Obj.DailyMISReport;
      }
      let HeaderParms = allParams.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader");
      if (HeaderParms) {
        this.headerDetail = JSON.parse(HeaderParms.ParameterValue);
        let header = allParams.find(a => a.ParameterGroupName == 'BillingReport' && a.ParameterName == 'TableExportSetting');
        if(header){
          this.headerProperties = JSON.parse(header.ParameterValue)["DailyMISReport"];
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
    documentContent += '</head><style> .table > tbody > tr > td, .table > tbody > tr > th, .table > tfoot > tr > td, .table > tfoot > tr > th, .table > thead > tr > td, .table > thead > tr > th { padding: 0px 0px 0px 5px !important; } </style>';
    documentContent += '<body onload="window.print()">' + printContents + '</body></html>'
    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();
  }

  // ExportToExcel() {
  //   this.dlService.ReadExcel("/ReportingNew/ExportToExcelDailyMISReport?FromDate=" + this.selDailyMIS.fromDate + "&ToDate=" + this.selDailyMIS.toDate)
  //     .map(res => res)
  //     .subscribe(data => {
  //       let blob = data;
  //       let a = document.createElement("a");
  //       a.href = URL.createObjectURL(blob);
  //       a.download = "MISReport_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
  //       document.body.appendChild(a);
  //       a.click();
  //     },
  //       err => this.ErrorMsg(err));
  // }
  ExportToExcel(tableId){
    if(tableId){
      let workSheetName = 'Daily MIS Report';
      let filename = 'DailyMisReport';

      var Heading;
      var phoneNumber;
      var hospitalName;
      var address;
      if(this.headerProperties.HeaderTitle!=null){
        Heading = this.headerProperties.HeaderTitle;
      }else{
        Heading = 'DAILY MIS REPORT';
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

      // let hospitalName = this.headerDetail.hospitalName;
      // let address = this.headerDetail.address;
      //NBB-send all parameters for now 
      //need enhancement in this function 
      //here from date and todate for show date range for excel sheet data
      CommonFunctions.ConvertHTMLTableToExcelForBilling(tableId, this.curDailyMIS.fromDate, this.curDailyMIS.toDate, workSheetName,
        Heading, filename, hospitalName,address,phoneNumber,this.headerProperties.ShowHeader,this.headerProperties.ShowDateRange);
    }
    
  }

  ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }

  MapReportData_Paid(reportData: Array<SubTotalVM>) {
    //below line returns unique DepartmentNames from the list of SubTotalVMs
    let deptNamesList = reportData.map(itm => itm.departmentName).filter((value, index, self) => self.indexOf(value) === index);
    if (deptNamesList) {
      //add Inpatient and Outpatient BillingItems for each unique departments.
      deptNamesList.forEach(i => {
        let tempData = new DeptBillingVM();
        let temp = new MISreportSummaryVM();

        //departmentName 
        tempData.departmentName = i;
        temp.section = i;

        //filtering items as per BillingType IPD/OPD
        let opdData = reportData.filter(t => t.departmentName == i && t.BillingType.toLowerCase() == "outpatient");
        if (opdData.length > 0) {
          let subCal = this.Calculate(opdData);
          tempData.billingType.push({ billType: "OPD", itemList: opdData, subCalculation: subCal });
          temp.sectiontype.push({ type: "OPD", collection: subCal.netTotal });
        }
        else {
          temp.sectiontype.push({ type: "OPD", collection: 0 });
        }
        let ipdData = reportData.filter(t => t.departmentName == i && t.BillingType.toLowerCase() == "inpatient");
        if (ipdData.length > 0) {
          let subCal = this.Calculate(ipdData);
          tempData.billingType.push({ billType: "IPD", itemList: ipdData, subCalculation: subCal });
          temp.sectiontype.push({ type: "IPD", collection: subCal.netTotal });
        }
        else {
          temp.sectiontype.push({ type: "IPD", collection: 0 });
        }

        //      department/section totals
        tempData.billingType.forEach(a => {
          a.itemList.forEach(b => {
            tempData.departmentTotal += b.netTotal;
          });
        });
        tempData.departmentTotal = CommonFunctions.parseAmount(tempData.departmentTotal);
        temp.totalRevenue = tempData.departmentTotal;

        //pushing into variable
        this.filteredReportData.deptsItems.push(tempData);
        this.dailyMISreportData.deptsItems.push(tempData);
        this.dailyMISsummaryData.push(temp);
      });
      this.FinalCalculation();
    }
  }

  MapReportData_Provisional(itemsList: Array<SubTotalVM>) {
    this.unpaidTotal = 0;//resetting value of unpaid total amount.
    if (itemsList && itemsList.length > 0) {
      itemsList.forEach(itm => {
        this.unpaidTotal += itm.provisional;//
      });
    }
  }

  Calculate(itemList: Array<SubTotalVM>): SubTotalVM {
    let tempCal = new SubTotalVM();
    itemList.forEach(itm => {
      tempCal.quantity += itm.quantity;
      tempCal.subTotal += itm.subTotal;
      tempCal.discount += itm.discount;
      tempCal.return += itm.return;
      tempCal.netTotal += itm.netTotal;
    });
    //parsing amounts
    tempCal.subTotal = CommonFunctions.parseAmount(tempCal.subTotal);
    tempCal.discount = CommonFunctions.parseAmount(tempCal.discount);
    tempCal.return = CommonFunctions.parseAmount(tempCal.return);
    tempCal.netTotal = CommonFunctions.parseAmount(tempCal.netTotal)

    return tempCal;
  }

  FinalCalculation() {
    this.filteredReportData.subTotalAmt = 0;
    this.filteredReportData.discountAmt = 0;
    this.filteredReportData.returnAmt = 0;
    this.filteredReportData.netTotalAmt = 0;

    this.filteredReportData.deptsItems.forEach(a => {
      a.billingType.forEach(b => {
        this.filteredReportData.subTotalAmt += b.subCalculation.subTotal;
        this.filteredReportData.discountAmt += b.subCalculation.discount;
        this.filteredReportData.returnAmt += b.subCalculation.return;
        this.filteredReportData.netTotalAmt += b.subCalculation.netTotal;
      });
    });
    //parsing amounts
    this.filteredReportData.subTotalAmt = CommonFunctions.parseAmount(this.filteredReportData.subTotalAmt);
    this.filteredReportData.discountAmt = CommonFunctions.parseAmount(this.filteredReportData.discountAmt);
    this.filteredReportData.returnAmt = CommonFunctions.parseAmount(this.filteredReportData.returnAmt);
    this.filteredReportData.netTotalAmt = CommonFunctions.parseAmount(this.filteredReportData.netTotalAmt);
  }

  SwitchViews() {
    this.filteredReportData = this.dailyMISreportData;
    this.FinalCalculation();
    if (this.showSummaryReport) {
      this.MapReportData_Provisional(this.unpaidItems);
      this.showSummaryReport = false;
      this.showDetailedReport = true;
    }
    else {
      this.showDetailedReport = false;
      this.showSummaryReport = true;
    }
  }

  LoadSectionDetail(data) {
    this.filteredReportData = new MISreportVM();
    this.filteredReportData.deptsItems = this.dailyMISreportData.deptsItems.filter(a => a.departmentName == data.section);
    let sectionUnpaidData = this.unpaidItems.filter(a => a.departmentName == data.section);
    this.MapReportData_Provisional(sectionUnpaidData)
    this.FinalCalculation();
    this.showSummaryReport = false;
    this.showDetailedReport = true;
  }
  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.curDailyMIS.fromDate =  $event.fromDate;
    this.curDailyMIS.toDate = $event.toDate;
  }
}

export class DeptBillingVM {
  public departmentName: string = "";
  public billingType: Array<{ billType: string, itemList: Array<SubTotalVM>, subCalculation: SubTotalVM }> = [];
  //= new Array<{ billType: string, itemList: Array<SubTotalVM>, subCalculation: SubTotalVM }>();
  public departmentTotal: number = 0;
}

export class SubTotalVM {
  public departmentName: string = "";
  public hospitalNo: string = "";
  public patientName: string = "";
  public itemName: string = "";
  public providerName: string = "";
  public price: number = 0;
  public quantity: number = 0;
  public subTotal: number = 0;
  public discount: number = 0;
  public return: number = 0;
  public netTotal: number = 0;
  public provisional: number = 0;//sud:30Aug'18--to accomodate provisional items..
  public billStatus: string = "";//sud:30Aug'18--to accomodate provisional items..
  public BillingType: string = "";//inpatient or outpatient
}

export class MISreportVM {
  public subTotalAmt: number = 0;
  public discountAmt: number = 0;
  public returnAmt: number = 0;
  public netTotalAmt: number = 0;
  public deptsItems: Array<DeptBillingVM> = [];
}

export class MISreportSummaryVM {
  public section: string = "";
  public sectiontype: Array<{ type: string, collection: number }> = [];
  public totalRevenue: number = 0;
}

class TotalVM {
  public count: number = 0;
  public amount: number = 0;
  public provAmount: number = 0;
  public creditAmount: number = 0;
}
