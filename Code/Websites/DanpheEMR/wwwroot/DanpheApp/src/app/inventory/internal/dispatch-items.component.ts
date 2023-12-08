import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment/moment';
import { CoreService } from '../../core/shared/core.service';
import { PHRMStoreModel } from '../../pharmacy/shared/phrm-store.model';
import { SecurityService } from '../../security/shared/security.service';
import { ActivateInventoryService } from '../../shared/activate-inventory/activate-inventory.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { InventoryFieldCustomizationService } from '../../shared/inventory-field-customization.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { RouteFromService } from "../../shared/routefrom.service";
import { DispatchItems, IDispatchableAsset, MAP_Dispatch_FixedAsset } from "../shared/dispatch-items.model";
import { Dispatch } from '../shared/dispatch.model';
import { InventoryBLService } from "../shared/inventory.bl.service";
import { InventoryService } from '../shared/inventory.service';
import { RequisitionStockVMModel } from "../shared/requisition-stock-vm.model";



@Component({ templateUrl: "./dispatch-items.html" })
export class DispatchItemsComponent {
  selectedAll: boolean = true;
  //its requisition dispatch component
  loading: boolean = false;
  isDispatchAllowed: boolean = true;
  StoreName: string = "";
  ReceivedBy: string = "";
  Remarks: string = "";
  RequestedOn: string = "";
  //model: Array<DispatchItems> = new Array<DispatchItems>();
  Dispatch: Dispatch = new Dispatch();
  requisitionStockVM: RequisitionStockVMModel = new RequisitionStockVMModel();
  currentActiveInventory: PHRMStoreModel;
  selectedBarCodeNumber: any;
  showBarcode: boolean = false;
  constructor(public routeFrom: RouteFromService, public coreService: CoreService, private _activeInvService: ActivateInventoryService, public InventoryBLService: InventoryBLService, public securityService: SecurityService, public inventoryService: InventoryService, public changeDetectorRef: ChangeDetectorRef, public messageBoxService: MessageboxService, public router: Router, public inventoryFieldCustomizationService: InventoryFieldCustomizationService) {
    this.currentActiveInventory = _activeInvService.activeInventory
  }
  ngOnInit() {
    this.Load(this.inventoryService.RequisitionId);
    this.GetInventoryFieldCustomization();
  }
  //Get Requisition and Requisition Items for Dispatch
  Load(RequisitionId: number) {
    if (RequisitionId != null && RequisitionId != 0) {
      this.CheckIfDispatchAllowed();
      this.StoreName = this.inventoryService.StoreName;//sud:3Mar'20-changed propertyname.
      this.RequestedOn = moment(this.inventoryService.RequestedOn).format('YYYY-MM-DD');
      this.InventoryBLService.GetRequisitionWithRItemsById(RequisitionId)
        .subscribe(res => this.LoadRequisitionDataForDispatch(res));
    }
  }

  private CheckIfDispatchAllowed() {
    this.isDispatchAllowed = this.inventoryService.isDispatchAllowed;
    if (this.isDispatchAllowed == false) {
      var dispatchVerificationSetting = this.coreService.Parameters.find(a => a.ParameterGroupName == "Inventory" && a.ParameterName == "AllowSubstoreDispatchWithoutVerification").ParameterValue;
      if (dispatchVerificationSetting == true || (typeof (dispatchVerificationSetting) == "string" && dispatchVerificationSetting == "true")) {
        this.messageBoxService.showMessage("Warning", ["Remarks is mandatory for dispatch without verification"]);
      }
      else {
        this.messageBoxService.showMessage("Failed", ["Dispatch before verification is forbidden."]);
        this.router.navigate([this.routeFrom.RouteFrom]);
        this.routeFrom.RouteFrom = null;
      }
    }
  }

