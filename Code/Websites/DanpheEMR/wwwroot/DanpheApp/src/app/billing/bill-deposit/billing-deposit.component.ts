import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Router } from '@angular/router';

import { BillingDeposit } from '../shared/billing-deposit.model';

import { PatientService } from '../../patients/shared/patient.service';
import { SecurityService } from '../../security/shared/security.service';
import { BillingBLService } from '../shared/billing.bl.service';
import { BillingService } from '../shared/billing.service';

import { CallbackService } from '../../shared/callback.service';

import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CoreService } from "../../core/shared/core.service";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { CommonFunctions } from "../../shared/common.functions";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { BillingMasterBlService } from "../shared/billing-master.bl.service";
import { EmployeeCashTransaction } from "../shared/billing-transaction.model";
import { BillingDepositList_DTO } from "../shared/dto/bill-deposit-list.dto";
import { DepositHead_DTO } from "../shared/dto/deposit-head.dto";
import { PatientBillingContextVM } from "../shared/patient-billing-context-vm";
import { ENUM_BillDepositType, ENUM_BillPaymentMode, ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status, ENUM_VisitType } from "./../../shared/shared-enums";

@Component({
  selector: 'billing-deposit',
  templateUrl: './billing-deposit.html',
  styleUrls: ['./billing-deposit.component.css']
})
export class BillingDepositComponent {
  public deposit: BillingDeposit = new BillingDeposit();
  //declare boolean loading variable for disable the double click event of button
  loading: boolean = false;
  public showReceipt: boolean = false;
  //public currencyUnit: string;
  @Input("isAddDepositFrmBillTxn")
  public isAddDepositFrmBillTxn: boolean = false;
  @Input("depositFrom")
  public depositFrom: string = "";
  @Output("emit-deposit")
  emitDeposit: EventEmitter<Object> = new EventEmitter<Object>();

  @Input()
  public showReceiptInput: boolean = false;
  public Amount: FormGroup = null;


  public currBillingContext: PatientBillingContextVM = null;

  public depositHeadList: Array<DepositHead_DTO> = new Array<DepositHead_DTO>();
  public selectedDepositHead: DepositHead_DTO = new DepositHead_DTO();
  public patBillHistory = {
    IsLoaded: false,
    PatientId: null,
    CreditAmount: null,
    ProvisionalAmt: null,
    TotalDue: null,
    DepositBalance: null,
    BalanceAmount: null
  };

  PaymentPages: any[];
  public TempEmployeeCashTransaction: Array<EmployeeCashTransaction> = new Array<EmployeeCashTransaction>();
  MstPaymentModes: any[];
  public depositLists = new Array<BillingDepositList_DTO>();
  public SelectedDeposit = new BillingDepositList_DTO();
  public FilteredDepositLists = new Array<BillingDepositList_DTO>();
  public IsDepositBalanceExceededToUseDepositReceiptNo: boolean = false;
  public SchemeId: number = null;
  public depositRefundPermission: string = "billing-deposit-refund-process";//! Krishna, 30thMay'23, This is a name of Permission to control Deposit Refund, Do not change until necessary.
  public depositRefundUsingDepositReceiptNumber: boolean = false;
  public confirmationTitle: string = "Confirm !";
  public confirmationMessageForAddDeposit: string = "Are you sure you want to Add Deposit ?";
  public confirmationMessageForAddDepositAndPrint: string = "Are you sure you want to Add Deposit and Print Slip ?";
  public confirmationMessageForReturnDeposit: string = "Are you sure you want to Return Deposit ?";
  public confirmationMessageForReturnDepositAndPrint: string = "Are you sure you want to Return Deposit and Print Slip ?";
  VisitType: any;

  constructor(public patientService: PatientService,
    public billingService: BillingService,
    public billingBLService: BillingBLService,
    public router: Router,
    public securityService: SecurityService,
    public callbackService: CallbackService,
    public coreService: CoreService,
    public formBuilder: FormBuilder, public messageBoxService: MessageboxService,
    public billingMasterBlService: BillingMasterBlService) {

    if (this.securityService.getLoggedInCounter().CounterId < 1) {
      this.callbackService.CallbackRoute = '/Billing/SearchPatient';
    }
    else if (!this.patientService.getGlobal().PatientId) {
      this.router.navigate(['/Billing/SearchPatient']);
    }
    else {
      //this.currencyUnit = this.billingService.currencyUnit;
      this.SchemeId = this.billingMasterBlService.SchemeId;
      this.Initialize();
      this.GetPatientDeposit(this.patientService.getGlobal().PatientId);
      this.GetDepositHead();

    }

    this.LoadPatientPastBillSummary(this.patientService.getGlobal().PatientId);
  }

