import { ChangeDetectorRef, Component } from "@angular/core";
import * as moment from 'moment/moment';
import { CoreService } from "../../..//core/shared/core.service";
import { SecurityService } from "../../../security/shared/security.service";
import { NepaliCalendarService } from "../../../shared/calendar/np/nepali-calendar.service";
import { CommonFunctions } from "../../../shared/common.functions";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RouteFromService } from "../../../shared/routefrom.service";
import { ENUM_DateTimeFormat } from "../../../shared/shared-enums";
import { CostCenterModel } from "../../settings/shared/cost-center.model";
import { ledgerGroupModel } from "../../settings/shared/ledgerGroup.model";
import { AccountingService } from '../../shared/accounting.service';
import { LedgerReportRequest_DTO } from "../shared/DTOs/ledger-report-request.dto";
import { AccountingReportsBLService } from '../shared/accounting-reports.bl.service';

@Component({
  selector: 'ledger-report',
  templateUrl: './ledger-report.html',
  host: { '(window:keyup)': 'hotkeys($event)' },
})
export class LedgerReportComponent {
  public ledgerResult: any;
  public IsOpeningBalance: boolean = false;
  public ledgerList: Array<{ LedgerId: number, LedgerName: string, LedgerGroupId: number, Code: string }> = [];
  public selLedger: { LedgerId, LedgerName, Code } = null;
  public txnGridColumns: Array<any> = null;
  public transactionId: number = null;
  public fromDate: string = null;
  public toDate: string = null;
  public selectedFiscalYear: any;
  public IsActive: boolean = true;
  public IsDetailsView: boolean = true;
  public voucherNumber: string = null;
  public actionView: boolean = true;
  public showExportbtn: boolean = false;
  public selLedgerName: string = "";
  public todayDate: string = null;
  public showPrint: boolean = false;
  public printDetaiils: any;
  public isDateFormatBS: boolean = true;// by default it'll be true.
  public datePref: string = "";
  public calType: string = "";
  public showTxnItemLevel: string = 'true'; //default value is true
  clicked = false;
  public showParticularcheckBox: boolean = true;
  public showParticularColumn: boolean = false;
  public ledgerResultView: any;
  public footerContent = '';
  public printBy: string = '';
  public dateRange: string = '';
  public headerContent = '';
  public reportHeader: string = 'Report Data';
  public printTitle: string = "";
  public ledgergroupList: Array<ledgerGroupModel> = new Array<ledgerGroupModel>();
  public selectedLedgerGroup: any;
  public filteredLedgerList: Array<{ LedgerId: number, LedgerName: string, LedgerGroupId: number }> = [];
  public selectedLedgerLists: Array<number> = [];
  public ledgerResultRawData: any;
  public ledgerDataList: any;
  public OriginalDataList: any;
  public viewMode: string = "summary";
  public viewDetailPopUp: boolean = false;
  public PopUpLedgerData: any;
  public showLedgerDetail: boolean = false;
  public ledgerId: number = 0;
  public ledgerName: string = '';
  public ledgerCode: any;
  public HideZeroTxn: boolean = false;
  public costCenters: Array<CostCenterModel> = new Array<CostCenterModel>();
  public selectedCostCenter: number = -2; // We are passing -2 to indicate all costcenter is selected in dropdown..
  constructor(
    public accReportBLService: AccountingReportsBLService,
    public routeFrom: RouteFromService,
    public coreservice: CoreService,
    public msgBoxServ: MessageboxService,
    public accountingService: AccountingService,
    public changeDetector: ChangeDetectorRef,
    public securityService: SecurityService,
    public nepaliCalendarService: NepaliCalendarService,) {
    this.todayDate = moment().format('YYYY-MM-DD');
    this.fromDate = moment().format('YYYY-MM-DD');
    this.toDate = moment().format('YYYY-MM-DD');
    this.GetLedgerGroup();
    //this.txnGridColumns = GridColumnSettings.LedgerTransactionList;
    this.GetLedgers();
    this.showExport();
    this.AssignCoreParameterValue();
    //this.LoadCalendarTypes();
    this.calType = this.coreservice.DatePreference;
    if (this.coreservice.DatePreference == 'np') {
      this.isDateFormatBS = true;
      this.datePref = "(BS)";
    }
    else {
      this.isDateFormatBS = false;
      this.datePref = "(AD)";
    }
    this.costCenters = this.accountingService.accCacheData.CostCenters ? this.accountingService.accCacheData.CostCenters : [];
  }
  public selectedDate: string = "";
  public fiscalYearId: number = null;