  //Load all requisition Items and assign to DispatchItems model
  LoadRequisitionDataForDispatch(res) {
    if (res.Status == "OK") {
      this.requisitionStockVM = res.Results;
      this.requisitionStockVM.requisition.RequisitionItems = this.requisitionStockVM.requisition.RequisitionItems.filter(RI => RI.IsActive == true);
      for (var r = 0; r < this.requisitionStockVM.requisition.RequisitionItems.length; r++) {
        var currDispatchItem = new DispatchItems();
        currDispatchItem.ItemId = this.requisitionStockVM.requisition.RequisitionItems[r].ItemId;
        currDispatchItem.RequisitionItemId = this.requisitionStockVM.requisition.RequisitionItems[r].RequisitionItemId;
        //currDispatchItem.RequiredQuantity = this.requisitionStockVM.requisition.RequisitionItems[r].Quantity - this.requisitionStockVM.requisition.RequisitionItems[r].ReceivedQuantity;
        currDispatchItem.RequiredQuantity = this.requisitionStockVM.requisition.RequisitionItems[r].PendingQuantity;
        currDispatchItem.AvailableQuantity = this.requisitionStockVM.requisition.RequisitionItems[r].AvailableQuantity;
        currDispatchItem.ItemName = this.requisitionStockVM.requisition.RequisitionItems[r].Item.ItemName;
        currDispatchItem.DispatchedQuantity = 0;
        currDispatchItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        currDispatchItem.TargetStoreId = this.requisitionStockVM.requisition.RequestFromStoreId;
        currDispatchItem.SourceStoreId = this.currentActiveInventory.StoreId;
        currDispatchItem.RequisitionId = this.inventoryService.RequisitionId;
        currDispatchItem.ItemCategory = this.requisitionStockVM.requisition.RequisitionItems[r].ItemCategory;
        currDispatchItem.BarCodeList = this.requisitionStockVM.requisition.RequisitionItems[r].BarCodeList;
        currDispatchItem.IsFixedAsset = this.requisitionStockVM.requisition.RequisitionItems[r].Item.IsFixedAssets;
        this.Dispatch.DispatchItems.push(currDispatchItem);
        this.setFocusById('dispatchQty0');
      }
      this.Dispatch.RequisitionId = this.requisitionStockVM.requisition.RequisitionId;
      this.Dispatch.SourceStoreId = this.currentActiveInventory.StoreId;
      this.Dispatch.TargetStoreId = this.requisitionStockVM.requisition.RequestFromStoreId;
    }
    else {
      this.messageBoxService.showMessage("notice-message", ["Requisition is not Authorized or Created !"]);

    }
  }

  onBarcodeChanged($event: IDispatchableAsset[], index: number) {
    this.Dispatch.DispatchItems[index].DispatchedAssets = $event.map(a => new MAP_Dispatch_FixedAsset(a.StockId));
    this.Dispatch.DispatchItems[index].DispatchedQuantity = $event.length;
  }

  FilterDispatchItems() {
    this.Dispatch.DispatchItems = this.Dispatch.DispatchItems.filter(a => a.DispatchedQuantity > 0 && a.isActive == true);
  }
  //POST: Dispatch Items and Save to database
  SaveDispatchItems() {
    if (this.isDispatchAllowed == false && (!this.Remarks || this.Remarks.trim() == '')) {
      this.messageBoxService.showMessage("failed", ["Remarks is compulsory for dispatch without verification."]);
    }
    else if (this.Dispatch.DispatchItems.some(item => item.isActive == true && item.DispatchedQuantity == 0)) {
      this.messageBoxService.showMessage("failed", ["Some items have zero quantity. Please uncheck them."]);
    }
    else {
      this.loading = true;
      this.FilterDispatchItems();
      if (this.Dispatch.DispatchItems != null) {
        let CheckIsValid = true;
        for (var i = 0; i < this.Dispatch.DispatchItems.length; i++) {
          for (var x in this.Dispatch.DispatchItems[i].DispatchItemValidator.controls) {
            this.Dispatch.DispatchItems[i].DispatchItemValidator.controls[x].markAsDirty();
            this.Dispatch.DispatchItems[i].DispatchItemValidator.controls[x].updateValueAndValidity();
          }
          //This is for check every item from dispatch is valid or not (dispatch is Array)
          if (this.Dispatch.DispatchItems[i].IsValidCheck(undefined, undefined) == false) { CheckIsValid = false; }

          //for checking Dispatched quantity is less than required quantity and Available quantity
          if ((this.Dispatch.DispatchItems[i].AvailableQuantity < this.Dispatch.DispatchItems[i].DispatchedQuantity) || (this.Dispatch.DispatchItems[i].RequiredQuantity < this.Dispatch.DispatchItems[i].DispatchedQuantity)) {
            this.messageBoxService.showMessage("notice-message", ["Dispatch Items must be less than Required and Available Quantity !"]);
            this.Dispatch.DispatchItems[i].IsDisQtyValid = false;
            CheckIsValid = false;
          }
          if (this.Dispatch.DispatchItems[i].IsFixedAsset == true) {
            if (this.Dispatch.DispatchItems[i].DispatchedAssets.length == 0) {
              this.messageBoxService.showMessage('error', ["Please select barcode number for capital fixed assest"]);
              return;
            }
          }

        }

        //Validation Pass then Dispatch and Save
        if (CheckIsValid) {
          this.Dispatch.Remarks = this.Remarks;
          this.Dispatch.DispatchItems.forEach(itm => {
            itm.Remarks = this.Remarks;
            itm.ReqDisGroupId = this.currentActiveInventory.INV_ReqDisGroupId;
          });
          this.InventoryBLService.PostToDispatchItems(this.Dispatch)
            .subscribe(
              (res: DanpheHTTPResponse) => {
                this.loading = false;

                if (res.Status == "OK") {
                  this.inventoryService.DispatchId = res.Results;
                  this.messageBoxService.showMessage("success", ["Dispatch Items detail Saved."]);
                  this.RouteToDispatchReceipt();
                }
                else {
                  this.messageBoxService.showMessage("failed", [res.ErrorMessage.split('Exception')[0]]);
                }
              },
              err => {
                this.loading = false,
                  this.logError(err);

              });
        } else { this.loading = false; this.messageBoxService.showMessage("notice-message", ['Enter Valid Dispatch Quantity']); }
      }
      else {
        this.loading = false;
        this.messageBoxService.showMessage("notice-message", ["Add Item ...Before Requesting"]);
      }
    }
  }

