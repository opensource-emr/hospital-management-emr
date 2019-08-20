import { Component, ChangeDetectorRef } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router'

import { RouteFromService } from "../../shared/routefrom.service"
import { InventoryBLService } from "../shared/inventory.bl.service"
import { SecurityService } from '../../security/shared/security.service';
import { InventoryService } from '../shared/inventory.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';

import { DispatchItems } from "../shared/dispatch-items.model"
import { StockTransaction } from "../shared/stock-transaction.model"
import { RequisitionStockVMModel } from "../shared/requisition-stock-vm.model"



@Component({

  templateUrl: "../../view/inventory-view/DispatchItems.html"  //"/InventoryView/DispatchItems"

})
export class DispatchItemsComponent {
  //its requisition dispatch component
  constructor(
    public routeFrom: RouteFromService,
    public InventoryBLService: InventoryBLService,
    public securityService: SecurityService,
    public inventoryService: InventoryService,
    public changeDetectorRef: ChangeDetectorRef,
    public messageBoxService: MessageboxService,
    public router: Router) {
    this.Load(this.inventoryService.Id);
  }
  loading: boolean = false;
  onStockShow: boolean = false;
  DepartmentName: string = "";
  msgBoxString: string = "";
  public ReceivedBy: string = "";
  public model: Array<DispatchItems> = new Array<DispatchItems>();
  public requisitionStockVM: RequisitionStockVMModel = new RequisitionStockVMModel();

  //Get Requisition and Requisition Items for Dispatch
  Load(RequisitionId: number) {
    if (RequisitionId != null && RequisitionId != 0) {
      this.DepartmentName = this.inventoryService.Name;
      this.InventoryBLService.GetRequisitionWithRItemsById(RequisitionId)
        .subscribe(res => this.LoadRequisitionDataForDispatch(res));
    }
  }

  //Load all requisition Items and assign to DispatchItems model
  LoadRequisitionDataForDispatch(res) {
    if (res.Status == "OK") {
      this.requisitionStockVM = res.Results;
      for (var r = 0; r < this.requisitionStockVM.requisition.RequisitionItems.length; r++) {
        var currDispatchItem = new DispatchItems();
        currDispatchItem.ItemId = this.requisitionStockVM.requisition.RequisitionItems[r].ItemId;
        currDispatchItem.DepartmentId = this.requisitionStockVM.requisition.DepartmentId;
        currDispatchItem.RequisitionItemId = this.requisitionStockVM.requisition.RequisitionItems[r].RequisitionItemId;
        currDispatchItem.RequiredQuantity = this.requisitionStockVM.requisition.RequisitionItems[r].Quantity - this.requisitionStockVM.requisition.RequisitionItems[r].ReceivedQuantity;
        currDispatchItem.AvailableQuantity = this.AvalablbleQty(this.requisitionStockVM.requisition.RequisitionItems[r].ItemId);
        currDispatchItem.ItemName = this.requisitionStockVM.requisition.RequisitionItems[r].Item.ItemName;
        currDispatchItem.DispatchedQuantity = currDispatchItem.RequiredQuantity;
        currDispatchItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        this.model.push(currDispatchItem);
      }
    }
    else {
      this.messageBoxService.showMessage("notice-message", ["Requisition is not Authorized or Created !"]);

    }
  }

