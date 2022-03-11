import { Component, OnChanges, SimpleChanges, DoCheck, Input, AfterContentChecked, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router'
import * as moment from 'moment/moment';

import { PatientService } from '../../../patients/shared/patient.service';
import { Patient } from '../../../patients/shared/patient.model';

//import { BillingService } from '../shared/billing.service';
//import { BillingBLService } from '../shared/billing.bl.service';

//import { BillingTransaction } from '../shared/billing-transaction.model';
//import { BillingTransactionItem } from "../shared/billing-transaction-item.model";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
//to add danphe-grid in credit-details page:sudarshan 26Mar'17
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { RouteFromService } from '../../../shared/routefrom.service';
import { SecurityService } from '../../../security/shared/security.service';
import { CallbackService } from '../../../shared/callback.service';
//import { BillingReceiptModel } from "../shared/billing-receipt.model";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { CommonFunctions } from "../../../shared/common.functions";
import { PharmacyService } from '../../shared/pharmacy.service';
import { PharmacyBLService } from '../../shared/pharmacy.bl.service';
import { PHRMInvoiceModel } from '../../shared/phrm-invoice.model';
import { PHRMSettlementModel } from '../../shared/pharmacy-settlementModel';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  // selector: 'my-app',
  templateUrl: "./settlement.view.html"
})

// App Component class
export class PHRMSettlementComponent implements OnDestroy {

  public allPHRMPendingSettlements: Array<PHRMInvoiceModel> = [];//this contains settleme
  public patCrInvoicDetails: Array<PHRMInvoiceModel> = [];

  public PHRMSettlementGridCols: Array<any> = null;

  public selectAllInvoices: boolean = false;
  public showActionPanel: boolean = false;
  public showDetailView: boolean = false;
  public selInvoicesTotAmount: number = 0;

  public model: PHRMSettlementModel = new PHRMSettlementModel();
  public setlmntToDisplay = new PHRMSettlementModel();

  public showReceipt: boolean = false;//to show hide settlement grid+action panel   OR  SettlementReceipt
  public showGrid: boolean = true;

  //     //sud: 13May'18--to display patient bill summary
  public patBillHistory = {
    IsLoaded: false,
    PatientId: null,
    CreditAmount: null,
    ProvisionalAmt: null,
    TotalDue: null,
    DepositBalance: null,
    BalanceAmount: null,
    SubtotalAmount: null,
    DiscountAmount: null
  };

  public loading: boolean = false;
  public currentCounter: number = 0;
  public billStatus: string = "All";
  public filteredPHRMPendingSettlements: Array<PHRMInvoiceModel> = [];

  constructor(public pharmacyService: PharmacyService,
    public router: Router,
    public routeFromService: RouteFromService,
    public pharmacyBLService: PharmacyBLService,
    public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef,
    public callbackservice: CallbackService,
    public patientService: PatientService,
    public msgBoxServ: MessageboxService) {

    this.currentCounter = this.securityService.getPHRMLoggedInCounter().CounterId;
    this.PHRMSettlementGridCols = GridColumnSettings.PHRMSettlementBillSearch;
    this.showGrid = true;

  }
  ngOnDestroy(): void {
    this.patientService.CreateNewGlobal();
  }

  // GetBillsForSettlement() {
  //   this.allPHRMPendingSettlements = [];
  //   this.pharmacyBLService.GetPHRMPendingBillsForSettlement()
  //     .subscribe((res: DanpheHTTPResponse) => {
  //       if (res.Status == "OK") {
  //         this.allPHRMPendingSettlements = res.Results;
  //         this.filteredPHRMPendingSettlements = this.allPHRMPendingSettlements;
  //       }
  //     });
  // }


  PHRMSettlementGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "showDetails":
        {
          this.showReceipt = false;
          var data = $event.Data;
          this.GetPatientCreditInvoices(data);

        }
        break;
      case "print":
        {
          var data = $event.Data;
          if (data.SettlementId > 0) {
            this.GetPaidSettlementsDetails(data);
          }
          else {
            this.GetUnPaidSettlementsDetails(data);
          }
        }
        break;
      default:
        break;
    }
  }

  GetPatientCreditInvoices(row): void {
    this.showGrid = false;
    this.showActionPanel = true;
    this.showReceipt = false;
    //patient mapping later used in receipt print
    let patient = this.patientService.CreateNewGlobal();
    patient.ShortName = row.PatientName;
    patient.PatientCode = row.PatientCode;
    patient.DateOfBirth = row.DateOfBirth;
    patient.Gender = row.Gender;
    patient.PatientId = row.PatientId;
    patient.PhoneNumber = row.PhoneNumber;

    this.pharmacyBLService.GetCreditInvoicesByPatient(patient.PatientId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.patCrInvoicDetails = res.Results.CreditItems;
          this.patientService.globalPatient = res.Results.Patient;
          var patient = this.patientService.globalPatient;
          patient.ShortName = `${patient.FirstName} ${patient.MiddleName ? patient.MiddleName : ''} ${patient.LastName}`;
          this.patCrInvoicDetails.forEach(function (inv) {
            inv.selectedPatient = res.Results.Patient;
            inv.CreateOn = moment(inv.CreateOn).format("YYYY-MM-DD HH:mm");
            //adding new field to manage checked/unchecked invoice.
            // inv.IsSelected = false;
          });

          this.patCrInvoicDetails.forEach(element => {
            element.InvoiceItems.forEach(a => {
              if (a.DiscountPercentage != 0) {
                // a.DiscountAmount = CommonFunctions.parseAmount(a.TotalAmount / a.DiscountPercentage)     already we have added item level discount if there is discount in item level then it will show otherwise there will be  0
                a.Tax = 0
              } else {
                //a.DiscountAmount = 0;
                a.Tax = 0
              }
            })
          });

          //by default selecting all items.
          this.selectAllInvoices = true;
          this.SelectAllChkOnChange();
          this.LoadPatientPastBillSummary(patient.PatientId);

        }
        else {
          this.msgBoxServ.showMessage("error", ["Couldn't fetch patient's credit details. Please try again later"], res.ErrorMessage);
        }
      });
  }


  //     //sud: 13May'18--to display patient's bill history
  LoadPatientPastBillSummary(patientId: number) {
    this.pharmacyBLService.GetPatientPastBillSummary(patientId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.patBillHistory = res.Results;
          this.patBillHistory.CreditAmount = CommonFunctions.parseAmount(this.patBillHistory.CreditAmount);
          //provisional amount should exclude itmes those are listed for payment in current window.
          this.patBillHistory.ProvisionalAmt = CommonFunctions.parseAmount(this.patBillHistory.ProvisionalAmt);
          this.patBillHistory.TotalDue = CommonFunctions.parseAmount(this.patBillHistory.CreditAmount + this.patBillHistory.ProvisionalAmt);
          this.patBillHistory.BalanceAmount = CommonFunctions.parseAmount(this.patBillHistory.DepositBalance - this.patBillHistory.TotalDue);
          //if balance is negative it'll be payableamt otherwise it'll be refundable amount.
          this.patBillHistory.BalanceAmount < 0 ? (this.model.PayableAmount = (-this.patBillHistory.BalanceAmount)) : (this.model.RefundableAmount = this.patBillHistory.BalanceAmount)
          this.patBillHistory.DepositBalance = CommonFunctions.parseAmount(this.patBillHistory.DepositBalance);
          this.patBillHistory.IsLoaded = true;
          this.patBillHistory.SubtotalAmount = CommonFunctions.parseAmount(this.patBillHistory.SubtotalAmount);           //add subtotal 
          this.patBillHistory.DiscountAmount = CommonFunctions.parseAmount(this.patBillHistory.DiscountAmount);           // add total discount amount  

          //this.model.DueAmount = this.patBillHistory.BalanceAmount;
          this.model.PaidAmount = this.model.PayableAmount;
          this.model.ReturnedAmount = this.model.RefundableAmount;

          if (this.patBillHistory.ProvisionalAmt > 0) {
            this.msgBoxServ.showMessage("warning", ["There are few items in provisional list, please generate their invoices and proceed for settlement"], null, true);
          }

        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
      });
  }


  BackToGrid() {
    this.showGrid = true;
    this.showActionPanel = false;
    this.showReceipt = false;
    this.showDetailView = false;
    this.setlmntToDisplay = new PHRMSettlementModel()
    //reset current patient value on back button.. 
    this.patientService.CreateNewGlobal();
    this.patCrInvoicDetails = [];
    this.model = new PHRMSettlementModel();
    //this.GetBillsForSettlement();
  }

  gridExportOptions = {
    fileName: 'SettlementLists_' + moment().format('YYYY-MM-DD') + '.xls',
  };


  SelectAllChkOnChange() {
    if (this.patCrInvoicDetails && this.patCrInvoicDetails.length) {
      if (this.selectAllInvoices) {
        this.patCrInvoicDetails.forEach(itm => {
          itm.IsSelected = true;
        });
        this.showActionPanel = true;
      }
      else {
        this.patCrInvoicDetails.forEach(itm => {
          itm.IsSelected = false;
        });
        this.showActionPanel = false;

      }

      this.CalculateTotalAmt();
    }
  }

  //     //Sets the component's check-unchecked properties on click of Component-Level Checkbox.
  //     SelectItemChkOnChange(item: BillingTransactionItem) {

  //         //show action panel if any one of item is checked.
  //         if (this.patCrInvoicDetails.find(itm => itm.IsSelected)) {
  //             this.showActionPanel = true;
  //         }
  //         else {
  //             this.showActionPanel = false;
  //         }

  //         if ((this.patCrInvoicDetails.every(a => a.IsSelected == true))) {
  //             this.selectAllInvoices = true;
  //         }
  //         else {
  //             this.selectAllInvoices = false;
  //         }

  //         this.CalculateTotalAmt();
  //     }

  CalculateTotalAmt() {
    this.selInvoicesTotAmount = 0;
    this.patCrInvoicDetails.forEach(inv => {
      if (inv.IsSelected) {
        this.selInvoicesTotAmount += inv.TotalAmount;
      }
    });
    this.selInvoicesTotAmount = CommonFunctions.parseAmount(this.selInvoicesTotAmount);
  }

  PayProvisionalItems() {
    let patId = this.patientService.globalPatient.PatientId;

    this.pharmacyBLService.GetProvisionalItemsByPatientIdForSettle(patId)
      .subscribe(res => {
        let provItems = res.Results.CreditItems;

        //changed: 4May-anish
        // let billingTransaction = this.billingService.CreateNewGlobalBillingTransaction();
        // billingTransaction.PatientId = patId;

        // provItems.forEach(bil => {
        //     let curBilTxnItm = BillingTransactionItem.GetClone(bil);
        //     billingTransaction.BillingTransactionItems.push(curBilTxnItm);

        // });
        this.routeFromService.RouteFrom = '/Pharmacy/Sale/Settlement';
        this.router.navigate(['/Pharmacy/Sale/CreditBills']);

      });
  }
  SettlePatientBills() {
    this.loading = true;
    if (this.CheckIsDiscountApplied()) {
      this.model.PHRMInvoiceTransactions = this.patCrInvoicDetails;

      let setlmntToPost = this.GetSettlementInvoiceFormatted();

      this.pharmacyBLService.PostSettlementInvoice(setlmntToPost)
        .subscribe((res: DanpheHTTPResponse) => {
          console.log("Response from server:");
          console.log(res);

          this.setlmntToDisplay = res.Results;
          this.setlmntToDisplay.BillingUser = this.securityService.GetLoggedInUser().UserName;
          this.setlmntToDisplay.Patient = this.patientService.globalPatient;
          this.showReceipt = true;
          this.showActionPanel = false;
          this.loading = false;

        },
          err => {
            this.msgBoxServ.showMessage("failed", [err.ErrorMessage]);
          }

        );
    }
    else {
      this.loading = false;
    }
  }

  CheckRemarks() {
    if (this.model.DiscountPercentage != null) {
      this.model.IsDiscounted = true;
    }
    else {
      this.model.IsDiscounted = false;
    }
  }
  CheckIsDiscountApplied(): boolean {
    if (this.model.DiscountPercentage != null) {
      this.model.IsDiscounted = true;
    }
    else {
      this.model.IsDiscounted = false;
    }
    if (this.model.IsDiscounted && !this.model.Remarks) {
      this.msgBoxServ.showMessage('failed', ["Remarks is mandatory in case of discount."]);
      return false;
    }
    else
      return true;
  }

  GetSettlementInvoiceFormatted(): PHRMSettlementModel {
    let retSettlModel = new PHRMSettlementModel();
    retSettlModel.PHRMInvoiceTransactions = this.patCrInvoicDetails;
    retSettlModel.PatientId = this.patientService.globalPatient.PatientId;
    retSettlModel.PayableAmount = this.model.PayableAmount;
    retSettlModel.RefundableAmount = this.model.RefundableAmount;
    retSettlModel.PaidAmount = this.model.PaidAmount;
    retSettlModel.ReturnedAmount = this.model.ReturnedAmount;
    retSettlModel.DepositDeducted = this.patBillHistory.DepositBalance;
    retSettlModel.DueAmount = this.model.DueAmount > 0 ? this.model.DueAmount : (-this.model.DueAmount);
    retSettlModel.PaymentMode = this.model.PaymentMode;
    retSettlModel.PaymentDetails = this.model.PaymentDetails;
    retSettlModel.CounterId = this.securityService.getLoggedInCounter().CounterId;
    retSettlModel.DiscountAmount = this.model.DiscountAmount;
    retSettlModel.Remarks = this.model.Remarks;
    return retSettlModel;
  }

  //     OnPaymentModeChange() {

  //     }
  PaidAmountOnChange() {
    if (this.model.PayableAmount < this.model.PaidAmount) {
      this.model.ReturnedAmount = CommonFunctions.parseAmount(this.model.PaidAmount - this.model.PayableAmount);
      this.model.IsDiscounted = false;
      this.model.DiscountAmount = 0;
      this.model.DiscountPercentage = 0;
    }

    else if (this.model.PayableAmount > this.model.PaidAmount) {
      this.model.DiscountAmount = CommonFunctions.parseAmount(this.model.PayableAmount - this.model.PaidAmount);
      this.model.IsDiscounted = true;
      this.model.ReturnedAmount = 0;
      this.model.DiscountPercentage = CommonFunctions.parseAmount((this.model.DiscountAmount / this.model.PayableAmount) * 100);

    }
    // else if(this.model.DiscountPercentage >0){
    //     let disc = this.model.DiscountPercentage/100;
    //     this.model.DiscountAmount = CommonFunctions.parseAmount(this.model.PayableAmount * disc);
    //     this.model.PaidAmount = CommonFunctions.parseFinalAmount( this.model.PayableAmount - this.model.DiscountAmount);
    //     this.model.IsDiscounted = true;
    //     this.model.ReturnedAmount  =0;
    // }
  }
  DiscountAmountOnChange() {
    let disc = this.model.DiscountPercentage / 100;
    this.model.DiscountAmount = CommonFunctions.parseAmount(this.model.PayableAmount * disc);
    this.model.PaidAmount = CommonFunctions.parseFinalAmount(this.model.PayableAmount - this.model.DiscountAmount);
    this.model.IsDiscounted = true;
    this.model.ReturnedAmount = 0;

  }
  DiscountChkOnChange() {
    if (this.model.IsDiscounted) {
      this.model.DiscountAmount = this.model.DueAmount;
      this.model.DueAmount = 0;
    }
    else {
      this.model.DiscountAmount = 0;
      this.model.DueAmount = CommonFunctions.parseAmount(this.model.PayableAmount - this.model.PaidAmount);
    }
  }

  //     //this is called after event emmitted from settlement receipt
  OnReceiptClosed($event) {
    //write logic based on $event later on.. for now only close this..
    this.showReceipt = false;
    this.setlmntToDisplay = new PHRMSettlementModel();
    //this.GetBillsForSettlement();
    this.BackToGrid();
    this.changeDetector.detectChanges();

  }
  showDetailedView(event: any) {
    console.log(event);
  }
  OnBillStatusChange() {
    if (this.billStatus == "All") {
      this.filteredPHRMPendingSettlements = this.allPHRMPendingSettlements;
    }
    else if (this.billStatus == "paid") {
      this.filteredPHRMPendingSettlements = this.allPHRMPendingSettlements.filter(p => p.BilStatus == "paid");
    }
    else if (this.billStatus == "unpaid") {
      this.filteredPHRMPendingSettlements = this.allPHRMPendingSettlements.filter(p => p.BilStatus == "unpaid");
    }
  }

  GetPaidSettlementsDetails(settlementData) {
    this.pharmacyBLService.GetPHRMSettlementDuplicateDetails(settlementData.SettlementId)
      .subscribe((res: DanpheHTTPResponse) => {
        this.setlmntToDisplay = res.Results;
        this.setlmntToDisplay.BillingUser = this.securityService.GetLoggedInUser().UserName;
        this.showReceipt = true;
        this.showGrid = false;
      },
        err => {
          this.msgBoxServ.showMessage("failed", [err.ErrorMessage]);
        }
      );
  }

  GetUnPaidSettlementsDetails(row) {
    this.pharmacyBLService.GetCreditInvoicesByPatient(row.PatientId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.patCrInvoicDetails = res.Results.CreditItems;
          this.patientService.globalPatient = res.Results.Patient;
          this.setlmntToDisplay.PHRMInvoiceTransactions = this.patCrInvoicDetails;
          this.setlmntToDisplay.Patient = res.Results.Patient;
          this.setlmntToDisplay.BillingUser = this.securityService.GetLoggedInUser().UserName;
          this.showReceipt = true;
          this.showGrid = false;
        }
        else {
          this.msgBoxServ.showMessage("error", ["Couldn't fetch patient's details. Please try again later"], res.ErrorMessage);
        }
      });
  }

}


