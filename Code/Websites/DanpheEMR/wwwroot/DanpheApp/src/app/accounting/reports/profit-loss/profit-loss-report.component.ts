import { ChangeDetectorRef, Component, Directive, ViewChild } from '@angular/core';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { AccountingReportsBLService } from "../shared/accounting-reports.bl.service";
import * as moment from 'moment/moment';
import { CommonFunctions } from '../../../shared/common.functions';
import { FiscalYearModel } from '../../settings/shared/fiscalyear.model';
import { CoreService } from '../../../core/shared/core.service';

import { AccountingService } from "../../shared/accounting.service";
@Component({
  selector: 'my-app',
  templateUrl: "./profit-loss-report.html"
})

export class ProfitLossReportComponent { 

  public fromDate: string = null;
  public toDate: string = null;
  public RevenueData: any = null;
  public ExpenseData: any = null;
  public TotalRevenue: number = 0;
  public TotalExpense: number = 0;
  public OverAllValue: number = 0;
  public showReportData: boolean = false;
  public NetProfit: number = 0;
  public IsLedgerLevel: boolean = false;
  public showLedgerDetail: boolean = false;
  public ledgerId: number = 0;
  public ledgerName: string = '';
  public IsShowReport: boolean = false;
  public dateRange: string = null;
  public IsDataLoaded: boolean = false;
  public showExportbtn : boolean=false;
  public currentFiscalYear: FiscalYearModel = new FiscalYearModel();
  public fiscalYearList: Array<FiscalYearModel> = new Array<FiscalYearModel>();
  public fiscalYearId:number= 0;
  public ledgerCode:any;
  btndisabled=false;
  public IsZeroAmountRecords: boolean = false;
  public showPrint: boolean = false;
  public printDetaiils: any;
  constructor(
    public msgBoxServ: MessageboxService,
    public coreservice : CoreService,
      public accReportBLServ: AccountingReportsBLService, public accountingService: AccountingService,
      private changeDetector: ChangeDetectorRef) {
   
    this.dateRange = "today";
    this.showExport();
  }
  public validDate:boolean=true;
  selectDate(event){
    if (event) {
      this.fromDate = event.fromDate;
      this.toDate = event.toDate;
      this.fiscalYearId = event.fiscalYearId;
      this.validDate = true;
      this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
    } 
    else {
      this.validDate =false;
    } 
  }
 
