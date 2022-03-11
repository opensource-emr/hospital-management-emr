import { Component, ChangeDetectorRef } from "@angular/core";
import { InventoryBLService } from "../../shared/inventory.bl.service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { InventoryService } from "../../shared/inventory.service";
import { Router } from "@angular/router";
import { PurchaseRequestModel } from "../../shared/purchase-request.model";
import { PurchaseRequestItemModel } from "../../shared/purchase-request-item.model";
import { SecurityService } from "../../../security/shared/security.service";
import { ItemModel } from "../../settings/shared/item.model";
import { VendorsModel } from "../../settings/shared/vendors.model";
import { CoreService } from "../../../core/shared/core.service";
import * as moment from "moment";
import { ENUM_GRItemCategory } from "../../../shared/shared-enums";
import { ActivateInventoryService } from "../../../shared/activate-inventory/activate-inventory.service";
import { ItemMaster } from "../../shared/item-master.model";


@Component({
  templateUrl: "./internalmain-purchase-request-add.html"
})

export class InternalMainPurchaseRequestAddComponent {

  public currentPurchaseRequest: PurchaseRequestModel = new PurchaseRequestModel();
  public currentPurchaseRequestItems: PurchaseRequestItemModel;
  public ItemList: Array<ItemModel>;
  public VendorList: Array<VendorsModel>;
  public rowCount: number = 0;
  public showAddItemPopUp: boolean = false;
  public index: any;
  public checkIsItemPresent: boolean = false;
  public isEdit: boolean = false;
  public selectedVendor: any = null;
  public showAddVendorPopUp: boolean = false;
  public PRCategories: string[] = [];
  public ItemListFiltered: ItemModel[];
  constructor(
    public inventoryBLService: InventoryBLService,
    public messageBoxService: MessageboxService,
    public changeDetectorRef: ChangeDetectorRef,
    public inventoryService: InventoryService,
    public securityService: SecurityService,
    public router: Router,
    public coreService: CoreService,
    private _activateInventoryService: ActivateInventoryService
  ) {
    this.LoadItemList();
    this.LoadVendorList();
    this.LoadPRCategory();
  }
  ngOnInit() {
    if (this.inventoryService.PurchaseRequestId > 0) {
      this.isEdit = true;
      this.GetItemsById(this.inventoryService.PurchaseRequestId);
    }
    else {
      this.AddRowRequest();
    }
  }
  ngOnDestroy() {
    this.inventoryService.RequisitionId = 0;
  }
  //to load the item in the start
  LoadItemList(): void {
    this.ItemList = this.inventoryService.allItemList;
    this.ItemList = this.ItemList.filter(item => item.IsActive == true);
    //this.FilterItemByPRCategory();
    if (this.ItemList == undefined || this.ItemList.length == 0) {
      this.messageBoxService.showMessage("failed", [
        "failed to get Item.. please check log for details."
      ]);
    }
  }
  OnPRCategoryChanged(indx) {
    var selPRItem = this.currentPurchaseRequest.PurchaseRequestItems[indx];
    selPRItem.filteredItemList = this.GetItemListByItemCategory(selPRItem.ItemCategory);
    selPRItem.filteredItemList = selPRItem.filteredItemList.slice();
    selPRItem.SelectedItem = new ItemModel();
    selPRItem.PurchaseRequestItemValidator.get("ItemId").setValue("");
    this.GoToNextInput("itemName" + indx, 100);
  }
  GetItemListByItemCategory(itmCategory: string) {
    let retItemList = this.ItemList.filter(item => item.ItemType === itmCategory);
    return retItemList;
  }
  LoadVendorList(): void {
    this.VendorList = this.inventoryService.allVendorList
    this.VendorList = this.VendorList.filter(vendor => vendor.IsActive == true);
    if (this.VendorList == undefined || this.VendorList.length == 0) {
      this.messageBoxService.showMessage("failed", [
        "failed to load vendors.. please check log for details."
      ]);
    }
  }
  GetItemsById(PurchaseRequestId) {
    this.inventoryBLService.GetPurchaseRequestItemsById(PurchaseRequestId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.currentPurchaseRequest.PurchaseRequestId = PurchaseRequestId;
          this.currentPurchaseRequest.Remarks = res.Results.Remarks;
          var requestDate = res.Results.RequestDate
          this.currentPurchaseRequest.RequestDate = moment(requestDate).format('YYYY-MM-DD');
          var RequestsItemArray = res.Results.purchaseRequestItems;
          this.currentPurchaseRequest.VendorId = RequestsItemArray[0].VendorId;
          for (var i = 0; i < RequestsItemArray.length; i++) {
            this.currentPurchaseRequest.PurchaseRequestItems.push(new PurchaseRequestItemModel);
            this.currentPurchaseRequest.PurchaseRequestItems[i].SelectedItem = this.ItemList.find(b => b.ItemId == RequestsItemArray[i].ItemId);
            this.SelectItemFromSearchBox(this.currentPurchaseRequest.PurchaseRequestItems[i].SelectedItem, i);
            this.currentPurchaseRequest.PurchaseRequestItems[i].RequestedQuantity = RequestsItemArray[i].RequestedQuantity;
            this.currentPurchaseRequest.PurchaseRequestItems[i].PurchaseRequestId = RequestsItemArray[i].PurchaseRequestId;
            this.currentPurchaseRequest.PurchaseRequestItems[i].Remarks = RequestsItemArray[i].Remarks;
            this.currentPurchaseRequest.PurchaseRequestItems[i].PurchaseRequestItemId = RequestsItemArray[i].PurchaseRequestItemId;
            this.currentPurchaseRequest.PurchaseRequestItems[i].VendorId = RequestsItemArray[i].VendorId;
          }
          this.selectedVendor = this.VendorList.find(a => a.VendorId == RequestsItemArray[0].VendorId);
        }
        else {
          if (!!res.ErrorMessage) {
            this.messageBoxService.showMessage("Failed", ["Check console for more detail."])
            console.log(res.ErrorMessage);
          }
        }
      })
  }
  SelectVendorFromSearchBox() {

    let selVendorObj: VendorsModel = null;
    if (typeof (this.selectedVendor) == 'string' && this.VendorList.length) {
      selVendorObj = this.VendorList.find(v => v.VendorName.toLowerCase() == this.selectedVendor.toLowerCase());
      //item = this.itemList.filter(a => a.ItemName.toLowerCase() == this.selectedItems[index].toLowerCase())[0];   //for billing order.                
    }
    else if (typeof (this.selectedVendor) == 'object') {
      selVendorObj = this.selectedVendor;
    }

    if (selVendorObj) {
      this.currentPurchaseRequest.VendorId = selVendorObj.VendorId;
      this.currentPurchaseRequest.VendorName = selVendorObj.VendorName;
      this.currentPurchaseRequest.CreditPeriod = selVendorObj.CreditPeriod;
    }
  }
  SelectItemFromSearchBox(Item: ItemModel, index) {
    //if proper item is selected then the below code runs ..othewise it goes out side the function
    if (typeof Item === "object" && !Array.isArray(Item) && Item !== null) {
      //this for loop with if conditon is to check whether the  item is already present in the array or not 
      //means to avoid duplication of item
      for (var i = 0; i < this.currentPurchaseRequest.PurchaseRequestItems.length; i++) {
        if (this.currentPurchaseRequest.PurchaseRequestItems[i].ItemId == Item.ItemId && i != index) {
          this.checkIsItemPresent = true;
        }
      }
      //id item is present the it show alert otherwise it assign the value
      if (this.checkIsItemPresent == true) {
        this.messageBoxService.showMessage("notice-message", [Item.ItemName + " is already add..Please Check!!!"]);
        this.checkIsItemPresent = false;
        this.changeDetectorRef.detectChanges();
        this.currentPurchaseRequest.PurchaseRequestItems.splice(index, 1);
        this.currentPurchaseRequestItems = new PurchaseRequestItemModel();
        this.currentPurchaseRequestItems.RequestedQuantity = 1;
        this.currentPurchaseRequest.PurchaseRequestItems.push(this.currentPurchaseRequestItems);

      }
      else {
        for (var a = 0; a < this.currentPurchaseRequest.PurchaseRequestItems.length; a++) {
          // Assiging the value StandardRate,VatPercentage and ItemId in the particular index ..
          //it helps for changing item after adding the item and also in adding in new item
          if (a == index) {
            this.currentPurchaseRequest.PurchaseRequestItems[index].ItemId = Item.ItemId;
          }
        }
      }
    }
  }
  AddPORequisition() {// this CheckIsValid varibale is used to check whether all the validation are proper or not ..
    //if the CheckIsValid == true the validation is proper else no
    var CheckIsValid = true;

    if (this.currentPurchaseRequest.IsValidCheck(undefined, undefined) == false) {
      // for loop is used to show PurchaseOrderValidator message ..if required  field is not filled
      for (var b in this.currentPurchaseRequest.PurchaseRequestValidator.controls) {
        this.currentPurchaseRequest.PurchaseRequestValidator.controls[b].markAsDirty();
        this.currentPurchaseRequest.PurchaseRequestValidator.controls[b].updateValueAndValidity();
        CheckIsValid = false;
      }
    }


    for (var i = 0; i < this.currentPurchaseRequest.PurchaseRequestItems.length; i++) {
      if (this.currentPurchaseRequest.PurchaseRequestItems[i].IsValidCheck(undefined, undefined) == false) {
        for (var a in this.currentPurchaseRequest.PurchaseRequestItems[i].PurchaseRequestItemValidator.controls) {
          this.currentPurchaseRequest.PurchaseRequestItems[i].PurchaseRequestItemValidator.controls[a].markAsDirty();
          this.currentPurchaseRequest.PurchaseRequestItems[i].PurchaseRequestItemValidator.controls[a].updateValueAndValidity();
        }
        CheckIsValid = false;
      }
    }


    if (this.currentPurchaseRequest.PurchaseRequestItems.length == 0) {
      this.messageBoxService.showMessage("notice-message", ["Please Add Item ...Before Requesting"]);
    }

    if (CheckIsValid == true && this.currentPurchaseRequest.PurchaseRequestItems != null) {
      //Updating the Status
      this.currentPurchaseRequest.IsActive = true;
      this.currentPurchaseRequest.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.currentPurchaseRequest.CreatedOn = moment().format("YYYY-MM-DD hh:mm:ss");
      this.currentPurchaseRequest.RequestStatus = "active";

      for (var i = 0; i < this.currentPurchaseRequest.PurchaseRequestItems.length; i++) {
        this.currentPurchaseRequest.PurchaseRequestItems[i].CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        this.currentPurchaseRequest.PurchaseRequestItems[i].CreatedOn = moment().format("YYYY-MM-DD hh:mm:ss");
        this.currentPurchaseRequest.PurchaseRequestItems[i].VendorId = this.currentPurchaseRequest.VendorId;
        this.currentPurchaseRequest.PurchaseRequestItems[i].RequestItemStatus = "active";
        this.currentPurchaseRequest.PurchaseRequestItems[i].ItemCategory=this.currentPurchaseRequest.PurchaseRequestItems[i].ItemCategory;
      }

      if (!this._activateInventoryService.activeInventory.StoreId) {
        this.messageBoxService.showMessage("Alert!", ["Cannot find StoreId. Please select Inventory First"])
        return;
      } else {
        this.currentPurchaseRequest.StoreId = this._activateInventoryService.activeInventory.StoreId;
        this.currentPurchaseRequest.PRGroupId = this._activateInventoryService.activeInventory.INV_PRGroupId;
      }

      this.inventoryBLService.PostToPORequisition(this.currentPurchaseRequest).
        subscribe(res => {
          if (res.Status == 'OK') {
            this.messageBoxService.showMessage("success", ["Purchase Order Requisition is Generated and Saved"]);
            this.changeDetectorRef.detectChanges();
            //deleting all creating new PO..after successully adding to db
            this.currentPurchaseRequest.PurchaseRequestItems = new Array<PurchaseRequestItemModel>();
            this.currentPurchaseRequest = new PurchaseRequestModel();
            this.currentPurchaseRequestItems = new PurchaseRequestItemModel();
            this.currentPurchaseRequestItems.RequestedQuantity = 1;
            this.currentPurchaseRequest.PurchaseRequestItems.push(this.currentPurchaseRequestItems);


            this.inventoryService.RequisitionId = res.Results;//sud:3Mar'20-Property Rename in InventoryService
            this.router.navigate(['/Inventory/InternalMain/PurchaseRequest']);

          }
          else {

            this.messageBoxService.showMessage("failed", ['failed to add Purchase Order Requisition.. please check log for details.']);
          }
        });

    }
  }
  UpdatePORequisition() {
    var CheckIsValid = true;

    if (this.currentPurchaseRequest.IsValidCheck(undefined, undefined) == false) {
      // for loop is used to show PurchaseOrderValidator message ..if required  field is not filled
      for (var b in this.currentPurchaseRequest.PurchaseRequestValidator.controls) {
        this.currentPurchaseRequest.PurchaseRequestValidator.controls[b].markAsDirty();
        this.currentPurchaseRequest.PurchaseRequestValidator.controls[b].updateValueAndValidity();
        CheckIsValid = false;
      }
    }
    for (var i = 0; i < this.currentPurchaseRequest.PurchaseRequestItems.length; i++) {
      //assigning vendorId is changes in edit
      this.currentPurchaseRequest.PurchaseRequestItems[i].VendorId = this.currentPurchaseRequest.VendorId;
      this.currentPurchaseRequest.PurchaseRequestItems[i].PurchaseRequestId = this.currentPurchaseRequest.PurchaseRequestId;
      if (this.currentPurchaseRequest.PurchaseRequestItems[i].IsValidCheck(undefined, undefined) == false) {
        for (var a in this.currentPurchaseRequest.PurchaseRequestItems[i].PurchaseRequestItemValidator.controls) {
          this.currentPurchaseRequest.PurchaseRequestItems[i].PurchaseRequestItemValidator.controls[a].markAsDirty();
          this.currentPurchaseRequest.PurchaseRequestItems[i].PurchaseRequestItemValidator.controls[a].updateValueAndValidity();
        }
        CheckIsValid = false;
      }
    }
    if (this.currentPurchaseRequest.PurchaseRequestItems.length == 0) {
      this.messageBoxService.showMessage("notice-message", ["Please Add Item ...Before Requesting"]);
    }

    if (CheckIsValid == true && this.currentPurchaseRequest.PurchaseRequestItems != null) {
      //Updating the Status
      this.currentPurchaseRequest.IsActive = true;
      this.currentPurchaseRequest.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.currentPurchaseRequest.ModifiedOn = moment().format("YYYY-MM-DD");

      if (!this._activateInventoryService.activeInventory.StoreId) {
        this.messageBoxService.showMessage("Alert!", ["Cannot find StoreId. Please select Inventory First"])
        return;
      } else {
        this.currentPurchaseRequest.StoreId = this._activateInventoryService.activeInventory.StoreId;
      }

      this.inventoryBLService.UpdatePORequisition(this.currentPurchaseRequest).
        subscribe(res => {
          if (res.Status == 'OK') {
            this.messageBoxService.showMessage("success", ["Purchase Order Requisition is Edited and Saved"]);
            this.changeDetectorRef.detectChanges();
            //deleting all creating new PO..after successully adding to db
            this.currentPurchaseRequest.PurchaseRequestItems = new Array<PurchaseRequestItemModel>();
            this.currentPurchaseRequest = new PurchaseRequestModel();
            this.currentPurchaseRequestItems = new PurchaseRequestItemModel();
            this.currentPurchaseRequestItems.RequestedQuantity = 1;
            this.currentPurchaseRequest.PurchaseRequestItems.push(this.currentPurchaseRequestItems);

            this.router.navigate(['/Inventory/InternalMain/PurchaseRequest']);

          }
          else {

            this.messageBoxService.showMessage("Failed", ['Failed to edit Purchase Order Requisition.']);
          }
        });

    }
  }
  OnItemSelected(Item: any) {
    this.inventoryBLService.GetAvailableQuantityByItemId(Item.ItemId)
      .subscribe(res => {
        if (res.Status == "OK") {
          Item.AvailableStock = res.Results;
        }
        else {
          console.log("Failed to get available Quantity.");
          Item.AvailableStock = 0;
        }
      })
  }
  //add a new row 
  AddRowRequest() {
    //checking the validation
    for (var i = 0; i < this.currentPurchaseRequest.PurchaseRequestItems.length; i++) {
      // for loop is used to show PurchaseOrderItemValidator message ..if required  field is not filled
      for (var a in this.currentPurchaseRequest.PurchaseRequestItems[i].PurchaseRequestItemValidator.controls) {
        this.currentPurchaseRequest.PurchaseRequestItems[i].PurchaseRequestItemValidator.controls[a].markAsDirty();
        this.currentPurchaseRequest.PurchaseRequestItems[i].PurchaseRequestItemValidator.controls[a].updateValueAndValidity();
      }
    }
    ////row can be added if only if the item is selected is last row
    //if (this.currentPOItem.ItemId != 0 && this.currentPOItem.ItemId != null) {
    this.rowCount++;
    this.currentPurchaseRequestItems = new PurchaseRequestItemModel();
    this.currentPurchaseRequestItems.ItemCategory = ENUM_GRItemCategory.Consumables;//sud:18Sep'21 : By default category=consumables.
    this.currentPurchaseRequestItems.filteredItemList = this.GetItemListByItemCategory(this.currentPurchaseRequestItems.ItemCategory);//load item list for 1st row based on itemcategory.
    this.currentPurchaseRequestItems.RequestedQuantity = 1;
    this.currentPurchaseRequest.PurchaseRequestItems.push(this.currentPurchaseRequestItems);

    let len = this.currentPurchaseRequest.PurchaseRequestItems.length - 1;
    window.setTimeout(function () {
      let itmNameBox = document.getElementById("itemName" + len);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 600);
    //}
    //else {
    //    alert("Please select an item before adding a new row ");
    //}
  }

  //to delete the row
  DeleteRow(index) {
    //to stop rowCount value going negative
    if (this.rowCount > 0) {
      this.rowCount--;
    }

    //this will remove the data from the array
    this.currentPurchaseRequest.PurchaseRequestItems.splice(index, 1);
    // if the index is 0 then ..  currentPOItem is pushhed in POItems to show the textboxes
    if (index == 0 && this.rowCount == 0) {
      this.currentPurchaseRequestItems = new PurchaseRequestItemModel();
      this.currentPurchaseRequest.PurchaseRequestItems.push(this.currentPurchaseRequestItems);
      this.currentPurchaseRequestItems.RequestedQuantity = 1;
      this.changeDetectorRef.detectChanges();

    }
    else {
      this.changeDetectorRef.detectChanges();
    }
  }
  DiscardChanges() {
    this.router.navigate(["/Inventory/InternalMain/PurchaseRequest/PurchaseRequestList"]);
  }
  //used to format display item in ng-autocomplete
  ItemListFormatter(data: any): string {
    let html = data["ItemName"] + "<b>(" + data["Code"] + ")</b>";
    return html;
  }
  VendorListFormatter(data: any): string {
    let html = data["VendorName"];
    return html;
  }

  //for item add popup
  AddItemPopUp(i) {
    this.showAddItemPopUp = false;
    this.index = i;
    this.changeDetectorRef.detectChanges();
    this.showAddItemPopUp = true;
  }
  //post item add function
  OnNewItemAdded($event) {
    this.showAddItemPopUp = false;
    var item = $event.item;
    this.ItemList.push(item);
    this.currentPurchaseRequestItems = new PurchaseRequestItemModel();
    if (this.currentPurchaseRequest.PRCategory == item.ItemType) {
      this.currentPurchaseRequestItems.RequestedQuantity = 1;
      this.currentPurchaseRequest.PurchaseRequestItems.splice(this.index, 1, this.currentPurchaseRequestItems);
      this.currentPurchaseRequest.PurchaseRequestItems[this.index].SelectedItem = item;
    }
    else {
      this.messageBoxService.showMessage("Warning", [`${item.ItemName} is added with Category as ${item.ItemType}.`, `Item will not be seen in PO with Category as ${this.currentPurchaseRequest.PRCategory}.`])
    }
  }
  //for vendor add popup
  AddVendorPopUp() {
    this.showAddVendorPopUp = false;
    this.changeDetectorRef.detectChanges();
    this.showAddVendorPopUp = true;
  }
  OnNewVendorAdded($event) {
    this.showAddVendorPopUp = false;
    var newVendor = $event.vendor;
    this.VendorList.push(newVendor);
    this.VendorList.slice();
    this.selectedVendor = newVendor;
  }
  GoToNextInput(id: string, focusDelayInMs: number = 0) {
    var Timer = setTimeout(() => {
      if (document.getElementById(id)) {
        let nextEl = <HTMLInputElement>document.getElementById(id);
        nextEl.focus();
        nextEl.select();
        clearTimeout(Timer);
      }
    }, focusDelayInMs)
  }

  setFocusById(targetId: string, waitingTimeinMS: number = 10) {
    if (this.isEdit) {
      if (targetId == "RequestPORequisition") {
        targetId = 'UpdatePORequisition';
      }
    }
    var timer = window.setTimeout(function () {
      let htmlObject = document.getElementById(targetId);
      if (htmlObject) {
        htmlObject.focus();
      }
      clearTimeout(timer);
    }, waitingTimeinMS);
  }

  public LoadPRCategory() {
    this.PRCategories = Object.values(ENUM_GRItemCategory).filter(p => isNaN(p as any));
  }
}