  //Making requisitionStockVM object for Post with Requisition, RequisitonItems, Stock, StockTransaction,DispatchItems
  //Because we only do One post of requisitionStockVM and POSt, PUT operation done by Server side in One transaction
  DispatchItemsTransaction() {
    let disQty = 0;
    let dItemId = 0;
    //This loop only for Stock Transaction and Stock 
    for (var dI = 0; dI < this.model.length; dI++) {//RequisitionItems.length
      dItemId = this.model[dI].ItemId;
      disQty = this.model[dI].DispatchedQuantity;
      this.model[dI].ReceivedBy = this.ReceivedBy;
      let currDisQty = 0;
      let globalCurrQty = 0;
      let globaldisQty = disQty;
      if (disQty > 0) {
        for (var stk = 0; stk < this.requisitionStockVM.stock.length; stk++) {
          if (dItemId == this.requisitionStockVM.stock[stk].ItemId) {
            if (globaldisQty != globalCurrQty) {
              var currStkTransaction: StockTransaction = new StockTransaction();
              if (this.requisitionStockVM.stock[stk].ItemId == dItemId) {
                if (this.requisitionStockVM.stock[stk].AvailableQuantity >= disQty) {
                  currDisQty = disQty;
                  globalCurrQty = globalCurrQty + disQty;
                  this.requisitionStockVM.stock[stk].AvailableQuantity = this.requisitionStockVM.stock[stk].AvailableQuantity - disQty;
                  currStkTransaction.Quantity = disQty;
                  currStkTransaction.StockId = this.requisitionStockVM.stock[stk].StockId;
                  currStkTransaction.InOut = "out";
                  currStkTransaction.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                  currStkTransaction.TransactionType = "dispatch";
                  //break;
                }
                else if (this.requisitionStockVM.stock[stk].AvailableQuantity < disQty) {
                  currDisQty = this.requisitionStockVM.stock[stk].AvailableQuantity;
                  let temp = disQty;
                  disQty = temp - currDisQty;
                  globalCurrQty = globalCurrQty + currDisQty;
                  this.requisitionStockVM.stock[stk].AvailableQuantity = this.requisitionStockVM.stock[stk].AvailableQuantity - currDisQty;
                  currStkTransaction.Quantity = currDisQty;
                  currStkTransaction.StockId = this.requisitionStockVM.stock[stk].StockId;
                  currStkTransaction.InOut = "out";
                  currStkTransaction.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                  currStkTransaction.TransactionType = "dispatch";
                }
                this.requisitionStockVM.stockTransactions.push(currStkTransaction);
              }
            }
          }
        }
      }

    }

    //Update Received and Pending Quantity for Each Requisition Item
    for (var i = 0; i < this.requisitionStockVM.requisition.RequisitionItems.length; i++) {
      this.requisitionStockVM.requisition.RequisitionItems[i].ReceivedQuantity = this.model[i].DispatchedQuantity + this.requisitionStockVM.requisition.RequisitionItems[i].ReceivedQuantity;
      let pendingQty = this.requisitionStockVM.requisition.RequisitionItems[i].Quantity - this.requisitionStockVM.requisition.RequisitionItems[i].ReceivedQuantity;
      if (pendingQty > 0) {
        this.requisitionStockVM.requisition.RequisitionItems[i].PendingQuantity = pendingQty;
      }
      else {
        this.requisitionStockVM.requisition.RequisitionItems[i].PendingQuantity = 0;
      }

    }

    let checkRStatus = true;
    //Update Status of Every Requisition Item
    for (var i = 0; i < this.requisitionStockVM.requisition.RequisitionItems.length; i++) {
      if (this.requisitionStockVM.requisition.RequisitionItems[i].ReceivedQuantity > 0 && this.requisitionStockVM.requisition.RequisitionItems[i].PendingQuantity == 0) {
        this.requisitionStockVM.requisition.RequisitionItems[i].RequisitionItemStatus = 'complete';
      }
      else {
        this.requisitionStockVM.requisition.RequisitionItems[i].RequisitionItemStatus = 'partial';
        checkRStatus = false;
      }


    }
    //Update Requisition Status
    if (checkRStatus) {
      this.requisitionStockVM.requisition.RequisitionStatus = 'complete';
    }
    //Push model data into RequisitionStockVM for single POST
    for (var ItemIndex = 0; ItemIndex < this.model.length; ItemIndex++) {
      this.requisitionStockVM.dispatchItems.push(this.model[ItemIndex]);
    }
    //Ramavtar : start 04Jan2018 : filtering dispatch items with 0 dispatched quantities
    for (var i = 0; i < this.requisitionStockVM.dispatchItems.length; i++) {
      if (this.requisitionStockVM.dispatchItems[i].DispatchedQuantity == 0) {
        this.requisitionStockVM.dispatchItems.splice(i, 1);
        i--;
      }
    }

  }

