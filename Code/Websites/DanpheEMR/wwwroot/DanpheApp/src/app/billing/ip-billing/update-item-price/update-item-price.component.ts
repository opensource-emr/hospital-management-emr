import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CoreService } from '../../../core/shared/core.service';
import { SecurityService } from '../../../security/shared/security.service';
import { PriceCategory } from '../../../settings-new/shared/price.category.model';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { BillingMasterBlService } from '../../shared/billing-master.bl.service';
import { BillingTransactionItem } from '../../shared/billing-transaction-item.model';
import { BillingBLService } from '../../shared/billing.bl.service';
import { BillingService } from '../../shared/billing.service';
import { PriceCategoryServiceItems_DTO } from '../../shared/dto/bill-pricecategory-service-items.dto';
import { ServiceItemDetails_DTO } from '../../shared/dto/service-item-details.dto';

@Component({
  selector: 'update-items',
  templateUrl: "./update-item-price.html",
  host: { '(window:keydown)': 'hotkeys($event)' }
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
  public AllItemLists: Array<ServiceItemDetails_DTO> = new Array<ServiceItemDetails_DTO>();
  public discountApplicable: boolean = true;
  public DiscountPercentAgg: number = 0;


  public ShowAssignDocInPopup: boolean = false;
  //public DocObj = { EmployeeId: null, EmployeeName: null};
  public PerformerList: any;

  //@Input()
  public someItems: Array<BillingTransactionItem> = [];
  public PriceCategories = new Array<PriceCategory>();
  public PriceCategoryServiceItems = new Array<PriceCategoryServiceItems_DTO>();
  public UpdatePriceConfigurations = { EnableInIpBilling: false, EnableInProvisionalClearance: false };
  constructor(public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public billingBLService: BillingBLService,
    public billingService: BillingService,
    public securityService: SecurityService,
    public billingMasterBlService: BillingMasterBlService) {
    this.GetProviderList();
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
  ngOnInit() {
    this.AllItemLists = this.billingMasterBlService.ServiceItemsForIp;//this.billingService.allBillItemsPriceList;
    if (this.filteredItems && this.filteredItems.length > 0 && this.AllItemLists && this.AllItemLists.length > 0) {
      //assign into newBillingTransaactionitem so that we can use its functions and validations.
      this.filteredItems = this.filteredItems.map(a => {
        return Object.assign(new BillingTransactionItem(), a);
      });

      this.FilterDiscountApplicableItemsAndPriceChangeAllowed();
      // this.AssignDoc
    }


    //console.log(this.filteredItems);


    //var items = this.filteredItems.map(a => Object.assign(new BillingTransactionItem, a));
    //this.filteredItems = items;

    //This component is used in OutPatient, InPatient and Insurance view detail page
    //Checking for insurance billing items
    //In case of OP & IP there is no insurance items therefore from the index[0] we can identify insurance Items or not.
    this.IsInsurance = this.filteredItems[0].IsInsurance;
  }



  //Find and Get the DiscountApplicable item disable textbox for DiscountApplcable=false
  FilterDiscountApplicableItemsAndPriceChangeAllowed() {

    this.filteredItems.forEach(a => {
      const ItemDetails = this.AllItemLists.find(b => a.ServiceItemId == b.ServiceItemId && a.ItemName == b.ItemName);
      if (ItemDetails) {
        this.discountApplicable = ItemDetails.IsDiscountApplicable;
        if (!this.discountApplicable) {
          a.EnableControl("DiscountPercent", false);
        }
        if (ItemDetails.IsDoctorMandatory) {
          this.ShowAssignDocInPopup = true;
          a.IsDoctorMandatory = ItemDetails.IsDoctorMandatory;
        }
        if (a.PerformerId) {
          a.DocObj.EmployeeId = a.PerformerId;
          a.DocObj.FullName = a.PerformerName;
        }
      }
      a.IsPriceChangeAllowed = ItemDetails.IsPriceChangeAllowed;
      a.IsZeroPriceAllowed = ItemDetails.IsZeroPriceAllowed;
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
      for (let i = 0; i < this.filteredItems.length; i++) {
        let currTxnItem = this.filteredItems[i];
        if (currTxnItem.IsZeroPriceAllowed) {
          currTxnItem.UpdateValidator('off', 'Price', null);
        }
        currTxnItem.EnableControl("ItemName", false);
        currTxnItem.EnableControl("ServiceDepartmentId", false);
        currTxnItem.EnableControl("PrescriberId", false);
        if (this.filteredItems[i].IsDoctorMandatory) {
          //currTxnItem.EnableControl("ProviderId", true);
          currTxnItem.UpdateValidator('on', 'PerformerId', 'required');
        }
        else {
          currTxnItem.UpdateValidator('off', 'PerformerId', null);
        }
        if (this.filteredItems[i].IsZeroPriceAllowed) {
          currTxnItem.UpdateValidator('off', 'Price', null);
        }
        for (let valCtrls in currTxnItem.BillingTransactionItemValidator.controls) {
          currTxnItem.BillingTransactionItemValidator.controls[valCtrls].markAsDirty();
          currTxnItem.BillingTransactionItemValidator.controls[valCtrls].updateValueAndValidity();

        }

      }
      for (let i = 0; i < this.filteredItems.length; i++) {
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
          modifiedItems.forEach(item => {
            item.DiscountPercentAgg = this.DiscountPercentAgg; // this is done because DiscountPercentAgg was passing value NAN
            if (item.IsAutoBillingItem) {
              item.IsAutoCalculationStop = true;
            }
          });
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


          //sud:1May'20--Need to set modifiedbyid to currentloggedinempie..--
          //temporary solution for now, need to get the data from server and then use that same ID ..
          //itemstoupdate and discountgroupitems are same object-reference, so we change in one and it should reflect in another as well.
          if (modifiedItems && modifiedItems.length > 0) {
            modifiedItems.forEach(itm => {
              itm.ModifiedBy = this.securityService.loggedInUser.EmployeeId;
            });
          }

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

  //load doctor
  GetProviderList(): void {
    this.billingBLService.GetProviderList()
      .subscribe(res => this.CallBackGenerateDoctor(res));
  }

  ////this is a success callback of GenerateDoctorList function.
  CallBackGenerateDoctor(res) {
    if (res.Status == "OK") {
      this.PerformerList = [];
      if (res && res.Results) {
        //res.Results.forEach(a => {
        //  this.providerList.push(a);
        //});
        let doclist: Array<any> = res.Results;
        this.PerformerList = doclist.map(a => {
          return { EmployeeId: a.EmployeeId, FullName: a.EmployeeName }
        });
        // this.providerList.unshift({ EmployeeId: 0, FullName: "--Select--" });
      }
    }
    else {
      this.msgBoxServ.showMessage("error", ["Not able to get Doctor list"]);
      console.log(res.ErrorMessage)
    }
  }

  //used to format the display of item in ng-autocomplete.
  PerformerListFormatter(data: any): string {
    let html = data["FullName"];
    return html;
  }

  DoctorChange(itm: BillingTransactionItem) {
    itm.PerformerId = itm.DocObj.EmployeeId;
    itm.PerformerName = itm.DocObj.FullName;
  }

  public hotkeys(event) {
    if (event.keyCode == 27) {//key->ESC
      this.CloseGroupDiscountPopUp();
    }
  }

  OnPriceCategoryChanged($event): void {
    if ($event) {
      const priceCategoryId = +$event.target.value;
      const isAnyServiceItemSelected = this.filteredItems.some(itm => itm.IsSelected);
      if (isAnyServiceItemSelected) {
        this.GetServiceItemsByPriceCategoryId(priceCategoryId);
      } else {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, [`No Service Items are Selected!`]);
      }
    }
  }

  GetServiceItemsByPriceCategoryId(priceCategoryId: number): void {
    this.billingMasterBlService.GetServiceItemsByPriceCategoryId(priceCategoryId).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results) {
        this.PriceCategoryServiceItems = res.Results;
        this.UpdateServiceItemsPriceWithNewPrice(this.PriceCategoryServiceItems);
      }
    }, err => {
      console.error(err);
    });
  }

  UpdateServiceItemsPriceWithNewPrice(priceCategoryServiceItems: Array<PriceCategoryServiceItems_DTO>): void {
    if (priceCategoryServiceItems && priceCategoryServiceItems.length > 0 && this.filteredItems && this.filteredItems.length > 0) {

      // Create a map from ServiceItemId to Price in priceCategoryServiceItems for faster lookup
      const mapProvisionalServiceItemsToUpdate = new Map<number, number>();
      priceCategoryServiceItems.forEach(item => {
        mapProvisionalServiceItemsToUpdate.set(item.ServiceItemId, item.Price);
      });
      // const mapProvisionalServiceItemsToUpdate = new Map<number, number>(priceCategoryServiceItems.map(item => [item.ServiceItemId, item.Price]));

      // Update the Price in ProvisionalItemsToUpdate in place
      this.filteredItems.forEach(item => {
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
