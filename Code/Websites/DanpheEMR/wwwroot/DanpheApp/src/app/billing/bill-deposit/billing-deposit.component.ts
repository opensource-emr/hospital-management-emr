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
@Component({
    selector: 'billing-deposit',
    templateUrl: './billing-deposit.html'
})
export class BillingDepositComponent {
    public deposit: BillingDeposit = new BillingDeposit();
    //declare boolean loading variable for disable the double click event of button
    loading: boolean = false;
    public showReceipt: boolean = false;
    public currencyUnit: string;
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
        public msgBoxServ: MessageboxService) {

        if (this.securityService.getLoggedInCounter().CounterId < 1) {
            this.callbackservice.CallbackRoute = '/Billing/SearchPatient'
            this.router.navigate(['/Billing/CounterActivate']);
        }
        else if (!this.patientservice.getGlobal().PatientId) {
            this.router.navigate(['/Billing/SearchPatient']);
        }
        else {
            this.currencyUnit = this.billingService.currencyUnit;
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
                if (this.deposit.DepositType == "Deposit")
                    this.deposit.DepositBalance = this.deposit.DepositBalance + this.deposit.Amount;
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
                                    this.msgBoxServ.showMessage("success", ["Deposit of " + this.currencyUnit + this.deposit.Amount + " added successfully."]);
                                }
                                else {
                                    this.msgBoxServ.showMessage("success", [this.currencyUnit + this.deposit.Amount + " returned successfully."]);
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

    //Ashim:#modificationDeposit 7May'18 - we're not posting to BillingTransactionTable incase of deposit or deposit return.

    //GetFormattedTxnForDeposit(): BillingTransaction {

    //    let billTxn = new BillingTransaction();
    //    billTxn.PatientId = this.patientservice.globalPatient.PatientId;
    //    billTxn.PatientVisitId = null;//get proper value here later if possible.
    //    billTxn.Remarks = this.deposit.Remarks;
    //    //this.model.CreatedOn = res.Results.CreatedOn;
    //    if (this.deposit.DepositType == 'deposit') {
    //        billTxn.TransactionType = "DEPOSIT";
    //        billTxn.DepositAmount = billTxn.TotalAmount = billTxn.PaidAmount = this.deposit.Amount;
    //        billTxn.DepositBalance = this.model.DepositBalance + this.deposit.Amount;
    //    }
    //    else {
    //        billTxn.TransactionType = "DEPOSIT RETURN";
    //        billTxn.DepositReturnAmount = this.deposit.Amount;
    //        billTxn.DepositBalance = this.model.DepositBalance - this.deposit.Amount;
    //        billTxn.DepositAmount = 0;
    //    }
    //    billTxn.PaidDate = moment().format("YYYY-MM-DD HH:mm:ss");
    //    billTxn.CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");
    //    billTxn.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
    //    billTxn.CounterId = this.securityService.getLoggedInCounter().CounterId;
    //    return billTxn;

    //}



    //Ashim:#modificationDeposit 7May'18 - we're not using invoice incase of deposit or deposit return
    //CallBackDeposit(depositModel: BillingDeposit) {
    //    let txnReceipt = BillingReceiptModel.GetReceiptForDeposit(depositModel.BillingTransaction);
    //    txnReceipt.Patient = Object.create(this.patientservice.globalPatient);
    //    txnReceipt.BillingUser = this.securityService.GetLoggedInUser().UserName;
    //    txnReceipt.IsValid = true;
    //    this.billingService.globalBillingReceipt = txnReceipt;
    //    this.router.navigate(['Billing/ReceiptPrint']);
    //}


    //CallBack(res) {
    //    this.deposit.BillingTransactionId = res.Results.BillingTransactionId;
    //    this.model.BillingTransactionId = res.Results.BillingTransactionId;

    //    var item = new BillingTransactionItem();
    //    if (this.model.TransactionType == "DEPOSIT") {
    //        item.TotalAmount = res.Results.DepositAmount
    //        item.Quantity = 1;
    //        item.Price = res.Results.DepositAmount;
    //    }
    //    else {
    //        item.TotalAmount = res.Results.DepositReturnAmount;
    //        item.Quantity = 1;
    //        item.Price = res.Results.DepositReturnAmount;
    //        this.model.DepositAmount = 0;
    //    }
    //    item.ItemName = this.model.TransactionType;
    //    this.model.TotalAmount = item.TotalAmount;
    //    if (this.model.TransactionType == "DEPOSIT") {
    //        this.model.Tender = item.TotalAmount;
    //    }
    //    else {
    //        let retamt = res.Results.DepositReturnAmount;
    //        this.model.DepositReturnAmount = retamt;
    //        this.model.Tender = 0;
    //    }
    //    //this.model.BillingTransactionItems[0].BillingTransactionId = this.deposit.BillingTransactionId;
    //    this.model.BillingTransactionItems.push(item);
    //    this.model.PaidDate = this.deposit.CreatedOn;
    //    this.model.Remarks = this.deposit.Remarks;
    //    this.model.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
    //    //this.deposit.OperatedDate = res.Results.PaidDate;
    //    //update the Bill Transaction Id  on the deposit Table
    //    this.billingBLService.UpdateTxnItemIdOnDeposit(this.deposit)
    //        .subscribe(() => {
    //            //this.deposit = new BillingDeposit();
    //            ////this.model. = this.deposit.OperatedDate;
    //            //var globalBill = this.billingService.CreateNewGlobalBillingTransaction();
    //            //globalBill = Object.assign(globalBill, this.model);
    //            //globalBill.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
    //            //this.model.BillingTransactionItems[0].RequisitionDate = moment().add((5 - moment().minute() % 5), 'minutes').format('YYYY-MM-DDTHH:mm');

    //            ////if (res.Results[0].TransactionType == 'deposit' || res.Results[0].TransactionType == 'deposit') {
    //            //this.model.DepositBalance = this.model.DepositAmount - this.model.DepositReturnAmount;
    //            ////}
    //            let depositbalance = this.model.DepositAmount - this.model.DepositReturnAmount;
    //            //}

    //            let txnReceipt = BillingReceiptModel.GetReceiptForDeposit(this.model);
    //            txnReceipt.Patient = Object.create(this.patientservice.globalPatient);
    //            txnReceipt.DepositBalance = depositbalance;
    //            txnReceipt.BillingUser = this.securityService.GetLoggedInUser().UserName;
    //            txnReceipt.IsValid = true;
    //            this.billingService.globalBillingReceipt = txnReceipt;
    //            this.router.navigate(['Billing/ReceiptPrint']);
    //        });
    //}

}