  //POST: Dispatch Items and Save to database
  SaveDispatchItems() {
    this.DispatchItemsTransaction();
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
        if ((this.requisitionStockVM.dispatchItems[i].AvailableQuantity < this.requisitionStockVM.dispatchItems[i].DispatchedQuantity)
          || (this.requisitionStockVM.dispatchItems[i].RequiredQuantity < this.requisitionStockVM.dispatchItems[i].DispatchedQuantity)) {

          this.messageBoxService.showMessage("notice-message", ["Dispatch Items must less than Required and Available Quantity !"]);
          this.requisitionStockVM.dispatchItems[i].IsDisQtyValid = false;
          CheckIsValid = false;
        }

        //Check for all record is 0 or not , if all values are zero then record not will be dispatch
        if (this.requisitionStockVM.dispatchItems[i].DispatchedQuantity == 0) { DisQtyCounter++; }

      }

      //Validation Pass then Dispatch and Save
      if (CheckIsValid && (this.requisitionStockVM.dispatchItems.length != DisQtyCounter)) {
        this.loading = true;
        this.InventoryBLService.PostToDispatchItems(this.requisitionStockVM)
          .subscribe(
            res => {
              this.CallBackSaveDispatchItems(res),
                this.loading = false;
            },
            err => {
              this.loading = false,
                this.logError(err);

            });
      } else { this.messageBoxService.showMessage("notice-message", ['Enter Valid Dispatch Quantity']); }
    }
    else {

      this.messageBoxService.showMessage("notice-message", ["Add Item ...Before Requesting"]);
    }
  }

  //call after Dispatch Items transaction completed with Status OK
  CallBackSaveDispatchItems(res) {
    if (res.Status == "OK") {
      this.messageBoxService.showMessage("success", ["Dispatch Items detail Saved."]);
      this.CallRoute();
    }
    else {
      err => {
        this.messageBoxService.showMessage("failed", ["failed to add result.. please check log for details."]);
        this.logError(err.ErrorMessage);
      }
    }
  }

  //Checking Dispatch Quantity must be < Available Quantity
  CheckAvailableQuantity(row: DispatchItems, index) {
    if (this.model[index].DispatchedQuantity > this.model[index].AvailableQuantity) {
      this.messageBoxService.showMessage("notice-message", ["More Items not available in Stock."]);
      row.IsDisQtyValid = false;
    }
    else if (this.model[index].DispatchedQuantity > this.model[index].RequiredQuantity) {
      this.messageBoxService.showMessage("notice-message", ["Not More Quantity Dispatched Than required"]);
      row.IsDisQtyValid = false;

    } else { row.IsDisQtyValid = true; }

  }


  //This method only for get Item Id and check that perticular Item available quantity in  stock list
  //sum of Available quantity against ItemId
  AvalablbleQty(itemId: number): number {
    let availableQty = 0;
    for (var i = 0; i < this.requisitionStockVM.stock.length; i++) {
      if (this.requisitionStockVM.stock[i].ItemId == itemId) {
        availableQty = availableQty + this.requisitionStockVM.stock[i].AvailableQuantity;
      }
    }
    return availableQty;
  }

  logError(err: any) {
    console.log(err);
  }
  //Cancel dispatching material and  navigate to Requisition list page
  Cancel() {
    this.model = new Array<DispatchItems>();
    this.requisitionStockVM = new RequisitionStockVMModel();
    this.router.navigate(['/Inventory/InternalMain/RequisitionList']);
  }

  //Navigate to Requisition List
  CallRoute() {
    this.requisitionStockVM = new RequisitionStockVMModel();
    this.model = new Array<DispatchItems>();
    this.router.navigate(['/Inventory/InternalMain/RequisitionList']);
  }

}
