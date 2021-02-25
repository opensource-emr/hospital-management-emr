import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { SecurityService } from '../../security/shared/security.service';
import { InventoryBLService } from "../shared/inventory.bl.service";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';

import { Requisition } from "../shared/requisition.model";
import { RequisitionItems } from "../shared/requisition-items.model";
import { ItemMaster } from "../shared/item-master.model";
import { InventoryService } from '../shared/inventory.service';
//import { VendorMaster } from "../shared/vendor-master.model";
import { CoreBLService } from "../../core/shared/core.bl.service";
import { WardSupplyBLService } from '../../wardsupply/shared/wardsupply.bl.service';
import { RequisitionStockVMModel } from '../shared/requisition-stock-vm.model';
import { DispatchItems } from '../shared/dispatch-items.model';
import { StockModel } from '../shared/stock.model';
import { StockTransaction } from '../shared/stock-transaction.model';
@Component({

  templateUrl: "../../view/inventory-view/DirectDispatch.html"  // "/InventoryView/RequisitionItems"

})
export class DirectDispatchComponent {

  ////binding logic
  public currentRequItem: RequisitionItems = new RequisitionItems();
  public requisition: Requisition = new Requisition();
  public requisitionStockVM: RequisitionStockVMModel = new RequisitionStockVMModel();
  public stockList: Array<any> = new Array<any>();
  ////this Item is used for search button(means auto complete button)...
  public ItemList: any;
  ////this is to add or delete the number of row in ui
  public rowCount: number = 0;
  public checkIsItemPresent: boolean = false;
  public StoreList: any;
  public selectedStore: any;
  //For Add Item --Yubraj 2nd April 2019
  public index: number = 0;
  public showAddItemPopUp: boolean = false;
  //for double click issues.
  public loading: boolean = false;

  constructor(
    public changeDetectorRef: ChangeDetectorRef,
    public inventoryBLService: InventoryBLService,
    public inventoryService: InventoryService,
    public securityService: SecurityService,
    public router: Router,
    public messageBoxService: MessageboxService,
    public coreBLService: CoreBLService, public wardBLService: WardSupplyBLService) {
    this.GetStockDetailsList();
    ////pushing currentPOItem for the first Row in UI 
    this.AddRowRequest();
    this.GetItemList();
    this.GetActiveStoreList();
  }
  ////to load the item in the start
  GetItemList() {
    try {
      this.ItemList = this.inventoryService.allItemList;
      this.ItemList = this.ItemList.filter(item => item.IsActive == true);
      if (this.ItemList.length == 0) {
        this.messageBoxService.showMessage("failed", [
          "failed to get Item.. please check log for details."
        ]);
      }
    } catch (ex) {
      this.messageBoxService.showMessage("Failed", ["Something went wrong while loading the items"]);
    }
  }

