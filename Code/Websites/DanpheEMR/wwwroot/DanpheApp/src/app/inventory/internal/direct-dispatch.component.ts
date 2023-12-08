import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { CoreService } from '../../core/shared/core.service';
import { PHRMStoreModel } from '../../pharmacy/shared/phrm-store.model';
import { SecurityService } from '../../security/shared/security.service';
import { ActivateInventoryService } from '../../shared/activate-inventory/activate-inventory.service';
import { InventoryFieldCustomizationService } from '../../shared/inventory-field-customization.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../shared/routefrom.service';
import { ENUM_DanpheHTTPResponses, ENUM_GRItemCategory, ENUM_MessageBox_Status } from '../../shared/shared-enums';
import { WardSupplyBLService } from '../../wardsupply/shared/wardsupply.bl.service';
import { DispatchItems, IDispatchableAsset, MAP_Dispatch_FixedAsset } from '../shared/dispatch-items.model';
import { Dispatch } from '../shared/dispatch.model';
import { InventoryBLService } from "../shared/inventory.bl.service";
import { InventoryService } from '../shared/inventory.service';
@Component({
  templateUrl: "./direct-dispatch.component.html"  // "/InventoryView/RequisitionItems"
})
export class DirectDispatchComponent implements OnDestroy {
  dispatchDate: string = moment().format('YYYY-MM-DD');
  currentDate: string = moment().format('YYYY-MM-DD');
  dispatchForm: FormGroup = new FormGroup({
    // dispatchDate: new FormControl(this.dispatchDate),
    targetStore: new FormControl('', Validators.required),
    remarks: new FormControl('', Validators.required),
    receivedBy: new FormControl(''),
  });
  dispatch: Dispatch = new Dispatch();
  stockList: any[] = [];
  substores: PHRMStoreModel[] = [];
  showAddItemPopUp: boolean = false;
  selectedStore: any = null;
  loading: boolean = false;
  selectedItemIndex: number = null;
  canUserEnterDate: boolean = false;
  dispatchItemCategories: any[];
  filteredItemList: any[];
  public GRDispatchItems: Array<DispatchItems> = new Array<DispatchItems>();
  GRItems: any[];
  public DispatchItem: DispatchItems = new DispatchItems();
  showSpecification: boolean = false;
  showBarcode: boolean = false;
  showDispatchDetailsPopup: boolean = false;


  constructor(
    public changeDetectorRef: ChangeDetectorRef, public activeInventoryService: ActivateInventoryService,
    public inventoryBLService: InventoryBLService, public inventoryService: InventoryService, public securityService: SecurityService,
    public router: Router, public messageBoxService: MessageboxService, public wardBLService: WardSupplyBLService,
    public fromRoute: RouteFromService, public coreService: CoreService, public inventoryFieldCustomizationService: InventoryFieldCustomizationService
  ) {
    this.canUserEnterDate = this.securityService.HasPermission('inventory-dispatch-backdate-entry-button');
    this.getActiveStoreList();
    this.getStockList();
    this.LoadDispatchItemCategory();
    this.LoadGRItemToDispatch();
    this.GetInventoryFieldCustomization();
  }


