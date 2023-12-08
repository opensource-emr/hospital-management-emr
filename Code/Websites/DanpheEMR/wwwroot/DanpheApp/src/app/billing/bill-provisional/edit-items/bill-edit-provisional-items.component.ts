import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CoreService } from "../../../core/shared/core.service";
import { PriceCategory } from "../../../settings-new/shared/price.category.model";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { BillingInvoiceBlService } from "../../shared/billing-invoice.bl.service";
import { BillingMasterBlService } from "../../shared/billing-master.bl.service";
import { BillingTransactionItem } from "../../shared/billing-transaction-item.model";
import { BillingBLService } from "../../shared/billing.bl.service";
import { PriceCategoryServiceItems_DTO } from "../../shared/dto/bill-pricecategory-service-items.dto";
import { ServiceItemDetails_DTO } from "../../shared/dto/service-item-details.dto";

@Component({
  selector: "edit-provisional-items",
  templateUrl: "./bill-edit-provisional-items.component.html",
})
export class BillEditProvisionalItemsComponent {

  @Input("patientDetails")
  PatientDetails: any = null;

  @Input("items-to-edit")
  ProvisionalItemsToUpdate = new Array<BillingTransactionItem>();

  @Output("close-items-to-edit")
  CloseEditItemsPopup = new EventEmitter<Object>();

  ServiceItems: Array<ServiceItemDetails_DTO> = new Array<ServiceItemDetails_DTO>();

  IsAllItemsSelected: boolean = false;

  PerformerList: any;
  Loading: boolean = false;
  DiscountApplicable: boolean = true;
  PriceCategories = new Array<PriceCategory>()
  PriceCategoryServiceItems = new Array<PriceCategoryServiceItems_DTO>();
  UpdatePriceConfigurations = { EnableInIpBilling: false, EnableInProvisionalClearance: false };


  constructor(public coreService: CoreService,
    private _msgBoxService: MessageboxService,
    private _billingBlService: BillingBLService,
    private _billingInvoiceService: BillingInvoiceBlService,
    private _billingMasterBlService: BillingMasterBlService) {
    this.GetDoctors();
    const allPriceCategories = this.coreService.Masters.PriceCategories;
    if (allPriceCategories && allPriceCategories.length > 0) {
      this.PriceCategories = allPriceCategories.filter(p => p.IsActive);
    }
    this.GetParameters();
  }

  GetParameters(): void {
    const params = this.coreService.Parameters.find(p => p.ParameterGroupName === "Billing" && p.ParameterName === "EnablePriceUpdateWithPriceCategory");
    if (params) {
      this.UpdatePriceConfigurations = JSON.parse(params.ParameterValue);
    }
  }
  ngOnInit(): void {
    this.ServiceItems = this._billingMasterBlService.ServiceItemsForProvisionalClearance;
    if (this.ProvisionalItemsToUpdate && this.ProvisionalItemsToUpdate.length > 0 && this.ServiceItems && this.ServiceItems.length > 0) {
      //assign into newBillingTransactionItems so that we can use its functions and validations.
      this.ProvisionalItemsToUpdate = this.ProvisionalItemsToUpdate.map(a => {
        return Object.assign(new BillingTransactionItem(), a);
      });

      this.FilterDiscountApplicableItemsAndPriceChangeAllowed();
    }
  }

  //Find and Get the DiscountApplicable item disable textBox for DiscountApplicable=false
  FilterDiscountApplicableItemsAndPriceChangeAllowed() {

    this.ProvisionalItemsToUpdate.forEach(a => {
      const itemDetails = this.ServiceItems.find(b => a.ServiceItemId === b.ServiceItemId);
      if (itemDetails) {
        this.DiscountApplicable = itemDetails.IsDiscountApplicable;
        if (!this.DiscountApplicable) {
          a.EnableControl("DiscountPercent", false);
        }

        if (a.PerformerId) {
          a.DocObj.EmployeeId = a.PerformerId;
          a.DocObj.FullName = a.PerformerName;
        }
      }
      a.IsPriceChangeAllowed = itemDetails.IsPriceChangeAllowed;
      a.IsZeroPriceAllowed = itemDetails.IsZeroPriceAllowed;
      if (a.IsPriceChangeAllowed && a.IsZeroPriceAllowed) {
        a.EnableControl("Price", true);
      } else if (a.IsPriceChangeAllowed && !a.IsZeroPriceAllowed) {
        a.EnableControl("Price", true);
      } else if (!a.IsPriceChangeAllowed && a.IsZeroPriceAllowed) {
        a.EnableControl("Price", false);
      } else if (a.IsPriceChangeAllowed) {
        a.EnableControl("Price", true);
      }
      else if (!a.IsPriceChangeAllowed && !a.IsZeroPriceAllowed) {
        a.EnableControl("Price", false);
      }
    });
  }

