import { TOUCH_BUFFER_MS } from '@angular/cdk/a11y';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import PHRMGridColumns from '../../shared/phrm-grid-columns';
import { SupplierLedgerService } from '../supplier-ledger.service';

@Component({
  selector: 'app-supplier-ledger-view',
  templateUrl: './supplier-ledger-view.component.html',
  styleUrls: ['./supplier-ledger-view.component.css']
})
export class SupplierLedgerViewComponent implements OnInit {
  subscription = new Subscription();
  supplierLedgerForm = new FormGroup({ PaidAmount: new FormControl('0',[Validators.required])});
  supplierLedgerViewGridColumns: Array<any> = null;
  supplierDetailsData: Array<any> = new Array<any>();
  showPopUp: boolean = true;
  selectedLedgerTxn: any[] = [];
  selectedSupplierId: string;
  selectAllLedger: boolean = false;
  selectedSupplierName: string;
  currentDate: string = moment().format("YYYY-MM-DD");
  showPaymentDetails: boolean = false;
  paymentDetails: any;
  totalPayableAmount: number;
  denyMakePayment: boolean = false;
  totalPaidAmount: number;

  constructor(private _msgBox: MessageboxService, private router: Router, private route: ActivatedRoute, private _supplierLedgerService: SupplierLedgerService) {
    this.supplierLedgerViewGridColumns = PHRMGridColumns.SupplierLedgerViewList;
    this.selectedSupplierId = this.route.snapshot.queryParamMap.get('id');
  }

  ngOnInit() {
    this.findSupplierGRDetails();
    this.configureLedgerForm();
  }
  findSupplierGRDetails() {
    this._supplierLedgerService.findSupplierGRDetails(this.selectedSupplierId).subscribe(res => {
      this.selectedLedgerTxn = res.Results.SupplierLedgerGRDetails;
      this.selectedSupplierName = res.Results.SupplierName;
      this.totalPayableAmount = this.selectedLedgerTxn.reduce((a, b) => a + b.BalanceAmount, 0);
      this.totalPaidAmount = this.selectedLedgerTxn.reduce((a, b) => a + b.DebitAmount, 0);
      if (this.totalPayableAmount == 0) {
        this.denyMakePayment = true;
        this._msgBox.showMessage("warning", ["No Due Amount for this Supplier Ledger"]);
      }
    })
  }
  Close() {
    this.showPopUp = false;
    this.router.navigate(['/Pharmacy/SupplierLedger']);
  }
  SelectAllLedger() {
    if (this.selectedLedgerTxn && this.selectedLedgerTxn.length) {
      this.selectedLedgerTxn.forEach((ledger) => {
        ledger.IsSelected = this.selectAllLedger;
      });
    }
    var selectedLedger = this.selectedLedgerTxn.filter(s => s.IsSelected == true).map(a => a.CreditAmount);
    var totalCreditAmt = selectedLedger.reduce((a, b) => a + b, 0)
    this.supplierLedgerForm.controls['PaidAmount'].setValue(totalCreditAmt);
  }

  //Sets check-unchecked properties on click of Component-Level Checkbox.
  SelectLedger() {
    //if every ledger is selected one by one, then select all checkbox must be selected.
    this.selectAllLedger = this.selectedLedgerTxn.every(item => item.IsSelected == true);
    var selectedLedger = this.selectedLedgerTxn.filter(s => s.IsSelected == true).map(a => a.CreditAmount);
    var totalCreditAmt = selectedLedger.reduce((a, b) => a + b, 0)
    this.supplierLedgerForm.controls['PaidAmount'].setValue(totalCreditAmt);
  }
  configureLedgerForm() {
    this.supplierLedgerForm.get('PaidAmount').valueChanges.subscribe(newPaidAmount => {
      this.PopulateGRPayingAmount(newPaidAmount);
    })
  }

  PopulateGRPayingAmount(TotalPayingAmount: number) {
    //reset all ledger txn
    this.selectedLedgerTxn.forEach(a => a.PayingAmount = 0);
    var totalPayingAmount = TotalPayingAmount;
    for (var i = 0; i < this.selectedLedgerTxn.length; i++) {
      if (totalPayingAmount >= this.selectedLedgerTxn[i].BalanceAmount) {
        this.selectedLedgerTxn[i].PayingAmount = this.selectedLedgerTxn[i].BalanceAmount;
        totalPayingAmount = totalPayingAmount - this.selectedLedgerTxn[i].BalanceAmount;
        this.selectedLedgerTxn[i].Status = 'complete';
      }
      else {
        this.selectedLedgerTxn[i].PayingAmount = totalPayingAmount;
        this.selectedLedgerTxn[i].Status = 'partial';
        totalPayingAmount = 0;
        break;
      }
    }
  }

  submit(form) {
    this.supplierLedgerForm.updateValueAndValidity();
    this.supplierLedgerForm.markAsTouched();
    if (this.supplierLedgerForm.valid) {
      if (this.supplierLedgerForm.controls['PaidAmount'].value > this.totalPayableAmount) {
        this._msgBox.showMessage("warning", ["Paying Amount can not be greater than Total Payable Amount."]);
        this.showPaymentDetails = false;
      }
      else {
        this.showPaymentDetails = true;
      }
    }
    else {
      this._msgBox.showMessage("Failed", ["Could not process the request."])
    }
  }
  MakePayment() {
    this._supplierLedgerService.makeSupplierLedgerPayment(this.selectedLedgerTxn).subscribe(res => {
      if (res.Status == "OK") {
        this._msgBox.showMessage("success", ["Payment Done Successfully."]);
        this.showPaymentDetails = false;
        this.router.navigate(['/Pharmacy/SupplierLedger']);
      }
      else {
        this._msgBox.showMessage("failed", ["failed to add result.. please check log for details.",]);
        console.log(res.ErrorMessage);
      }
    })
  }
  CancelPayment() {
    this.showPaymentDetails = false;
  }
  get PaidAmount() {
    return this.supplierLedgerForm.get("PaidAmount") as FormControl;
  }
}

