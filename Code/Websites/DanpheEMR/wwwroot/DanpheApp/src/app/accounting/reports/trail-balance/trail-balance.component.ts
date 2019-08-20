import { Component, Directive, ViewChild } from '@angular/core';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { AccountingReportsBLService } from "../shared/accounting-reports.bl.service";
import { CommonFunctions } from '../../../shared/common.functions';
import * as moment from 'moment/moment';
import { TrialBalanceReportVM } from "../shared/trial-balance-reportvm.model";
import { FiscalYearModel } from '../../settings/shared/fiscalyear.model';

@Component({
  selector: 'my-app',
  templateUrl: "./trail-balance-report.html"
})

export class TrailBalanceReportComponent {

  public reportData: Array<TrialBalanceReportVM> = new Array<TrialBalanceReportVM>();
  public TotalDrCr: Array<any> = [];
  public fromDate: string = null;
  public toDate: string = null;
  public currentFiscalYear: FiscalYearModel = new FiscalYearModel();
  public fiscalYearList: Array<FiscalYearModel> = new Array<FiscalYearModel>();
  public selectedFiscalYear: any;
  public IsDetailsView: boolean = false;
  public showLedgerDetail: boolean = false;
  public ledgerId: number = 0;
  public ledgerName: string = '';
  public IsShowReport: boolean = false;
  public dateRange: string = null;
  public IsDataLoaded: boolean = false;