  Initialize() {
    this.deposit = new BillingDeposit();
    this.deposit.CounterId = this.securityService.getLoggedInCounter().CounterId;
    this.deposit.TransactionType = ENUM_BillDepositType.Deposit;
    this.deposit.PatientId = this.patientService.getGlobal().PatientId;
    this.deposit.PaymentMode = ENUM_BillPaymentMode.cash;
    if (this.selectedDepositHead) {
      this.deposit.DepositHeadId = this.selectedDepositHead.DepositHeadId;
    }
    this.LoadPatientBillingContext();
    this.GetPatientDepositsList(this.deposit.PatientId);
  }

  ngOnInit() {
    this.MstPaymentModes = this.coreService.masterPaymentModes;
    this.PaymentPages = this.coreService.paymentPages;
    this.Amount = this.formBuilder.group({
      'Amount': ['', Validators.required]
    });
  }

  ngAfterViewInit() {
    this.SetFocusById('txtAmount');
  }

  LoadPatientPastBillSummary(patientId: number) {
    this.billingBLService.GetPatientPastBillSummary(patientId)
      .subscribe(res => {
        if (res.Status == "OK") {

          this.patBillHistory = res.Results;
          this.patBillHistory.ProvisionalAmt = CommonFunctions.parseAmount(this.patBillHistory.ProvisionalAmt);
          this.patBillHistory.BalanceAmount = CommonFunctions.parseAmount(this.patBillHistory.BalanceAmount);
          this.patBillHistory.DepositBalance = CommonFunctions.parseAmount(this.patBillHistory.DepositBalance);
          this.patBillHistory.CreditAmount = CommonFunctions.parseAmount(this.patBillHistory.CreditAmount);
          this.patBillHistory.TotalDue = CommonFunctions.parseAmount(this.patBillHistory.TotalDue);
          this.patBillHistory.IsLoaded = true;
        }
        else {
          this.messageBoxService.showMessage("failed", [res.ErrorMessage]);
          this.loading = false;
        }
      });
  }