  GetDoctors(): void {
    this._billingBlService.GetProviderList()
      .subscribe(res => this.CallBackGenerateDoctor(res));
  }

  CallBackGenerateDoctor(res): void {
    if (res.Status === ENUM_DanpheHTTPResponses.OK) {
      this.PerformerList = [];
      if (res && res.Results) {
        let docList: Array<any> = res.Results;
        this.PerformerList = docList.map(a => {
          return { EmployeeId: a.EmployeeId, FullName: a.EmployeeName }
        });
      }
    }
    else {
      this._msgBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Not able to get Doctor list"]);
      console.log(res.ErrorMessage)
    }
  }

  PerformerListFormatter(data: any): string {
    let html = data["FullName"];
    return html;
  }

  OnChangeSelectAll(): void {
    this.ProvisionalItemsToUpdate.forEach(item => {
      item.IsSelected = this.IsAllItemsSelected;
    });
  }

  OnChangeItemSelect(): void {
    if ((this.ProvisionalItemsToUpdate.every(a => a.IsSelected == true))) {
      this.IsAllItemsSelected = true;
    }
    else if (this.ProvisionalItemsToUpdate.every(a => a.IsSelected == false)) {
      this.IsAllItemsSelected = false;
      this._msgBoxService.showMessage(ENUM_MessageBox_Status.Warning, ["Please select Item to update."]);
    }
    else {
      this.IsAllItemsSelected = false;
    }
  }
  CloseItemsEditPopup(): void {
    this.CloseEditItemsPopup.emit();
    this.Loading = false;
  }

  DoctorChange(itm: BillingTransactionItem): void {
    itm.PerformerId = itm.DocObj.EmployeeId;
    itm.PerformerName = itm.DocObj.FullName;
  }

  CalculateTotal(index: number) {
    let item = this.ProvisionalItemsToUpdate[index];
    if (item) {
      item.SubTotal = item.Quantity * item.Price;
      item.DiscountAmount = this._billingInvoiceService.CalculateAmountFromPercentage(item.DiscountPercent, item.SubTotal);//item.SubTotal * (item.DiscountPercent / 100);
      item.TotalAmount = item.SubTotal - item.DiscountAmount;
      item.TaxableAmount = item.IsTaxApplicable ? (item.SubTotal - item.DiscountAmount) : 0;
      item.NonTaxableAmount = item.IsTaxApplicable ? 0 : (item.SubTotal - item.DiscountAmount);
      item.IsSelected = true;
    }
  }

  UpdatePrice() {
    if (this.CheckValidation()) {
      if (!this.Loading) {
        this.Loading = true;
        let modifiedItems = this.ProvisionalItemsToUpdate.filter(a => a.IsSelected);
        if (modifiedItems && modifiedItems.length > 0) {
          modifiedItems.forEach(item => {
            if (item.IsAutoBillingItem) {
              item.IsAutoCalculationStop = true;
            }
          });
          this.PutTransactionItems(modifiedItems);
        }
        else {
          this._msgBoxService.showMessage(ENUM_MessageBox_Status.Warning, ["Please  select Item to update."]);
          this.Loading = false;
        }
      }
      else {
        this.Loading = false;
      }
    }
  }