  constructor(
    public msgBoxServ: MessageboxService,
    public accReportBLServ: AccountingReportsBLService) {
    this.fromDate = moment().format('YYYY-MM-DD');
    this.toDate = moment().format('YYYY-MM-DD');
    this.GetCurrentFiscalYear();
    this.dateRange = "today";
  }
  //event onDateChange
  onDateChange($event) {
    this.IsShowReport = false;
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    var type = $event.type;
    this.checkDateValidation();
    this.reportData = new Array<TrialBalanceReportVM>();
    if (type != "custom") {
      this.GetTrialBalanceRpt();
    }
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
  ChangeFiscalYear() {
    this.currentFiscalYear = this.fiscalYearList.find(x => x.FiscalYearId == parseInt(this.selectedFiscalYear));
  }
  GetTrialBalanceRpt() {
    if (this.checkDateValidation() && this.checkValidFiscalYear()) {
      this.accReportBLServ.GetTrailBalanceReport(this.fromDate, this.toDate).subscribe(res => {
        if (res.Status == "OK") {
          this.IsShowReport = true;
          this.MapAndMakeTrialReport(res.Results);
        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
      });
    }
    else {
      this.IsShowReport = false;
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
  MapAndMakeTrialReport(trialReportData) {
    for (let i = 0; i < 6; i++) {
      this.TotalDrCr[i] = 0;
    }
    try {
      let rowData = trialReportData;
      this.reportData = new Array<TrialBalanceReportVM>();
      if (rowData.length > 0) {
        rowData.forEach(row => {
          let parent = new TrialBalanceReportVM();
          //parent level is COA
          parent.level = "COA";
          parent.Particulars = row.Particulars;
          parent.OpeningCr = parent.OpeningDr = 0;
          parent.CurrentCr = parent.CurrentDr = 0;
          parent.TotalDr = parent.TotalCr = 0;
          this.reportData.push(parent);//push parent to list

          row.LedgerGroupList.forEach(ledgerGroup => {
            let child = new TrialBalanceReportVM();
            //child level is LedgerGroup
            child.level = "LedgerGroup";
            child.Particulars = ledgerGroup.Particulars;
            child.OpeningCr = child.OpeningDr = 0;
            child.CurrentCr = child.CurrentDr = 0;
            child.TotalDr = child.TotalCr = 0;
            this.reportData.push(child);//push child to list

            ledgerGroup.LedgerList.forEach(ledger => {
              let subChild = new TrialBalanceReportVM();
              //subchild Level is Ledger
              subChild.level = "Ledger";
              subChild.Particulars = ledger.Particulars;
              subChild.LedgerId = ledger.LedgerId;
              ledger.OpeningDr = ledger.OpeningDr + ledger.OpeningBalDr;
              ledger.OpeningCr = ledger.OpeningCr + ledger.OpeningBalCr;
              //calculate opening Debit/Credit balance (upto fromDate)
              if (ledger.OpeningDr >= ledger.OpeningCr) {
                subChild.OpeningDr = ledger.OpeningDr - ledger.OpeningCr;
                subChild.OpeningCr = 0;
              } else {
                subChild.OpeningCr = ledger.OpeningCr - ledger.OpeningDr;
                subChild.OpeningDr = 0;
              }
              //calculate current Debit/Credit balance (fromDate to toDate)
              if (ledger.CurrentDr >= ledger.CurrentCr) {
                subChild.CurrentDr = ledger.CurrentDr - ledger.CurrentCr;
                subChild.CurrentCr = 0;
              } else {
                subChild.CurrentCr = ledger.CurrentCr - ledger.CurrentDr;
                subChild.CurrentDr = 0;
              }
              //calculate total of subChild Dr/Cr
              subChild.TotalDr = subChild.CurrentDr + subChild.OpeningDr;
              subChild.TotalCr = subChild.CurrentCr + subChild.OpeningCr;

              if (ledger.Details.length > 0) {
                for (let i = 0; i < ledger.Details.length; i++) {
                  if (ledger.Details[i].Dr >= ledger.Details[i].Cr) {
                    ledger.Details[i].Dr = ledger.Details[i].Dr - ledger.Details[i].Cr;
                    ledger.Details[i].Cr = 0;
                  }
                  else {
                    ledger.Details[i].Cr = ledger.Details[i].Cr - ledger.Details[i].Dr;
                    ledger.Details[i].Dr = 0;
                  }
                }
                subChild.Details = ledger.Details;
              }
              if (subChild.OpeningCr != subChild.OpeningDr || subChild.CurrentCr != subChild.CurrentDr) {
                this.reportData.push(subChild);//push subchild
              }

              //add current Dr/Cr of subchild to current Dr/Cr of child
              child.CurrentDr = child.CurrentDr + subChild.CurrentDr;
              child.CurrentCr = child.CurrentCr + subChild.CurrentCr;
              //calculate opening Debit/Credit balance (upto fromDate)
              child.OpeningDr = child.OpeningDr + subChild.OpeningDr;
              child.OpeningCr = child.OpeningCr + subChild.OpeningCr;
            });
            //calculate total of child Dr/Cr
            child.TotalDr = child.OpeningDr + child.CurrentDr;
            child.TotalCr = child.OpeningCr + child.CurrentCr;

            //add current Dr/Cr of child to current Dr/Cr of parent
            parent.CurrentDr = parent.CurrentDr + child.CurrentDr;
            parent.CurrentCr = parent.CurrentCr + child.CurrentCr;
            //calculate opening Debit/Credit balance (upto fromDate)
            parent.OpeningDr = parent.OpeningDr + child.OpeningDr;
            parent.OpeningCr = parent.OpeningCr + child.OpeningCr;
          });
          //calculate total of parent Dr/Cr
          parent.TotalDr = parent.OpeningDr + parent.CurrentDr;
          parent.TotalCr = parent.OpeningCr + parent.CurrentCr;

          //grandtotal for opening Dr/Cr
          this.TotalDrCr[0] = this.TotalDrCr[0] + parent.OpeningDr;
          this.TotalDrCr[1] = this.TotalDrCr[1] + parent.OpeningCr;
          //grandtotal for current Dr/Cr
          this.TotalDrCr[2] = this.TotalDrCr[2] + parent.CurrentDr;
          this.TotalDrCr[3] = this.TotalDrCr[3] + parent.CurrentCr;
          //grandtotal for total Dr/Cr
          this.TotalDrCr[4] = this.TotalDrCr[4] + parent.TotalDr;
          this.TotalDrCr[5] = this.TotalDrCr[5] + parent.TotalCr;
        });
      } else {
        this.msgBoxServ.showMessage("notice", ['NO RECORD FOUND']);
      }
    } catch (ex) {
      console.log(ex);
    }
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
    documentContent += '<body onload="window.print()">' + headerContent + printContents + '</body></html>';
    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();
  }
  ExportToExcel(tableId) {
    if (tableId) {
      let workSheetName = 'Trial Balance Report';
      let Heading = 'Trial Balance Report';
      let filename = 'TrialBalanceReport';
      //NBB-send all parameters for now 
      //need enhancement in this function 
      //here from date and todate for show date range for excel sheet data
      CommonFunctions.ConvertHTMLTableToExcel(tableId, this.fromDate, this.toDate, workSheetName,
        Heading, filename);
    }
  }
  SwitchViews(row) {
    this.ledgerId = row.LedgerId;
    this.ledgerName = row.Particulars;
    this.showLedgerDetail = true;
  }
  ShowReport($event) {
    this.showLedgerDetail = false;
  }
  showChild(row, level) {
    let flag = 1;
    for (let i = 0; i < this.reportData.length; i++) {
      if (flag == 0) {
        if (level == 'COA') {
          this.reportData[i].ShowLedgerGroup = (this.reportData[i].ShowLedgerGroup == true) ? false : true;
          if (this.reportData[i].ShowLedgerGroup == false) {
            this.reportData[i + 1].ShowLedger = false;
          }
          if (this.reportData[i].level == 'COA') {
            break;
          }
        }
        else {
          this.reportData[i].ShowLedger = (this.reportData[i].ShowLedger == true) ? false : true;
          if (this.reportData[i].level == 'LedgerGroup') {
            break;
          }
        }
      }
      if (this.reportData[i] == row) {
        flag = 0;
      }
    }
  }
}
