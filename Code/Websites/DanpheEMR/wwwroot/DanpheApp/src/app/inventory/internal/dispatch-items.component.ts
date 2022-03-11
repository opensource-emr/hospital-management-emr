import { Component, ChangeDetectorRef, AfterViewInit } from '@angular/core'
import { Router } from '@angular/router'
import { RouteFromService } from "../../shared/routefrom.service"
import { InventoryBLService } from "../shared/inventory.bl.service"
import { SecurityService } from '../../security/shared/security.service';
import { InventoryService } from '../shared/inventory.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { DispatchItems } from "../shared/dispatch-items.model"
import { RequisitionStockVMModel } from "../shared/requisition-stock-vm.model"
import * as moment from 'moment/moment';
import { CoreService } from '../../core/shared/core.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { PHRMStoreModel } from '../../pharmacy/shared/phrm-store.model';
import { ActivateInventoryService } from '../../shared/activate-inventory/activate-inventory.service';



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
  model: Array<DispatchItems> = new Array<DispatchItems>();
  requisitionStockVM: RequisitionStockVMModel = new RequisitionStockVMModel();
  currentActiveInventory: PHRMStoreModel;
  constructor(public routeFrom: RouteFromService, public coreService: CoreService, private _activeInvService: ActivateInventoryService, public InventoryBLService: InventoryBLService, public securityService: SecurityService, public inventoryService: InventoryService, public changeDetectorRef: ChangeDetectorRef, public messageBoxService: MessageboxService, public router: Router) {
    this.currentActiveInventory = _activeInvService.activeInventory
  }
  ngOnInit() {
    this.Load(this.inventoryService.RequisitionId);
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
        currDispatchItem.DispatchedQuantity = currDispatchItem.RequiredQuantity;
        currDispatchItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        currDispatchItem.TargetStoreId = this.requisitionStockVM.requisition.RequestFromStoreId;
        currDispatchItem.SourceStoreId = this.currentActiveInventory.StoreId;
        currDispatchItem.RequisitionId = this.inventoryService.RequisitionId;
        this.model.push(currDispatchItem);
        this.setFocusById('dispatchQty0');
      }
    }
    else {
      this.messageBoxService.showMessage("notice-message", ["Requisition is not Authorized or Created !"]);

    }
  }

  FilterDispatchItems() {
    this.requisitionStockVM.dispatchItems = new Array<DispatchItems>();
    this.requisitionStockVM.dispatchItems = this.model.filter(a => a.DispatchedQuantity > 0 && a.isActive == true);
  }
  //POST: Dispatch Items and Save to database
  SaveDispatchItems() {
    if (this.isDispatchAllowed == false && (!this.Remarks || this.Remarks.trim() == '')) {
      this.messageBoxService.showMessage("failed", ["Remarks is compulsory for dispatch without verification."]);
    }
    else if (this.model.some(item => item.isActive == true && item.DispatchedQuantity == 0)) {
      this.messageBoxService.showMessage("failed", ["Some items have zero quantity. Please uncheck them."]);
    }
    else {
      this.loading = true;
      this.FilterDispatchItems();
      if (this.requisitionStockVM.dispatchItems != null) {
        let DisQtyCounter: number = 0;//Checking Dispatched quantity is greater than 0 or not
        //Validation
        let CheckIsValid = true;
        for (var i = 0; i < this.requisitionStockVM.dispatchItems.length; i++) {
          for (var x in this.requisitionStockVM.dispatchItems[i].DispatchItemValidator.controls) {
            this.requisitionStockVM.dispatchItems[i].DispatchItemValidator.controls[x].markAsDirty();
            this.requisitionStockVM.dispatchItems[i].DispatchItemValidator.controls[x].updateValueAndValidity();
          }
          //This is for check every item from dispatch is valid or not (dispatch is Array)
          if (this.requisitionStockVM.dispatchItems[i].IsValidCheck(undefined, undefined) == false) { CheckIsValid = false; }

          //for checking Dispatched quantity is less than required quantity and Available quantity
          if ((this.requisitionStockVM.dispatchItems[i].AvailableQuantity < this.requisitionStockVM.dispatchItems[i].DispatchedQuantity) || (this.requisitionStockVM.dispatchItems[i].RequiredQuantity < this.requisitionStockVM.dispatchItems[i].DispatchedQuantity)) {
            this.messageBoxService.showMessage("notice-message", ["Dispatch Items must be less than Required and Available Quantity !"]);
            this.requisitionStockVM.dispatchItems[i].IsDisQtyValid = false;
            CheckIsValid = false;
          }

        }

        //Validation Pass then Dispatch and Save
        if (CheckIsValid) {
          this.requisitionStockVM.dispatchItems.forEach(d => d.ReqDisGroupId = this.currentActiveInventory.INV_ReqDisGroupId);
          this.InventoryBLService.PostToDispatchItems(this.requisitionStockVM.dispatchItems)
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
    if (this.model[index].DispatchedQuantity > this.model[index].AvailableQuantity) {
      row.IsDisQtyValid = false;
    }
    else if (this.model[index].DispatchedQuantity > this.model[index].RequiredQuantity) {
      row.IsDisQtyValid = false;

    } else { row.IsDisQtyValid = true; }

  }
  logError(err: any) {
    console.log(err);
  }
  //Cancel dispatching material and  navigate to Requisition list page
  Cancel() {
    this.model = new Array<DispatchItems>();
    this.requisitionStockVM = new RequisitionStockVMModel();
    this.router.navigate(['/Inventory/InternalMain/Requisition/RequisitionList']);
  }

  //Navigate to Dispatch Receipt
  RouteToDispatchReceipt() {
    this.requisitionStockVM = new RequisitionStockVMModel();
    this.model = new Array<DispatchItems>();
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
    this.model.forEach(a => {
      a.isActive = this.selectedAll;
      a.DispatchedQuantity = a.isActive ? a.RequiredQuantity : 0;
    });
  }
  checkIfAllSelected(index) {
    this.selectedAll = this.model.every(a => a.isActive == true);
    if (this.model[index].isActive == false) {
      this.model[index].DispatchedQuantity = 0;
    }
    else {
      this.model[index].DispatchedQuantity = this.model[index].RequiredQuantity;
    }
    this.CheckAvailableQuantity(this.model[index], index);
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
}
