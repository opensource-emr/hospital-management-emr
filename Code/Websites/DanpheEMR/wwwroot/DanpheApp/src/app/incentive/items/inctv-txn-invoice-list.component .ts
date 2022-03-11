import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { DanpheHTTPResponse } from "../../shared/common-models";
import { DLService } from "../../shared/dl.service";
import { SecurityService } from "../../security/shared/security.service";
import { IncentiveTransactionItemsVM } from "../shared/incentive-transaction-items-vm";
import { IncentiveFractionItemsModel } from "../shared/incentive-fraction-item.model";
import { IncentiveBLService } from "../shared/incentive.bl.service";
import { CoreService } from "../../core/shared/core.service";
import { NepaliCalendarService } from "../../shared/calendar/np/nepali-calendar.service";

@Component({
  templateUrl: './inctv-txn-invoice-list.html',
  styleUrls: ['./styles.css']
})
export class IncentiveTxnInvoiceListComponent {

  public allInvoiceInfoList: Array<InctvInvoiceInfoVM> = [];
  public selInvoiceInfo: InctvInvoiceInfoVM = null;
  //public selTxnItem: IncentiveTransactionInvoiceItemsVM = new IncentiveTransactionInvoiceItemsVM();

  public allTxnInvoiceItemList: Array<any> = [];
  public allFractionsListOfInvoice: Array<IncentiveFractionItemsModel> = [];

  public txnItem: IncentiveTransactionItemsVM = new IncentiveTransactionItemsVM();
  public txnInvoiceGridColumns: Array<any> = null;
  public IsDateValid: boolean = true;
  public TDS = { "TDSEnabled": true, "TDSPercent": 15 };

  public calType: string = '';

  public datePreference: string = "np";

  constructor(public changeDetector: ChangeDetectorRef,
    public npCalendarService: NepaliCalendarService,
    public msgBoxServ: MessageboxService,
    public dlService: DLService,
    public securityService: SecurityService,
    public coreservice: CoreService,
    public incentiveBLService: IncentiveBLService) {
    //if Datepreference is found then use the same, else use nepali by default..
    this.datePreference = this.coreservice.DatePreference ? this.coreservice.DatePreference : "np";


    //this.LoadIncentiveTxnInvoiceList();
    this.LoadAllDocList();
    //this.LoadUptoDateFractionTransactions();//move this to new page for syncing...

    // this.LoadEmpProfileMap();
    this.LoadCalenderTypes();
    this.GetEmpIncentiveInfo();
  }

  ngOnInit() {
    this.invoiceListFormatter = this.invoiceListFormatter.bind(this);//to use global variable in list formatter auto-complete
  }


  public fromDate: string = moment().format('YYYY-MM-DD');
  public toDate: string = moment().format('YYYY-MM-DD');
  //public employeeId: number = 0;
  public billingtransactionId: number = 0;
  public showAllitemtxn: boolean = false;
  public showUpdateItemsPopup: boolean = false;
  public showFractionItemContainer: boolean = false;

  public LoadData() {
    this.DateValidCheck();
    if (this.IsDateValid) {
      this.LoadIncentiveTxnInvoiceList();
    }
  }

