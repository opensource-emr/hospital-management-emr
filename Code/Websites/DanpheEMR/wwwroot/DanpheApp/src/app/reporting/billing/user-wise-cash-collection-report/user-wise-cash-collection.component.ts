import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../shared/reporting-service";
import { DLService } from "../../../shared/dl.service";
import { HttpClient } from '@angular/common/http';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { CoreService } from '../../../core/shared/core.service';
import * as moment from 'moment/moment';
import { CommonFunctions } from "../../../shared/common.functions";
import { RPT_BIL_UserWiseCashCollectionModel } from './user-wise-cash-collection.model';
import { SettingsBLService } from '../../../settings-new/shared/settings.bl.service';
import { SecurityService } from '../../../security/shared/security.service';
import { NepaliCalendarService } from '../../../shared/calendar/np/nepali-calendar.service';
@Component({
  templateUrl: "./user-wise-cash-collection.html"
})
export class RPT_BIL_UserWiseCashCollectionComponent {
    public dlService: DLService = null;
    public http: HttpClient = null;
    public fromDate: string = "";
    public toDate: string = "";
    public currentDate: string = "";
    public calType: string = "";
    public showReport: boolean = false;
    public headerDetail: any = null;
    public reportData: Array<any> = new Array<any>();
    public selUser: any = "";
    public userObjModel: RPT_BIL_UserWiseCashCollectionModel = new RPT_BIL_UserWiseCashCollectionModel();
    public summary: any = {
        tot_SubTotal: 0, tot_Discount: 0,tot_ReturnDiscount: 0, tot_Refund: 0, tot_Provisonal: 0,
        tot_Cancel: 0, tot_Credit: 0, tot_NetTotal: 0, tot_SalesTotal: 0, tot_CashCollection: 0 ,tot_Deposit: 0,tot_DepositReturn: 0,tot_GrandTotal:0
    };
    public TotalReturnSales:number = 0;
    public TotalCashSales:number = 0;
    public NetCashSales:number=0;
    public TotalDeposit:number= 0;
    public NetCashCollection:number=0;
    public headerProperties:any;
    public userList:any = [];
    public CurrentUser = '';
    userId: number;
    public summaryData: Array<any> = new Array<any>();;

    constructor(
        _http: HttpClient,
        _dlService: DLService,
        public msgBoxServ: MessageboxService,
        public reportServ: ReportingService,
        public coreservice: CoreService,
        public settingsBLService: SettingsBLService,
        public securityService: SecurityService) {
        this.http = _http;
        this.dlService = _dlService;
        this.LoadHeaderDetailsCalenderTypes();
        this.LoadUser();
        this.userObjModel.fromDate = moment().format('YYYY-MM-DD');
        this.userObjModel.toDate = moment().format('YYYY-MM-DD');
        this.currentDate = moment().format('YYYY-MM-DD');
    }

    LoadUser() {
        this.settingsBLService.GetUserList()
          .subscribe(res => {
            if (res.Status == "OK") {
              this.userList = res.Results;
              CommonFunctions.SortArrayOfObjects(this.userList, "EmployeeName");
              this.CurrentUser = this.securityService.loggedInUser.Employee.FullName;
    
            }
            else {
              alert("Failed ! " + res.ErrorMessage);
            }
    
          });
      }

    Load() {
        for (var i in this.userObjModel.userWiseCollectionReportValidator.controls) {
            this.userObjModel.userWiseCollectionReportValidator.controls[i].markAsDirty();
            this.userObjModel.userWiseCollectionReportValidator.controls[i].updateValueAndValidity();
      }
      if (this.userObjModel.fromDate != null && this.userObjModel.toDate != null) {
            this.fromDate = this.userObjModel.fromDate;
            this.toDate = this.userObjModel.toDate;
            this.userId = this.userObjModel.userId;
            this.dlService.Read("/BillingReports/UserWiseCashCollectionReport?FromDate=" + this.fromDate + "&ToDate=" + this.toDate + "&UserId=" + this.userId)
                .map(res => res)
                .subscribe(res => this.Success(res),
                    err => this.Error(err));
        }
        else {
            this.msgBoxServ.showMessage("notice-message", ["dates are not proper."]);
        }
    }
    UserListFormatter(data: any): string {
        return data["EmployeeName"];
    }
    