  ////to load the item in the start
  getStockList() {
    try {
      this.inventoryBLService.GetStockListForDirectDispatch(this.activeInventoryService.activeInventory.StoreId)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.stockList = res.Results
            if (this.fromRoute.RouteFrom != 'GRToDispatch') {
              this.addNewRow();
            }
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
  public LoadDispatchItemCategory() {
    this.dispatchItemCategories = Object.values(ENUM_GRItemCategory).filter(p => isNaN(p as any));
  }
  OnItemCategoryChanged(indx: number) {
    var dispatchItem = this.dispatch.DispatchItems[indx];
    this.filteredItemList = [];
    this.filteredItemList = this.GetItemListByItemCategory(dispatchItem.ItemCategory);
    this.GoToNextInput("itemName" + indx, 100);
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
  GetItemListByItemCategory(itmCategory: string) {
    let retItemList = this.stockList.filter(item => item.ItemCategory === itmCategory);
    return retItemList;
  }
  addNewRow(index: number = null) {
    var errorMessages: string[] = [];
    var isAddNewItemAllowed = true;
    for (var i = 0; i < this.dispatch.DispatchItems.length; i++) {
      for (var x in this.dispatch.DispatchItems[i].DispatchItemValidator.controls) {
        this.dispatch.DispatchItems[i].DispatchItemValidator.controls[x].markAsTouched();
        this.dispatch.DispatchItems[i].DispatchItemValidator.controls[x].updateValueAndValidity();
        if (this.dispatch.DispatchItems[i].DispatchItemValidator.controls[x].invalid) {
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
      newRow.ItemCategory = ENUM_GRItemCategory.Consumables;
      this.filteredItemList = this.GetItemListByItemCategory(newRow.ItemCategory);
      newRow.DispatchedQuantity = 1;
      newRow.DispatchItemValidator.addControl('Item', new FormControl('', Validators.required));
      if (index == null) {
        index = this.dispatch.DispatchItems.length;
      }
      this.dispatch.DispatchItems.splice(index, 0, newRow);
      if (this.selectedStore == null) {
        this.setFocusById('store');
      }
      else {
        this.SetFocusOnItemName(index, 20);
      }
    }
  }
  deleteRow(index) {
    this.dispatch.DispatchItems.splice(index, 1);
    if (this.dispatch.DispatchItems.length == 0) {
      this.addNewRow();
    }
    this.SetFocusOnItemName(index - 1);
  }

  onItemNameChanged(index: number) {
    let selectedDispItem = this.dispatch.DispatchItems[index];
    if (selectedDispItem.selectedItem != null && selectedDispItem.ItemId == selectedDispItem.selectedItem.ItemId) return;
    if (selectedDispItem.selectedItem == null) return;
    if (typeof (selectedDispItem.selectedItem) == "string") {
      selectedDispItem.selectedItem = this.stockList.find(a => a.ItemName == selectedDispItem.selectedItem && a.BatchNo == selectedDispItem.BatchNo);
    }
    if (typeof (selectedDispItem.selectedItem) == "object") {
      let checkIsItemPresent = false;
      //means to avoid duplication of item
      for (var i = 0; i < this.dispatch.DispatchItems.length; i++) {
        if (this.dispatch.DispatchItems[i].ItemId == selectedDispItem.ItemId && index != i) {
          checkIsItemPresent = true;
        }
      }
      if (checkIsItemPresent == true) {
        this.messageBoxService.showMessage("notice-message", [selectedDispItem.ItemName + " is already added. Please Check!"]);
        this.dispatch.DispatchItems.splice(index, 1);
        this.addNewRow(index);
      }
      else {
        selectedDispItem.ItemId = selectedDispItem.selectedItem.ItemId;
        selectedDispItem.ItemName = selectedDispItem.selectedItem.ItemName;
        selectedDispItem.ItemCode = selectedDispItem.selectedItem.ItemCode;
        selectedDispItem.ItemUOM = selectedDispItem.selectedItem.ItemUOM;
        selectedDispItem.BatchNo = selectedDispItem.selectedItem.BatchNo;
        selectedDispItem.AvailableQuantity = selectedDispItem.selectedItem.AvailableQuantity;
        selectedDispItem.CostPrice = selectedDispItem.selectedItem.CostPrice;
        selectedDispItem.BarCodeList = selectedDispItem.selectedItem.BarCodeList;
        selectedDispItem.IsFixedAsset = selectedDispItem.selectedItem.IsFixedAsset;
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
  onBarcodeChanged($event: IDispatchableAsset[], index: number) {
    this.dispatch.DispatchItems[index].DispatchedAssets = $event.map(a => new MAP_Dispatch_FixedAsset(a.StockId));
    this.dispatch.DispatchItems[index].DispatchedQuantity = $event.length;
  }
  postDirectDispatch() {
    let errorMessages: string[] = [];
    let formValidity: boolean = true;
    if (this.dispatchDate === null) {
      this.messageBoxService.showMessage('Failed', ['Please select valid date']);
      return;
    }
    if (this.loading == true) return;
    this.loading = true;
    for (let x in this.dispatchForm.controls) {
      this.dispatchForm.controls[x].markAsTouched();
      this.dispatchForm.controls[x].updateValueAndValidity();
      if (this.dispatchForm.controls[x].invalid) {
        errorMessages.push(`${x} is invalid.`);
        formValidity = false;
      }
    }
    for (let i = 0; i < this.dispatch.DispatchItems.length; i++) {
      for (let x in this.dispatch.DispatchItems[i].DispatchItemValidator.controls) {
        this.dispatch.DispatchItems[i].DispatchItemValidator.controls[x].markAsTouched();
        this.dispatch.DispatchItems[i].DispatchItemValidator.controls[x].updateValueAndValidity();
        if (this.dispatch.DispatchItems[i].DispatchItemValidator.controls[x].invalid) {
          errorMessages.push(`${x} is invalid for item no. ${i + 1}.`);
          formValidity = false;
        }
      }
    }

    if (formValidity == true && this.dispatch.DispatchItems != null) {
      this.dispatch.DispatchItems.forEach(item => {
        item.DispatchedDate = `${moment(this.dispatchDate).format("YYYY-MM-DD")} ${moment().format("HH:mm:ss.SSS")}`;
        item.SourceStoreId = this.activeInventoryService.activeInventory.StoreId;
        item.TargetStoreId = this.selectedStore.StoreId;
        item.Remarks = this.dispatchForm.get('remarks').value;
        item.ReceivedBy = this.dispatchForm.get('receivedBy').value;
        item.ReqDisGroupId = this.selectedStore.ReqDisGroupId;
      })
      this.dispatch.ReqDisGroupId = this.selectedStore.ReqDisGroupId;
      this.dispatch.TargetStoreId = this.selectedStore.StoreId;
      this.dispatch.SourceStoreId = this.activeInventoryService.activeInventory.StoreId;
      this.dispatch.Remarks = this.dispatchForm.get('remarks').value;
      this.inventoryBLService.PostDirectDispatch(this.dispatch, this.fromRoute.RouteFrom).
        finally(() => this.loading = false).
        subscribe(res => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            let result = res.Results;
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["Requisition is Generated and Saved"]);
            this.changeDetectorRef.detectChanges();
            this.fromRoute.RouteFrom = null;
            this.inventoryService.GoodsReceiptId = 0;

            this.inventoryService.DispatchId = result.DispatchId;
            this.inventoryService.RequisitionId = result.RequisitionId;
            this.inventoryService.StoreName = this.activeInventoryService.activeInventory.Name;
            this.showDispatchDetailsPopup = true;
          }
          else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['failed to add Requisition.. please check log for details.']);
            console.log(res.ErrorMessage);
            this.router.navigate(['/Inventory/InternalMain/Requisition/RequisitionList']);
          }
        }, err => {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['failed to add Requisition.. please check log for details.']);
          console.log(err.ErrorMessage);
          this.router.navigate(['/Inventory/InternalMain/Requisition/RequisitionList']);
        }, () => {
          this.loading = false;
        });
    }
    else {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, errorMessages);
      this.loading = false;
    }
  }
  discardChanges() {
    this.dispatch = new Dispatch();
    this.dispatch.DispatchItems = new Array<DispatchItems>();
    this.dispatchForm.reset();
    this.router.navigate(['/Inventory/InternalMain/Requisition/RequisitionList']);
  }
  storeListFormatter(data: any): string {
    return data["Name"];
  }
  ////used to format display item in ng-autocomplete
  stockListFormatter(data: any): string {
    let html = "<font color='blue'; size=03 >" + data["ItemName"] + "</font>";
    html += (data["Description"] == null || data["Description"] == "") ? "" : (" | " + data["Description"]);
    html += (data["BatchNo"] == null || data["BatchNo"] == "") ? "" : (" | B: " + data["BatchNo"]);
    return html;
  }

  onPressedEnterKeyInItemField(index: number) {
    if (this.dispatch.DispatchItems[index].ItemId == null) {
      this.deleteRow(index);
      this.setFocusById('remarks');
    }
    else {
      // this.setFocusById('qtyip' + index);
      this.setFocusById('specification' + index);
    }
  }
  GoToQtyField(index: number) {
    this.setFocusById('qtyip' + index);

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


  getCurrentFiscalYearId() {
    return this.inventoryService.allFiscalYearList.find(fy => moment(this.currentDate).isBetween(fy.StartDate, fy.EndDate, null, '[]')).FiscalYearId;
  }

  public get isDispatchedDateValid() {
    return this.inventoryService.allFiscalYearList.some(fy => (fy.IsClosed == null || fy.IsClosed == false) && moment(this.dispatchForm.get('dispatchDate').value).isBetween(fy.StartDate, fy.EndDate, null, '[]')) as Boolean;
  }

  LoadGRItemToDispatch() {
    if (this.inventoryService.GoodsReceiptId > 0 && this.fromRoute.RouteFrom == 'GRToDispatch') {
      this.inventoryBLService.GetGRItemsWithAvailableQtyByGRId(this.inventoryService.GoodsReceiptId).subscribe(res => {
        if (res.Status == "OK") {
          this.GRItems = res.Results;
          for (let i = 0; i <= this.GRItems.length - 1; i++) {
            this.DispatchItem = new DispatchItems();
            this.GRDispatchItems.push(this.DispatchItem);
          }
          this.GRDispatchItems.forEach((itm, i) => {
            itm.ItemId = this.GRItems[i].ItemId;
            itm.selectedItem = this.GRItems[i].selectedItem;
            itm.ItemUOM = this.GRItems[i].ItemUOM;
            itm.ItemCategory = this.GRItems[i].ItemCategory;
            itm.AvailableQuantity = this.GRItems[i].AvailableQuantity;
            itm.DispatchedQuantity = this.GRItems[i].AvailableQuantity;
            itm.StoreStockId = this.GRItems[i].StoreStockId;
          });
          this.dispatch.DispatchItems = this.GRDispatchItems;
        }
      })
    }
  }
  ngOnDestroy() {
    this.fromRoute.RouteFrom = null;
    this.inventoryService.GoodsReceiptId = 0;
  }
  OnFiscalYearDateChange($event) {
    this.dispatchDate = $event ? $event.selectedDate : null;
  }
  GetInventoryFieldCustomization(): void {
    let parameter = this.inventoryFieldCustomizationService.GetInventoryFieldCustomization();
    this.showSpecification = parameter.showSpecification;
    this.showBarcode = parameter.showBarcode;
  }

  CallBackDispatchDetailsPopUpClose() {
    this.showDispatchDetailsPopup = false;
    this.router.navigate(['/Inventory/InternalMain/Requisition/RequisitionList']);
  }
}