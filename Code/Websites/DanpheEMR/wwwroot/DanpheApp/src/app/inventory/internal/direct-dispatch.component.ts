import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { SecurityService } from '../../security/shared/security.service';
import { InventoryBLService } from "../shared/inventory.bl.service";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { InventoryService } from '../shared/inventory.service';
import { WardSupplyBLService } from '../../wardsupply/shared/wardsupply.bl.service';
import { DispatchItems } from '../shared/dispatch-items.model';
import { ActivateInventoryService } from '../../shared/activate-inventory/activate-inventory.service';
import { PHRMStoreModel } from '../../pharmacy/shared/phrm-store.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
@Component({
  templateUrl: "./direct-dispatch.component.html"  // "/InventoryView/RequisitionItems"
})
export class DirectDispatchComponent {
  dispatchDate: string = moment().format('YYYY-MM-DD');
  dispatchForm: FormGroup = new FormGroup({
    dispatchDate: new FormControl(this.dispatchDate),
    targetStore: new FormControl('', Validators.required),
    remarks: new FormControl('', Validators.required),
    receivedBy: new FormControl(''),
    issueNo: new FormControl('')
  });
  dispatchItems: DispatchItems[] = [];
  stockList: any[] = [];
  substores: PHRMStoreModel[] = [];
  showAddItemPopUp: boolean = false;
  selectedStore: any = null;
  loading: boolean = false;
  selectedItemIndex: number = null;
  canUserEnterDate: boolean = false;

  constructor(
    public changeDetectorRef: ChangeDetectorRef, public activeInventoryService: ActivateInventoryService,
    public inventoryBLService: InventoryBLService, public inventoryService: InventoryService, public securityService: SecurityService,
    public router: Router, public messageBoxService: MessageboxService, public wardBLService: WardSupplyBLService
  ) {
    this.canUserEnterDate = this.securityService.HasPermission('inventory-dispatch-backdate-entry-button');
    this.getActiveStoreList();
    this.getStockList();
    this.addNewRow();
  }