  CheckValidation(): boolean {
    let isFormValid = true;

    if (this.ProvisionalItemsToUpdate) {
      for (let i = 0; i < this.ProvisionalItemsToUpdate.length; i++) {
        let currTxnItem = this.ProvisionalItemsToUpdate[i];
        if (currTxnItem.IsZeroPriceAllowed) {
          currTxnItem.UpdateValidator('off', 'Price', null);
        }
        currTxnItem.EnableControl("ItemName", false);
        currTxnItem.EnableControl("ServiceDepartmentId", false);
        currTxnItem.EnableControl("PrescriberId", false);
        if (this.ProvisionalItemsToUpdate[i].IsDoctorMandatory) {
          currTxnItem.UpdateValidator('on', 'PerformerId', 'required');
        }
        else {
          currTxnItem.UpdateValidator('off', 'PerformerId', null);
        }
        if (this.ProvisionalItemsToUpdate[i].IsZeroPriceAllowed) {
          currTxnItem.UpdateValidator('off', 'Price', null);
        }
        for (let valCtrls in currTxnItem.BillingTransactionItemValidator.controls) {
          currTxnItem.BillingTransactionItemValidator.controls[valCtrls].markAsDirty();
          currTxnItem.BillingTransactionItemValidator.controls[valCtrls].updateValueAndValidity();

        }

      }
      for (let i = 0; i < this.ProvisionalItemsToUpdate.length; i++) {
        let currTxnItm_1 = this.ProvisionalItemsToUpdate[i];
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

  PutTransactionItems(modifiedItems: Array<BillingTransactionItem>) {
    this._billingBlService.UpdateProvisionalItems(modifiedItems)
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this._msgBoxService.showMessage(ENUM_MessageBox_Status.Success, ["Item/s updated successfully"]);
          this.CloseEditItemsPopup.emit({ modifiedItems: modifiedItems });
          this.Loading = false;
        }
      },
        err => {
          this._msgBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Some error issue in updating group discount. Please try again."]);
          this.Loading = false;
        });
  }

  OnPriceCategoryChanged($event): void {
    if ($event) {
      const priceCategoryId = +$event.target.value;
      const isAnyServiceItemSelected = this.ProvisionalItemsToUpdate.some(itm => itm.IsSelected);
      if (isAnyServiceItemSelected) {
        this._msgBoxService.showMessage(ENUM_MessageBox_Status.Notice, [`This Action will rate of Items`]);
        this.GetServiceItemsByPriceCategoryId(priceCategoryId);
      } else {
        this._msgBoxService.showMessage(ENUM_MessageBox_Status.Notice, [`No Service Items are Selected!`]);
      }
    }
  }

  GetServiceItemsByPriceCategoryId(priceCategoryId: number): void {
    this._billingMasterBlService.GetServiceItemsByPriceCategoryId(priceCategoryId).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results) {
        this.PriceCategoryServiceItems = res.Results;
        this.UpdateServiceItemsPriceWithNewPrice(this.PriceCategoryServiceItems);
      }
    }, err => {
      console.error(err);
    });
  }

  UpdateServiceItemsPriceWithNewPrice(priceCategoryServiceItems: Array<PriceCategoryServiceItems_DTO>): void {
    if (priceCategoryServiceItems && priceCategoryServiceItems.length > 0 && this.ProvisionalItemsToUpdate && this.ProvisionalItemsToUpdate.length > 0) {

      // Create a map from ServiceItemId to Price in priceCategoryServiceItems for faster lookup
      const mapProvisionalServiceItemsToUpdate = new Map<number, number>();
      priceCategoryServiceItems.forEach(item => {
        mapProvisionalServiceItemsToUpdate.set(item.ServiceItemId, item.Price);
      });
      // const mapProvisionalServiceItemsToUpdate = new Map<number, number>(priceCategoryServiceItems.map(item => [item.ServiceItemId, item.Price]));

      // Update the Price in ProvisionalItemsToUpdate in place
      this.ProvisionalItemsToUpdate.forEach(item => {
        if (item.IsSelected) {
          const newPrice = mapProvisionalServiceItemsToUpdate.get(item.ServiceItemId);
          if (newPrice !== undefined) {
            item.Price = newPrice;
          }
        }
      });
    }
  }

}
