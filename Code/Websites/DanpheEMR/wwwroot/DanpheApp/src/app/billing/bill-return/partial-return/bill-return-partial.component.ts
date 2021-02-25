import { Component, Input, OnChanges, OnInit } from "@angular/core";
import { BillingReceiptModel } from "../../shared/billing-receipt.model";
import { BillingTransaction } from "../../shared/billing-transaction.model";
import { BillingBLService } from "../../shared/billing.bl.service";
import { SecurityService } from "../../../security/shared/security.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { BillingService } from "../../shared/billing.service";

@Component({
    selector: "bill-return-partial",
    templateUrl: "./bill-return-partial.html"
})
export class BillReturnPartialComponent implements OnChanges, OnInit {

    @Input("invoiceDetails")
    public invoiceDetails: BillingReceiptModel = new BillingReceiptModel();

    @Input("billTransaction")
    public billTXNForNewReceipt: BillingTransaction = new BillingTransaction();

    @Input("showPartialReturnedInvoice")
    public showPartialReturnedInvoice: boolean = true;

    @Input("showIPReceipt")
    public showIPReceipt: boolean = false;

    public showReturnedInvoice: boolean = false;

    public billReturnedData: BillingReceiptModel = new BillingReceiptModel();;
    public billNotReturnedData: BillingReceiptModel = new BillingReceiptModel();;
    public IsAllSelectedItems: boolean = false;
    public showRemark: boolean = false;
    public returnRemarks: string = "";
    public showPrintBtn: boolean = false;
    public showPartialReturnView: boolean = true;
    public showNotReturnedItems: boolean = false;
    //declare boolean loading variable for disable the double click event of button
    public loading: boolean = false;

    constructor(public billingBLService: BillingBLService,
        public securityService: SecurityService,
        public msgBoxServ: MessageboxService,
        public billServ: BillingService) {


    }

    ngOnInit() {
        if (this.showIPReceipt) {
            this.loading = true;
            this.msgBoxServ.showMessage("NOTE!!! This is Discharged Receipt", ["Go To ADT for DISCHARGE CANCEL to return this receipt"]);
        }
    }

    ngOnChanges() {
        if (this.showPartialReturnedInvoice) {
            this.showReturnedInvoice = false;
            this.showRemark = false;
        }
    }

    checkIpBilling() {

        if (this.showIPReceipt) {
            this.loading = true;
            this.msgBoxServ.showMessage("NOTE!!! This is Discharged Receipt", ["Go To ADT for DISCHARGE CANCEL to return this receipt"]);
        }
    }

    OnChangeSelectAll() {
        this.invoiceDetails.BillingItems.forEach(item => {
            item.IsSelected = this.IsAllSelectedItems;
        });
        if (this.IsAllSelectedItems) {
            this.invoiceDetails.ReturnedAmount = this.invoiceDetails.TotalAmount;
            this.showRemark = true;
        } else {
            this.showRemark = false;
            this.invoiceDetails.ReturnedAmount = 0;
        }
    }

    OnChangeItemSelect($event) {
        let count = 0;
        for (let i = 0; i < this.invoiceDetails.BillingItems.length; i++) {
            if (this.invoiceDetails.BillingItems[i].IsSelected) {
                count++;
            }
        }
        if (count != 0) {
            this.showRemark = true;
        } else {
            this.showRemark = false;
        }
        if ($event.IsSelected) {
            this.IsAllSelectedItems = false;
            this.invoiceDetails.ReturnedAmount += $event.Price
        } else {
            this.invoiceDetails.ReturnedAmount -= $event.Price
            this.IsAllSelectedItems = false;
        }

        if(this.invoiceDetails.BillingItems.length == count){
            this.IsAllSelectedItems = true;
        }
    }

    ReturnInvoice() {
        if (this.showRemark) {
            if (this.returnRemarks) {
                this.loading = true;

                this.billingBLService.PostReturnReceipt(this.invoiceDetails, this.billTXNForNewReceipt, this.returnRemarks)
                    .subscribe(res => {
                        if (res.Status == "OK") {
                            this.billReturnedData = BillingReceiptModel.MapReceiptForReturnBill(res.Results.BillingReturnedData); //BillingReceiptModel.GetReceiptForDuplicate(res.Results.BillingReturnedData);
                            this.billReturnedData.BillingUser = this.securityService.GetLoggedInUser().UserName;
                            this.billReturnedData.PaymentMode = res.Results.BillingRemainingData.PaymentMode;
                            this.billReturnedData.PrintReturnReceipt = true;
                            this.billReturnedData.DepositReturnAmount = res.Results.BillingRemainingData.DepositReturnAmount;
                            this.billReturnedData.DepositBalance = res.Results.BillingRemainingData.DepositBalance;
                            this.billReturnedData.Change = res.Results.BillingRemainingData.Change;
                            this.billReturnedData.BillingType =  res.Results.BillingRemainingData.TransactionType;
                            this.billReturnedData.VisitId = res.Results.BillingRemainingData.PatientVisitId;
                            
                            if (res.Results.BillingReturnedData.PartialReturnTxnId != null) {
                                this.billNotReturnedData = BillingReceiptModel.MapReceiptForNotReturnBill(res.Results.BillingRemainingData);
                                this.billNotReturnedData.DepositBalance = 0;
                                this.billNotReturnedData.DepositReturnAmount = 0;
                                this.billNotReturnedData.Change = 0;
                                this.billNotReturnedData.Tender = 0;
                                this.billNotReturnedData.BillingUser = this.securityService.GetLoggedInUser().UserName;
                                this.showNotReturnedItems = true;
                            } else {
                                this.showNotReturnedItems = false;
                            }
                            this.showPrintBtn = true;
                            this.showPartialReturnView = false;
                            this.showReturnedInvoice = true;
                            this.showPartialReturnedInvoice = false;
                            this.returnRemarks = "";
                            this.loading = false;

                            console.log("CreditNoteNumber is: " + res.Results.BillingReturnedData.CreditNoteNumber);
                            this.msgBoxServ.showMessage("success", ["Bill returned successfully.."]);
                        }
                        else {
                            this.msgBoxServ.showMessage("error", ["Couldn't return this bill. Please try again later"]);
                        }
                    });
            }
            else {
                this.msgBoxServ.showMessage("error", ["Remarks is Mandatory"]);
            }
        } else {
            this.msgBoxServ.showMessage("error", ["Select at least One item to be returned"]);
        }
    }


}
