import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import * as moment from 'moment/moment';
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { DLService } from "../../../shared/dl.service";
import { CoreService } from "../../../core/shared/core.service";
import { IncentiveBLService } from "../../shared/incentive.bl.service";
import { CommonFunctions } from "../../../shared/common.functions";


@Component({
  selector: 'incentive-item-summary',
  templateUrl: './incentive-item-summary-report.html'
})
export class INCTV_BIL_IncentiveItemComponent {
  @Input("fromDate")
  public FromDate: string = "";
  @Input("toDate")
  public ToDate: string = "";
  @Input("referrerId")
  public employeeId: number = null;
  //@Input("servDeptName")
  //public ServDeptName: string = "";
  public showReport: boolean = false;
  public showDetailView: boolean = false;
  public selectedEmpName: string = "";
  public reportData: Array<any> = [];

  public allInctvFracIdToUpdate: Array<number> = [];

  public allReportData: Array<{ IncomeType: string, reportData: Array<any>, description: string }> = [];
  public summary = {
    tot_RefBilAmt: 0, tot_RefInctvAmt: 0, tot_RefTDSAmt: 0, tot_RefNetPayable: 0,
    tot_AssignBilAmt: 0, tot_AssignInctvAmt: 0, tot_AssignTDSAmt: 0, tot_AssignNetPayable: 0,
  };
  @Output("callback")
  callback: EventEmitter<Object> = new EventEmitter<Object>();
  public currentDate: string = "";

  public isDateFormatBS = true;
  public showItemSummary = false;

  //public PaymentInfoDetail: INCTV_TXN_PaymentInfoVM = new INCTV_TXN_PaymentInfoVM();

  constructor(
    public msgBoxServ: MessageboxService,
    public dlService: DLService,
    public coreService: CoreService,
    public incentiveBLService: IncentiveBLService) {
    this.currentDate = moment().format('YYYY-MM-DD');
  }

  ngOnInit() {
    this.LoadDocDeptItemSummary();
  }

  LoadDocDeptItemSummary() {
    //let srvDept = this.ServDeptName.replace(/&/g, '%26');//this is URL-Encoded value for character  '&'    --see: URL Encoding in Google for details.
    this.dlService.Read("/BillingReports/INCTV_DocterItemSummary?FromDate=" + this.FromDate + "&ToDate=" + this.ToDate + "&employeeId=" + this.employeeId)
      //.map(res => res)
      .subscribe(res => {
        if (res.Status == "OK") {
          let data = JSON.parse(res.Results.JsonData);
          if (data && data.Table1 && data.Table1[0]) {
            this.reportData = data.Table1;
            this.selectedEmpName = this.reportData && this.reportData.length > 0 ? this.reportData[0].IncentiveReceiverName : "";//sud:19Mar'20-quickfix to solve other error

            this.reportData.forEach(itm => {
              itm.AssignedToAmount = CommonFunctions.parseAmount(itm.AssignedToAmount);
              itm.AssignedToPercent = CommonFunctions.parseAmount(itm.AssignedToPercent);
              itm.ReturnAmount = CommonFunctions.parseAmount(itm.ReferralAmount);
              itm.ReferredByPercent = CommonFunctions.parseAmount(itm.ReferredByPercent);
              itm.TotalAmount = CommonFunctions.parseAmount(itm.TotalAmount);
              itm.IsPaymentMade = itm.IsPaymentProcessed;
            });

            this.showReport = true;

            this.CalculateSummaryAmounts(this.reportData);

            let referralData = this.reportData.filter(a => a.IncomeType == "referral");
            let assignedData = this.reportData.filter(a => a.IncomeType == "assigned");
            CommonFunctions.SortArrayOfObjects(referralData,'TransactionDate');
            CommonFunctions.SortArrayOfObjects(assignedData,'TransactionDate');

            this.allReportData.push({ 'IncomeType': "assigned", 'reportData': assignedData, description: "(Services/Tests Performed by this Doctor himself/herself.)" });
            this.allReportData.push({ 'IncomeType': "referral", 'reportData': referralData, description: "(Services/Tests Referred by this doctor.)" });
            this.showItemSummary = true;
          }
          else {
            this.msgBoxServ.showMessage("notice-message", ['Data Not Available for Selected Parameters...']);
            this.showItemSummary = false;
          }
        }
      });
  }