  LoadIncentiveTxnInvoiceList() {
    //sud:12Feb'20-employeeid is not needed for this api, make necessaray changs in api and in StoredProcedure of this.
    this.dlService.Read("/api/Incentive?reqType=view-txn-InvoiceLevel&fromDate=" + this.fromDate + "&toDate=" + this.toDate + "&employeeId=" + 0)
      .map(res => res)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.allInvoiceInfoList = res.Results;
          this.SetFocusOnInvoiceListSearchBox();
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to get transaction items."]);
          console.log(res.ErrorMessage);
        }
      });
  }

  LoadIncentiveTxnInvoiceItemList() {
    this.allTxnInvoiceItemList = [];
    this.allFractionsListOfInvoice = [];

    //sud:12Feb'20-employeeid is not needed for this api, make necessaray changs in api and in StoredProcedure of this.
    this.dlService.Read("/api/Incentive?reqType=view-txn-InvoiceItemLevel&BillingTansactionId=" + this.billingtransactionId)
      .map(res => res)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.allTxnInvoiceItemList = res.Results.TxnItems;
          this.allFractionsListOfInvoice = res.Results.FractionItems;

          //assign fraction items to each txnitems..
          if (this.allTxnInvoiceItemList && this.allFractionsListOfInvoice) {
            this.allTxnInvoiceItemList.forEach(txnItm => {
              txnItm.FractionItems = this.allFractionsListOfInvoice.filter(frcItm => frcItm.BillingTransactionItemId == txnItm.BillingTransactionItemId);
              //set to isremoved if something is Inactive while getting from Database..
              if (txnItm.FractionItems && txnItm.FractionItems.length > 0) {

                txnItm.FractionItems.forEach(a => {
                  a.DocObj = { EmployeeId: a.IncentiveReceiverId, FullName: a.IncentiveReceiverName };
                  //a.DocObj.FullName = a.IncentiveReceiverName;
                  if (a.IsActive == false) {
                    a.IsRemoved = true;
                  }
                });
              }
            });
          }

          this.showAllitemtxn = true;
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to get transaction items."]);
          console.log(res.ErrorMessage);
        }
      });
  }


  public allEmpList: Array<any> = [];
  LoadAllDocList() {
    this.incentiveBLService.GetIncentiveApplicableDocterList()
      .map(res => res)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          let doclist: Array<any> = res.Results;
          this.allEmpList = doclist.map(a => {
            return { EmployeeId: a.EmployeeId, FullName: a.FullName }
          });
          this.allEmpList.unshift({ EmployeeId: 0, FullName: "--Select--" });

        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to get transaction items."]);
          console.log(res.ErrorMessage);
        }
      });
  }



  ShowTransactionItemsOfInvoice(invInfo: InctvInvoiceInfoVM) {

    this.showAllitemtxn = false;
    this.billingtransactionId = invInfo.BillingTransactionId;

    this.LoadIncentiveTxnInvoiceItemList();
    this.showFractionItemContainer = false;
  }


  selectedBillTxnItem: IncentiveTransactionInvoiceItemsVM = new IncentiveTransactionInvoiceItemsVM();

  TransactionItemOnClick(i, txnItm) {
    this.showFractionItemContainer = false;
    this.changeDetector.detectChanges();
    this.selectedBillTxnItem = new IncentiveTransactionInvoiceItemsVM();
    this.selectedBillTxnItem.PatientId = this.selInvoiceInfo.PatientId;
    this.selectedBillTxnItem.PatientCode = this.selInvoiceInfo.PatientCode;
    this.selectedBillTxnItem.PatientName = this.selInvoiceInfo.PatientName;
    this.selectedBillTxnItem.InvoiceNo = this.selInvoiceInfo.InvoiceNo;
    this.selectedBillTxnItem.TransactionDate = this.selInvoiceInfo.TransactionDate;
    this.selectedBillTxnItem.BillingTransactionId = this.selInvoiceInfo.BillingTransactionId;
    this.selectedBillTxnItem.BillingTransactionItemId = txnItm.BillingTransactionItemId;
    this.selectedBillTxnItem.ItemName = txnItm.ItemName;
    this.selectedBillTxnItem.ItemId = txnItm.ItemId;
    this.selectedBillTxnItem.Quantity = txnItm.Quantity;
    this.selectedBillTxnItem.BillItemPriceId = txnItm.BillItemPriceId;
    this.selectedBillTxnItem.TotalAmount = txnItm.TotalAmount;
    this.selectedBillTxnItem.AssignedToEmpName = txnItm.AssignedToEmpName;
    this.selectedBillTxnItem.ReferredByEmpName = txnItm.ReferredByEmpName;

    this.allTxnInvoiceItemList.forEach(a => {
      a.IsSelected = false;
    });

    this.allTxnInvoiceItemList[i].IsSelected = true;
    this.showFractionItemContainer = true;
  }

  OnIncentivePercentChange(currFrcItem: IncentiveFractionItemsModel) {
    let incPercent = currFrcItem.IncentivePercent ? currFrcItem.IncentivePercent : 0;
    currFrcItem.IncentiveAmount = currFrcItem.TotalBillAmount * incPercent / 100;
  }



  //start: sud-15-Feb- To load Uptodate Incentive
  LoadUptoDateFractionTransactions() {
    console.log('syncing....');
    //fromdate is hard-coded: 1Feb2020 for now, we'll soon move this to another page with Sync option.. (sud)

    let url = "/api/Incentive?reqType=load-uptodate-transactions&fromDate=2020-02-01&toDate=" + this.toDate;
    let data = null;
    this.dlService.Add(data, url).map(res => res).subscribe(res => {
      console.log(res);
      if (res.Status == "OK") {
        console.log("UptoDate..Fraction calculation completed.. ")
        //this.msgBoxServ.showMessage("success", ["Fraction calculation completed..."]);
      }
      else {
        this.msgBoxServ.showMessage("failed", ["Couldn't update fraction calculation data. Pls try again."]);
      }
    });
  }

  invoiceListFormatter(data: any): string {

    let txnDate = data["TransactionDate"];
    let txnDateFormatted = "";
    if (txnDate) {
      if (this.datePreference == "np") {
        txnDateFormatted = this.npCalendarService.ConvertEngToNepaliFormatted(txnDate, "YYYY-MM-DD") + "(BS)";
      }
      else {
        txnDateFormatted = moment(txnDate).format("YYYY-MM-DD") + "(AD)";
      }
    }



    //here we're highlighting the PatientName.
    let html: string = "";
    html = "<font size=03>" + data["InvoiceNo"] + "</font>&nbsp;-&nbsp;&nbsp;<font color='blue'; size=03 ><b>" + data["PatientName"] +
      "</b></font>&nbsp;&nbsp;" + "(" + data["PatientCode"] + ")" + "    "+this.coreservice.currencyUnit + data["TotalAmount"]
      + "&nbsp;&nbsp;&nbsp;<font color='green'; size=01><b>" + txnDateFormatted + "</b></font>";
    return html;
  }

  InvoiceInfoChanged() {
    if (this.selInvoiceInfo && typeof (this.selInvoiceInfo) == "object") {
      this.ShowTransactionItemsOfInvoice(this.selInvoiceInfo);
    }
  }


  //// this is needed as a global variable.
  //public EmpProfMap_All: Array<any> = [];

  //LoadEmpProfileMap() {
  //  this.incentiveBLService.GetEmpIncentiveInfo()
  //    .subscribe((res: DanpheHTTPResponse) => {
  //      if (res.Status == "OK") {
  //        this.EmpProfMap_All = res.Results;
  //      }
  //      else {
  //        this.msgBoxServ.showMessage("failed", ["Unable to get transaction items."]);
  //        console.log(res.ErrorMessage);
  //      }
  //    });
  //}




  //public TDScalculation(frcItems) {
  //  frcItems.forEach(a => {
  //    var profEmpObj = this.EmpProfMap_All.find(b => b.EmployeeId == a.IncentiveReceiverId);
  //    if (profEmpObj) {
  //      a.TDSPercentage = profEmpObj.TDSPercentage;
  //      a.TDSAmount = (a.TDSPercentage * a.IncentiveAmount) / 100;
  //      a.IncentiveReceiverName = a.IncentiveReceiverName ? a.IncentiveReceiverName : profEmpObj.FullName;
  //    }
  //    else {
  //      a.TDSPercentage = this.TDS.TDSPercent;
  //      a.TDSAmount = (a.TDSPercentage * a.IncentiveAmount) / 100;
  //    }
  //  });
  //}

  public EmpIncentiveInfo: Array<any> = [];

  public GetEmpIncentiveInfo() {
    this.incentiveBLService.GetEmpIncentiveInfo()
      .map(res => res)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.EmpIncentiveInfo = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to get Data."]);
          console.log(res.ErrorMessage);
        }
      });
  }

  LoadTDSRate() {
    let allParams = this.coreservice.Parameters;
    if (allParams.length) {
      let CalParms = allParams.find(a => a.ParameterName == "TDSConfiguration" && a.ParameterGroupName == "Incentive");
      if (CalParms) {
        let Obj = JSON.parse(CalParms.ParameterValue);
        this.TDS.TDSEnabled = Obj.TDSEnabled;
        this.TDS.TDSPercent = Obj.TDSPercent;
      }
    }
  }

  //used to format the display of item in ng-autocomplete.
  EmployeeListFormatter(data: any): string {
    let html = data["FullName"];
    return html;
  }

  ChangeDocter(aa) {
    aa.IncentiveReceiverId = aa.DocObj.EmployeeId;
    aa.IncentiveReceiverName = aa.DocObj.FullName;
  }

  private SetFocusOnInvoiceListSearchBox() {
    window.setTimeout(function () {
      let srchBox = document.getElementById("srch_invoiceList");
      if (srchBox) {
        srchBox.focus();
      }
    }, 600);
  }

  DateValidCheck() {
    if (this.toDate && this.fromDate) {
      //get current date, month and time
      var currDate = moment().format('YYYY-MM-DD');

      if ((moment(this.toDate).diff(currDate) > 0) ||
        (moment(this.toDate) < moment(this.fromDate))) {
        this.IsDateValid = false;
      }
      else {
        this.IsDateValid = true;
      }
    }
  }
  LoadCalenderTypes() {
    let allParams = this.coreservice.Parameters;
    if (allParams.length) {
      let CalParms = allParams.find(a => a.ParameterName == "CalendarTypes" && a.ParameterGroupName == "Common");
      if (CalParms) {
        let Obj = JSON.parse(CalParms.ParameterValue);
        this.calType = Obj.IncentiveModule;
      }
    }
  }
  EditFractionOnClose($event) {
    console.log($event);
  }

  //sud:28May'20--For Reusable From-Date-To-Date component
  OnDateRangeChange($event) {
    if ($event) {
      this.fromDate = $event.fromDate;
      this.toDate = $event.toDate;
    }
  }

}

