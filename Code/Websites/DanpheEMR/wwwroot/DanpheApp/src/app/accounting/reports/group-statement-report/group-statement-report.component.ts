import { ChangeDetectorRef, Component } from "@angular/core";
import { CommonFunctions } from "../../../shared/common.functions";
import { CoreService } from "../../../core/shared/core.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ledgerGroupModel } from "../../settings/shared/ledgerGroup.model";
import { AccountingReportsBLService } from "../shared/accounting-reports.bl.service";
import { GroupStatementReportVM } from "../shared/group-statement-reportvm.model";
import { AccountingService } from "../../shared/accounting.service";

@Component({
  selector: "my-app",
  templateUrl: "./group-statement-report.component.html",
})
export class GroupStatementReportComponent {
  public showLedgerDetail: boolean = false; //show / Hide Ledger Report on ledger click
  public fromDate: string = null;
  public toDate: string = null;
  public ledgerId: number = 0;
  public ledgerName: string = "";
  public ledgerCode: any;
  public IsShowReport: boolean = false;
  public showExportbtn: boolean = false;
  public showPrint: boolean = false;
  public printDetaiils: any;
  public fiscalYearId: number = 0;
  selectedLedgerGroup:any ;
  btndisabled=false;
  public ledgergroupList: Array<ledgerGroupModel> = new Array<ledgerGroupModel>();
  public validDate: boolean = true;
  public reportData: Array<GroupStatementReportVM> = new Array<GroupStatementReportVM>();
  public reportDataGrandTotal: GroupStatementReportVM = new GroupStatementReportVM();
  public dateRange:string= null;
  constructor(
    public msgBoxServ: MessageboxService,
    public coreservice: CoreService,
    public accReportBLServ: AccountingReportsBLService,
    public accountingService: AccountingService,
    private changeDetector: ChangeDetectorRef
  ) {    
    this.showExport();
    this.GetLedgerGroup();
this.getCoreParameters();
  }
getCoreParameters(){
    this.accountingService.getCoreparameterValue();
  }
  selectDate(event) {
    if (event) {
      this.fromDate = event.fromDate;
      this.toDate = event.toDate;
      this.fiscalYearId = event.fiscalYearId;
      this.validDate = true;
      this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
    } else {
      this.validDate = false;
    }
  }

  checkDateValidation() {
    let flag = true;
    if (!this.validDate) {
      this.msgBoxServ.showMessage("error", ["Select proper date."]);
      flag = false;
    }
    return flag
  }
  checkValidation(){
    let flag =true;
    if (!this.selectedLedgerGroup || !this.selectedLedgerGroup.LedgerGroupId) {
      this.msgBoxServ.showMessage("failed", ["Please select ledger group."]);
      flag = false;
    }
    
    return flag;
  }

  
  //get all ledger group
  GetLedgerGroup() {
      if(!!this.accountingService.accCacheData.LedgerGroups && this.accountingService.accCacheData.LedgerGroups.length>0){ //mumbai-team-june2021-danphe-accounting-cache-change
      this.CallBackLedgerGroup(this.accountingService.accCacheData.LedgerGroups) //mumbai-team-june2021-danphe-accounting-cache-change
    }
  }

  CallBackLedgerGroup(res) {
    if (res) {
      this.ledgergroupList = new Array<ledgerGroupModel>();
      this.ledgergroupList = res.filter((lg) => lg.IsActive == true); //only isActive true ledgergroup here
      this.ledgergroupList = this.ledgergroupList.slice(); //mumbai-team-june2021-danphe-accounting-cache-change
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

  //get Group statement report details
    GetGroupStatementRpt() {
        this.btndisabled = true;
    if (this.checkValidation() && this.checkDateValidation()) {
      this.accReportBLServ
        .GetGroupStatementReport(this.fromDate, this.toDate, this.fiscalYearId,this.selectedLedgerGroup.LedgerGroupId)
        .subscribe((res) => {
          if (res.Status == "OK") {
            this.btndisabled=false;
            this.reportData= new Array<GroupStatementReportVM>()
            this.reportData=res.Results;
            if(this.reportData.length >0){
              this.IsShowReport = true;
              this.reportDataGrandTotal= new GroupStatementReportVM();
               let totalAmtRow= CommonFunctions.getGrandTotalData(this.reportData)[0];               
               totalAmtRow.OpeningTotal = (totalAmtRow.OpeningDr > totalAmtRow.OpeningCr || totalAmtRow.OpeningCr== totalAmtRow.OpeningDr)? (totalAmtRow.OpeningDr-totalAmtRow.OpeningCr): (totalAmtRow.OpeningCr-totalAmtRow.OpeningDr );
               totalAmtRow.OpeningType = (totalAmtRow.OpeningDr > totalAmtRow.OpeningCr || totalAmtRow.OpeningCr == totalAmtRow.OpeningDr) ?"Dr" : "Cr",                              
               totalAmtRow.ClosingTotal = (totalAmtRow.ClosingDr > totalAmtRow.ClosingCr || totalAmtRow.ClosingDr==totalAmtRow.ClosingCr)?(totalAmtRow.ClosingDr-totalAmtRow.ClosingCr):(totalAmtRow.ClosingCr-totalAmtRow.ClosingDr),
               totalAmtRow.ClosingType = (totalAmtRow.ClosingDr > totalAmtRow.ClosingCr || totalAmtRow.ClosingDr == totalAmtRow.ClosingCr) ? "Dr": "Cr",
               this.reportDataGrandTotal=Object.assign(this.reportDataGrandTotal,totalAmtRow);
            }else{
              this.btndisabled=false;
              this.msgBoxServ.showMessage("failed",["No records found"]);
            }
           
            //this.MapAndMakeTrialReport(res.Results);
          } else {
            this.btndisabled=false;
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
          }
        });
    } else {
      this.btndisabled=false;
      this.IsShowReport = false;
    }
  }

  //assign ledgergroup details , after ledgergroup autocomplete changed values
  AssignSelectedLedgerGroup() {
    if (this.selectedLedgerGroup && this.selectedLedgerGroup.LedgerGroupId > 0) {

    } else {
      this.selectedLedgerGroup=""      ;
    }
  }
  //about show or hide export to excel button
  showExport() {
    let exportshow = this.coreservice.Parameters.find(
      (a) =>
        a.ParameterName == "AllowOtherExport" &&
        a.ParameterGroupName == "Accounting"
    ).ParameterValue;
    if (exportshow == "true") {
      this.showExportbtn = true;
    } else {
      this.showExportbtn = false;
    }
  }
//print table report data
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
    // this.printDetaiils = headerContent + printContents ;
    this.accountingService.Print(tableId,this.dateRange);
  }
  //export to excel sheet all report data
  ExportToExcel(tableId) {
    // if (tableId) {
    //   let workSheetName = 'Group Statement Report';
    //   let Heading = 'Group Statement Report';
    //   let filename = 'GroupStatementReport';
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
    this.ledgerName = row.Particular;
    this.ledgerCode = row.Code;
    this.showLedgerDetail = true;
  }
  ShowReport($event) {
    this.showLedgerDetail = false;    

  }
}