    Success(res) {
        if (res.Status == "OK") {
          this.reportData = null;
          this.summaryData = null;
            let data = JSON.parse(res.Results.JsonData);
            if (data.ReportData.length > 0) {
                this.reportData = data.ReportData;
                this.summaryData = data.Summary;
                this.CalculateSummaryAmounts();
                this.showReport = true;
            }
            else {
                this.ClearSummary();
                this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates or select different User']);
            }
        }
        else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
            this.ClearSummary();
        }
    }

    Error(err) {
        this.ClearSummary();
        this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
    }

    LoadHeaderDetailsCalenderTypes() {
        let allParams = this.coreservice.Parameters;
        if (allParams.length) {
            let CalParms = allParams.find(a => a.ParameterName == "CalendarTypes" && a.ParameterGroupName == "Common");
            if (CalParms) {
                let Obj = JSON.parse(CalParms.ParameterValue);
                this.calType = Obj.UserWiseCashCollectionReport;
            }
            let HeaderParms = allParams.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader");
            if (HeaderParms) {
                this.headerDetail = JSON.parse(HeaderParms.ParameterValue);
                let header = allParams.find(a => a.ParameterGroupName == 'BillingReport' && a.ParameterName == 'TableExportSetting');
                if(header){
                    this.headerProperties = JSON.parse(header.ParameterValue)["UserWiseCashCollectionReport"];
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
          let workSheetName = 'USER WISE CASH COLLECTION REPORT';
          //let Heading = 'Doctor Wise Income Summary';
          let filename = 'UserWiseCashCollectionReport';
          var Heading;
          var phoneNumber;
          var hospitalName;
          var address;
          if(this.headerProperties.HeaderTitle!=null){
            Heading = this.headerProperties.HeaderTitle;
          }else{
            Heading = 'USER WISE CASH COLLECTION REPORT';
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
          // for footer
          var footerContent = document.getElementById("summaryForUserReport").innerHTML;
          var Footer = JSON.parse(JSON.stringify(footerContent));   
        //   let hospitalName = this.headerDetail.hospitalName;
        //   let address = this.headerDetail.address;
          //NBB-send all parameters for now 
          //need enhancement in this function 
          //here from date and todate for show date range for excel sheet data 
          this.ConvertHTMLTableToExcelForBilling(tableId, this.fromDate, this.toDate, workSheetName,
            Heading, filename, hospitalName,address,phoneNumber,this.headerProperties.ShowHeader,this.headerProperties.ShowDateRange,Footer);
        }
        
      }

    ErrorMsg(err) {
        this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
        console.log(err.ErrorMessage);
  }
    userChanged() {
      this.userObjModel.userId = this.selUser ? this.selUser.EmployeeId : null;
    }

    CalculateSummaryAmounts() {
      this.ClearSummary();
        this.reportData.forEach(a => {
            this.summary.tot_SubTotal += (a.IP_Collection + a.OP_Collection);
            this.summary.tot_Discount += (a.IP_Discount + a.OP_Discount);
            this.summary.tot_ReturnDiscount += (a.IP_ReturnDiscount + a.OP_ReturnDiscount);
            this.summary.tot_Refund += (a.IP_Refund + a.OP_Refund);
            this.summary.tot_NetTotal += (a.IP_NetTotal + a.OP_NetTotal);
            this.summary.tot_GrandTotal += (this.summary.tot_NetTotal);
            this.summary.tot_Deposit += (a.DepositAmount);
            this.summary.tot_DepositReturn += (a.DepositReturn);
        });

        this.summary.tot_GrandTotal += (this.summary.tot_Deposit - this.summary.tot_DepositReturn);
        this.summary.tot_SubTotal = CommonFunctions.parseAmount(this.summary.tot_SubTotal);
        this.summary.tot_Discount = CommonFunctions.parseAmount(this.summary.tot_Discount);
        this.summary.tot_ReturnDiscount = CommonFunctions.parseAmount(this.summary.tot_ReturnDiscount);
        this.summary.tot_Refund = CommonFunctions.parseAmount(this.summary.tot_Refund);
        this.summary.tot_NetTotal = CommonFunctions.parseAmount(this.summary.tot_NetTotal);
        this.summary.tot_Deposit = CommonFunctions.parseAmount(this.summary.tot_Deposit);
        this.summary.tot_DepositReturn = CommonFunctions.parseAmount(this.summary.tot_DepositReturn);
        this.summary.tot_GrandTotal = CommonFunctions.parseAmount(this.summary.tot_GrandTotal);

        this.TotalCashSales = (this.summary.tot_SubTotal - this.summary.tot_Discount);
        this.TotalReturnSales = (this.summary.tot_Refund - this.summary.tot_ReturnDiscount);
        this.NetCashSales = (this.TotalCashSales - this.TotalReturnSales);
        this.TotalDeposit = (this.summary.tot_Deposit -  this.summary.tot_DepositReturn);
        this.NetCashCollection = (this.NetCashSales + this.TotalDeposit);

        this.TotalCashSales = CommonFunctions.parseAmount(this.TotalCashSales);
        this.TotalReturnSales = CommonFunctions.parseAmount(this.TotalReturnSales);
        this.NetCashSales = CommonFunctions.parseAmount(this.NetCashSales);
        this.TotalDeposit = CommonFunctions.parseAmount(this.TotalDeposit);
        this.NetCashCollection = CommonFunctions.parseAmount(this.NetCashCollection);

  }
  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.userObjModel.fromDate = this.fromDate;
    this.userObjModel.toDate = this.toDate;
  }

  ConvertHTMLTableToExcelForBilling(table: any, fromDate: string, toDate: string, SheetName: string, TableHeading: string, FileName: string, hospitalName:string, hospitalAddress:string, phoneNumber:any, showHeader:boolean, showDateRange:boolean, footer:string) {
    try {
      if (table) {
        //gets tables wrapped by a div.
        var _div = document.getElementById(table).getElementsByTagName("table");
        var colCount = [];
  
        //pushes the number of columns of multiple table into colCount array.
        for(let i = 0; i< _div.length; i++){
            var col = _div[i].rows[1].cells.length;
              colCount.push(col);
        }
  
        //get the maximum element from the colCount array.
        var maxCol = colCount.reduce(function(a, b) {
        return Math.max(a, b);
        }, 0);
        
        //define colspan for td.
        var span = "colspan= "+Math.trunc(maxCol/3);
        
        var phone;
        if(phoneNumber!=null){
          phone = '<tr><td '+span+'></td><td colspan="4" style="text-align:center;font-size:medium;"><strong> Phone:'+phoneNumber+'</strong></td><td '+span+'></td></tr><br>';
        }else{
          phone = "";
        }
  
        var hospName;
        var address;
        if(showHeader == true){
          hospName = '<tr><td '+span+'></td><td colspan="4" style="text-align:center;font-size:medium;"><strong>'+hospitalName+'</strong></td><td '+span+'></td></tr><br>'; 
          address = '<tr><td '+span+'></td><td colspan="4" style="text-align:center;font-size:medium;"><strong>'+hospitalAddress+'</strong></td><td '+span+'></tr><br>';
        }else{
          hospName = "";
          address = "";
        }
        let workSheetName = (SheetName.length > 0) ? SheetName : 'Sheet';
        let fromDateNp: any;
        let toDateNp = '';
        if (fromDate.length > 0 && toDate.length > 0) {
          fromDateNp = NepaliCalendarService.ConvertEngToNepaliFormatted_static(fromDate, '');
          toDateNp = NepaliCalendarService.ConvertEngToNepaliFormatted_static(toDate, '');
        }
       
        //let Heading = '<tr><td></td><td></td><td></td><td></td><td colspan="4" style="text-align:center;font-size:medium;"><h>' + TableHeading + '</h></td><td></td><td></td><td></td><td></td><td></td></tr>';
       let Heading = '<tr><td '+span+'></td><td colspan="4" style="text-align:center;font-size:medium;"><h>' + TableHeading + '</h></td><td '+span+'></td></tr>';
       var dateRange; 
       if(showDateRange == true){
          dateRange = (fromDate.length > 0 && toDate.length > 0) ? '<tr><td></td><td><b>Date Range:(AD)' + fromDate + ' To ' + toDate + '</b></td></tr><br /><tr><td></td><td><b>Date Range: (BS)' + fromDateNp + ' To ' + toDateNp + '</b></td></tr><br/>' : '';
      
        }else{
          dateRange = "";
        }
          let PrintDate = '<tr><td></td><td><b>Created Date:' + moment().format('YYYY-MM-DD') + '</b></td></tr><br />'
       
        let filename = (FileName.length > 0) ? FileName : 'Exported_Excel_File';
        filename = filename + '_' + moment().format('YYYYMMMDDhhss') + '.xls';
  
        let uri = 'data:application/vnd.ms-excel;base64,'
          , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table><tr>{hospitalName}{hospitalAddress}{phone}{Heading}{DateRange}{PrintDate}</tr>{table}</table><br><table><tr><td></td><td></td><td>{footer}</td></tr></table></body></html>'
          , base64 = function (s) { return window.btoa(decodeURIComponent(encodeURIComponent(s))) }
          , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }
         if (!table.nodeType) table = document.getElementById(table)
        var ctx = { worksheet: workSheetName, table: table.innerHTML, PrintDate: PrintDate,hospitalName:hospName,hospitalAddress:address,phone:phone ,DateRange: dateRange, Heading: Heading, footer:footer }
        //return window.location.href = uri + base64(format(template, ctx))             
        var link = document.createElement('a');
        link.href = uri + base64(format(template, ctx));
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (ex) {
      console.log(ex);
    }
  }

  ClearSummary(){
    this.summary.tot_SubTotal = this.summary.tot_Discount = this.summary.tot_ReturnDiscount = this.summary.tot_Refund = this.summary.tot_NetTotal = this.summary.tot_Credit = this.summary.tot_Provisional = this.summary.tot_Cancel = this.summary.tot_Deposit = this.summary.tot_DepositReturn = 0;
    this.TotalReturnSales = this.TotalCashSales = this.NetCashSales = this.TotalDeposit = this.NetCashCollection = 0;      
  }
}
