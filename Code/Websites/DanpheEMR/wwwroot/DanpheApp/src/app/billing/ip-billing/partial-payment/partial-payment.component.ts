import { Component, Input, Output, EventEmitter, Renderer2 } from '@angular/core'
import { BillingTransactionItem } from '../../shared/billing-transaction-item.model';
import { BillingBLService } from '../../shared/billing.bl.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { CommonFunctions } from '../../../shared/common.functions';
import { CoreService } from '../../../core/shared/core.service';
import { Patient } from '../../../patients/shared/patient.model';
import { BillingService } from '../../shared/billing.service';
import { RouteFromService } from '../../../shared/routefrom.service';
import { Router } from '@angular/router';
import { ENUM_BillingType, ENUM_InvoiceType } from '../../../shared/shared-enums';
import { PatientService } from '../../../patients/shared/patient.service';

@Component({
  selector: 'partial-payment',
  templateUrl: "./partial-payment.html",
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class PartialPaymentComponent {

  @Output("close-popup")
  closePartialPaymentPopUp: EventEmitter<Object> = new EventEmitter<Object>();

  @Input("patientDetails")
  public patientDetails: any = null;

  @Input("pat-all-items")
  public patAllItems: Array<BillingTransactionItem>;


  public filteredItems: Array<any> = [];

  public isAllItemsSelected: boolean = false;
  public loading: boolean = false;

  constructor(public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public billingService: BillingService,
    public routeFromService: RouteFromService,
    public router: Router,
    public patientService: PatientService) {

  }

  ngOnInit() {

  }

  ClosePartialPaymentPopUp($event) {
    this.closePartialPaymentPopUp.emit();
    console.log($event);
    //this.loading = false;
  }

  OnChangeSelectAll() {
    this.patAllItems.forEach(item => {
      item.IsSelected = this.isAllItemsSelected;
    });
  }

  OnChangeItemSelect() {
    if ((this.patAllItems.every(a => a.IsSelected == true))) {
      this.isAllItemsSelected = true;
    }
    else if (this.patAllItems.every(a => a.IsSelected == false)) {
      this.isAllItemsSelected = false;
      this.msgBoxServ.showMessage("Warning!", ["Please select Item for Partial Payment"]);
    }
    else {
      this.isAllItemsSelected = false;
    }
  }

  ProceedPartialPayment() {
    this.patAllItems.forEach(a => {
      if (a.IsSelected) {
        this.filteredItems.push(a);
      }
    });

    if (this.filteredItems && this.filteredItems.length > 0) {
      this.AssignTOGlobelVar();

      this.routeFromService.RouteFrom = "inpatient";
      this.router.navigate(['/Billing/BillingTransactionItem']);
    }
    else {
      this.msgBoxServ.showMessage("notice", ["Please select Item for Partial Payment"]);
    }

  }


  AssignTOGlobelVar() {
    var billingTransaction = this.billingService.CreateNewGlobalBillingTransaction();
    billingTransaction.PatientId = this.patientDetails.PatientId;
    billingTransaction.PatientVisitId = this.patientDetails.VisitId;
    //billingTransaction.Patient = Object.create(this.patientService.globalPatient);
    billingTransaction.BillingTransactionItems = this.filteredItems;
    billingTransaction.DepositAvailable = this.patientDetails.DepositAdded - this.patientDetails.DepositReturned;
    //billingTransaction.DepositAmount = this.patientDetails.DepositAdded;
    //billingTransaction.DepositReturnAmount = this.patientDetails.DepositReturned ? this.patientDetails.DepositReturned : 0;
    billingTransaction.TransactionType = ENUM_BillingType.inpatient;
    billingTransaction.InvoiceType = ENUM_InvoiceType.inpatientPartial;
  }

  public hotkeys(event) {
    if (event.keyCode == 27) {//key->ESC
      this.ClosePartialPaymentPopUp(null);
    }
  }
}