  ExportToExcel(tableId) {
    if (tableId) {
      let workSheetName = 'Doctor Incentive Summary Details';
      let Heading = 'Doctor Incentive Summary Details';
      let filename = 'doctorIncentiveDetails';
      //NBB-send all parameters for now 
      //need enhancement in this function 
      //here from date and todate for show date range for excel sheet data
      CommonFunctions.ConvertHTMLTableToExcel(tableId, this.FromDate, this.ToDate, workSheetName,
        Heading, filename);
    }
  }

  public ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }

  public CalculateSummaryAmounts(data) {
    //initailize to zero
    this.summary.tot_RefBilAmt = this.summary.tot_RefInctvAmt = this.summary.tot_RefTDSAmt = this.summary.tot_RefNetPayable = 0;
    this.summary.tot_AssignBilAmt = this.summary.tot_AssignInctvAmt = this.summary.tot_AssignTDSAmt = this.summary.tot_AssignNetPayable = 0;

    //initialize the empty array of FracId To update
    this.allInctvFracIdToUpdate = []

    data.forEach(a => {
      if (a.IncomeType == 'assigned') {
        this.summary.tot_AssignBilAmt += a.TotalAmount;
        this.summary.tot_AssignInctvAmt += a.IncentiveAmount;
        this.summary.tot_AssignTDSAmt += a.TDSAmount;
        this.summary.tot_AssignNetPayable += a.NetPayableAmt;
        this.allInctvFracIdToUpdate.push(a.InctvTxnItemId);
      }
      else if (a.IncomeType == 'referral') {
        this.summary.tot_RefBilAmt += a.TotalAmount;
        this.summary.tot_RefInctvAmt += a.IncentiveAmount;
        this.summary.tot_RefTDSAmt += a.TDSAmount;
        this.summary.tot_RefNetPayable += a.NetPayableAmt;
        this.allInctvFracIdToUpdate.push(a.InctvTxnItemId);
      }
    });

    this.summary.tot_AssignBilAmt = CommonFunctions.parseAmount(this.summary.tot_AssignBilAmt);
    this.summary.tot_AssignInctvAmt = CommonFunctions.parseAmount(this.summary.tot_AssignInctvAmt);
    this.summary.tot_AssignTDSAmt = CommonFunctions.parseAmount(this.summary.tot_AssignTDSAmt);
    this.summary.tot_AssignNetPayable = CommonFunctions.parseAmount(this.summary.tot_AssignNetPayable);
    this.summary.tot_RefBilAmt = CommonFunctions.parseAmount(this.summary.tot_RefBilAmt);
    this.summary.tot_RefInctvAmt = CommonFunctions.parseAmount(this.summary.tot_RefInctvAmt);
    this.summary.tot_RefTDSAmt = CommonFunctions.parseAmount(this.summary.tot_RefTDSAmt);
    this.summary.tot_RefNetPayable = CommonFunctions.parseAmount(this.summary.tot_RefNetPayable);
  }

  public CallBackDepts() {
    this.showReport = false;

    this.callback.emit({ showBillDocSummary: true });
  }

  ChangeDateFormate() {
    this.isDateFormatBS = !this.isDateFormatBS;
  }
}

export class INCTV_TXN_PaymentInfoVM {

  public PaymentDate: string = '';
  public ReceiverId: number = 0;
  public TotalAmount: number = 0;
  public TDSAmount: number = 0;
  public NetPayAmount: number = 0;
  public IsPostedToAccounting: boolean = false;
  public AccountingPostedDate: string = '';

}
