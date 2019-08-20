import { Component, Directive, ViewChild } from '@angular/core';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { AccountingReportsBLService } from "../shared/accounting-reports.bl.service";
import * as moment from 'moment/moment';
import { CommonFunctions } from '../../../shared/common.functions';
import { FiscalYearModel } from '../../settings/shared/fiscalyear.model';

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
  public currentFiscalYear: FiscalYearModel = new FiscalYearModel();
  public fiscalYearList: Array<FiscalYearModel> = new Array<FiscalYearModel>();

  constructor(
    public msgBoxServ: MessageboxService,
    public accReportBLServ: AccountingReportsBLService) {
    this.fromDate = moment().format('YYYY-MM-DD');
    this.toDate = moment().format('YYYY-MM-DD');
    this.GetCurrentFiscalYear();
    this.dateRange = "today";
  }
  GetCurrentFiscalYear() {
    try {
      this.accReportBLServ.GetFiscalYearsList().subscribe(res => {
        if (res.Status == "OK") {
          this.fiscalYearList = res.Results;
          this.currentFiscalYear = this.fiscalYearList.find(x => x.IsActive == true);
          this.IsDataLoaded = true;
        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
      });
    }
    catch (ex) {
      console.log(ex);
    }
  }
  checkValidFiscalYear() {
    var frmdate = moment(this.fromDate, "YYYY-MM-DD");
    var tdate = moment(this.toDate, "YYYY-MM-DD");
    var flag = false;
    this.fiscalYearList.forEach(a => {
      if ((moment(a.StartDate, 'YYYY-MM-DD') <= frmdate) && (tdate <= moment(a.EndDate, 'YYYY-MM-DD'))) {
        flag = true;
      }
    });
    if (!flag) {
      this.msgBoxServ.showMessage("error", ['Selected dates must be with in a fiscal year']);
    }
    return flag;
  }
  loadData() {
    if (this.checkDateValidation() && this.checkValidFiscalYear()) {
      this.accReportBLServ.GetProfitLossReport(this.fromDate, this.toDate).subscribe(res => {
        if (res.Status == "OK") {
          let data = res.Results;
          this.RevenueData = data.find(a => a.PrimaryGroup == "Revenue");
          this.ExpenseData = data.find(a => a.PrimaryGroup == "Expenses");
          this.CalculateTotalAmounts();
          this.formatDataforDisplay();
          this.showReportData = true;
        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
      });
    }
    else {
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
    RevData = this.pushCOA(RevData, "Direct Income");
    //inserting initial Types (Purchase)
    RevData = this.pushCOA(RevData, "Purchase");
    //inserting initial Types (Direct Expense)
    RevData = this.pushCOA(RevData, "Direct Expense");
    //Calculating Gross Amount
    let temp = RevData.find(a => a.Name == "Direct Income");
    GrossAmt = temp ? temp.Amount : 0;
    temp = RevData.find(a => a.Name == "Purchase");
    GrossAmt -= temp ? temp.Amount : 0;
    temp = RevData.find(a => a.Name == "Direct Expense");
    GrossAmt -= temp ? temp.Amount : 0;

    //inserting Blank Entries in List of make total in same line
    let RevLength = RevData.length;
    let ExpLength = ExpData.length + 1;
    if (RevLength > ExpLength)
      for (let i = 0; i < RevLength - ExpLength; i++)
        ExpData = this.pushToList(ExpData, "", 0, "BlankEntry", 0);
    else if (RevLength < ExpLength)
      for (let i = 0; i < ExpLength - RevLength; i++)
        RevData = this.pushToList(RevData, "", 0, "BlankEntry", 0);
    //inserting Gross in List
    if (GrossAmt >= 0) {
      RevData = this.pushToList(RevData, "Gross Profit", GrossAmt, "BoldTotal", 0);
    } else {
      RevData = this.pushToList(RevData, "Gross Loss", GrossAmt, "BoldTotal", 0);
    }

    //inserting initial Types (Indirect Income)Indirect Expenses
    RevData = this.pushCOA(RevData, "Indirect Income");

    //inserting initial Types (Indirect Expenses)
    RevData = this.pushCOA(RevData, "Indirect Expenses");

    TotalAmt = GrossAmt;
    temp = RevData.find(a => a.Name == "Indirect Income");
    TotalAmt += temp ? temp.Amount : 0;
    //inserting Total in List
    //RevData = this.pushToList(RevData, "Total", TotalAmt, "BoldCategory");



    let NetAmt = TotalAmt;
    if (RevData.find(a => a.Name == "Indirect Expenses") != null) {
      NetAmt = NetAmt - RevData.find(a => a.Name == "Indirect Expenses").Amount;
    }
    //inserting NetAmount in List
    if (NetAmt >= 0) {
      RevData = this.pushToList(RevData, "Net Profit", NetAmt, "BoldTotal", 0);
    } else {
      RevData = this.pushToList(RevData, "Net Loss", NetAmt, "BoldTotal", 0);
    }

    ////inserting other Types in List (except Direct Income)

    //this.RevenueData.COAList.forEach(a => {
    //    if (a.COA != "Direct Income") {
    //        nonDirectIncome = nonDirectIncome + a.COA != "Direct Income" ? a.TotalAmount : 0;
    //        RevData = this.pushToList(RevData, a.COA, a.TotalAmount, "BoldCategory");
    //        a.LedgerGroupList.forEach(b => {
    //            RevData = this.pushToList(RevData, b.LedgerGroupName, b.LedgerGroupAmount, "ledgerGroupLevel");
    //            b.LedgerList.forEach(c => {
    //                RevData = this.pushToList(RevData, c.LedgerName, CommonFunctions.parseAmount(c.Amount), "ledgerLevel");
    //            });
    //        });
    //    }
    //});

    ////inserting other Types in List (except Cost of Goods Sold and Direct Expense)
    //this.ExpenseData.COAList.forEach(a => {
    //    if (a.COA != "Direct Expense" && a.COA != "Cost of Goods Sold") {
    //        nonDirectExpense = nonDirectExpense + a.COA != "Direct Expense" ? a.TotalAmount : 0;
    //        ExpData = this.pushToList(ExpData, a.COA, a.TotalAmount, "BoldCategory");
    //        a.LedgerGroupList.forEach(b => {
    //            ExpData = this.pushToList(ExpData, b.LedgerGroupName, b.LedgerGroupAmount, "ledgerGroupLevel");
    //            b.LedgerList.forEach(c => {
    //                ExpData = this.pushToList(ExpData, c.LedgerName, CommonFunctions.parseAmount(c.Amount), "ledgerLevel");
    //            });
    //        });
    //    }
    //});
    ////calculating Net Amount and inserting in ExpData
    //this.NetProfit = GrossAmt + nonDirectIncome - nonDirectExpense;
    //if (this.NetProfit >= 0) {
    //    ExpData = this.pushToList(ExpData, "Net Profit", this.NetProfit, "BoldCategory");
    //}
    //else {
    //    this.NetProfit = -this.NetProfit;
    //    RevData = this.pushToList(RevData, "Net Loss", this.NetProfit, "BoldCategory");
    //    this.NetProfit = -this.NetProfit;
    //}


    ////inserting blank Entry to make total in same line
    //RevLength = RevData.length;
    //ExpLength = ExpData.length;
    //if (RevLength > ExpLength)
    //    for (let i = 0; i < RevLength - ExpLength; i++)
    //        ExpData = this.pushToList(ExpData, "", 0, "BlankEntry");
    //else if (RevLength < ExpLength)
    //    for (let i = 0; i < ExpLength - RevLength; i++)
    //        RevData = this.pushToList(RevData, "", 0, "BlankEntry");
    //RevData = this.pushToList(RevData, "Total", GrossAmt + nonDirectIncome, "BoldTotal");
    //ExpData = this.pushToList(ExpData, "Total", this.NetProfit + nonDirectExpense, "BoldTotal");

    this.RevenueData = RevData;
    this.ExpenseData = ExpData;
  }

  pushCOA(data, COA) {
    this.RevenueData.COAList.forEach(a => {
      if (a.COA == COA) {
        data = this.pushToList(data, a.COA, a.TotalAmount, "BoldCategoryCOA", 0);
        a.LedgerGroupList.forEach(b => {
          data = this.pushToList(data, b.LedgerGroupName, b.LedgerGroupAmount, "ledgerGroupLevel", 0);
          b.LedgerList.forEach(c => {
            data = this.pushToList(data, c.LedgerName, CommonFunctions.parseAmount(c.Amount), "ledgerLevel", c.LedgerId);
          });
        });
      }
    });
    this.ExpenseData.COAList.forEach(a => {
      if (a.COA == COA) {
        data = this.pushToList(data, a.COA, a.TotalAmount, "BoldCategoryCOA", 0);
        a.LedgerGroupList.forEach(b => {
          data = this.pushToList(data, b.LedgerGroupName, b.LedgerGroupAmount, "ledgerGroupLevel", 0);
          b.LedgerList.forEach(c => {
            data = this.pushToList(data, c.LedgerName, CommonFunctions.parseAmount(c.Amount), "ledgerLevel", c.LedgerId);
          });
        });
      }
    });
    return data;
  }
  //common function for foramtting
  //it takes source list, name, amount and style string then return by attaching obj to it.
  pushToList(list, name, amt, style, ledgerId) {
    let Obj = new Object();
    Obj["Name"] = name;
    Obj["Amount"] = amt;
    Obj["Style"] = style;
    Obj["LedgerId"] = ledgerId;
    Obj["ShowLedgerGroup"] = false;
    Obj["ShowLedger"] = false;
    list.push(Obj);

    return list;
  }

  Print() {
    let popupWinindow;
    var headerContent = document.getElementById("headerForPrint").innerHTML;
    var printContents = '<b>Report Date Range: ' + this.fromDate + ' To ' + this.toDate + '</b>';
    printContents += '<style> table { border-collapse: collapse; border-color: black; } th { color:black; background-color: #599be0; } </style>';
    printContents += document.getElementById("printpage").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    let documentContent = "<html><head>";
    documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../themes/theme-default/DanphePrintStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
    documentContent += '</head>';
    documentContent += '<body onload="window.print()">' + headerContent + printContents + '</body></html>'
    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();
  }
  ExportToExcel(tableId) {
    if (tableId) {
      let workSheetName = 'Profit & Loss Report';
      let Heading = 'Profit & LossReport';
      let filename = 'ProfitAndLossReport';
      //NBB-send all parameters for now 
      //need enhancement in this function 
      //here from date and todate for show date range for excel sheet data
      CommonFunctions.ConvertHTMLTableToExcel(tableId, this.fromDate, this.toDate, workSheetName,
        Heading, filename);
    }
  }
  SwitchViews(row) {
    this.ledgerId = row.LedgerId;
    this.ledgerName = row.Name;
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
    let flag = true;
    flag = moment(this.fromDate, "YYYY-MM-DD").isValid() == true ? flag : false;
    flag = moment(this.toDate, "YYYY-MM-DD").isValid() == true ? flag : false;
    flag = (this.toDate >= this.fromDate) == true ? flag : false;
    if (!flag) {
      this.msgBoxServ.showMessage("error", ['select proper date(FromDate <= ToDate)']);
    }
    return flag;
  }
}
