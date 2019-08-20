import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core'
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { BillingTransactionItem } from '../../shared/billing-transaction-item.model';
import { CommonFunctions } from '../../../shared/common.functions';
import { BillingBLService } from '../../shared/billing.bl.service';
@Component({
    selector: "group-discount",
    templateUrl: "./group-discount.html"
})
export class GroupDiscountComponent {


    public isAllItemsSelected: boolean = true;  //yubraj: 28th Nov '18
    public groupDiscountPercent: number = null;
    public showMessage: boolean = false;
    @Output("close-popup")
    closeGroupDiscountPopUp: EventEmitter<Object> = new EventEmitter<Object>();

    @Input("estimated-dis-percent")
    public estimatedDiscountPercent: number = 0;

    @Input("pending-items")
    public patAllPendingItems: Array<BillingTransactionItem> = [];

    @Input("show-group-dis-popup")
    public showGroupDiscountPopUp: boolean = false;

    @Input("discount-group-items")
    public discountGroupItems: Array<BillingTransactionItem> = [];

    @Input("admissionInfo")
    public admissionInfo: any = null;

    public model = {
        PharmacyProvisionalAmount: 0,
        SubTotal: 0,
        TotalDiscount: 0,
        TaxAmount: 0,
        NetTotal: 0,
        DepositAdded: 0,
        DepositReturned: 0,
        DepositBalance: 0,
        TotalAmount: 0,
        ToBePaid: 0,
        ToBeRefund: 0,
        PayType: "cash",
        PaymentDetails: null,
        Remarks: null,
    };

    constructor(public msgBoxServ: MessageboxService,
        public billingBLService: BillingBLService) {

    }


    //yubraj: 28th Nov '18
    OnChangeItemSelect() {
        if ((this.discountGroupItems.every(a => a.IsSelected == true))) {
            this.isAllItemsSelected = true;
            // this.discountGroupItems.every(a => a.DiscountPercent == this.groupDiscountPercent);
        }
        else if (this.discountGroupItems.every(a => a.IsSelected == false)) {
            this.isAllItemsSelected = false;
            this.msgBoxServ.showMessage("Warning!", ["Please select Item to give Group Discount."]);
        }
        else {
            this.isAllItemsSelected = false;
        }
        this.ItemGroupDiscount();

    }
    CloseGroupDiscountPopUp() {
        this.discountGroupItems = [];
        this.discountGroupItems.forEach(item => item.IsSelected = true);
        this.discountGroupItems.forEach(item => item.DiscountPercent == 0);
        this.closeGroupDiscountPopUp.emit();
    }
    //yubraj: 28th Nov '18
    OnChangeSelectAll() {
        this.discountGroupItems.forEach(item => {
            item.IsSelected = this.isAllItemsSelected;
        });

        if (!this.isAllItemsSelected)
            this.msgBoxServ.showMessage("Warning!", ["Please select Item to give Group Discount."]);
        this.ItemGroupDiscount();
    }

    ItemGroupDiscount() {
        this.groupDiscountPercent = this.groupDiscountPercent ? this.groupDiscountPercent : 0;
        if (this.groupDiscountPercent < 0 || this.groupDiscountPercent > 100)
        {
            this.showMessage = true;
            return;
        }
        this.showMessage= false;
        this.discountGroupItems.forEach(item => {
            if (item.IsSelected) {
                if (item.IsSelected && !this.groupDiscountPercent) {
                    item.DiscountPercent = 0;
                }
                else {
                    item.DiscountPercent = this.groupDiscountPercent;
                }
            }
            else {
                item.DiscountPercent = 0;
            }
            let itemDiscount = item.SubTotal * (item.DiscountPercent / 100);
            item.TotalAmount = item.SubTotal - itemDiscount;
            let invoiceDiscount = item.TotalAmount * (this.estimatedDiscountPercent / 100);
            item.TotalAmount = item.TotalAmount - (invoiceDiscount ? invoiceDiscount : 0);
            item.DiscountAmount = itemDiscount + (invoiceDiscount ? invoiceDiscount : 0);
        });
    }
    UpdateLocalListItems(modifiedItems: Array<BillingTransactionItem>) {
        //this.patAllPendingItems = res.result;
        this.patAllPendingItems
            .forEach(patItem => {
                for (let filterDiscountItem of modifiedItems) {
                    if (filterDiscountItem.BillingTransactionItemId == patItem.BillingTransactionItemId) {
                        patItem = Object.assign(patItem, filterDiscountItem);
                        modifiedItems.splice(modifiedItems.findIndex(a => a.BillingTransactionItemId == filterDiscountItem.BillingTransactionItemId), 1)
                        break;
                    }
                }
            });
        this.patAllPendingItems = this.patAllPendingItems.slice();
       //this.CalculationForAll();
    }
    PutTransactionItems(modifiedItems: Array<BillingTransactionItem>) {
        this.billingBLService.UpdateBillTxnItems(modifiedItems)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.msgBoxServ.showMessage("success", ["Discount updated successfully"]);
                    this.UpdateLocalListItems(modifiedItems);
                    this.closeGroupDiscountPopUp.emit();
                    //this.showGroupDiscountPopUp = false;

                }
            },
                err => {
                    this.msgBoxServ.showMessage("error", ["Some error issue in updating group discount. Please try again."]);
                });
    }
    //yubraj: 28th Nov '18
    SubmitGroupDiscount() {
        if (this.groupDiscountPercent >= 0) {
            let discountedItems = this.discountGroupItems.filter(a => a.IsSelected);
            if (discountedItems && discountedItems.length) {
                this.PutTransactionItems(discountedItems);

            }
            else {
                this.msgBoxServ.showMessage("Warning!", ["Please  select Item to give Group Discount."]);
            }
        }
        else {
            this.msgBoxServ.showMessage("Warning!", ["Please  Enter Discount Percent."]);
        }
    }

    //yubraj: 28th Nov '18
    CheckIfAllSelectedEdit() {
        this.discountGroupItems.forEach(a => {
            if (a.IsSelected) {
                this.isAllItemsSelected = true;
                a.DiscountPercent == this.groupDiscountPercent;
            }
            else if (!a.IsSelected) {
                this.isAllItemsSelected = false;
                this.msgBoxServ.showMessage("Warning!", ["Please select Item to give Group Discount."]);
            }
            else {
                this.isAllItemsSelected = false;
            }
        });
    }
}