  public validDate: boolean = true;
  public headerDetail: any;
  selectDate(event) {
    if (event) {
      this.fromDate = event.fromDate;
      this.toDate = event.toDate;
      this.fiscalYearId = event.fiscalYearId;
      this.validDate = true;
      this.dateRange = "&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
    }
    else {
      this.validDate = false;
    }
  }
  AssignCoreParameterValue() {
    var showTxnItemLevelPar = this.coreservice.Parameters.filter(p => p.ParameterGroupName.toLowerCase() == "accounting" && p.ParameterName == "ShowLedgerReportTxnItemLevel");
    this.showTxnItemLevel = (showTxnItemLevelPar.length > 0) ? showTxnItemLevelPar[0].ParameterValue : 'true';

    var showParticular = this.coreservice.Parameters.filter(p => p.ParameterGroupName.toLowerCase() == "accounting" && p.ParameterName == "AccLedgerReportShowParticulars");
    var val = (showParticular.length > 0) ? showParticular[0].ParameterValue : 'false';
    this.showParticularcheckBox = JSON.parse(val);
    var paramValue = this.coreservice.Parameters.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader").ParameterValue;
    if (paramValue) {
      this.headerDetail = JSON.parse(paramValue);
    }
    else {
      this.msgBoxServ.showMessage("error", ["Error getting parameters"]);
    }

    this.accountingService.getCoreparameterValue();

  }
  //loads CalendarTypes from Paramter Table (database) and assign the require CalendarTypes to local variable.
  LoadCalendarTypes() {
    let Parameter = this.coreservice.Parameters;
    Parameter = Parameter.filter(parms => parms.ParameterName == "CalendarTypes");
    let calendarTypeObject = JSON.parse(Parameter[0].ParameterValue);
    this.calType = calendarTypeObject.AccountingModule;
  }

  public GetLedgers() {
    if (!!this.accountingService.accCacheData.Ledgers && this.accountingService.accCacheData.Ledgers.length > 0) { //mumbai-team-june2021-danphe-accounting-cache-change
      this.ledgerList = this.accountingService.accCacheData.Ledgers; //mumbai-team-june2021-danphe-accounting-cache-change
      this.ledgerList = this.ledgerList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
      this.filteredLedgerList = this.ledgerList;
    }
  }



  DisplayParticular() {
    this.IsDetailsView = (this.IsDetailsView == true) ? false : true;
  }
  showItemDetails() {
    //this.IsDetailsView = (this.IsDetailsView == true) ? false : true;   

    // if (this.IsDetailsView) {
    // this.GroupViewData(this.ledgerResult);
    // }
    // else{
    //   this.ledgerResult = this.ledgerResultView;
    // }
  }
  showParticularCol() {
    this.showParticularColumn = (this.showParticularColumn == true) ? false : true;
  }