//class IncentiveTransactionInvoiceItemsVM {

//  public BillingTransactionItemId: number = null;
//  public ItemName: string = '';
//  public Quantity: number = 0;
//  public Price: number = 0;
//  public DiscountAmount: number = 0;
//  public SubTotal: number = 0;
//  public TotalAmount: number = 0;
//  public ReferredByEmpId: number = null;
//  public ReferredByEmpName: string = null;
//  public ReferredByPercent: number = null;
//  public ReferralAmount: number = null;
//  public AssignedToEmpId: number = null;
//  public AssignedToEmpName: string = null;
//  public AssignedToPercent: number = null;
//  public AssignedToAmount: number = null;
//  public FractionItems: Array<IncentiveFractionItemsModel> = [];

//  public IsSelected: boolean = false;//only for client side.
//}

//sud:16Feb'20--add this to separate class later on. 
class InctvInvoiceInfoVM {
  public PatientId: number = 0;
  public PatientName: string = null;
  public PatientCode: string = null;
  public InvoiceNo: string = null;
  public TransactionDate: string = null;
  public TotalAmount: number = 0;
  public BillingTransactionId: number = 0;

}
class IncentiveTransactionInvoiceItemsVM {
  public AssignedToEmpName: string = '';
  public BillingTransactionId: number = null;
  public BillingTransactionItemId: number = null;
  public FractionCount: number = null;
  public InvoiceNo: string = "";
  public BillItemPriceId: number = 0;
  public Quantity: number = 0;
  public ItemId: number = 0;
  public ItemName: string = "";
  public PatientCode: string = "";
  public PatientId: number = null;
  public PatientName: string = "";
  public ReferredByEmpName: string = null;
  public ServiceDepartmentName: string = "";
  public TotalAmount: number = 100;
  public TransactionDate: string = "";

  public IsSelected: boolean = false;//only for client side.
}
