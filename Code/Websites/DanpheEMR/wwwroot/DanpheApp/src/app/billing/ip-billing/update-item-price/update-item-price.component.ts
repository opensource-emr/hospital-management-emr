import { Component, Input, Output, EventEmitter, Renderer2, OnInit } from '@angular/core'
import { BillingTransactionItem } from '../../shared/billing-transaction-item.model';
import { BillingBLService } from '../../shared/billing.bl.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { CommonFunctions } from '../../../shared/common.functions';
import { BillItemPrice } from '../../shared/billitem-price.model';

@Component({
  selector: 'update-items',
  templateUrl: "./update-item-price.html"
})

export class UpdateItemPriceComponent implements OnInit {
  @Output("close-popup")
  closeUpdatItemsPopUp: EventEmitter<Object> = new EventEmitter<Object>();
  @Input("patientDetails")
  public patientDetails: any = null;
  public isAllItemsSelected: boolean = false;
  public loading: boolean = false;
  @Input("filtered-items")
  public filteredItems: Array<BillingTransactionItem>;

  public IsInsurance: boolean = false;

  //Yubraj 29th July --Used for DiscableApplicable scenario only
  public AllItemLists: Array<BillItemPrice> = new Array<BillItemPrice>();
  public discountApplicable: boolean = true;

  //@Input()
  public someItems: Array<BillingTransactionItem> = [];
  constructor(public msgBoxServ: MessageboxService,
    public billingBLService: BillingBLService) {
  }

  ngOnInit() {
    this.LoadAllBillItems();
    var items = this.filteredItems.map(a => Object.assign(new BillingTransactionItem, a));
    this.filteredItems = items;

    //This component is used in OutPatient, InPatient and Insurance view detail page
    //Checking for insurance billing items
    //In case of OP & IP there is no insurance items therefore from the index[0] we can identify insurance Items or not.
    this.IsInsurance = this.filteredItems[0].IsInsurance;
  }

  //Getting All Billitem List to check with filtered items
  LoadAllBillItems() {
    this.billingBLService.GetBillItemList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.AllItemLists = res.Results;
          this.FilterDiscountApplicableItems();
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["Some error issue in updating group discount. Please try again."]);
          this.loading = false;
        });
  }

  //Find and Get the DiscountApplicable item disable textbox for DiscountApplcable=false
  FilterDiscountApplicableItems() {
    this.AllItemLists;
    this.filteredItems;
    this.filteredItems.forEach(a => {
      var ItemDetails = this.AllItemLists.find(b => a.ItemId == b.ItemId && a.ItemName == b.ItemName);
      this.discountApplicable = ItemDetails.DiscountApplicable;
      if (!this.discountApplicable)
        a.EnableControl("DiscountPercent", false)
    });
  }

  CalculateTotal(index: number) {
    let item = this.filteredItems[index];
    if (item) {
      item.SubTotal = item.Quantity * item.Price;
      item.DiscountAmount = item.SubTotal * (item.DiscountPercent / 100);
      item.TotalAmount = item.SubTotal - item.DiscountAmount;
      item.TaxableAmount = item.IsTaxApplicable ? (item.SubTotal - item.DiscountAmount) : 0;
      item.NonTaxableAmount = item.IsTaxApplicable ? 0 : (item.SubTotal - item.DiscountAmount);
      item.IsSelected = true;
    }
  }

  OnChangeSelectAll() {
    this.filteredItems.forEach(item => {
      item.IsSelected = this.isAllItemsSelected;
    });
  }

  OnChangeItemSelect() {
    if ((this.filteredItems.every(a => a.IsSelected == true))) {
      this.isAllItemsSelected = true;
      // this.discountGroupItems.every(a => a.DiscountPercent == this.groupDiscountPercent);
    }
    else if (this.filteredItems.every(a => a.IsSelected == false)) {
      this.isAllItemsSelected = false;
      this.msgBoxServ.showMessage("Warning!", ["Please select Item to update."]);
    }
    else {
      this.isAllItemsSelected = false;
    }

  }

  CheckValidation(): boolean {
    let isFormValid = true;

    if (this.filteredItems) {
      for (var i = 0; i < this.filteredItems.length; i++) {
        let currTxnItem = this.filteredItems[i];
        currTxnItem.EnableControl("ItemName", false);
        currTxnItem.EnableControl("ServiceDepartmentId", false);
        currTxnItem.EnableControl("RequestedBy", false);
        currTxnItem.EnableControl("ProviderId", false);

        for (var valCtrls in currTxnItem.BillingTransactionItemValidator.controls) {
          currTxnItem.BillingTransactionItemValidator.controls[valCtrls].markAsDirty();
          currTxnItem.BillingTransactionItemValidator.controls[valCtrls].updateValueAndValidity();

        }

      }
      for (var i = 0; i < this.filteredItems.length; i++) {
        let currTxnItm_1 = this.filteredItems[i];
        //break loop if even a single txn item is invalid.
        if (!currTxnItm_1.IsValidCheck(undefined, undefined)) {
          isFormValid = false;
          break;
        }
      }
    }
    else {
      isFormValid = false;
    }
    return isFormValid;
  }

  UpdatePrice() {

    if (this.CheckValidation()) {
      if (!this.loading) {
        this.loading = true;
        let modifiedItems = this.filteredItems.filter(a => a.IsSelected);
        if (modifiedItems && modifiedItems.length > 0) {
          this.PutTransactionItems(modifiedItems);
        }
        else {
          this.msgBoxServ.showMessage("Warning!", ["Please  select Item to update."]);
          this.loading = false;
        }
      }
      else {
        this.loading = false;
      }
    }
  }

  PutTransactionItems(modifiedItems: Array<BillingTransactionItem>) {
    this.billingBLService.UpdateBillTxnItems(modifiedItems)
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.msgBoxServ.showMessage("success", ["Item/s updated successfully"]);
          // this.UpdateLocalListItems(modifiedItems);
          this.closeUpdatItemsPopUp.emit({ modifiedItems: modifiedItems });
          this.loading = false;
          //this.showGroupDiscountPopUp = false;

        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["Some error issue in updating group discount. Please try again."]);
          this.loading = false;
        });
  }

  //UpdateLocalListItems(modifiedItems: Array<BillingTransactionItem>) {
  //    //this.patAllPendingItems = res.result;
  //    this.patAllPendingItems
  //        .forEach(patItem => {
  //            for (let filterDiscountItem of modifiedItems) {
  //                if (filterDiscountItem.BillingTransactionItemId == patItem.BillingTransactionItemId) {
  //                    patItem = Object.assign(patItem, filterDiscountItem);
  //                    modifiedItems.splice(modifiedItems.findIndex(a => a.BillingTransactionItemId == filterDiscountItem.BillingTransactionItemId), 1)
  //                    break;
  //                }
  //            }
  //        });
  //    this.patAllPendingItems = this.patAllPendingItems.slice();
  //    //this.CalculationForAll();
  //}

  CloseGroupDiscountPopUp() {
    this.closeUpdatItemsPopUp.emit();
    this.loading = false;
  }
}