  public GetTxnList() {
    let postData = new LedgerReportRequest_DTO();
    postData.LedgerIds = this.selectedLedgerLists;
    postData.FromDate = this.fromDate;
    postData.ToDate = this.toDate;
    postData.FiscalYearId = this.fiscalYearId;
    postData.CostCenterId = this.selectedCostCenter;

    this.clicked = true;
    this.ledgerDataList = null;
    this.ledgerDataList = null;
    if (this.CheckSelLedger() && this.checkDateValidation()) {
      //this.ledgerResult = null;
      this.accReportBLService.GetLedgerListReport(postData)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.clicked = false;
            if (res.Results.result.length || res.Results.dataList.length) {
              // this.ledgerResult = res.Results.result;
              // let obj = _.cloneDeep(this.ledgerResult);
              // obj = obj.filter(a=> a.TransactionItems != null);
              // {
              //   obj.forEach(element => {
              //     let data = element.TransactionItems.reduce((acc, currVal) => {
              //       if (acc.hasOwnProperty(currVal.LedgerId)) {
              //         acc[currVal.DrCr].Amount += currVal.Amount;
              //       } else {
              //         acc[currVal.DrCr] = currVal;
              //       }
              //       return acc;
              //     }, []);
              //     this.tempItemList.push(data);
              //   });
              // }
              this.ledgerResultView = res.Results.result;
              this.ledgerResultRawData = res.Results.result;
              if (this.showTxnItemLevel != 'true') {
                this.GroupViewData(res.Results.result);
              }
              this.ledgerDataList = res.Results.dataList;
              this.ledgerDataList.forEach(e => {
                let CrTotalAmt = 0;
                let DrTotalAmt = 0;
                let OpeningBalanceAmt = 0;
                let OpeningBalanceDrAmt = 0;
                let OpeningBalanceCrAmt = 0;
                this.IsOpeningBalance = false;
                e.ledgerResult = this.ledgerResultRawData.filter(a => a.LedgerId == e.LedgerId);
                e.LedgerName = this.ledgerList.filter(a => a.LedgerId == e.LedgerId)[0].LedgerName;
                e.Code = this.ledgerList.filter(a => a.LedgerId == e.LedgerId)[0].Code;

                // if (this.showTxnItemLevel != 'true') {
                //   this.GroupViewData(res.Results.result);
                // }
                if (e.ledgerResult.length > 0) {
                  e.ledgerResult.forEach(a => {
                    DrTotalAmt += a.LedgerDr;
                    CrTotalAmt += a.LedgerCr;
                    OpeningBalanceCrAmt = 0; OpeningBalanceDrAmt = 0;
                    a.OpeningBalanceType ? OpeningBalanceDrAmt = a.OpeningBalance : OpeningBalanceCrAmt = a.OpeningBalance;
                  })
                  if (OpeningBalanceDrAmt < 0) {
                    OpeningBalanceCrAmt = -OpeningBalanceDrAmt;
                    OpeningBalanceDrAmt = 0;
                  }
                  if (OpeningBalanceCrAmt < 0) {
                    OpeningBalanceDrAmt = -OpeningBalanceCrAmt;
                    OpeningBalanceCrAmt = 0;
                  }
                  e.ledgerResult.DrTotalAmount = CommonFunctions.parseAmount(DrTotalAmt);
                  e.ledgerResult.CrTotalAmount = CommonFunctions.parseAmount(CrTotalAmt);

                  e.ledgerResult.OpeningBalanceDrAmount = CommonFunctions.parseAmount(OpeningBalanceDrAmt);
                  e.ledgerResult.OpeningBalanceCrAmount = CommonFunctions.parseAmount(OpeningBalanceCrAmt);
                  //e.ledgerResult.LedgerName = this.selLedger.LedgerName;
                  // this.selLedgerName = this.selLedger.LedgerName;
                  // Calculating Debit total amount and credit total amount
                  if (e.ledgerResult.DrTotalAmount > e.ledgerResult.CrTotalAmount) {
                    if (e.ledgerResult.OpeningBalanceDrAmount > e.ledgerResult.OpeningBalanceCrAmount) {
                      e.ledgerResult.DrNetAmount = e.ledgerResult.DrTotalAmount - e.ledgerResult.CrTotalAmount + e.ledgerResult.OpeningBalanceDrAmount;
                    }
                    else {
                      e.ledgerResult.DrNetAmount = e.ledgerResult.DrTotalAmount - e.ledgerResult.CrTotalAmount - e.ledgerResult.OpeningBalanceCrAmount;
                    }
                    if (e.ledgerResult.DrNetAmount < 0) {
                      e.ledgerResult.CrNetAmount = - e.ledgerResult.DrNetAmount;
                      e.ledgerResult.DrNetAmount = 0;
                    }
                  }
                  else {
                    if (e.ledgerResult.OpeningBalanceDrAmount < e.ledgerResult.OpeningBalanceCrAmount) {
                      e.ledgerResult.CrNetAmount = e.ledgerResult.CrTotalAmount - e.ledgerResult.DrTotalAmount + e.ledgerResult.OpeningBalanceCrAmount;
                    }
                    else {
                      e.ledgerResult.CrNetAmount = e.ledgerResult.CrTotalAmount - e.ledgerResult.DrTotalAmount - e.ledgerResult.OpeningBalanceDrAmount;
                    }
                    if (e.ledgerResult.CrNetAmount < 0) {
                      e.ledgerResult.DrNetAmount = - e.ledgerResult.CrNetAmount;
                      e.ledgerResult.CrNetAmount = 0;
                    }
                  }

                  e.ledgerResult.OpeningBalanceDrAmount = CommonFunctions.parseAmount(OpeningBalanceDrAmt);
                  e.ledgerResult.OpeningBalanceCrAmount = CommonFunctions.parseAmount(OpeningBalanceCrAmt);

                }
                else {
                  e.ledgerResult = this.ledgerDataList.filter(a => a.LedgerId == e.LedgerId);
                  (e.AmountDr >= e.AmountCr) ? OpeningBalanceDrAmt = e.AmountDr - e.AmountCr : OpeningBalanceCrAmt = e.AmountCr - e.AmountDr;
                  e.ledgerResult.DrNetAmount = OpeningBalanceDrAmt;
                  e.ledgerResult.CrNetAmount = OpeningBalanceCrAmt;
                  e.ledgerResult.OpeningBalanceDrAmount = CommonFunctions.parseAmount(OpeningBalanceDrAmt);
                  e.ledgerResult.OpeningBalanceCrAmount = CommonFunctions.parseAmount(OpeningBalanceCrAmt);
                }

              });
            }
            // else if (!res.Results.result.length) {
            //   this.ledgerResultRawData = res.Results.result;
            //   let dataList = res.Results.dataList;
            //   this.ledgerDataList = res.Results.dataList;
            //   this.ledgerDataList.forEach(e => {
            //     let OpeningBalanceAmt = 0;
            //     let OpeningBalanceDrAmt = 0;
            //     let OpeningBalanceCrAmt = 0;
            //     this.IsOpeningBalance = false;
            //     e.ledgerResult = [];
            //     e.LedgerName = this.ledgerList.filter(a=> a. LedgerId == e.LedgerId)[0].LedgerName;
            //     e.Code = this.ledgerList.filter(a=> a.LedgerId == e.LedgerId)[0].Code;
            //     (e.AmountDr >= e.AmountCr) ? OpeningBalanceDrAmt = e.AmountDr - e.AmountCr : OpeningBalanceCrAmt = e.AmountCr - e.AmountDr;
            //     e.ledgerResult.DrNetAmount = OpeningBalanceDrAmt;
            //     e.ledgerResult.CrNetAmount = OpeningBalanceCrAmt;
            //     e.ledgerResult.OpeningBalanceDrAmount = CommonFunctions.parseAmount(OpeningBalanceDrAmt);
            //     e.ledgerResult.OpeningBalanceCrAmount = CommonFunctions.parseAmount(OpeningBalanceCrAmt);
            //   });
            // }
            else {
              this.clicked = false;
              this.msgBoxServ.showMessage("failed", ["No Records found."]);
              this.ledgerResultRawData = null;
            }

            this.BalanceCalculation();
            this.OriginalDataList = this.ledgerDataList;
            this.HandleHideZeroTxn();
          }//ok if closed here
          else {
            this.clicked = false;
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
          }
        });

    }
    else {
      this.clicked = false;
    }

  }

  HandleHideZeroTxn() {
    if (this.HideZeroTxn && this.ledgerDataList && this.ledgerDataList.length > 0) {
      var data = this.ledgerDataList.filter(a => a.ledgerResult.some(result => (result.AmountCr !== 0 || result.AmountDr !== 0)));
      this.ledgerDataList = data;
    }
    else {
      this.ledgerDataList = this.OriginalDataList;
    }
  }

  BalanceCalculation() {
    this.ledgerDataList && this.ledgerDataList.length && this.ledgerDataList.forEach(e => {
      if (this.ledgerList && (e.ledgerResult && e.ledgerResult.length > 0)) {
        //console.log(JSON.stringify(this.ledgerResult));
        //this sort is for TransactionDate ASCENDING..
        e.ledgerResult.sort(function (a, b) {
          if (a.TransactionDate > b.TransactionDate) return 1;
          if (a.TransactionDate < b.TransactionDate) return -1;
          return 0;
        });
        // console.log(JSON.stringify(this.ledgerResult));
        var openingBal = (e.ledgerResult.OpeningBalanceDrAmount > 0) ? e.ledgerResult.OpeningBalanceDrAmount : e.ledgerResult.OpeningBalanceCrAmount;
        var balanceType = (e.ledgerResult.OpeningBalanceDrAmount > 0) ? "DR" : (e.ledgerResult.OpeningBalanceCrAmount > 0) ? "CR" : "NA";
        var lastBalance = openingBal;
        var lastTypeDr = balanceType;
        for (var i = 0; i < e.ledgerResult.length; i++) {
          if (lastTypeDr == "NA") {//if opening balance DR and CR same (i.e. both zero, both same amount) then drcr may be clitical to define
            if (e.ledgerResult[i].DrCr == true) {
              lastBalance = lastBalance + e.ledgerResult[i].LedgerDr;
              e.ledgerResult[i].Balance = lastBalance;
              lastTypeDr = "DR";
              e.ledgerResult[i].BalanceType = true;
            }
            else {
              e.ledgerResult[i].Balance = (lastBalance > e.ledgerResult[i].LedgerCr) ? lastBalance - e.ledgerResult[i].LedgerCr : e.ledgerResult[i].LedgerCr - lastBalance;
              lastTypeDr = (lastBalance > e.ledgerResult[i].LedgerCr) ? lastTypeDr : "CR";
              lastBalance = e.ledgerResult[i].Balance;
              e.ledgerResult[i].BalanceType = (lastTypeDr == "CR") ? false : true;

            }
          }
          else if (lastTypeDr == "DR") {//debit record transaction
            if (e.ledgerResult[i].DrCr == true) {
              lastBalance = lastBalance + e.ledgerResult[i].LedgerDr;
              e.ledgerResult[i].Balance = lastBalance;
              lastTypeDr = "DR";
              e.ledgerResult[i].BalanceType = true;
            }
            else {
              e.ledgerResult[i].Balance = (lastBalance > e.ledgerResult[i].LedgerCr) ? lastBalance - e.ledgerResult[i].LedgerCr : e.ledgerResult[i].LedgerCr - lastBalance;
              lastTypeDr = (lastBalance > e.ledgerResult[i].LedgerCr) ? lastTypeDr : "CR";
              lastBalance = e.ledgerResult[i].Balance;
              e.ledgerResult[i].BalanceType = (lastTypeDr == "CR") ? false : true;
            }
          } else if (lastTypeDr == "CR") {///Credit record calculation here
            if (e.ledgerResult[i].DrCr == false) {
              lastBalance = lastBalance + e.ledgerResult[i].LedgerCr;
              e.ledgerResult[i].Balance = lastBalance;
              lastTypeDr = "CR";
              e.ledgerResult[i].BalanceType == false;
            } else if (e.ledgerResult[i].DrCr == true) {
              var ll = (e.ledgerResult[i].LedgerDr < lastBalance) ? lastBalance - e.ledgerResult[i].LedgerDr : e.ledgerResult[i].LedgerDr - lastBalance;
              lastTypeDr = (e.ledgerResult[i].LedgerDr > lastBalance) ? "DR" : lastTypeDr;
              lastBalance = ll;
              e.ledgerResult[i].Balance = lastBalance;
              e.ledgerResult[i].BalanceType = (lastTypeDr == "DR") ? true : false;

            }
          }
          let flag = (lastTypeDr == "DR") ? true : false;
          e.ledgerResult[i].BalanceType = flag;
        }


        //sud:18Mar'20 -- add a new property to each ledger in thelist to use it later.
        if (e.ledgerResult && e.ledgerResult.length > 0) {
          e.ledgerResult.forEach(led => {
            led["IsHighlighted"] = false;
          });
        }


        //this.ledgerResult[1].BalanceType=false;
        //console.log(JSON.stringify(this.ledgerResult));
      }
    });
  }
  CheckSelLedger(): boolean {

    if (!this.selectedLedgerLists || typeof (this.selectedLedgerLists) != 'object' || this.selectedLedgerLists.length < 1) {

      this.selLedger = undefined;
      this.msgBoxServ.showMessage("failed", ["Select ledger from the list."]);
      this.clicked = false;
      return false;
    }
    else
      return true;
  }

  ViewTransactionDetails(voucherNumber: string) {

    this.transactionId = null;
    this.voucherNumber = null;
    this.changeDetector.detectChanges();
    this.voucherNumber = voucherNumber;
    this.routeFrom.RouteFrom = "LedgerReport"
  }


  LedgerListFormatter(data: any): string {
    return data["Code"] + "-" + data["LedgerName"] + " | " + data["PrimaryGroup"] + " -> " + data["LedgerGroupName"];
  }

  checkDateValidation() {
    let flag = true;
    if (!this.validDate) {
      this.msgBoxServ.showMessage("error", ['Select proper date.']);
      let flag = false;
    }

    return flag;
  }
  Print(tableId) {
    // this.showPrint = false;
    // this.printDetaiils = null;
    // this.changeDetector.detectChanges();
    //this.showPrint = true;
    // this.printDetaiils = document.getElementById("printpage");
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
      var printContents = `<div>
                          <p class='alignleft'>${this.reportHeader}</p>
                          <p class='alignleft'><b>For the period:</b>
                          ${this.dateRange}<br/></p>
                          <p class='alignright'>
                            ${this.printBy}<br /> 
                            <b>Printed On:</b> (AD)${printDate}<br /> 
                          </p>
                        </div>`
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
  public ExportToExcel(tableId) {
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
      filename = workSheetName = this.accountingService.paramExportToExcelData.HeaderTitle + moment().format(ENUM_DateTimeFormat.Year_Month_Day);
      if (!!this.accountingService.paramExportToExcelData) {
        if (!!this.accountingService.paramExportToExcelData.HeaderTitle) {
          if (this.accountingService.paramExportToExcelData.HeaderTitle) {
            var headerTitle = "Ledger Report"
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
          else {
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
      CommonFunctions.ConvertHTMLTableToExcelForAccounting(tableId, workSheetName, date,
        headerTitle, filename, hospitalName, address, printByMessage, this.accountingService.paramExportToExcelData.ShowPrintBy, this.accountingService.paramExportToExcelData.ShowHeader,
        this.accountingService.paramExportToExcelData.ShowDateRange, printBy, this.accountingService.paramExportToExcelData.ShowFooter, Footer)

    } catch (ex) {
      console.log(ex);
    }
  }
  ConvertHTMLTableToExcelForAccounting(table: any, SheetName: string, date: string, TableHeading: string, filename: string, hospitalName: string, hospitalAddress: string, printByMessage: string, showPrintBy: boolean, showHeader: boolean, showDateRange: boolean, printBy: string, ShowFooter: boolean, Footer: string) {
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
        let workSheetName = (SheetName.length > 0) ? SheetName : 'Sheet';
        let fromDateNp: any;
        let toDateNp = '';
        if (this.fromDate.length > 0 && this.toDate.length > 0) {
          fromDateNp = NepaliCalendarService.ConvertEngToNepaliFormatted_static(this.fromDate, '');
          toDateNp = NepaliCalendarService.ConvertEngToNepaliFormatted_static(this.toDate, '');
        }

        if (ShowFooter == true) {
          Footer = "";
        } else {
          Footer = null;
        }
        let uri = 'data:application/vnd.ms-excel;base64,'
          , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table><tr>}{Header}</tr>{table}</table></body></html>'
          , base64 = function (s) { return window.btoa(decodeURIComponent(encodeURIComponent(s))) }
          , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }
        if (!table.nodeType) table = document.getElementById(table)
        var ctx = {
          worksheet: workSheetName, table: table.innerHTML, Header: Header,
          footer: Footer
        }
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
  // ExportToExcel(tableId) {
  //   if (tableId) {
  //     this.actionView = false;
  //     this.changeDetector.detectChanges();
  //     let workSheetName = 'Ledger Report';
  //     //  {{selLedgerName}} &nbsp; Ledger ( {{selLedger.Code}} )
  //     let Heading ="Ledger Report for: "+ this.selLedgerName.toUpperCase()+" ("+this.selLedger.Code+")";
  //     let filename = 'LedgerReport';
  //     CommonFunctions.ConvertHTMLTableToExcel(tableId, this.fromDate, this.toDate, workSheetName,
  //       Heading, filename);
  //   }
  //   this.actionView = true;
  //   this.changeDetector.detectChanges();
  //  //this.accountingService.ExportToExcel(tableId);
  // }
  GroupViewData(Result) {
    try {
      if (Result) {

        var helper = {};
        var result1 = Result.reduce(function (r, o) {
          var key = o.TransactionDate + o.VoucherNumber + o.LedgerId;

          if (!helper[key]) {
            helper[key] = Object.assign({}, o);
            if (helper[key].DrCr != true) {
              helper[key].LedgerCr = helper[key].Amount;
            }
            else {
              helper[key].LedgerDr = helper[key].Amount;
            }
            //if (helper[key].DrCr != true) {
            //    helper[key].Amount = - helper[key].Amount;
            //}
            r.push(helper[key]);
          }
          else {
            helper[key].LedgerName = o.LedgerName;
            // helper[key].Amount += o.Amount;
            if (o.DrCr) {
              helper[key].LedgerDr += o.Amount;
            }
            else {
              helper[key].LedgerCr += o.Amount;
            }
            //if (o.DrCr) {
            //    helper[key].Amount += o.Amount;
            //}
            //else {
            //    helper[key].Amount -= o.Amount;
            //}
          }
          return r;
        }, []);
        //grouping for transaction items 
        // var resultOriginal = Result;
        // result1.forEach(itm => {
        //   itm.TransactionItems = [];
        //   var tempTxnItemList: any;
        //   if (resultOriginal.length > 0) {
        //     var matchingTxnItmList = resultOriginal.filter(it => it.VoucherNumber == itm.VoucherNumber && it.TransactionDate == itm.TransactionDate);
        //     matchingTxnItmList.forEach(data => {
        //       data.TransactionItems.forEach(dItm => {
        //         itm.TransactionItems.push(dItm);
        //       });

        //     });
        //   }

        //   var helper = {};
        //   var txnResult = itm.TransactionItems.reduce(function (r, o) {
        //    var key = o.LedgerName + o.DrCr;

        //       if (!helper[key]) {
        //         helper[key] = Object.assign({}, o);
        //         r.push(helper[key]);
        //       }
        //       else {
        //         helper[key].LedgerName = o.LedgerName;
        //         helper[key].LedAmount += o.LedAmount;
        //       }

        //     return r;

        //   }, []);

        //   itm.TransactionItems = txnResult;

        // });

        this.ledgerResultRawData = result1;

      }
    } catch (exception) {
      console.log(exception);
    }
  }
  showExport() {

    let exportshow = this.coreservice.Parameters.find(a => a.ParameterName == "AllowOtherExport" && a.ParameterGroupName == "Accounting").ParameterValue;
    if (exportshow == "true") {
      this.showExportbtn = true;
    }
    else {
      this.showExportbtn = false;
    }
  }





  //start:Sud-19Mar'20--For downarrow-uparrow and enter shortcut to see transaction details plus navigate up down

  public hotKeysEnabled: boolean = false;

  HotKeysOnOff(txnItm) {

    if (txnItm.IsHighlighted) {
      txnItm.IsHighlighted = false;
      this.hotKeysEnabled = false;
      return;
    }

    if (this.ledgerResult && this.ledgerResult.length > 0) {
      this.ledgerResult.forEach(a => {
        a.IsHighlighted = false;
      });
    }

    txnItm["IsHighlighted"] = !txnItm["IsHighlighted"];
    if (txnItm["IsHighlighted"]) {
      this.hotKeysEnabled = true;
    }

  }


  //this function is hotkeys when pressed by user
  hotkeys(event) {
    if (!this.hotKeysEnabled) {
      return;
    }

    if (event) {

      if (event.keyCode == 38) {//up arrow
        if (this.ledgerDataList && this.ledgerDataList.length > 0 && this.ledgerDataList.ledgerResult.findIndex(a => a.IsHighlighted) > -1) {

          let curIndx = this.ledgerDataList.ledgerResult.findIndex(a => a.IsHighlighted);
          this.ledgerDataList.ledgerResult[curIndx].IsHighlighted = false;

          if (curIndx > 0) {
            curIndx--;
          }
          //this will go to minimum zero.
          this.ledgerDataList.ledgerResult[curIndx].IsHighlighted = true;
        }
      }
      else if (event.keyCode == 40) {//down arrow
        if (this.ledgerDataList && this.ledgerDataList.ledgerResult.length > 0 && this.ledgerDataList.ledgerResult.findIndex(a => a.IsHighlighted) > -1) {
          let curIndx = this.ledgerDataList.ledgerResult.findIndex(a => a.IsHighlighted);
          this.ledgerDataList.ledgerResult[curIndx].IsHighlighted = false;
          if (curIndx < this.ledgerDataList.ledgerResult.length - 1) {
            curIndx++;
          }
          this.ledgerDataList.ledgerResult[curIndx].IsHighlighted = true;

        }
      }

      ////sud:15June-Removed Enter shortcut since it was giving issues in Edit voucher because this highlighted voucher was opening again..
      // else if (event.keyCode == 13) {//enter.
      //   if (this.ledgerResult && this.ledgerResult.length > 0 && this.ledgerResult.findIndex(a => a.IsHighlighted) > -1) {
      //     let curIndx = this.ledgerResult.findIndex(a => a.IsHighlighted);
      //     if (curIndx > -1) {
      //       let curTxnItm = this.ledgerResult[curIndx];

      //       this.ViewTransactionDetails(curTxnItm.VoucherNumber);
      //     }

      //   }
      // }


    } //40 down, 38 up

  }
  //end:Sud-19Mar'20--For downarrow-uparrow and enter shortcut to see transaction details plus navigate up down

  //for date format change
  // public isDateFormatBS:boolean = true;// by default it'll be true.
  public ChangeAD_BS() {
    this.isDateFormatBS = !this.isDateFormatBS;
    this.datePref = (this.isDateFormatBS) ? "(BS)" : "(AD)";
  }

  //this function will call after voucher details popup closed, we need to reload reports if value is true
  public OnPopupClose($event) {
    if ($event && $event.reloadPage) {
      this.GetTxnList();
    }
  }

  GetLedgerGroup() {
    if (!!this.accountingService.accCacheData.LedgerGroups && this.accountingService.accCacheData.LedgerGroups.length > 0) {
      this.CallBackLedgerGroup(this.accountingService.accCacheData.LedgerGroups);
    }
  }

  CallBackLedgerGroup(res) {
    if (res) {
      this.ledgergroupList = new Array<ledgerGroupModel>();
      this.ledgergroupList = res.filter((lg) => lg.IsActive == true);
      this.ledgergroupList = this.ledgergroupList.slice();
    }
  }
  //format ledgergroup for autocomplete
  LedgerGroupListFormatter(data: any): string {
    return (
      data["LedgerGroupName"] +
      " | " +
      data["PrimaryGroup"] +
      " -> " +
      data["COA"]
    );
  }

  AssignSelectedLedgerGroup() {
    if (typeof (this.selectedLedgerGroup) == 'object' && this.selectedLedgerGroup.LedgerGroupId > 0) {
      var ledgerList = this.ledgerList.filter(a => a.LedgerGroupId == this.selectedLedgerGroup.LedgerGroupId);
      this.filteredLedgerList = ledgerList;
    }
    else {
      this.filteredLedgerList = this.ledgerList;
    }
  }

  OnLedgerSelected($event) {
    if ($event) {
      this.selectedLedgerLists = [];
      if ($event && $event.length) {
        $event.forEach(v => {
          this.selectedLedgerLists.push(v.LedgerId);
        })
      }
    }
  }
  HandleValueChange() {
    this.ledgerDataList && this.ledgerDataList.length && this.ledgerDataList.forEach(element => {
      if (element.ledgerResult) {
        element.ledgerResult.map(a => {
          a.TransactionDate = this.nepaliCalendarService.ConvertNepStringToEngString(a.TransactionDate);
        })
      }
    });
  }

  OpenDetailPopUP(row: any) {
    this.viewDetailPopUp = true;
    this.ledgerCode = row.Code;
    this.ledgerName = row.LedgerName;
    this.ledgerId = row.LedgerId;
    // this.PopUpLedgerData = this.ledgerDataList.filter(a=> a.LedgerId == row.LedgerId);
  }

  Close() {
    // this.ledgerDataList.filter(a=>a.LedgerId == this.PopUpLedgerData[0].LedgerId).forEach(ele => {
    //   if(ele.ledgerResult){
    //     ele.ledgerResult.map(a=>{
    //         a.TransactionDate = this.nepaliCalendarService.ConvertNepStringToEngString(a.TransactionDate);
    //     })
    //   }
    // });
    this.viewDetailPopUp = false;
  }
}
