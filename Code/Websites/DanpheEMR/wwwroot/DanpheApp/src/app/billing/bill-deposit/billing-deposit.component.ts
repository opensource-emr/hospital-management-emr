import { Component, Input, Output, EventEmitter } from "@angular/core";
import { RouterOutlet, RouterModule, Router } from '@angular/router';

import { BillingDeposit } from '../shared/billing-deposit.model';

import { PatientService } from '../../patients/shared/patient.service';
import { BillingService } from '../shared/billing.service';
import { BillingBLService } from '../shared/billing.bl.service';
import { SecurityService } from '../../security/shared/security.service';

import { CallbackService } from '../../shared/callback.service';

import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { CommonFunctions } from "../../shared/common.functions";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { PatientBillingContextVM } from "../shared/patient-billing-context-vm";
import { CoreService } from "../../core/shared/core.service";
@Component({
  selector: 'billing-deposit',
  templateUrl: './billing-deposit.html'
})
export class BillingDepositComponent {
  public deposit: BillingDeposit = new BillingDeposit();
  //declare boolean loading variable for disable the double click event of button
  loading: boolean = false;
  public showReceipt: boolean = false;
  //public currencyUnit: string;
  @Input("isAddDepositFrmBillTxn")
  public isAddDepositFrmBillTxn: boolean = false;
  @Output("emit-deposit")
  emitDeposit: EventEmitter<Object> = new EventEmitter<Object>();

  @Input()
  public showReceiptInput: boolean = false;

  public currBillingContext: PatientBillingContextVM = null;

  public patBillHistory = {
    IsLoaded: false,
    PatientId: null,
    CreditAmount: null,
    ProvisionalAmt: null,
    TotalDue: null,
    DepositBalance: null,
    BalanceAmount: null
  };

  constructor(public patientservice: PatientService,
    public billingService: BillingService,
    public billingBLService: BillingBLService,
    public router: Router,
    public securityService: SecurityService,
    public callbackservice: CallbackService,
    public coreService: CoreService,
    public msgBoxServ: MessageboxService) {

    if (this.securityService.getLoggedInCounter().CounterId < 1) {
      this.callbackservice.CallbackRoute = '/Billing/SearchPatient'
      this.router.navigate(['/Billing/CounterActivate']);
    }
    else if (!this.patientservice.getGlobal().PatientId) {
      this.router.navigate(['/Billing/SearchPatient']);
    }
    else {
      //this.currencyUnit = this.billingService.currencyUnit;
      this.Initialize();
      this.GetPatientDeposit(this.patientservice.getGlobal().PatientId);
    }

    this.LoadPatientPastBillSummary(this.patientservice.getGlobal().PatientId);
  }

  Initialize() {
    this.deposit = new BillingDeposit();
    this.deposit.CounterId = this.securityService.getLoggedInCounter().CounterId;
    this.deposit.DepositType = "Deposit";
    this.deposit.PatientId = this.patientservice.getGlobal().PatientId;
    this.deposit.PaymentMode = "cash";
    this.LoadPatientBillingContext();
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
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
          this.loading = false;
        }
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
          this.msgBoxServ.showMessage("failed", ["Unable to get deposit detail"]);
          console.log(res.ErrorMessage);
        }
      });
  }

  CalculateDepositBalance(res) {
    let depositAmount = 0;
    let returnDepositAmount = 0;
    let depositDeductAmount = 0;
    for (var i = 0; i < res.Results.length; i++) {
      if (res.Results[i].DepositType == "Deposit") {
        depositAmount = res.Results[i].DepositAmount;
      }
      else if (res.Results[i].DepositType == "ReturnDeposit") {
        returnDepositAmount = res.Results[i].DepositAmount;
      }
      else if (res.Results[i].DepositType == "depositdeduct") {
        depositDeductAmount = res.Results[i].DepositAmount;
      }
    }
    this.deposit.DepositBalance = CommonFunctions.parseAmount(depositAmount - returnDepositAmount - depositDeductAmount);
  }

  SubmitBillingDeposit(_showReceipt: boolean) {
    this.loading = true;
    if (this.deposit.DepositType) {
      if (this.deposit.Amount > 0) {
        if (this.deposit.DepositType == "ReturnDeposit" && this.deposit.Amount > this.deposit.DepositBalance) {
          this.msgBoxServ.showMessage("failed", ["Return Amount should not be greater than Deposit Amount"]);
          this.loading = false;
          return;
        }
        if (this.deposit.DepositType == "Deposit") {
          if (this.deposit.Amount > 10000000000) {
            this.msgBoxServ.showMessage("failed", ["Deposit Amount should not be greater than 10000000000"]);
            this.loading = false;
            return;
          }
          this.deposit.DepositBalance = this.deposit.DepositBalance + this.deposit.Amount;
        }
        else
          this.deposit.DepositBalance = this.deposit.DepositBalance - this.deposit.Amount;
        this.billingBLService.PostBillingDeposit(this.deposit)
          .subscribe(
            res => {
              if (this.showReceiptInput) {
                _showReceipt = true;
              }
              if (res.Status == "OK") {
                if (this.deposit.DepositType == "Deposit") {
                  this.msgBoxServ.showMessage("success", ["Deposit of " + this.coreService.currencyUnit + this.deposit.Amount + " added successfully."]);
                }
                else {
                  this.msgBoxServ.showMessage("success", [this.coreService.currencyUnit + this.deposit.Amount + " returned successfully."]);
                }
                if (_showReceipt) {
                  this.deposit = res.Results;
                  this.deposit.PatientName = this.patientservice.getGlobal().ShortName;
                  this.deposit.PatientCode = this.patientservice.getGlobal().PatientCode;
                  this.deposit.Address = this.patientservice.getGlobal().Address;
                  this.deposit.PhoneNumber = this.patientservice.getGlobal().PhoneNumber;
                }
                else {
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
                this.msgBoxServ.showMessage("failed", ["Cannot complete the transaction."]);
                this.loading = false;
              }
            });
      } else {
        this.msgBoxServ.showMessage("failed", [this.deposit.DepositType + " Amount must be greater than 0"]);
        this.loading = false;
      }
    }
    else {
      this.msgBoxServ.showMessage("failed", ["Please Select Deposit Type"])
      this.loading = false;
    }
  }
  public EmitDeposit(emitBalance: boolean) {
    let balance = emitBalance ? this.deposit.DepositBalance : 0;
    this.emitDeposit.emit({ depositBalance: balance });
  }
  //added: ashim: 08Aug2018 : To get patientVisitId and assign to deposit transaction.
  LoadPatientBillingContext() {
    this.billingBLService.GetPatientBillingContext(this.patientservice.globalPatient.PatientId)
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


}