  loadData() {
    this.btndisabled=true;
    if (this.checkDateValidation() ) {      
      this.accReportBLServ.GetProfitLossReport(this.fromDate, this.toDate,this.fiscalYearId).subscribe(res => {
        if (res.Status == "OK") {
          this.btndisabled=false;
          let data = res.Results;
          this.RevenueData = data.find(a => a.PrimaryGroup == this.accountingService.getnamebyCode("001"));  //  "Revenue"
          this.ExpenseData = data.find(a => a.PrimaryGroup == this.accountingService.getnamebyCode("002")); // "Expenses"
          this.CalculateTotalAmounts();
          this.formatDataforDisplay();
          this.showReportData = true;
         
        }
        else {
          this.btndisabled=false;
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
      });
    }
    else {
      this.btndisabled=false;
      this.showReportData = false;
    }
  }
  //calculating subtotals and overall total

  CalculateTotalAmounts() {
    let revTotal = 0;
    let expTotal = 0;
    if (this.RevenueData) {
      for (var i = 0; i < this.RevenueData.COAList.length; i++) {
        var typeTotal = 0;
        for (var j = 0; j < this.RevenueData.COAList[i].LedgerGroupList.length; j++) {
          var LedgerGroupTotal = 0;
          for (var k = 0; k < this.RevenueData.COAList[i].LedgerGroupList[j].LedgerList.length; k++) {
            let amount = this.RevenueData.COAList[i].LedgerGroupList[j].LedgerList[k].CrAmount
              - this.RevenueData.COAList[i].LedgerGroupList[j].LedgerList[k].DrAmount;
            LedgerGroupTotal = LedgerGroupTotal + amount;
            this.RevenueData.COAList[i].LedgerGroupList[j].LedgerList[k].Amount = amount;
          }
          this.RevenueData.COAList[i].LedgerGroupList[j]["LedgerGroupAmount"] = LedgerGroupTotal;
          typeTotal += LedgerGroupTotal;
        }
        this.RevenueData.COAList[i]["TotalAmount"] = typeTotal;
        revTotal += typeTotal;
      }
      this.TotalRevenue = revTotal;
    }
    if (this.ExpenseData) {
      for (var i = 0; i < this.ExpenseData.COAList.length; i++) {
        var typeTotal = 0;
        for (var j = 0; j < this.ExpenseData.COAList[i].LedgerGroupList.length; j++) {
          var LedgerGroupTotal = 0;
          for (var k = 0; k < this.ExpenseData.COAList[i].LedgerGroupList[j].LedgerList.length; k++) {
            let amount = this.ExpenseData.COAList[i].LedgerGroupList[j].LedgerList[k].DrAmount
              - this.ExpenseData.COAList[i].LedgerGroupList[j].LedgerList[k].CrAmount;
            LedgerGroupTotal = LedgerGroupTotal + amount;
            this.ExpenseData.COAList[i].LedgerGroupList[j].LedgerList[k].Amount = amount;
          }
          this.ExpenseData.COAList[i].LedgerGroupList[j]["LedgerGroupAmount"] = LedgerGroupTotal;
          typeTotal += LedgerGroupTotal;
        }
        this.ExpenseData.COAList[i]["TotalAmount"] = typeTotal;
        expTotal += typeTotal;
      }
      this.TotalExpense = expTotal;
    }
    if (this.TotalRevenue > this.TotalExpense)
      this.OverAllValue = this.TotalRevenue - this.TotalExpense;
    else {
      this.OverAllValue = this.TotalExpense - this.TotalRevenue;
    }
  }

  formatDataforDisplay() {
    let ExpData = [];
    let RevData = [];
    let nonDirectExpense = 0;
    let nonDirectIncome = 0;
    let GrossAmt = 0;
    let TotalAmt = 0;
    //inserting initial Types (Direct Income) 
    RevData = this.pushCOA(RevData, this.accountingService.getnamebyCode("004")); // "Direct Income"
    //inserting initial Types (Purchase)
    RevData = this.pushCOA(RevData, this.accountingService.getnamebyCode("007")); //"Purchase"
    //inserting initial Types (Direct Expense)
    RevData = this.pushCOA(RevData, this.accountingService.getnamebyCode("003")); // Direct Expense
    //Calculating Gross Amount
    let temp = RevData.find(a => a.Name == this.accountingService.getnamebyCode("004")); //"Direct Income"
    GrossAmt = temp ? temp.Amount : 0;
    temp = RevData.find(a => a.Name == this.accountingService.getnamebyCode("007")); // "Purchase"
    GrossAmt -= temp ? temp.Amount : 0;
    temp = RevData.find(a => a.Name == this.accountingService.getnamebyCode("003")); //  "Direct Expense"
    GrossAmt -= temp ? temp.Amount : 0;

    //inserting Blank Entries in List of make total in same line
    let RevLength = RevData.length;
    let ExpLength = ExpData.length + 1;
    if (RevLength > ExpLength)
      for (let i = 0; i < RevLength - ExpLength; i++)
        ExpData = this.pushToList(ExpData, "", 0, "BlankEntry", 0,0);
    else if (RevLength < ExpLength)
      for (let i = 0; i < ExpLength - RevLength; i++)
        RevData = this.pushToList(RevData, "", 0, "BlankEntry", 0,0);
    //inserting Gross in List
    if (GrossAmt >= 0) {
      RevData = this.pushToList(RevData, "Gross Profit", GrossAmt, "BoldTotal", 0,0);
    } else {
      RevData = this.pushToList(RevData, "Gross Loss", GrossAmt, "BoldTotal", 0,0);
    }

    //inserting initial Types (Indirect Income)Indirect Expenses
    RevData = this.pushCOA(RevData, this.accountingService.getnamebyCode("006")); //"Indirect Income"

    //inserting initial Types (Indirect Expenses)
    RevData = this.pushCOA(RevData, this.accountingService.getnamebyCode("005")); //"Indirect Expenses"

    TotalAmt = GrossAmt;
    temp = RevData.find(a => a.Name == this.accountingService.getnamebyCode("006")); //"Indirect Income"
    TotalAmt += temp ? temp.Amount : 0;
    //inserting Total in List
    //RevData = this.pushToList(RevData, "Total", TotalAmt, "BoldCategory",0,0);



    let NetAmt = TotalAmt;
    if (RevData.find(a => a.Name == this.accountingService.getnamebyCode("005")) != null) { //"Indirect Expenses"
      NetAmt = NetAmt - RevData.find(a => a.Name ==  this.accountingService.getnamebyCode("005")).Amount; //"Indirect Expenses"
    }
    //inserting NetAmount in List
    if (NetAmt >= 0) {
      RevData = this.pushToList(RevData, "Net Profit", NetAmt, "BoldTotal", 0,0);
    } else {
      RevData = this.pushToList(RevData, "Net Loss", NetAmt, "BoldTotal", 0,0);
    }

    ////inserting other Types in List (except Direct Income)

    // this.RevenueData.COAList.forEach(a => {
    //    if (a.COA != "Direct Income") {
    //        nonDirectIncome = nonDirectIncome + a.COA != "Direct Income" ? a.TotalAmount : 0;
    //        RevData = this.pushToList(RevData, a.COA, a.TotalAmount, "BoldCategory",0,0);
    //        a.LedgerGroupList.forEach(b => {
    //            RevData = this.pushToList(RevData, b.LedgerGroupName, b.LedgerGroupAmount, "ledgerGroupLevel",0,0);
    //            b.LedgerList.forEach(c => {
    //                RevData = this.pushToList(RevData, c.LedgerName, CommonFunctions.parseAmount(c.Amount), "ledgerLevel",0,0);
    //            });
    //        });
    //    }
    // });

    ////inserting other Types in List (except Cost of Goods Sold and Direct Expense)
    // this.ExpenseData.COAList.forEach(a => {
    //    if (a.COA != "Direct Expense" && a.COA != "Cost of Goods Sold") {
    //        nonDirectExpense = nonDirectExpense + a.COA != "Direct Expense" ? a.TotalAmount : 0;
    //        ExpData = this.pushToList(ExpData, a.COA, a.TotalAmount, "BoldCategory",0,0);
    //        a.LedgerGroupList.forEach(b => {
    //            ExpData = this.pushToList(ExpData, b.LedgerGroupName, b.LedgerGroupAmount, "ledgerGroupLevel",0,0);
    //            b.LedgerList.forEach(c => {
    //                ExpData = this.pushToList(ExpData, c.LedgerName, CommonFunctions.parseAmount(c.Amount), "ledgerLevel",0,0);
    //            });
    //        });
    //    }
    //});
    ////calculating Net Amount and inserting in ExpData
    // this.NetProfit = GrossAmt + nonDirectIncome - nonDirectExpense;
    // if (this.NetProfit >= 0) {
    //    ExpData = this.pushToList(ExpData, "Net Profit", this.NetProfit, "BoldCategory",0,0);
    // }
    // else {
    //    this.NetProfit = -this.NetProfit;
    //    RevData = this.pushToList(RevData, "Net Loss", this.NetProfit, "BoldCategory",0,0);
    //    this.NetProfit = -this.NetProfit;
    // }


    ////inserting blank Entry to make total in same line
    // RevLength = RevData.length;
    // ExpLength = ExpData.length;
    // if (RevLength > ExpLength)
    //    for (let i = 0; i < RevLength - ExpLength; i++)
    //        ExpData = this.pushToList(ExpData, "", 0, "BlankEntry",0,0);
    // else if (RevLength < ExpLength)
    //    for (let i = 0; i < ExpLength - RevLength; i++)
    //        RevData = this.pushToList(RevData, "", 0, "BlankEntry",0,0);
    // RevData = this.pushToList(RevData, "Total", GrossAmt + nonDirectIncome, "BoldTotal",0,0);
    // ExpData = this.pushToList(ExpData, "Total", this.NetProfit + nonDirectExpense, "BoldTotal",0,0);

    this.RevenueData = RevData;
    this.ExpenseData = ExpData;
  }

  pushCOA(data, COA) {
    if(this.RevenueData != undefined || this.RevenueData != null){
      this.RevenueData.COAList.forEach(a => {
        if (a.COA == COA) {
          data = this.pushToList(data, a.COA, a.TotalAmount, "BoldCategoryCOA", 0,0);
          a.LedgerGroupList.forEach(b => {
            data = this.pushToList(data, b.LedgerGroupName, b.LedgerGroupAmount, "ledgerGroupLevel", 0,0);
            b.LedgerList.forEach(c => {
              data = this.pushToList(data, c.LedgerName, CommonFunctions.parseAmount(c.Amount), "ledgerLevel", c.LedgerId,c.Code);
            });
          });
        }
      });
    }
    if(this.ExpenseData != undefined || this.ExpenseData != null){
        this.ExpenseData.COAList.forEach(a => {
          if (a.COA == COA) {
            data = this.pushToList(data, a.COA, a.TotalAmount, "BoldCategoryCOA", 0,0);
            a.LedgerGroupList.forEach(b => {
              data = this.pushToList(data, b.LedgerGroupName, b.LedgerGroupAmount, "ledgerGroupLevel", 0,0);
              b.LedgerList.forEach(c => {
                data = this.pushToList(data, c.LedgerName, CommonFunctions.parseAmount(c.Amount), "ledgerLevel", c.LedgerId,c.Code);
              });
            });
          }
        });
     }
    return data;
  }
  //common function for foramtting
  //it takes source list, name, amount and style string then return by attaching obj to it.
  pushToList(list, name, amt, style, ledgerId,code) {
    let Obj = new Object();
    Obj["Name"] = name;
    Obj["Amount"] = amt;
    Obj["Style"] = style;
    Obj["LedgerId"] = ledgerId;
    Obj["ShowLedgerGroup"] = false;
    Obj["ShowLedger"] = false;
    Obj["Code"] =code;
    list.push(Obj);

    return list;
  }

  Print(tableId) {
    // let popupWinindow;
    // var headerContent = document.getElementById("headerForPrint").innerHTML;
    // var printContents = '<b>Report Date Range: ' + this.fromDate + ' To ' + this.toDate + '</b>';
    // printContents += '<style> table { border-collapse: collapse; border-color: black; } th { color:black; background-color: #599be0; } </style>';
    // printContents += document.getElementById("printpage").innerHTML; 
    // this.showPrint = false;
    // this.printDetaiils = null;
    // this.changeDetector.detectChanges();
    // this.showPrint = true;
    // this.printDetaiils = headerContent + printContents ; //document.getElementById("printpage");
    this.accountingService.Print(tableId,this.dateRange);

  }
  ExportToExcel(tableId) {
    // if (tableId) {
    //   let workSheetName = 'Profit & Loss Report';
    //   let Heading = 'Profit & LossReport';
    //   let filename = 'ProfitAndLossReport';
    //   //NBB-send all parameters for now 
    //   //need enhancement in this function 
    //   //here from date and todate for show date range for excel sheet data
    //   CommonFunctions.ConvertHTMLTableToExcel(tableId, this.fromDate, this.toDate, workSheetName,
    //     Heading, filename);
    // }
    this.accountingService.ExportToExcel(tableId,this.dateRange);
  }
  SwitchViews(row) {
    this.ledgerId = row.LedgerId;
    this.ledgerName = row.Name;
    this.ledgerCode = row.Code;
    this.showLedgerDetail = true;
  }
  ShowReport($event) {
    this.showLedgerDetail = false;
  }
  ShowChild(row, level) {
    let flag = 1;
    for (let i = 0; i < this.RevenueData.length; i++) {
      if (flag == 0) {
        if (level == 'COA') {
          this.RevenueData[i].ShowLedgerGroup = (this.RevenueData[i].ShowLedgerGroup == true) ? false : true;
          if (this.RevenueData[i].ShowLedgerGroup == false) {
            this.RevenueData[i + 1].ShowLedger = false;
          }
          if (this.RevenueData[i].Style == 'BoldCategoryCOA') {
            break;
          }
        }
        else {
          this.RevenueData[i].ShowLedger = (this.RevenueData[i].ShowLedger == true) ? false : true;
          if (this.RevenueData[i].Style == 'ledgerGroupLevel') {
            break;
          }
        }
      }
      if (this.RevenueData[i] == row) {
        flag = 0;
      }
    }
  }
  //event onDateChange
  onDateChange($event) {
    this.showReportData = false;
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    var type = $event.type;
    this.checkDateValidation();
    this.ExpenseData = [];
    if (type != "custom") {
      this.loadData();
    }
  }

  checkDateValidation() {
    if(!this.validDate){
      this.msgBoxServ.showMessage("error", ['Select proper date.']);
      return false;
    }
    let flag = true;
    flag = moment(this.fromDate, "YYYY-MM-DD").isValid() == true ? flag : false;
    flag = moment(this.toDate, "YYYY-MM-DD").isValid() == true ? flag : false;
    flag = (this.toDate >= this.fromDate) == true ? flag : false;
    if (!flag) {
      this.msgBoxServ.showMessage("error", ['select proper date(FromDate <= ToDate)']);
    }
    return flag;
  }
  showExport(){

    let exportshow = this.coreservice.Parameters.find(a => a.ParameterName =="AllowOtherExport" && a.ParameterGroupName == "Accounting").ParameterValue;
        if ( exportshow== "true"){
          this.showExportbtn =true;     
        }
        else{
            this.showExportbtn = false;
        }
      }

}