  FilteredDepositListFormatter(data: any): string {
    return data["ReceiptNo"];
  }
  GetPatientDepositsList(patientId: number) {
    this.billingBLService.GetPatientDepositsList(patientId).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results) {
        this.depositLists = res.Results;
        if (this.depositLists && this.depositLists.length) {
          this.FilteredDepositLists = this.depositLists.filter(d => d.TransactionType === ENUM_BillDepositType.Deposit && d.IsDepositRefundedUsingDepositReceiptNo === false);
        }
      }
    },
      err => {
        console.log(err);
      });
  }
  GetPatientDeposit(patientId: number): void {
    this.billingBLService.GetDepositFromPatient(patientId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          if (res.Results.length)
            this.CalculateDepositBalance(res);
        }
        else {
          this.messageBoxService.showMessage("failed", ["Unable to get deposit detail"]);
          console.log(res.ErrorMessage);
        }
      });
  }

  GetDepositHead() {
    this.billingBLService
      .GetDepositHead()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.depositHeadList = res.Results;
          const defaultDepositHead = this.depositHeadList.find(f => f.IsDefault === true);
          if (defaultDepositHead) {
            this.deposit.DepositHeadId = defaultDepositHead.DepositHeadId;
          } else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [
              "Please check log for error",
            ]);
          }
        } else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [
            "No Default Deposit Head Found",
          ]);
        }
      });

  }


  CalculateDepositBalance(res) {
    let depositAmount = 0;
    let returnDepositAmount = 0;
    let depositDeductAmount = 0;
    for (let i = 0; i < res.Results.length; i++) {
      if (res.Results[i].TransactionType == "Deposit") {
        depositAmount = res.Results[i].SumInAmount;
      }
      else if (res.Results[i].TransactionType == "ReturnDeposit") {
        returnDepositAmount = res.Results[i].SumOutAmount;
      }
      else if (res.Results[i].TransactionType == "depositdeduct") {
        depositDeductAmount = res.Results[i].SumOutAmount;
      }
    }
    this.deposit.DepositBalance = CommonFunctions.parseAmount(depositAmount - returnDepositAmount - depositDeductAmount);
  }
  OnDepositHeadChange($event) {
    if ($event) {
      if (this.selectedDepositHead && this.selectedDepositHead.DepositHeadId > 0) {
        this.deposit.DepositHeadId = this.selectedDepositHead.DepositHeadId;
      } else {
        this.deposit.DepositHeadId = null;
      }
    }
  }

  SubmitBillingDeposit(_showReceipt: boolean) {
    if (this.CheckForRefundPermission()) {
      this.deposit.PaymentMode = ENUM_BillPaymentMode.cash;
      if (this.Amount.valid)
        this.loading = true;
      if (this.deposit.TransactionType) {
        if (this.deposit.InAmount > 0 || this.deposit.OutAmount > 0) {
          if (this.deposit.TransactionType === ENUM_BillDepositType.ReturnDeposit && this.deposit.OutAmount > this.deposit.DepositBalance) {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Return Amount should not be greater than Deposit Amount"]);
            this.loading = false;
            return;
          }
          if (this.deposit.TransactionType === ENUM_BillDepositType.Deposit) {
            const maximumDepositAmount = 10000000000;
            if (this.deposit.InAmount > maximumDepositAmount) {
              this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [`Deposit Amount should not be greater than ${maximumDepositAmount}`]);
              this.loading = false;
              return;
            }
            this.deposit.DepositBalance = this.deposit.DepositBalance + this.deposit.InAmount;
          }
          else
            this.deposit.DepositBalance = this.deposit.DepositBalance - this.deposit.OutAmount;
          this.deposit.empCashTransactionModel = this.TempEmployeeCashTransaction;
          //!Krishna, 17thMay'23, Remove below code if Refund using DepositReceiptNo is not needed.
          if (this.SelectedDeposit && this.SelectedDeposit.DepositId && this.deposit.TransactionType === ENUM_BillDepositType.ReturnDeposit) {
            this.deposit.SelectedDepositId = this.SelectedDeposit.DepositId;
          } else {
            this.deposit.SelectedDepositId = null;
          }
          let visitType = this.patientService.getGlobal().VisitType ? this.patientService.getGlobal().VisitType : ENUM_VisitType.outpatient;

          if (this.depositFrom === 'ipBilling') {
            visitType = ENUM_VisitType.inpatient
          }
          this.deposit.VisitType = visitType;

          this.billingBLService.PostBillingDeposit(this.deposit)
            .subscribe(
              res => {
                if (this.showReceiptInput) {
                  _showReceipt = true;
                }
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                  this.depositRefundUsingDepositReceiptNumber = false;
                  if (this.deposit.TransactionType === ENUM_BillDepositType.Deposit) {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ["Deposit of " + this.coreService.currencyUnit + this.deposit.InAmount + " added successfully."]);
                  }
                  else {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [this.coreService.currencyUnit + this.deposit.OutAmount + " returned successfully."]);

                  }

                  if (_showReceipt) {
                    this.deposit = res.Results;
                    this.deposit.PatientName = this.patientService.getGlobal().ShortName;
                    this.deposit.PatientCode = this.patientService.getGlobal().PatientCode;
                    this.deposit.Address = this.patientService.getGlobal().Address;
                    this.deposit.PhoneNumber = this.patientService.getGlobal().PhoneNumber;
                  }
                  else {
                    const defaultDepositHead = this.depositHeadList.find(deposit => deposit.IsDefault);
                    this.selectedDepositHead = defaultDepositHead;
                    this.Initialize();
                    this.deposit.DepositBalance = res.Results.DepositBalance;
                  }
                  //this.deposit.DepositType = "Deposit Settlement ";//needs revision: sud:13May'18
                  if (this.isAddDepositFrmBillTxn)
                    this.EmitDeposit(true);
                  this.showReceipt = _showReceipt;
                  this.loading = false;
                  this.LoadPatientPastBillSummary(res.Results.PatientId);
                }
                else {
                  if (res.ErrorMessage.match(/Return Deposit Amount is Invalid/g)) {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [res.ErrorMessage]);
                    this.router.navigate(['/Billing/SearchPatient']);
                    this.loading = false;
                  }
                  else {
                    //! Krishna, this is done to maintain the Actual DepositBalance incase of failure.
                    if (this.deposit.TransactionType === ENUM_BillDepositType.Deposit) {

                      this.deposit.DepositBalance = this.deposit.DepositBalance - this.deposit.InAmount;
                    } else {
                      this.deposit.DepositBalance = this.deposit.DepositBalance + this.deposit.OutAmount;
                    }
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Cannot complete the transaction."]);
                    this.loading = false;
                  }
                }
              });
        } else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [this.deposit.TransactionType + " Amount must be greater than 0"]);
          this.loading = false;
        }
      }
      else {
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Please Select Deposit Type"])
        this.loading = false;
      }
    } else {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["Sorry, you do not have Permission to refund."]);
    }

  }
  public EmitDeposit(emitBalance: boolean) {
    let balance = emitBalance ? this.deposit.DepositBalance : 0;
    this.emitDeposit.emit({ depositBalance: balance });
  }
  //added: ashim: 08Aug2018 : To get patientVisitId and assign to deposit transaction.
  LoadPatientBillingContext() {
    this.billingBLService.GetPatientBillingContext(this.patientService.globalPatient.PatientId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.currBillingContext = res.Results;
          this.deposit.PatientVisitId = this.currBillingContext.PatientVisitId;
        }
      });
  }

  SetFocusById(IdToBeFocused: string) {
    window.setTimeout(function () {
      let elemToFocus = document.getElementById(IdToBeFocused)
      if (elemToFocus != null && elemToFocus != undefined) {
        elemToFocus.focus();
      }
    }, 100);
  }

  MultiplePaymentCallBack($event) {
    if ($event && $event.MultiPaymentDetail) {
      this.TempEmployeeCashTransaction = new Array<EmployeeCashTransaction>();
      this.TempEmployeeCashTransaction = $event.MultiPaymentDetail;
    }
    this.deposit.PaymentDetails = $event.PaymentDetail;
  }

  PaymentModeChanges($event) {
    this.deposit.PaymentMode = $event.PaymentMode.toLowerCase();
    this.deposit.PaymentDetails = $event.PaymentDetails;
    if (this.TempEmployeeCashTransaction && !this.TempEmployeeCashTransaction.length) {
      let obj = this.MstPaymentModes.find(a => a.PaymentSubCategoryName.toLowerCase() == this.deposit.PaymentMode.toLocaleLowerCase());
      let empCashTxnObj = new EmployeeCashTransaction();
      empCashTxnObj.InAmount = this.deposit.DepositBalance + this.deposit.InAmount;
      empCashTxnObj.OutAmount = 0;
      empCashTxnObj.PaymentModeSubCategoryId = obj.PaymentSubCategoryId;
      empCashTxnObj.ModuleName = "Billing";
      this.TempEmployeeCashTransaction.push(empCashTxnObj);
    }
  }
  IsDirty(fieldName): boolean {
    if (fieldName == undefined) {
      return this.Amount.dirty;
    } else {
      return this.Amount.controls[fieldName].dirty;
    }
  }

  IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.Amount.valid;
    } else {
      return !this.Amount.hasError(validator, fieldName);
    }
  }
  logError(err: any) {
    console.log(err);
  }

  OnDepositReceiptNoChanged(): void {
    this.deposit.OutAmount = 0;
    if (this.SelectedDeposit && this.SelectedDeposit.DepositId) {
      this.depositRefundUsingDepositReceiptNumber = true;
      this.IsDepositBalanceExceededToUseDepositReceiptNo = false;
      if (this.SelectedDeposit.Amount > this.deposit.DepositBalance) {
        this.IsDepositBalanceExceededToUseDepositReceiptNo = true;
        this.SelectedDeposit = new BillingDepositList_DTO();
        this.depositRefundUsingDepositReceiptNumber = false;
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Deposit Balance is not enough to use Deposit Receipt to Refund"]);
        return;
      }
      const selectedDepositTransaction = this.FilteredDepositLists.find(a => a.DepositId === this.SelectedDeposit.DepositId);
      if (selectedDepositTransaction) {
        this.deposit.OutAmount = selectedDepositTransaction.Amount;
        this.selectedDepositHead = this.depositHeadList.find(a => a.DepositHeadId === selectedDepositTransaction.DepositHeadId);
        this.deposit.DepositHeadId = selectedDepositTransaction.DepositHeadId;
      }
    }
  }

  DepositTransactionTypeChanged($event): void {
    if ($event) {
      this.SelectedDeposit = new BillingDepositList_DTO();
      this.deposit.InAmount = 0;
      this.deposit.OutAmount = 0;
    }
  }

  CheckForRefundPermission(): boolean {
    let isPermitted = false;
    if (this.deposit.TransactionType !== ENUM_BillDepositType.ReturnDeposit) {
      isPermitted = true;
      return isPermitted;
    }
    let depositRefundPermissionSettings;
    const param = this.coreService.Parameters.find(a => a.ParameterGroupName === 'Billing' && a.ParameterName === 'DepositRefundPermissionSetting');
    if (param) {
      const paramValue = JSON.parse(param.ParameterValue);
      if (paramValue) {
        depositRefundPermissionSettings = paramValue;
      }
    }
    if (this.deposit.TransactionType === ENUM_BillDepositType.ReturnDeposit) {
      if (depositRefundPermissionSettings && depositRefundPermissionSettings.length) {
        const depositRefundPermissionSetting = depositRefundPermissionSettings.find(a => a.SchemeId === this.SchemeId && a.DepositHeadId === this.deposit.DepositHeadId);
        if (depositRefundPermissionSetting && depositRefundPermissionSetting.IsPermissionRequiredToDepositRefund) {
          isPermitted = this.securityService.HasPermission(this.depositRefundPermission);
        } else {
          isPermitted = true;
        }
      } else {
        isPermitted = this.securityService.HasPermission(this.depositRefundPermission);
      }
    }
    return isPermitted;
  }

  handleConfirm() {
    this.loading = true;
    this.SubmitBillingDeposit(false);
  }

  handleCancel() {
    this.loading = false;
  }

  handleDepositAndPrintConfirmation() {
    this.loading = true;
    this.SubmitBillingDeposit(true);
  }
}
