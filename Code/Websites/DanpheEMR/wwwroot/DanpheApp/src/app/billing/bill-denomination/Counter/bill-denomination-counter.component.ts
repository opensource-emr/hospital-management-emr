import { ChangeDetectorRef, Component } from "@angular/core";
import { Router } from "@angular/router";
import * as moment from 'moment/moment';
import { CoreService } from "../../../core/shared/core.service";
import { Employee } from "../../../employee/shared/employee.model";
import { SecurityService } from "../../../security/shared/security.service";
import { CallbackService } from "../../../shared/callback.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { DLService } from "../../../shared/dl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponseText, ENUM_DateTimeFormat, ENUM_HandOver_Type, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { BillingGridColumnSettings } from "../../shared/billing-grid-columns";
import { BillingBLService } from "../../shared/billing.bl.service";
import { DenominationModel, HandOverEmployeeListVM, PendingHandOverListVM, PendingOutgoingHandoverListVM } from "../../shared/denomination.model";
import { HandOverTransactionModel } from "../../shared/hand-over-transaction.model";
import { HandOverModel } from "../../shared/hand-over.model";

@Component({
  selector: 'billing-denomination',
  templateUrl: './bill-denomination-counter.html',
  styles: [`.print-only{display: none;}`],
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class BillingDenominationCounterComponent {

  public HandoverTransactionAccount: HandOverTransactionModel = new HandOverTransactionModel();
  public HandoverTransactionUser: HandOverTransactionModel = new HandOverTransactionModel();
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
  public PendingOutgoingUser: number = 0;
  public PendingOutgoingAccount: number = 0;
  public showDenominationForm: boolean = false;
  public showPendingOutgoingUserHandOver: boolean = false;
  public showPendingOutgoingAccountHandOver: boolean = false;
  public showPendingIncomingHandOver: boolean = false;
  public handOverType: string = "";
  public selectedHandOverToUser: HandOverEmployeeListVM = new HandOverEmployeeListVM();
  public PendingIncomingHandoverGridColumns: Array<any> = new Array<any>();
  public PendingOutgoingUserHandoverGridColumns: Array<any> = new Array<any>();
  public PendingOutgoingAccountHandoverGridColumns: Array<any> = new Array<any>();
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public PendingIncomingHandoverList: Array<PendingHandOverListVM> = new Array<PendingHandOverListVM>();
  public PendingOutgoingUserHandoverList: Array<PendingOutgoingHandoverListVM> = new Array<PendingOutgoingHandoverListVM>();
  public PendingOutgoingAccountHandoverList: Array<PendingOutgoingHandoverListVM> = new Array<PendingOutgoingHandoverListVM>();
  public EnabledHandoverTypeSetting = {
    "EnableUserLevelHandover": false,
    "EnableAccountLevelHandover": false,
    "DefaultHandoverType": "Account"
  }
  public handoverTypeList: typeof ENUM_HandOver_Type = ENUM_HandOver_Type;
  public BankHandoverSettings: any = { "ShowVoucherNumber": true, "IsVoucherNoMandatory": false, "ShowReceivePending": false, "ReceivePendingLabel": "Pending(to be Received by Accounts)" };

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
    this.PendingIncomingHandoverGridColumns = BillingGridColumnSettings.PendingIncomingHandoverList;
    this.PendingOutgoingUserHandoverGridColumns = BillingGridColumnSettings.PendingOutgingUserHandoverList;
    this.PendingOutgoingAccountHandoverGridColumns = BillingGridColumnSettings.PendingOutgingAccountHandoverList;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('CreatedOn', false));

    if (this.currentCounter < 1) {
      this.callbackService.CallbackRoute = '/Billing/BillingDenomination';
    }
    else {
      this.GetUsersList();
      this.GetBanksList();
    } close
    this.CurrentDate = moment().format(ENUM_DateTimeFormat.Year_Month_Day);
    this.FromDate = moment().format(ENUM_DateTimeFormat.Year_Month_Day);
    this.ToDate = moment().format(ENUM_DateTimeFormat.Year_Month_Day);
    this.HandoverTransactionAccount.VoucherDate = moment().format(ENUM_DateTimeFormat.Year_Month_Day);
    this.ReadParameters();
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

  public GetBanksList(): void {
    this.billingBLService.GetBankList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          if (res.Results.length)
            this.Banklist = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to get Bank List"]);
          console.log(res.ErrorMessage);
        }
      });
  }


  public GetUsersList(): void {
    this.billingBLService.GetUserList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          if (res.Results.length)
            this.userlist = res.Results;
        }
        else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Unable to get User List."]);
          console.log(res.ErrorMessage);
        }
      });
  }

  public GetEmpDueAmount(): void {
    this.billingBLService.GetEmpDueAmount()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == ENUM_DanpheHTTPResponseText.OK) {
          this.LatestDueAmount = res.Results.LatestDueAmount;
          this.PendingReceiveAmount = res.Results.PendingReceiveAmount;
          this.PendingOutgoingUser = res.Results.PendingOutgoingUser;
          this.PendingOutgoingAccount = res.Results.PendingOutgoingAccount;
          this.HandoverTransactionAccount.DueAmount = this.HandoverTransactionUser.DueAmount = this.LatestDueAmount - (this.HandoverTransactionAccount.HandoverAmount + this.HandoverTransactionUser.HandoverAmount);

        }
        else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Unable to get Employee Due Amount."]);
          console.log(res.ErrorMessage);
        }
      });
  }
  GetHandoverAmount(): void { //to get HandoverTransaction amount
    this.dLService.Read("/BillingReports/BIL_TXN_GetHandoverCalculationDateWise?FromDate=" + this.FromDate + "&ToDate=" + this.ToDate)
      .map(res => res)
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          let data = JSON.parse(res.Results.JsonData);
          if (data && data.Table1) {
            let currUsrHandoverInfo = data.Table1.find(a => a.EmployeeId == this.currentEmpId);
            let currUsrCollectionObj = this.userDayCollection.find(c => c.EmployeeId == this.currentEmpId);
            let currUsrCollnAmt = currUsrCollectionObj ? currUsrCollectionObj.UserDayCollection : 0;
            let handoverBalance = currUsrHandoverInfo ? currUsrHandoverInfo.ReceivedAmount - currUsrHandoverInfo.GivenAmount : 0;

            this.showColInPag = currUsrCollnAmt + handoverBalance;
          }
          else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ['Data Not Available for Selected Parameters...']);
          }
        }
      });
  }

  CheckValidations(): boolean {
    let isValid: boolean = true;
    for (var i in this.HandoverTransactionAccount.HandoverTransactionValidator.controls) {
      this.HandoverTransactionAccount.HandoverTransactionValidator.controls[i].markAsDirty();
      this.HandoverTransactionAccount.HandoverTransactionValidator.controls[i].updateValueAndValidity();
    }
    isValid = this.HandoverTransactionAccount.IsValidCheck(undefined, undefined);

    if (this.HandoverTransactionAccount.HandoverAmount > this.LatestDueAmount) {
      isValid = false;
    }

    return isValid;
  }

  Submit(): void {
    this.loading = true;

    if (this.BankHandoverSettings.ShowVoucherNumber && this.BankHandoverSettings.IsVoucherNoMandatory && !this.HandoverTransactionAccount.VoucherNumber) {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Enter Handover Voucher Number. Voucher Number is Mandatory"]);
      this.loading = false;
      return;
    }
    if (this.CheckValidations() && ((this.HandoverTransactionAccount.HandoverAmount + this.HandoverTransactionUser.HandoverAmount) <= this.LatestDueAmount)) {
      this.HandoverTransactionAccount.CounterId = this.currentCounter;
      this.HandoverTransactionAccount.HandoverByEmpId = this.currentEmpId;
      this.HandoverTransactionAccount.HandoverType = ENUM_HandOver_Type.Account;

      this.billingBLService.PostHandoverTransactionDetails(this.HandoverTransactionAccount)
        .subscribe(
          res => {
            if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
              this.HandoverTransactionAccount = new HandOverTransactionModel();
              this.HandoverTransactionAccount.VoucherDate = moment().format(ENUM_DateTimeFormat.Year_Month_Day);
              this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Handover Transaction Detailed added successfully."]);
              this.loading = false;

              this.GetEmpDueAmount();
            }
            else {
              this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Something Wrong."]);
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
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Check the Entered Form detailed."]);
      this.loading = false;
    }
  }

  SubmitUserHandover(): void {
    this.loading = true;
    if (this.HandoverTransactionUser.HandoverToEmpId <= 0) {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Please select HandoverTo User from the list."]);
      this.loading = false;
      return;
    }
    if (this.HandoverTransactionUser.HandoverAmount <= 0 || ((this.HandoverTransactionAccount.HandoverAmount + this.HandoverTransactionUser.HandoverAmount) > this.LatestDueAmount)) {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Invalid Handover Amount. Please check it."]);
      this.loading = false;
      return;
    }
    this.HandoverTransactionUser.CounterId = this.currentCounter;
    this.HandoverTransactionUser.HandoverByEmpId = this.currentEmpId;
    this.HandoverTransactionUser.HandoverType = ENUM_HandOver_Type.User;
    this.billingBLService.PostHandoverTransactionDetails(this.HandoverTransactionUser).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
        this.HandoverTransactionUser = new HandOverTransactionModel()
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Handover Transaction Detailed added successfully."]);
        this.selectedHandOverToUser = new HandOverEmployeeListVM();
        this.GetEmpDueAmount();
      }
      else {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Something Wrong."]);
        console.log(res.ErrorMessage);
      }
    },
      (err: DanpheHTTPResponse) => {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [err.ErrorMessage]);
      },
      () => {
        this.loading = false;
      });
  }


  AmountChange(): void {
    this.total = 0;
    this.Denomination.forEach(val => {
      this.total = this.total + val.CurrencyType * val.Quantity;
    });
    this.total = this.total + this.OtherAmount;
  }

  OtherAmountChange(): void {
    this.total = 0;
    this.Denomination.forEach(val => {
      this.total = this.total + val.CurrencyType * val.Quantity;
    });
    this.total = this.total + this.OtherAmount;
  }

  logError(err: any): void {
    console.log(err);
  }

  LoadCounterDayCollection(): void {
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

  public print(): void {
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

  CurrentDateChange(): void {
    this.FromDate = this.ToDate = this.CurrentDate;
  }

  SetFocusOnButton(idToSelect: string): void {
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

  AssignSelectedBank(): void {
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
        this.HandoverTransactionAccount.BankName = bank.BankName;
      }
      else {
        this.BankName = null;
      }
    }
  }

  AssignSelectedUser(): void {
    this.HandoverTransactionUser.HandoverToEmpId = this.selectedHandOverToUser.UserId > 0 ? this.selectedHandOverToUser.UserId : 0;
  }

  public hotkeys(event): void {
    if (event.keyCode == 27) {//key->ESC
      this.ShowAlert = false;
    }
  }

  HandoverAmountChange(): void {
    if ((this.HandoverTransactionAccount.HandoverAmount + this.HandoverTransactionUser.HandoverAmount) <= this.LatestDueAmount) {
      this.HandoverTransactionUser.DueAmount = this.HandoverTransactionAccount.DueAmount = this.LatestDueAmount - (this.HandoverTransactionAccount.HandoverAmount + this.HandoverTransactionUser.HandoverAmount);
    }
    else if ((this.HandoverTransactionAccount.HandoverAmount + this.HandoverTransactionUser.HandoverAmount) > this.LatestDueAmount) {
      this.HandoverTransactionUser.DueAmount = this.HandoverTransactionAccount.DueAmount = this.LatestDueAmount;
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, ["Handover Amount is Greater than Handover Due Amount."]);
    }
  }

  setFocusOnDenominationCount(index): void {
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

  public ReadParameters(): void {
    let StrParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Billing" && a.ParameterName == "BankHandoverSettings");
    if (StrParam && StrParam.ParameterValue) {
      let currParam = JSON.parse(StrParam.ParameterValue);
      this.BankHandoverSettings = currParam;
    }
    let Param = this.coreService.Parameters.find(a => a.ParameterGroupName == "Billing" && a.ParameterName == "HandOverTypeSelection");
    if (Param && Param.ParameterValue) {
      this.EnabledHandoverTypeSetting = JSON.parse(Param.ParameterValue);
      if (this.EnabledHandoverTypeSetting.DefaultHandoverType.toLowerCase() === ENUM_HandOver_Type.Account.toLowerCase()) {
        if (this.EnabledHandoverTypeSetting.EnableAccountLevelHandover) {
          this.handOverType = ENUM_HandOver_Type.Account;
        }
        else {
          if (this.EnabledHandoverTypeSetting.EnableUserLevelHandover) {
            this.handOverType = ENUM_HandOver_Type.User;
          }
        }
      }
      else {
        if (this.EnabledHandoverTypeSetting.EnableUserLevelHandover && this.EnabledHandoverTypeSetting.DefaultHandoverType.toLowerCase() === ENUM_HandOver_Type.User.toLowerCase()) {
          this.handOverType = ENUM_HandOver_Type.User;
        }
        else {
          if (this.EnabledHandoverTypeSetting.EnableAccountLevelHandover) {
            this.handOverType = ENUM_HandOver_Type.Account;
          }
        }
      }
    }
  }

  FocuseOnVoucherNo(): void {
    if (this.BankHandoverSettings.ShowVoucherNumber) {
      this.coreService.FocusInputById('VoucherNumber');
    }
    else {
      this.coreService.FocusInputById('HandoverAmount');
    }
  }

  FocuseOnHandOverAmountUser(): void {
    this.coreService.FocusInputById('HandOver_Amount_User');
  }

  public OpenDenominationForm(): void {
    this.showDenominationForm = true;
  }

  public CloseDenominationFrom(): void {
    this.showDenominationForm = false;

    this.Denomination.forEach(a => {
      a.Quantity = 0;
    });
    this.total = 0;
  }
  public OpenPendingIncomingHandover(): void {
    this.GetPendingIncomingHandover();
    this.showPendingIncomingHandOver = true;
  }

  public ClosePendingIncomingHandover(): void {
    this.showPendingIncomingHandOver = false;
  }

  public OpenPendingOutgoingHandoverUser(): void {
    this.GetPendingOutgoingUserHandover();
    this.showPendingOutgoingUserHandOver = true;
  }

  public ClosePendingOutgoingHandoverUser(): void {
    this.showPendingOutgoingUserHandOver = false;
  }

  public OpenPendingOutgoingHandoverAccount(): void {
    this.GetPendingOutgoingAccountHandover();
    this.showPendingOutgoingAccountHandOver = true;
  }

  public ClosePendingOutgoingHandoverAccount(): void {
    this.showPendingOutgoingAccountHandOver = false;
  }

  public PendingIncomingHandoverListGridActions($event): void {
    switch ($event.Action) {
      case "handover-receive":
        {
          let data = $event.Data;
          let isConfirm = window.confirm(`You are about to receive ${data.HandoverAmount} from ${data.HandOverByName}.This will be added to your current DUE AMOUNT. Are you sure want to continue?`);
          if (isConfirm) {
            this.billingBLService.UpdateHandOverStatus($event.Data.HandoverTxnId).subscribe((res) => {
              this.GetPendingIncomingHandover();
              this.GetEmpDueAmount();
              this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Handover Amount is successfully received."]);
            });
          }
        }
        break;
      default:
        break;
    }
  }

  public GetPendingIncomingHandover(): void {
    this.billingBLService.GetPendingIncomingHandOver().subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
        this.PendingIncomingHandoverList = res.Results;
      }
      else {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Unable to get pending incoming handover list."]);
      }
    },
      (err: DanpheHTTPResponse) => {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Something went wrong please try again."]);
      });
  }

  public GetPendingOutgoingUserHandover(): void {
    this.billingBLService.GetPendingOutgoingHandOver(ENUM_HandOver_Type.User).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
        this.PendingOutgoingUserHandoverList = res.Results;
      }
      else {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Unable to get outgoing user handover list."]);
      }
    },
      (err: DanpheHTTPResponse) => {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Something went wrong please try again."]);
      });
  }

  public GetPendingOutgoingAccountHandover(): void {
    this.billingBLService.GetPendingOutgoingHandOver(ENUM_HandOver_Type.Account).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
        this.PendingOutgoingAccountHandoverList = res.Results;
      }
      else {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Unable to get outgoing account handover list."]);
      }
    },
      (err: DanpheHTTPResponse) => {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Something went wrong please try again."]);
      });
  }

  public UserListFormatter(data: Employee): string {
    return `${data["ShortName"]} | ${data["DepartmentName"]}`;
  }
}
