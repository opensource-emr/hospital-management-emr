import { ChangeDetectorRef, Component } from "@angular/core";
import { CoreService } from "../../../core/shared/core.service";
import { SecurityService } from "../../..//security/shared/security.service";
import { NepaliCalendarService } from "../../..//shared/calendar/np/nepali-calendar.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { AccountingService } from "../../shared/accounting.service";
import { AccountingReportsBLService } from "../shared/accounting-reports.bl.service";
import { LedgerModel } from "../../settings/shared/ledger.model";
import { ledgerGroupModel } from "../../settings/shared/ledgerGroup.model";
import { Voucher } from "../../transactions/shared/voucher";
import * as _ from 'lodash';
import * as moment from "moment";
import { DateWiseDayBookModel, DayBookModel } from "../../settings/shared/day-book-model";

@Component({
    selector: 'day-book-report',
    templateUrl: './day-book-report.html',
  })
  export class DayBookReportComponent {
    public ledgerList : Array<LedgerModel> = new Array<LedgerModel>();
    public voucherList : Array<Voucher> = new Array<Voucher>();
    public selectedLedgerList : any;
    public fromDate: string = null;
    public toDate: string = null;
    public fiscalYearId : number = 0;
    public validDate : boolean = false;
    public dateRange : string = '';
    public OpeningData : any;
    public TransactionData : any;
    public DayBookModelData : Array<DayBookModel> = new Array<DayBookModel>();
    public DateWiseTotal = [];
    public OriginalDateWiseTotal = [];
    public todayDate : string = '';
    public footerContent = '';
    public printBy: string = '';
    public headerContent = '';
    public reportHeader : string = 'Day Book Report';
    public printTitle: string = "";
    public headerDetail: any;
    public HideZeroTxn : boolean = false;
    
    constructor(
        public accReportBLService: AccountingReportsBLService,
        public coreservice: CoreService,
        public msgBoxServ: MessageboxService,
        public accountingService: AccountingService,
        public securityService : SecurityService,
        public nepaliCalendarService: NepaliCalendarService,
        public changeDetector: ChangeDetectorRef) {
        this.todayDate = moment().format('YYYY-MM-DD');
        this.GetLedgers();
        this.GetVoucher(); 
        var paramValue = this.coreservice.Parameters.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader").ParameterValue;
        if (paramValue){
          this.headerDetail = JSON.parse(paramValue);
        }
        this.accountingService.getCoreparameterValue();
    }

    public GetLedgers() {
      if(!!this.accountingService.accCacheData.Ledgers && this.accountingService.accCacheData.Ledgers.length>0){
        this.ledgerList = this.accountingService.accCacheData.Ledgers;
      }
      if(localStorage.getItem('DayBookPreferredLedgerId')){
        this.selectedLedgerList = this.ledgerList.find(a=> a.LedgerId == Number(localStorage.getItem('DayBookPreferredLedgerId')));
      }
    }

    public GetVoucher() {
        if(!!this.accountingService.accCacheData.VoucherType && this.accountingService.accCacheData.VoucherType.length>0){
          this.voucherList = this.accountingService.accCacheData.VoucherType;
        }
    }

    LedgerGroupListFormatter(data: any): string {    
        return (
          data["LedgerGroupName"] +
          " | " +
          data["PrimaryGroup"] +
          " -> " +
          data["COA"]
        );
    }

    LedgerListFormatter(data : any){
        return data["LedgerName"];
    }

    HandleLedgerChange(){
      if(this.selectedLedgerList && typeof (this.selectedLedgerList)== 'object')
      localStorage.setItem('DayBookPreferredLedgerId',this.selectedLedgerList.LedgerId);
    }

    selectDate(event){
        if (event) {
          this.fromDate = event.fromDate;
          this.toDate = event.toDate;
          this.fiscalYearId = event.fiscalYearId;
          this.validDate = true;
          this.dateRange = "&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
        } 
        else {
          this.validDate =false;
        } 
    }
    GetTxnList(){
        this.DayBookModelData = [];
        this.DateWiseTotal = [];
        this.OriginalDateWiseTotal = [];
        if (this.CheckSelLedger()  && this.checkDateValidation()) {
            this.accReportBLService.GetDayBookReport(this.fromDate, this.toDate,this.fiscalYearId,this.selectedLedgerList.LedgerId)
            .subscribe(res=>{
                if(res.Status == 'OK' && res.Results){
                    this.OpeningData = res.Results.OpeningData;
                    this.TransactionData = res.Results.TransactionData;
                    this.ProcessTransactionData();
                }
                else{
                    this.msgBoxServ.showMessage("notice",["No data avalilable on selected date range."]);
                }
            },
            err=>{
                this.msgBoxServ.showMessage("error",["Unable to load data."]);
            });
        }

    }
    checkDateValidation() {
        let flag = true;  
        if(!this.validDate){
          this.msgBoxServ.showMessage("error", ['Select proper date.']);
          let flag =  false;
        }
        return flag;
    }
    CheckSelLedger(): boolean {
        if (!this.selectedLedgerList || this.selectedLedgerList.length < 1) {
          this.msgBoxServ.showMessage("failed", ["Select ledger from the list."]);
          return false;
        }
        else
          return true;
    }

    ProcessTransactionData(){
        this.TransactionData.sort(function (a, b) {
            if (a.VoucherNumber > b.VoucherNumber) return 1;
            if (a.VoucherNumber < b.VoucherNumber) return -1;
            return 0;
           });
           
      this.TransactionData.sort(function (a, b) {
           if (a.TransactionDate > b.TransactionDate) return 1;
           if (a.TransactionDate < b.TransactionDate) return -1;
           return 0;
          });

      this.TransactionData.forEach((txn,index)=>{
          txn.LedgerName = this.ledgerList.filter(a=> a.LedgerId == txn.LedgerId)[0].LedgerName;
          txn.VoucherType = this.voucherList.filter(a=> a.VoucherId == txn.VoucherId)[0].VoucherName;
          if(index == 0)
          txn.Accumulated = this.OpeningData[0].OpeningBalance - txn.DrAmount + txn.CrAmount;
          else
          txn.Accumulated = this.TransactionData[index-1].Accumulated - txn.DrAmount + txn.CrAmount; 
      })
      let ledgerData = this.TransactionData;
      const fromDate = moment(this.fromDate);
      const toDate = moment(this.toDate).add(1,'day');
      while (fromDate.isBefore(toDate, 'day')) {
        let todayTxnData = ledgerData.filter(a=> fromDate.isSame(moment(a.TransactionDate)));
        let model = new DateWiseDayBookModel();
        model.Transactions = todayTxnData;
        if(fromDate.isSame(moment(this.fromDate))){
          model.OpeningBalance = this.OpeningData[0].OpeningBalance;
        }  
        else{
          model.OpeningBalance = this.DateWiseTotal[this.DateWiseTotal.length-1].ClosingBalance;
        } 
        model.ClosingBalance = model.OpeningBalance; 
        let dr = 0;
        let cr = 0;
        model.Transactions.forEach(txn=>{
          dr += txn.DrAmount;
          cr += txn.CrAmount;
          model.ClosingBalance += (txn.CrAmount-txn.DrAmount);
        })  
        model.DrAmount = dr;
        model.CrAmount = cr;  
        model.TransactionDate = this.nepaliCalendarService.ConvertEngToNepDateString(fromDate.toString())
        // let results = todayTxnData.reduce(function(results, data) {
        //     (results[data.VoucherNumber] = results[data.VoucherNumber] || []).push(data);
        //     return results;
        // }, {})
        // model.Transactions = results;
        model.TotalDrAmount = model.OpeningBalance > 0 ? (model.CrAmount + model.OpeningBalance) : (model.CrAmount);
        model.TotalCrAmount = model.OpeningBalance > 0 ? model.DrAmount : model.DrAmount + this.getNumber(model.OpeningBalance);
        this.DateWiseTotal.push(model);
        fromDate.add(1, 'days');
      }
      this.OriginalDateWiseTotal = this.DateWiseTotal;
      this.HandleHideZeroTxn();
    }

    getNumber(num:number){
      return Math.abs(num);
    }

    HandleHideZeroTxn(){
      if(this.HideZeroTxn){
        let data = this.DateWiseTotal.filter(a=> a.Transactions.length != 0);
        this.DateWiseTotal = data;
      }
      else{
        this.DateWiseTotal = this.OriginalDateWiseTotal;
      }
    }

    Print(tableId) {
      let date = JSON.parse(JSON.stringify(this.dateRange));
      var printDate = moment().format("YYYY-MM-DD HH:mm");//Take Current Date/Time for PrintedOn Value.
      this.printBy = this.securityService.loggedInUser.Employee.FullName;
         let printBy = JSON.parse(JSON.stringify(this.printBy));
      let popupWinindow;
      if (this.accountingService.paramData) {
        if (!this.printBy.includes("Printed")) {
          var currDate = moment().format("YYYY-MM-DD HH:mm");
          var nepCurrDate = NepaliCalendarService.ConvertEngToNepaliFormatted_static(currDate, "YYYY-MM-DD hh:mm");
         var printedBy = (this.accountingService.paramData.ShowPrintBy) ? "<b>Printed By:</b>&nbsp;" + this.printBy : '';
          this.printBy = printedBy;
        }
        this.dateRange = (this.accountingService.paramData.ShowDateRange) ? date : date = '';
      var Header = document.getElementById("headerForPrint").innerHTML;     
   var printContents = ``;
      printContents += "<style> table { border-collapse: collapse; border-color: black;font-size: 11px; background-color: none; } th { color:black; background-color: #599be0;}.ADBS_btn {display:none;padding:0px ;} .tr { color:black; background-color: none;} "
      printContents += ".alignleft {float:left;width:33.33333%;text-align:left;}.aligncenter {float: left;width:33.33333%;text-align:center;}.alignright {float: left;width:33.33333%;text-align:right;}​</style>";
    
     printContents += document.getElementById(tableId).innerHTML
      popupWinindow = window.open(
        "",
        "_blank",
        "width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no, ADBS_btn=null"
      );
      popupWinindow.document.open();
      let documentContent = "<html><head>";
      //documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../../themes/theme-default//DanphePrintStyle.css"/>';
      documentContent +=
        '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
      documentContent +=
        '<link rel="stylesheet" type="text/css" href="../../../themes/theme-default//DanpheStyle.css"/>';
      documentContent += "</head>";
      if (this.accountingService.paramData) {
        this.printTitle = this.accountingService.paramData.HeaderTitle;
       this.headerContent = Header;
        printContents = (this.accountingService.paramData.ShowHeader) ? this.headerContent + printContents : printContents;
        printContents = (this.accountingService.paramData.ShowFooter) ? printContents + this.footerContent : printContents;
      }
      documentContent +=
        '<body onload="window.print()">' + printContents + "</body></html>";
      popupWinindow.document.write(documentContent);
      popupWinindow.document.close();
    }
  }
    // Export report to Excelsheet
    public ExportToExcel(tableId){
      try {
            let Footer = JSON.parse(JSON.stringify(this.footerContent));
             let date = JSON.parse(JSON.stringify(this.dateRange));
             date = date.replace("To", " To:");
            this.printBy = this.securityService.loggedInUser.Employee.FullName;
            let printBy = JSON.parse(JSON.stringify(this.printBy));
            let printByMessage = '';
            var hospitalName;
            var address;
            let filename;
            let workSheetName;
            filename = workSheetName = this.selectedLedgerList.LedgerName+`_`+this.accountingService.paramExportToExcelData.HeaderTitle + `_` + this.todayDate;
            if(!!this.accountingService.paramExportToExcelData){
            if (!!this.accountingService.paramExportToExcelData.HeaderTitle) {
              if (this.accountingService.paramExportToExcelData.HeaderTitle) {
              var headerTitle = "Day Book Report"
              }
             
              if (this.accountingService.paramExportToExcelData.ShowPrintBy) {
                if (!printBy.includes("PrintBy")) {
                  printByMessage = 'Exported By:'
                }
                else {
                  printByMessage = ''
                }
              }
              else {
                printBy = '';
              }
              if (!this.accountingService.paramExportToExcelData.ShowDateRange) {
                date = ""
              }
              else{
                  date
              }
              //check Header
              if (this.accountingService.paramExportToExcelData.ShowHeader == true) {
                hospitalName = this.headerDetail.hospitalName;
                address = this.headerDetail.address;
              }
              else {
                hospitalName = null;
                          address = null;
              }
              //check Footer
              if (!this.accountingService.paramExportToExcelData.ShowFooter) {
                Footer = null;
              }
            }
          }
            else {
              Footer = "";
              printBy = "";
              date = "";
              printByMessage = "";
             
            }
            this.ConvertHTMLTableToExcelForAccounting(tableId,workSheetName,date,
             headerTitle,filename,hospitalName,address, printByMessage,this.accountingService.paramExportToExcelData.ShowPrintBy,this.accountingService.paramExportToExcelData.ShowHeader,
             this.accountingService.paramExportToExcelData.ShowDateRange, printBy,this.accountingService.paramExportToExcelData.ShowFooter,Footer)
            
          } catch (ex) {
            console.log(ex);
          }
  }
   ConvertHTMLTableToExcelForAccounting(table: any, SheetName: string,date:string,  TableHeading: string, filename: string,hospitalName:string,hospitalAddress:string, printByMessage:string,showPrintBy:boolean, showHeader:boolean, showDateRange: boolean, printBy:string,ShowFooter:boolean,  Footer:string  ) {
    try {
      var printDate = moment().format("YYYY-MM-DD HH:mm");
      if (table) {
        //gets tables wrapped by a div.
        var _div = document.getElementById(table).getElementsByTagName("table");
        var colCount = [];
  
        //pushes the number of columns of multiple table into colCount array.
        for (let i = 0; i < _div.length; i++) {
          var col = _div[i].rows[1].cells.length;
          colCount.push(col);
        }
  
        //get the maximum element from the colCount array.
        var maxCol = colCount.reduce(function (a, b) {
          return Math.max(a, b);
        }, 0);
  
        //define colspan for td.
        var span = "colspan= " + Math.trunc(maxCol / 3);
        var hospName;
        var address;
        if (showHeader == true) {
          var Header = `<tr><td></td><td></td><td colspan="4" style="text-align:center;font-size:large;"><strong>${hospitalName}</strong></td></tr><br/><tr> <td></td><td></td><td colspan="4" style="text-align:center;font-size:small;"><strong>${hospitalAddress}</strong></td></tr><br/>
          <tr><td></td><td></td><td colspan="4" style="text-align:center;font-size:small;width:600px;"><strong>${TableHeading}</strong></td></tr><br/>
          <tr> <td style="text-align:center;"><strong>${date}</strong></td><td></td><td></td><td></td><td></td><td style="text-align:center;"><strong>${printByMessage}${printBy}</strong></td><td><strong>Exported On: ${printDate}</strong></td></tr><br>`
         } else {
          if (date == "") { //if showdate date is false
            Header = `<tr> <td style="text-align:center;"><strong> ${printByMessage} ${printBy} </strong></td><td><strong>Exported On: ${printDate}</strong></td></tr>`;
          }
          else if (printBy == "") { // if  printby is false. 
            Header = `<tr> <td style="text-align:center;"><strong>${date}</strong></td><td><strong>Exported On: ${printDate}</strong></td></tr>`;
          }
          else { //if both are true
            Header = `<tr> <td style="text-align:center;"><strong>${date}</strong></td><td></td><td></td><td></td><td style="text-align:center;"><strong>${printByMessage}${printBy}</strong></td><td><strong>Exported On: ${printDate}</strong></td></tr><br>`;
          }
        }
        Header += `<tr><td style="text-align:left">${this.selectedLedgerList.LedgerName} (${this.selectedLedgerList.Code})</td></tr>`;
        let workSheetName = (SheetName.length > 0) ? SheetName : 'Sheet';
        let fromDateNp: any;
        let toDateNp = '';
        if (this.fromDate.length > 0 && this.toDate.length > 0) {
          fromDateNp = NepaliCalendarService.ConvertEngToNepaliFormatted_static(this.fromDate, '');
          toDateNp = NepaliCalendarService.ConvertEngToNepaliFormatted_static(this.toDate, '');
        }
        
        if(ShowFooter == true){
          Footer = "";
        }else{
          Footer = null;
        }
        let uri = 'data:application/vnd.ms-excel;base64,'
          , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table><tr>}{Header}</tr>{table}</table></body></html>'
          , base64 = function (s) { return window.btoa(decodeURIComponent(encodeURIComponent(s))) }
          , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }
        if (!table.nodeType) table = document.getElementById(table)
        var ctx = { worksheet: workSheetName, table: table.innerHTML,Header:Header,
           footer: Footer }            
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
}