import { Component, ChangeDetectorRef } from "@angular/core";
import { BillingBLService } from "../../shared/billing.bl.service";
import { DenominationModel } from "../../shared/denomination.model";
import { HandOverModel } from "../../shared/hand-over.model";
import * as moment from 'moment/moment';
import { Employee } from "../../../employee/shared/employee.model";
import { DLService } from "../../../shared/dl.service";
import { Router } from "@angular/router";
import { CoreService } from "../../../core/shared/core.service";
import { SecurityService } from "../../../security/shared/security.service";
import { CallbackService } from "../../../shared/callback.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { HandOverTransactionModel } from "../../shared/hand-over-transaction.model";

@Component({
  selector: 'billing-denomination',
  templateUrl: './bill-denomination-counter.html',
  styles: [`.print-only{display: none;}`],
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class BillingDenominationCounterComponent {

  public HandoverTransaction: HandOverTransactionModel = new HandOverTransactionModel();
  public Denomination: Array<DenominationModel> = new Array<DenominationModel>();
  public userlist: Array<Employee> = [];
  public Banklist: Array<any> = [];
  public loading: boolean = false;
  public currentCounter: number = 0;
  public currentEmpId: number = 0;

  public total: number = 0;
  public ShowAlert: boolean = false;
  public CurrencyType = ['1000', '500', '100', '50', '20', '10', '5', '2', '1'];
  public handoverDetail: HandOverModel;
  public showColInPag: number = 0;
  public userName: string = null;
  public counterDayCollection = [];
  public userDayCollection = [];

  public CurrentDate: string = null;
  public FromDate: string = null;
  public ToDate: string = null;

  public BankName: any = null;
  public OtherAmount: number = 0;

  public LatestDueAmount: number = 0;

  public PendingReceiveAmount: number = 0;

  public BankHandoverSettings: any = { "ShowVoucherNumber": true, "IsVoucherNoMandatory": false,"ShowReceivePending":false,"ReceivePendingLabel":"Pending(to be Received by Accounts)" };
  
  constructor(
    public billingBLService: BillingBLService,
    public dLService: DLService,
    public msgBoxServ: MessageboxService,
    public securityService: SecurityService,
    public changeDetectorRef: ChangeDetectorRef,
    public callbackService: CallbackService,
    public coreService: CoreService,
    public router: Router) {
    this.currentCounter = this.securityService.getLoggedInCounter().CounterId;
    this.currentEmpId = this.securityService.GetLoggedInUser().EmployeeId;

    if (this.currentCounter < 1) {
      this.callbackService.CallbackRoute = '/Billing/BillingDenomination'
      this.router.navigate(['/Billing/CounterActivate']);
    }
    else {
      this.GetUsersList();
      this.GetBanksList();      
    }
    this.CurrentDate = moment().format('YYYY-MM-DD');
    this.FromDate = moment().format('YYYY-MM-DD');
    this.ToDate = moment().format('YYYY-MM-DD');
    this.HandoverTransaction.VoucherDate = moment().format('YYYY-MM-DD');
    this.GetBankHandoverSettings();
  }

  ngOnInit() {
    this.BankListFormatter = this.BankListFormatter.bind(this);//to use global variable in list formatter auto-complete
    this.LoadCounterDayCollection();
    this.GetEmpDueAmount();
    this.CurrencyType.forEach(
      val => {
        var singleDenomination = new DenominationModel();
        singleDenomination.CurrencyType = Number(val);
        this.Denomination.push(singleDenomination);
      });
    this.total = 0;

    this.coreService.FocusInputById('srchbxBankName');//default focus on bankname searchbox.
  }

  public GetBanksList() {
    this.billingBLService.GetBankList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          if (res.Results.length)
            this.Banklist = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to get Bank List"]);
          console.log(res.ErrorMessage);
        }
      });
  }


  public GetUsersList() {
    this.billingBLService.GetUserList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          if (res.Results.length)
            this.userlist = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to get User List."]);
          console.log(res.ErrorMessage);
        }
      });
  }

  public GetEmpDueAmount() {
    this.billingBLService.GetEmpDueAmount()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          //this.EmpDueAmount = res.Results;
          this.LatestDueAmount = res.Results.LatestDueAmount;
          this.PendingReceiveAmount = res.Results.PendingReceiveAmount;
          this.HandoverTransaction.DueAmount = this.LatestDueAmount - this.HandoverTransaction.HandoverAmount;

        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to get Employee Due Amount."]);
          console.log(res.ErrorMessage);
        }
      });
  }
  GetHandoverAmount() { //to get HandoverTransaction amount
    this.dLService.Read("/BillingReports/BIL_TXN_GetHandoverCalculationDateWise?FromDate=" + this.FromDate + "&ToDate=" + this.ToDate)
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK") {
          let data = JSON.parse(res.Results.JsonData);
          if (data && data.Table1) {
            let currUsrHandoverInfo = data.Table1.find(a => a.EmployeeId == this.currentEmpId);
            let currUsrCollectionObj = this.userDayCollection.find(c => c.EmployeeId == this.currentEmpId);
            let currUsrCollnAmt = currUsrCollectionObj ? currUsrCollectionObj.UserDayCollection : 0;
            let handoverBalance = currUsrHandoverInfo ? currUsrHandoverInfo.ReceivedAmount - currUsrHandoverInfo.GivenAmount : 0;

            this.showColInPag = currUsrCollnAmt + handoverBalance;
          }
          else {
            this.msgBoxServ.showMessage("notice-message", ['Data Not Available for Selected Parameters...']);
          }
        }
      });
  }

  CheckValidations(): boolean {
    let isValid: boolean = true;
    for (var i in this.HandoverTransaction.HandoverTransactionValidator.controls) {
      this.HandoverTransaction.HandoverTransactionValidator.controls[i].markAsDirty();
      this.HandoverTransaction.HandoverTransactionValidator.controls[i].updateValueAndValidity();
    }
    isValid = this.HandoverTransaction.IsValidCheck(undefined, undefined);

    if (this.HandoverTransaction.HandoverAmount > this.LatestDueAmount) {
      isValid = false;
    }

    return isValid;
  }

  Submit() {
    this.loading = true;

    if(this.BankHandoverSettings.ShowVoucherNumber && this.BankHandoverSettings.IsVoucherNoMandatory && !this.HandoverTransaction.VoucherNumber){
      this.msgBoxServ.showMessage("Error", ["Enter Handover Voucher Number. Voucher Number is Mandatory"]);
      this.loading = false;
      return;
    }
    if (this.CheckValidations()) {
      this.HandoverTransaction.CounterId = this.currentCounter;
      this.HandoverTransaction.HandoverByEmpId = this.currentEmpId;
      this.HandoverTransaction.HandoverType = 'Bank';

      this.billingBLService.PostHandoverTransactionDetails(this.HandoverTransaction)
        .subscribe(
          res => {
            if (res.Status == "OK") {
              this.HandoverTransaction = new HandOverTransactionModel();
              this.HandoverTransaction.VoucherDate = moment().format('YYYY-MM-DD');
              this.msgBoxServ.showMessage("success", ["Handover Transaction Detailed added successfully."]);
              this.loading = false;

              this.GetEmpDueAmount();
            }
            else {
              this.msgBoxServ.showMessage("failed", ["Something Wrong."]);
              console.log(res.ErrorMessage);
              this.loading = false;
            }
          },
          err => {
            this.logError(err);
            this.loading = false;
          });
    }
    else {
      this.msgBoxServ.showMessage("failed", ["Check the Entered Form detailed."]);
      this.loading = false;
    }
  }



  AmountChange() {
    this.total = 0;
    this.Denomination.forEach(val => {
      this.total = this.total + val.CurrencyType * val.Quantity;
    });
    this.total = this.total + this.OtherAmount;
  }

  OtherAmountChange() {
    this.total = 0;
    this.Denomination.forEach(val => {
      this.total = this.total + val.CurrencyType * val.Quantity;
    });
    this.total = this.total + this.OtherAmount;
  }

  logError(err: any) {
    console.log(err);
  }

  LoadCounterDayCollection() {
    this.dLService.Read("/Reporting/BILLDsbCntrUsrCollection?fromDate="
      + this.FromDate + "&toDate=" + this.ToDate)
      .map(res => res)
      .subscribe(res => {

        if (res.Results) {
          let dailyCollection = JSON.parse(res.Results.JsonData);

          this.userDayCollection = dailyCollection.UserCollection;
          this.counterDayCollection = dailyCollection.CounterCollection;

          this.GetHandoverAmount();
        }
      },
        err => {
        });

  }

  public print() {
    let popupWinindow;
    var printContents = document.getElementById("denomPrint").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    var documentContent = '<html><head>';
    documentContent += `<link rel="stylesheet" type="text/css" href="../../../../../../themes/theme-default/DanpheStyle.css" />`
      + `<link rel="stylesheet" type="text/css" href="../../../../../../themes/theme-default/DanphePrintStyle.css" /></head>`;

    /// documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
    ///Sud:22Aug'18--added no-print class in below documeentContent

    documentContent += '<body class="bill-denom" onload="window.print()">' + printContents + '</body></html>';
    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();
  }
  // public showPrint: boolean = false;
  // public printDetaiils: any;Ks

  // public print() {
  //   this.showPrint = false;
  //   this.printDetaiils = null;
  //   this.changeDetectorRef.detectChanges();
  //   this.showPrint = true;
  //   this.printDetaiils = document.getElementById("denomPrint");

  // }

  CurrentDateChange() {
    this.FromDate = this.ToDate = this.CurrentDate;
  }

  SetFocusOnButton(idToSelect: string) {
    if (document.getElementById(idToSelect)) {
      let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
      nextEl.focus();
    }
  }

  BankListFormatter(data: any): string {
    let html: string = "";
    if (data['BankShortName']) {
      html += "<i>" + data["BankName"] + "<b>&nbsp;&nbsp;(" + data['BankShortName'] + ")</b></i>";
    }
    else {
      html += "<i>" + data["BankName"] + "</i>";
    }
    return html;
  }

  AssignSelectedBank() {
    console.log(this.BankName);
    let bank = null;
    if (this.BankName) {
      if (typeof (this.BankName) == 'string') {
        bank = this.Banklist.find(a => a.BankName.toLowerCase() == this.BankName.toLowerCase());
      }
      else if (typeof (this.BankName) == 'object') {
        bank = this.BankName;
      }
      else {
        this.BankName = null;
      }
      if (bank) {
        this.HandoverTransaction.BankName = bank.BankName;
      }
      else{
        this.BankName = null;
      }
    }
  }
  public hotkeys(event) {
    if (event.keyCode == 27) {//key->ESC
      this.ShowAlert = false;
    }
  }

  HandoverAmountChange() {
    if (this.HandoverTransaction.HandoverAmount <= this.LatestDueAmount) {
      this.HandoverTransaction.DueAmount = this.LatestDueAmount - this.HandoverTransaction.HandoverAmount;
    }
    else if (this.HandoverTransaction.HandoverAmount > this.LatestDueAmount) {
      this.HandoverTransaction.DueAmount = this.LatestDueAmount;
      this.msgBoxServ.showMessage("warning", ["Handover Amount is Greater than Handover Due Amount."]);
    }
  }

  setFocusOnDenominationCount(index) {
    var targetId: string = null;
    if (this.Denomination.length == (index + 1)) {
      targetId = 'otherAmount';
    }
    else {
      targetId = 'quantity_' + (index + 1);
    }
    let htmlObject = document.getElementById(targetId);
    if (htmlObject) {
      htmlObject.focus();
    }
  }

  public GetBankHandoverSettings() {
    var StrParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Billing" && a.ParameterName == "BankHandoverSettings");
    if (StrParam && StrParam.ParameterValue) {
      let currParam = JSON.parse(StrParam.ParameterValue);
      this.BankHandoverSettings = currParam;
    }
  }

  FocuseOnVoucherNo(){
    if(this.BankHandoverSettings.ShowVoucherNumber){
      this.coreService.FocusInputById('VoucherNumber');
    }
    else{
      this.coreService.FocusInputById('HandoverAmount');
    }
  }
}