  //Checking Dispatch Quantity must be < Available Quantity
  CheckAvailableQuantity(row: DispatchItems, index) {
    if (this.Dispatch.DispatchItems[index].DispatchedQuantity > this.Dispatch.DispatchItems[index].AvailableQuantity) {
      row.IsDisQtyValid = false;
    }
    else if (this.Dispatch.DispatchItems[index].DispatchedQuantity > this.Dispatch.DispatchItems[index].RequiredQuantity) {
      row.IsDisQtyValid = false;

    } else { row.IsDisQtyValid = true; }

  }
  logError(err: any) {
    console.log(err);
  }
  //Cancel dispatching material and  navigate to Requisition list page
  Cancel() {
    this.Dispatch.DispatchItems = new Array<DispatchItems>();
    this.requisitionStockVM = new RequisitionStockVMModel();
    this.router.navigate(['/Inventory/InternalMain/Requisition/RequisitionList']);
  }

  //Navigate to Dispatch Receipt
  RouteToDispatchReceipt() {
    this.requisitionStockVM = new RequisitionStockVMModel();
    this.Dispatch.DispatchItems = new Array<DispatchItems>();
    this.router.navigate(['/Inventory/InternalMain/Requisition/DispatchReceiptDetails']);

  }

  GoToNextInput(currRowNum: string) {
    let nextRow = currRowNum + 1;
    let idToSelect = 'dispatchQty' + nextRow;
    if (document.getElementById(idToSelect)) {
      let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
      nextEl.focus();
      nextEl.select();
    }
  }
  ToogleAllDispatchItems() {
    this.Dispatch.DispatchItems.forEach(a => {
      a.isActive = this.selectedAll;
      a.DispatchedQuantity = 0;
    });
  }
  checkIfAllSelected(index) {
    this.selectedAll = this.Dispatch.DispatchItems.every(a => a.isActive == true);
    if (this.Dispatch.DispatchItems[index].isActive == false) {
      this.Dispatch.DispatchItems[index].DispatchedQuantity = 0;
    }
    else {
      this.Dispatch.DispatchItems[index].DispatchedQuantity = 0;
    }
    this.CheckAvailableQuantity(this.Dispatch.DispatchItems[index], index);
  }

  setFocusById(targetId: string, waitingTimeinMS: number = 10) {
    var timer = window.setTimeout(function () {
      let htmlObject = document.getElementById(targetId);
      if (htmlObject) {
        htmlObject.focus();
      }
      else if (!htmlObject) {
        targetId = 'remarks';
        let htmlObject = document.getElementById(targetId);
        if (htmlObject) {
          htmlObject.focus();
        }
      }
      clearTimeout(timer);
    }, waitingTimeinMS);
  }
  GetInventoryFieldCustomization(): void {
    let parameter = this.inventoryFieldCustomizationService.GetInventoryFieldCustomization();
    this.showBarcode = parameter.showBarcode;
  }
}