  GetActiveStoreList() {
    this.wardBLService.GetActiveSubStoreList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.StoreList = res.Results;
        }
      })
  }
  //load stock list
  public GetStockDetailsList() {
    this.inventoryBLService.GetStockList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.stockList = res.Results;
        }
        else {
          this.messageBoxService.showMessage("error", ["Failed to get StockDetailsList. " + res.ErrorMessage]);
        }
      },
        err => {
          this.messageBoxService.showMessage("error", ["Failed to get StockDetailsList. " + err.ErrorMessage]);
        });
  }
  ////add a new row 
  AddRowRequest() {
    for (var i = 0; i < this.requisition.RequisitionItems.length; i++) {
      // for loop is used to show RequisitionItemValidator message ..if required  field is not filled
      for (var a in this.requisition.RequisitionItems[i].RequisitionItemValidator.controls) {
        this.requisition.RequisitionItems[i].RequisitionItemValidator.controls[a].markAsDirty();
        this.requisition.RequisitionItems[i].RequisitionItemValidator.controls[a].updateValueAndValidity();
      }
    }
    //row can be added if only if the item is selected is last row
    //if (this.currentRequItem.ItemId != 0 && this.currentRequItem.ItemId != null) {
    this.rowCount++;
    this.currentRequItem = new RequisitionItems();
    this.currentRequItem.Quantity = 1;
    this.requisition.RequisitionItems.push(this.currentRequItem);

    let nextInputIndex = this.requisition.RequisitionItems.length - 1;
    this.SetFocusOnItemName(nextInputIndex);
  }
  private SetFocusOnItemName(index: number) {
    window.setTimeout(function () {
      let itmNameBox = document.getElementById("itemName" + index);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 600);
  }
  ////to delete the row
  DeleteRow(index) {
    try {
      this.requisition.RequisitionItems.splice(index, 1);
      if (this.requisition.RequisitionItems.length == 0) {
        this.AddRowRequest();
      }
    }
    catch (exception) {
      this.messageBoxService.showMessage("Error", [exception]);
    }
  }

  SelectItemFromSearchBox(Item: ItemMaster, index) {
    //if proper item is selected then the below code runs ..othewise it goes out side the function
    if (typeof Item === "object" && !Array.isArray(Item) && Item !== null) {
      //this for loop with if conditon is to check whether the  item is already present in the array or not 
      //means to avoid duplication of item
      for (var i = 0; i < this.requisition.RequisitionItems.length; i++) {
        if (this.requisition.RequisitionItems[i].ItemId == Item.ItemId) {
          this.checkIsItemPresent = true;
        }
      }
      //id item is present the it show alert otherwise it assign the value
      if (this.checkIsItemPresent == true) {
        this.messageBoxService.showMessage("notice-message", [Item.ItemName + " is already add..Please Check!!!"]);
        this.checkIsItemPresent = false;
        this.changeDetectorRef.detectChanges();
        this.requisition.RequisitionItems.splice(index, 1);
        this.currentRequItem = new RequisitionItems();
        this.currentRequItem.Quantity = 1;
        this.requisition.RequisitionItems.push(this.currentRequItem);
      }
      else {
        for (var a = 0; a < this.requisition.RequisitionItems.length; a++) {
          // Assiging the value StandardRate,VatPercentage and ItemId in the particular index ..
          //it helps for changing item after adding the item and also in adding in new item
          if (a == index) {
            this.requisition.RequisitionItems[index].ItemId = Item.ItemId;
            this.requisition.RequisitionItems[index].Code = Item.Code;
            this.requisition.RequisitionItems[index].UOMName = Item.UOMName;
          }
        }
      }
    }
  }

  DirectDispatch() {
    this.loading = true;
    // this CheckIsValid varibale is used to check whether all the validation are proper or not ..
    //if the CheckIsValid == true the validation is proper else no
    var CheckIsValid = true;
    if (this.requisition.IsValidCheck(undefined, undefined) == false) {
      // for loop is used to show RequisitionValidator message ..if required  field is not filled
      for (var a in this.requisition.RequisitionValidator.controls) {
        this.requisition.RequisitionValidator.controls[a].markAsDirty();
        this.requisition.RequisitionValidator.controls[a].updateValueAndValidity();
      }
      CheckIsValid = false;
    }
    for (var i = 0; i < this.requisition.RequisitionItems.length; i++) {
      // for loop is used to show RequisitionItemValidator message ..if required  field is not filled
      for (var a in this.requisition.RequisitionItems[i].RequisitionItemValidator.controls) {
        this.requisition.RequisitionItems[i].RequisitionItemValidator.controls[a].markAsDirty();
        this.requisition.RequisitionItems[i].RequisitionItemValidator.controls[a].updateValueAndValidity();
      }
      if (this.requisition.RequisitionItems[i].IsValidCheck(undefined, undefined) == false) {
        CheckIsValid = false;
      }
      if (this.requisition.RequisitionItems[i].Quantity > this.AvalablbleQty(this.requisition.RequisitionItems[i].ItemId)) {
        CheckIsValid = false;
      }
    }
    if (!this.requisition.Remarks || this.requisition.Remarks.trim() == "") {
      CheckIsValid = false;
      this.messageBoxService.showMessage("Failed", ["Remarks is mandatory. Please fill remarks."]);
    }

    if (CheckIsValid == true && this.requisition.RequisitionItems != null) {
      //Updating the Status
      this.requisition.RequisitionStatus = "active";
      //Comment by Nagesh on 11-Jun-17 Employee Id not getting so, now passing static id
      this.requisition.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      for (var i = 0; i < this.requisition.RequisitionItems.length; i++) {
        this.requisition.RequisitionItems[i].RequisitionItemStatus = "active";
        this.requisition.RequisitionItems[i].CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        this.requisition.RequisitionItems[i].AuthorizedBy = this.securityService.GetLoggedInUser().EmployeeId;
        //Comment on 02-July'17 By-Nagesh-No need to send Item Object with requisitionItems only Need ItemId
        this.requisition.RequisitionItems[i].ItemId = this.requisition.RequisitionItems[i].ItemId;
        this.requisition.RequisitionItems[i].Item = null;
        //setting the dispatch item
        var currDispatchItem = new DispatchItems();
        currDispatchItem.ItemId = this.requisition.RequisitionItems[i].ItemId;
        currDispatchItem.RequisitionItemId = this.requisition.RequisitionItems[i].RequisitionItemId;
        currDispatchItem.RequiredQuantity = this.requisition.RequisitionItems[i].Quantity - this.requisition.RequisitionItems[i].ReceivedQuantity;
        currDispatchItem.AvailableQuantity = this.AvalablbleQty(this.requisition.RequisitionItems[i].ItemId);
        currDispatchItem.ItemName = this.requisition.RequisitionItems[i].ItemName;
        currDispatchItem.DispatchedQuantity = currDispatchItem.RequiredQuantity;
        currDispatchItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        currDispatchItem.StoreId = this.requisition.StoreId;
        currDispatchItem.RequisitionId = this.inventoryService.RequisitionId;
        this.requisitionStockVM.dispatchItems.push(currDispatchItem);
      }
      this.requisitionStockVM.requisition = this.requisition;
      this.inventoryBLService.PostDirectDispatch(this.requisitionStockVM).
        subscribe(res => {
          if (res.Status == 'OK') {
            this.messageBoxService.showMessage("success", ["Requisition is Generated and Saved"]);
            this.changeDetectorRef.detectChanges();
            //route to dispatch
            var requisitionId = res.Results;
            this.RouteToViewDetail(requisitionId, this.requisition.StoreName);
            this.loading = false;
          }
          else {
            this.messageBoxService.showMessage("failed", ['failed to add Requisition.. please check log for details.']);
            console.log(res.ErrorMessage);
            //route back to requisition list
            this.router.navigate(['/Inventory/InternalMain/Requisition/RequisitionList']);
          }
        }, err => {
          this.messageBoxService.showMessage("failed", ['failed to add Requisition.. please check log for details.']);
          console.log(err.ErrorMessage);
          //route back to requisition list
          this.router.navigate(['/Inventory/InternalMain/Requisition/RequisitionList']);
        }, () => {
          this.loading = false;
        });
    }
    else {
      this.loading = false;
    }
  }

  CheckAvailableQuantity(dispatchItem: DispatchItems, index) {
    if (dispatchItem.DispatchedQuantity > dispatchItem.AvailableQuantity) {
      dispatchItem.IsDisQtyValid = false;
    }
    else if (dispatchItem.DispatchedQuantity > dispatchItem.RequiredQuantity) {
      dispatchItem.IsDisQtyValid = false;

    } else { dispatchItem.IsDisQtyValid = true; }

  }
  AvalablbleQty(itemId: number): number {
    let availableQty = 0;
    for (var i = 0; i < this.stockList.length; i++) {
      if (this.stockList[i].ItemId == itemId) {
        availableQty = availableQty + this.stockList[i].AvailQuantity;
      }
    }
    return availableQty;
  }
  //used to select store in autocomplete
  OnStoreChange() {
    let store = null;
    if (!this.selectedStore) {
      this.requisition.StoreId = null;
    }
    else if (typeof (this.selectedStore) == 'string') {
      store = this.StoreList.find(a => a.ServiceDepartmentName.toLowerCase() == this.selectedStore.toLowerCase());
    }
    else if (typeof (this.selectedStore) == "object") {
      store = this.selectedStore;
    }
    if (store) {
      this.requisition.StoreId = store.StoreId;
      this.requisition.StoreName = store.Name;
    }
    else {
      this.requisition.StoreId = null;
      this.requisition.StoreName = "";
    }
  }
  StoreListFormatter(data: any): string {
    return data["Name"];
  }
  ////used to format display item in ng-autocomplete
  ItemListFormatter(data: any): string {
    let html = data["ItemName"];
    return html;
  }
  ////this is to cancel the whole PO at one go and adding new PO
  Cancel() {
    this.requisition.RequisitionItems = new Array<RequisitionItems>();
    this.requisition = new Requisition();
    this.currentRequItem = new RequisitionItems()
    this.currentRequItem.Quantity = 1;
    this.requisition.RequisitionItems.push(this.currentRequItem);
    //route back to requisition list
    this.router.navigate(['/Inventory/InternalMain/Requisition/RequisitionList']);
  }
  logError(err: any) {
    console.log(err);
  }

  RouteToViewDetail(requisitionId: number, storeName: string) {//sud:3Mar'20
    //pass the Requisition Id to RequisitionView page for List of Details about requisition
    this.inventoryService.RequisitionId = requisitionId;
    this.inventoryService.StoreName = storeName;
    this.router.navigate(['/Inventory/InternalMain/Requisition/RequisitionDetails']);
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
    this.ItemList.push({
      "ItemId": item.ItemId, "ItemName": item.ItemName, StandardRate: item.StandardRate, VAT: item.VAT
    });
    this.currentRequItem = new RequisitionItems();
    this.currentRequItem.Quantity = 1;
    this.requisition.RequisitionItems.splice(this.index, 1, this.currentRequItem);
    this.requisition.RequisitionItems[this.index].SelectedItem = item;
  }
  GoToNextInput(idToSelect: string) {
    if (document.getElementById(idToSelect)) {
      let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
      nextEl.focus();
      nextEl.select();
    }
  }
}