  ////to load the item in the start
  getStockList() {
    try {
      this.inventoryBLService.GetStockListForDirectDispatch(this.activeInventoryService.activeInventory.StoreId)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.stockList = res.Results;
          }
          else {
            this.messageBoxService.showMessage("Failed", ["Failed to load the stock. Please check console."])
            console.log(res.ErrorMessage);
          }
        })
    } catch (ex) {
      this.messageBoxService.showMessage("Failed", ["Something went wrong while loading the items"]);
    }
  }

  getActiveStoreList() {
    this.wardBLService.GetActiveSubStoreList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.substores = res.Results;
          this.setFocusById('store');
        }
      })
  }
  addNewRow(index: number = null) {
    var errorMessages: string[] = [];
    var isAddNewItemAllowed = true;
    for (var i = 0; i < this.dispatchItems.length; i++) {
      for (var x in this.dispatchItems[i].DispatchItemValidator.controls) {
        this.dispatchItems[i].DispatchItemValidator.controls[x].markAsTouched();
        this.dispatchItems[i].DispatchItemValidator.controls[x].updateValueAndValidity();
        if (this.dispatchItems[i].DispatchItemValidator.controls[x].invalid) {
          errorMessages.push(`${x} is invalid for item no. ${i + 1}.`);
          isAddNewItemAllowed = false;
        }
      }
    }
    if (isAddNewItemAllowed == false) {
      this.messageBoxService.showMessage("Failed", errorMessages);
    }
    else {
      let newRow = new DispatchItems();
      newRow.SourceStoreId = this.activeInventoryService.activeInventory.StoreId;
      newRow.TargetStoreId = null;
      newRow.AvailableQuantity = 0;
      newRow.ItemId = null;
      newRow.DispatchedQuantity = 1;
      newRow.DispatchItemValidator.addControl('Item', new FormControl('', Validators.required));
      if (index == null) {
        index = this.dispatchItems.length;
      }
      this.dispatchItems.splice(index, 0, newRow);
      this.SetFocusOnItemName(index, 20);
    }
  }
  deleteRow(index) {
    this.dispatchItems.splice(index, 1);
    if (this.dispatchItems.length == 0) {
      this.addNewRow();
    }
    this.SetFocusOnItemName(index - 1);
  }

  onItemNameChanged(index: number) {
    let selectedDispItem = this.dispatchItems[index];
    if (selectedDispItem.selectedItem != null && selectedDispItem.ItemId == selectedDispItem.selectedItem.ItemId) return;
    if (selectedDispItem.selectedItem == null) return;
    if (typeof (selectedDispItem.selectedItem) == "string") {
      selectedDispItem.selectedItem = this.stockList.find(a => a.ItemName == selectedDispItem.selectedItem && a.BatchNo == selectedDispItem.BatchNo);
    }
    if (typeof (selectedDispItem.selectedItem) == "object") {
      let checkIsItemPresent = false;
      //means to avoid duplication of item
      for (var i = 0; i < this.dispatchItems.length; i++) {
        if (this.dispatchItems[i].ItemId == selectedDispItem.ItemId && index != i) {
          checkIsItemPresent = true;
        }
      }
      if (checkIsItemPresent == true) {
        this.messageBoxService.showMessage("notice-message", [selectedDispItem.ItemName + " is already added. Please Check!"]);
        this.dispatchItems.splice(index, 1);
        this.addNewRow(index);
      }
      else {
        selectedDispItem.ItemId = selectedDispItem.selectedItem.ItemId;
        selectedDispItem.ItemName = selectedDispItem.selectedItem.ItemName;
        selectedDispItem.ItemCode = selectedDispItem.selectedItem.ItemCode;
        selectedDispItem.ItemUOM = selectedDispItem.selectedItem.ItemUOM;
        selectedDispItem.BatchNo = selectedDispItem.selectedItem.BatchNo;
        selectedDispItem.AvailableQuantity = selectedDispItem.selectedItem.AvailableQuantity;
        selectedDispItem.DispatchItemValidator.get('AvailableQty').setValue(selectedDispItem.selectedItem.AvailableQuantity);
        selectedDispItem.DispatchItemValidator.get('Item').setValue(selectedDispItem.selectedItem.ItemName);
      }
    }
    else {
      selectedDispItem.ItemId = null;
      selectedDispItem.ItemName = '';
      selectedDispItem.ItemCode = '';
      selectedDispItem.ItemUOM = '';
    }
  }
  onStoreChange() {
    let store = null;
    if (typeof (this.selectedStore) == 'string') {
      store = this.substores.find(a => a.Name.toLowerCase() == this.selectedStore.toLowerCase());
    }
    else if (typeof (this.selectedStore) == "object") {
      store = this.selectedStore;
    }
  }
  postDirectDispatch() {
    if (this.loading == true) return;
    this.loading = true;
    var errorMessages: string[] = [];
    var formValidity: boolean = true;
    for (var x in this.dispatchForm.controls) {
      this.dispatchForm.controls[x].markAsTouched();
      this.dispatchForm.controls[x].updateValueAndValidity();
      if (this.dispatchForm.controls[x].invalid) {
        errorMessages.push(`${x} is invalid.`);
        formValidity = false;
      }
    }
    for (var i = 0; i < this.dispatchItems.length; i++) {
      for (var x in this.dispatchItems[i].DispatchItemValidator.controls) {
        this.dispatchItems[i].DispatchItemValidator.controls[x].markAsTouched();
        this.dispatchItems[i].DispatchItemValidator.controls[x].updateValueAndValidity();
        if (this.dispatchItems[i].DispatchItemValidator.controls[x].invalid) {
          errorMessages.push(`${x} is invalid for item no. ${i + 1}.`);
          formValidity = false;
        }
      }
    }

    if (formValidity == true && this.dispatchItems != null) {
      this.dispatchItems.forEach(item => {
        item.DispatchedDate = `${moment(this.dispatchDate).format("YYYY-MM-DD")} ${moment().format("HH:mm:ss.SSS")}`;
        item.SourceStoreId = this.activeInventoryService.activeInventory.StoreId;
        item.TargetStoreId = this.selectedStore.StoreId;
        item.Remarks = this.dispatchForm.get('remarks').value;
        item.ReceivedBy = this.dispatchForm.get('receivedBy').value;
        item.IssueNo = this.dispatchForm.get('issueNo').value;
        item.ReqDisGroupId = this.selectedStore.ReqDisGroupId;
      })
      this.inventoryBLService.PostDirectDispatch(this.dispatchItems).
        subscribe(res => {
          if (res.Status == 'OK') {
            var dispatchId = res.Results;
            this.messageBoxService.showMessage("success", ["Requisition is Generated and Saved"]);
            this.changeDetectorRef.detectChanges();
            //route to dispatch

            this.RouteToViewDetail(dispatchId, this.activeInventoryService.activeInventory.Name);
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
  discardChanges() {
    this.dispatchItems = new Array<DispatchItems>();
    this.dispatchForm.reset();
    //route back to requisition list
    this.router.navigate(['/Inventory/InternalMain/Requisition/RequisitionList']);
  }
  storeListFormatter(data: any): string {
    return data["Name"];
  }
  ////used to format display item in ng-autocomplete
  stockListFormatter(data: any): string {
    let html = "<font color='blue'; size=03 >" + data["ItemName"] + "</font>";
    html += (data["BatchNo"] == null || data["BatchNo"] == "") ? "" : (" | B: " + data["BatchNo"]);
    return html;
  }

  RouteToViewDetail(dispatchId: number, storeName: string) {//sud:3Mar'20
    //pass the Requisition Id to RequisitionView page for List of Details about requisition
    this.inventoryService.DispatchId = dispatchId;
    this.inventoryService.StoreName = storeName;
    this.router.navigate(['/Inventory/InternalMain/Requisition/DispatchReceiptDetails']);
  }
  onPressedEnterKeyInItemField(index: number) {
    if (this.dispatchItems[index].ItemId == null) {
      this.deleteRow(index);
      this.setFocusById('remarks');
    }
    else {
      this.setFocusById('qtyip' + index);
    }
  }


  private SetFocusOnItemName(index: number, waitingTimeinms = 0) {
    this.setFocusById("itemName" + index, waitingTimeinms);
  }
  setFocusById(targetId: string, waitingTimeinMS: number = 0) {
    var timer = window.setTimeout(function () {
      let htmlObject = document.getElementById(targetId);
      if (htmlObject) {
        htmlObject.focus();
      }
      clearTimeout(timer);
    }, waitingTimeinMS);
  }


  public get isDispatchedDateValid() {
    return this.inventoryService.allFiscalYearList.some(fy => (fy.IsClosed == null || fy.IsClosed == false) && moment(this.dispatchForm.get('dispatchDate').value).isBetween(fy.StartDate, fy.EndDate)) as Boolean;
  }
}