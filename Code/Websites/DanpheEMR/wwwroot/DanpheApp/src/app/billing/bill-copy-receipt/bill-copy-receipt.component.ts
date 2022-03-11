import { Component, Input, Output, EventEmitter } from "@angular/core";
import { BillingTransaction } from "../shared/billing-transaction.model";
import { BillingTransactionItem } from "../shared/billing-transaction-item.model";
import { BillingBLService } from "../shared/billing.bl.service";
import { BillingService } from "../shared/billing.service";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CommonFunctions } from "../../shared/common.functions";
@Component({
  selector: 'bill-copy-recipt',
  templateUrl: './bill-copy-receipt.html',
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class BillCopyReceiptComponent {
  @Input("patientId")
  public patientId: number;
  @Output("selreceipt-event")
  selReceiptEvent: EventEmitter<Object> = new EventEmitter<Object>();
  //commented: sud: 7Aug'18 -- we don't need to send fiscal year to get list of returned receipts..
  //public selFiscYrId: number = 2;//remove this hardcode later:
  public selTxn: any;
  public invoiceList: Array<any>;
  public selectedTxnId: number = null;
  public showTxnCopySelPage: boolean = false;
  constructor(public billingBLService: BillingBLService,
    public billingService: BillingService,
    public msgBoxServ: MessageboxService) {

  }

  @Input("showTxnCopySelPage")
  public set value(val: boolean) {
    if (val && this.patientId) {
      this.GetReturnedTransacitons(this.patientId);
    }
  }

  public GetReturnedTransacitons(patientId: number) {
    this.billingBLService.GetPatientReturnedReceiptList(patientId)
      .subscribe(res => {
        if (res.Status == "OK") {
          if (res.Results && res.Results.length) {
            this.invoiceList = res.Results;
            this.invoiceList.forEach(invoice => {
              invoice.TotalAmount = CommonFunctions.parseAmount(invoice.TotalAmount);
              invoice.IsSelected = false;//temporary property to bind with radiobutton.--yubaraj:22Aug'18
            });
            this.showTxnCopySelPage = true;
          }
          else {
            this.showTxnCopySelPage = false;
            this.msgBoxServ.showMessage("failed", ["Patient doesn't have any returned invoice."]);
          }

        }
        else {
          this.showTxnCopySelPage = false;
          this.msgBoxServ.showMessage("failed", ["Failed to get returned invoice list."]);
        }
      });
  }
  public AssignTransaction(txn) {
    this.selTxn = txn;
  }
  public CreateCopy() {
    if (this.selTxn) {
      let txn = this.billingService.CreateNewGlobalBillingTransaction();
      this.selTxn.BillingTransactionItems.forEach(item => {
        //we were not getting validation instance when assigned directly.
        let billItem = new BillingTransactionItem();
        billItem = Object.assign(billItem, item);
        //sud:10Nov'19-- need to set BillingTransaction to null else it'll create new invoices--
        //when user creates provisional receipt(from billingtransaction page) after copy - earlier items.
        billItem.BillingTransaction = null;
        billItem.BillingTransactionItemId = 0;
        billItem.BillingTransactionId = null;//sud: 7Aug'18--billingtransactionid can't be copied.
        billItem.ReturnQuantity = null;
        billItem.ReturnStatus = null;
        billItem.CreatedBy = null;
        billItem.CreatedOn = null;
        billItem.PaidDate = null;
        billItem.CounterId = null;
        billItem.CounterDay = null;
        billItem.BillingTransactionId = null;
        //billItem.Price = null;
        txn.BillingTransactionItems.push(billItem);
      });
      txn.PatientId = this.selTxn.PatientId;
      txn.PatientVisitId = this.selTxn.PatientVisitId;
      txn.TransactionType = this.selTxn.TransactionType;
      txn.PaymentMode = this.selTxn.PaymentMode;
      txn.PaymentDetails = this.selTxn.PaymentDetails;
      txn.DiscountPercent = this.selTxn.DiscountPercent;
      txn.Remarks = this.selTxn.Remarks;
      txn.PackageId = this.selTxn.PackageId;
      txn.PackageName = this.selTxn.PackageName;
      txn.BillingTransactionId = 0;
      this.Close();
      this.selReceiptEvent.emit(); //emitting output
    }
    else
      this.msgBoxServ.showMessage("failed", ["Select Invoice to copy from."]);
  }
  Close() {
    this.patientId = null;
    this.selTxn = null;
    this.showTxnCopySelPage = false;
    this.selectedTxnId = null;
  }

  public hotkeys(event) {
    if (event.keyCode == 27) {//key->ESC
      this.Close();
    }
  }
}
