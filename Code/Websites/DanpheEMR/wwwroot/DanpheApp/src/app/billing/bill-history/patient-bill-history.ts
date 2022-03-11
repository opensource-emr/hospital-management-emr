import { Component, EventEmitter, Input, Output } from "@angular/core";
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { BillingBLService } from '../shared/billing.bl.service';
import { PatientService } from '../../patients/shared/patient.service';

import { CommonFunctions } from '../../shared/common.functions';

import { DanpheHTTPResponse } from "../../shared/common-models";
import { Patient } from "../../patients/shared/patient.model";

import { BillingService } from "../shared/billing.service";
import * as moment from 'moment/moment';
import { CoreService } from "../../core/shared/core.service";

@Component({
  selector: "bill-history",
  templateUrl: "./patient-bill-history.html",
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class PatientBillHistoryComponent {

  @Output("history-emitter")
  historyEmitter: EventEmitter<Object> = new EventEmitter<Object>();

  @Input("showPatientBillHistory")
  public showPatientBillHistory: boolean = false;

  @Input("patient")
  public patient: Patient;

  public patBillHistory = {
    IsLoaded: false,
    PatientId: null,
    PaidAmount: null,
    DiscountAmount: null,
    CancelAmount: null,
    ReturnedAmount: null,
    CreditAmount: null,
    ProvisionalAmt: null,
    TotalDue: null,
    DepositBalance: null,
    BalanceAmount: null
  };
  public patBillHistoryDetail = {
    IsLoaded: false,
    Invoices: null,
    ProvisionalItems: null,
    Settlements: null,
    Deposits: null,
    CancelledItems: null
  }

  public paidPatBillHistoryDetail = Array<any>();

  public unPaidPatBillHistoryDetail = Array<any>();
  public returnedPatBillHistoryDetail = Array<any>();
  public insuranceBillDetail = Array<any>();
  //public currencyUnit: string = "";
  public showView: false;
  private RefundAmount: boolean = false;

  constructor(public billingBLService: BillingBLService,
    public msgBoxServ: MessageboxService,
    public patientService: PatientService, public billingService: BillingService,
    public coreService: CoreService) {
    //this.currencyUnit = this.billingService.currencyUnit;

  }


  //@Input("showPatientBillHistory")
  //public set value(val: boolean) {
  //  this.showPatientBillHistory = val;
  //  if (this.showPatientBillHistory && this.patient && this.patient.PatientId) {
  //    this.LoadPatientPastBillSummary(this.patient.PatientId);
  //    this.LoadPatientBillDetail(this.patient.PatientId);
  //  }
  //  else {
  //    this.showPatientBillHistory = false;
  //  }
  //}

  ngOnInit() {
    //console.log(this.patient);
    //console.log(this.showPatientBillHistory);
    if (this.showPatientBillHistory && this.patient && this.patient.PatientId) {
      this.LoadPatientPastBillSummary(this.patient.PatientId);
      this.LoadPatientBillDetail(this.patient.PatientId);
    }
    else {
      this.showPatientBillHistory = false;
    }
  }
  LoadPatientPastBillSummary(patientId: number) {
    this.billingBLService.GetPatientPastBillSummary(patientId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.patBillHistory = res.Results;
          //provisional amount should exclude itmes those are listed for payment in current window.
          this.patBillHistory.ProvisionalAmt = CommonFunctions.parseAmount(this.patBillHistory.ProvisionalAmt);
          this.patBillHistory.TotalDue = CommonFunctions.parseAmount(this.patBillHistory.CreditAmount + this.patBillHistory.ProvisionalAmt);
          this.patBillHistory.BalanceAmount = CommonFunctions.parseAmount(this.patBillHistory.DepositBalance - this.patBillHistory.TotalDue);
          this.patBillHistory.IsLoaded = true;
          this.patBillHistory.DepositBalance = CommonFunctions.parseAmount(this.patBillHistory.DepositBalance);
          this.patBillHistory.PaidAmount = CommonFunctions.parseAmount(this.patBillHistory.PaidAmount);
          this.patBillHistory.CreditAmount = CommonFunctions.parseAmount(this.patBillHistory.CreditAmount);
          this.patBillHistory.CancelAmount = CommonFunctions.parseAmount(this.patBillHistory.CancelAmount);
          this.patBillHistory.ReturnedAmount = CommonFunctions.parseAmount(this.patBillHistory.ReturnedAmount);
          this.patBillHistory.DiscountAmount = CommonFunctions.parseAmount(this.patBillHistory.DiscountAmount);

          if (this.patBillHistory.BalanceAmount >= 0) {
            this.RefundAmount = true;
          }
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Cannot get patient bill history detail.Check Log"]);
          console.log(res.ErrorMessage)
        }
      });
  }
  LoadPatientBillDetail(patientId: number) {
    this.paidPatBillHistoryDetail = [];
    this.unPaidPatBillHistoryDetail = [];
    this.returnedPatBillHistoryDetail = [];
    this.insuranceBillDetail = [];
    this.billingBLService.GetPatientBillHistoryDetail(patientId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.patBillHistoryDetail = res.Results;
          //provisional amount should exclude itmes those are listed for payment in current window.
          this.patBillHistoryDetail.Invoices.forEach(invoice => {
            invoice.Amount = CommonFunctions.parseAmount(invoice.Amount);
            if (invoice.BillStatus == 'paid' && !invoice.IsReturned && !invoice.IsInsuranceBilling) {
              this.paidPatBillHistoryDetail.push(invoice);
            }
            else if (invoice.BillStatus == 'unpaid' && !invoice.IsReturned && !invoice.IsInsuranceBilling) {
              this.unPaidPatBillHistoryDetail.push(invoice);
            }
            else if (invoice.IsInsuranceBilling && !invoice.IsReturned) {
              this.insuranceBillDetail.push(invoice);
            }
            // else if (invoice.IsReturned) {
            //   invoice.BillStatus = 'returned';
            //   this.returnedPatBillHistoryDetail.push(invoice);
            // }
          });
          this.returnedPatBillHistoryDetail = res.Results.ReturnedItems;
          
          this.patBillHistoryDetail.ProvisionalItems.forEach(provisional => {
            provisional.SubTotal = CommonFunctions.parseAmount(provisional.SubTotal);
            provisional.Amount = CommonFunctions.parseAmount(provisional.Amount);
          });
          this.patBillHistoryDetail.Settlements.forEach(settlement => {
            settlement.PaidAmount = CommonFunctions.parseAmount(settlement.PaidAmount);
          });
          this.patBillHistoryDetail.CancelledItems.forEach(canItems => {
            canItems.Amount = CommonFunctions.parseAmount(canItems.Amount);
            canItems.SubTotal = CommonFunctions.parseAmount(canItems.SubTotal);
          });
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Cannot get patient bill history detail. Check Log"]);
          console.log(res.ErrorMessage)
        }
      });
  }
  Close() {
    this.showPatientBillHistory = false;
    this.patient = null;
  }
  //  <link href="../../assets-dph/external/global/plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
  public showHeader: boolean = false;
  printDetailedView() {
    this.showHeader = true;
    let popupWinindow;
    var printContents = document.getElementById("printpage").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    popupWinindow.document.write('<html><head><link href="../../assets-dph/external/global/plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet" /><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
    popupWinindow.document.close();
  }

  showDetailedView(event: any) {
  }

  public hotkeys(event) {
    if (event.keyCode == 27) {
      this.historyEmitter.emit({ close: true });
    }
  }

}
