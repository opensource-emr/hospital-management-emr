import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { SecurityService } from '../../../security/shared/security.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RouteFromService } from "../../../shared/routefrom.service";
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import { PharmacyService } from '../../shared/pharmacy.service';
import { PHRMStoreDispatchItems } from "../../shared/phrm-store-dispatch-items.model";
import { DispatchItemDto, DispatchItemModel, RequisitionForDispatchModel } from './phrm-requisition-for-dispatch-vm.model';
@Component({

      templateUrl: "./phrm-store-dispatch-items.component.html"

})
export class PHRMStoreDispatchItemsComponent {
      requisition: RequisitionForDispatchModel = new RequisitionForDispatchModel();
      dispatchingItems: Array<PHRMStoreDispatchItems> = new Array<PHRMStoreDispatchItems>();
      selectAllRequisition: boolean = true;
      ReceivedBy: string = "";
      loading: boolean = false;
      constructor(
            public routeFrom: RouteFromService,
            public PharmacyBLService: PharmacyBLService,
            public securityService: SecurityService,
            public PharmacyService: PharmacyService,
            public changeDetectorRef: ChangeDetectorRef,
            public messageBoxService: MessageboxService,
            public router: Router) {
            this.Load(this.PharmacyService.Id);
      }
      // ngOnDestroy(): void {
      //       throw new Error('Method not implemented.');
      // }

      // ngOnDestroy() {
      //       this.PharmacyService.Id = null;
      // }

      //Get Requisition and Requisition Items for Dispatch
      Load(RequisitionId: number) {
            if (RequisitionId != null && RequisitionId != 0) {
                  this.PharmacyBLService.GetRequisitionDetailsForDispatch(RequisitionId)
                        .subscribe((res: DanpheHTTPResponse) => {
                              if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                                    this.requisition = res.Results.Result.Requisition;
                                    this.checkIfAllSelected();
                                    this.checkIfDispatchIsAllowed();
                              }
                              else {
                                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["Requisition is not Authorized or Created !"]);

                              }
                        });
            }
      }
      public checkIfDispatchIsAllowed() {
            let IsDispatchForbidden = this.requisition.RequisitionItems.every(a => a.IsDispatchForbidden == true);
            if (IsDispatchForbidden == true) {
                  this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["No items to dispatch."]);
            }
      }
      toogleAllDispatchItems() {
            this.requisition.RequisitionItems.forEach(a => {
                  if (a.IsDispatchForbidden == false) {
                        a.IsDispatchingNow = this.selectAllRequisition;
                  }
            });
      }
      checkIfAllSelected() {
            const dispatchableRequisition = this.requisition.RequisitionItems.filter(a => a.IsDispatchForbidden == false);
            this.selectAllRequisition = dispatchableRequisition.length > 0 && dispatchableRequisition.every(a => a.IsDispatchingNow == true);
      }
      OnBatchChange(i, j) {
            let selectedBatchNo = this.requisition.RequisitionItems[i].DispatchedItems[j].BatchNo;
            //check if duplication is happening
            let IsDuplicateItem: boolean = this.requisition.RequisitionItems[i].DispatchedItems.filter(a => a.BatchNo == selectedBatchNo).length > 1;
            //if item is duplicate, remove that item
            if (IsDuplicateItem == true) {
                  this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["Batch already selected."]);
                  this.requisition.RequisitionItems[i].DispatchedItems[j].BatchNo = null;
                  this.requisition.RequisitionItems[i].DispatchedItems[j].ExpiryDate = null;
                  this.requisition.RequisitionItems[i].DispatchedItems[j].AvailableQuantity = null;
                  this.requisition.RequisitionItems[i].DispatchedItems[j].DispatchedQuantity = 0;
            }
            else {
                  //find selected Stock and assign Expiry Date and Available Quantity
                  let selectedStock = this.requisition.RequisitionItems[i].AvailableStockList.find(a => a.BatchNo == selectedBatchNo);
                  this.requisition.RequisitionItems[i].DispatchedItems[j].ExpiryDate = selectedStock.ExpiryDate;
                  this.requisition.RequisitionItems[i].DispatchedItems[j].SalePrice = selectedStock.SalePrice;
                  this.requisition.RequisitionItems[i].DispatchedItems[j].CostPrice = selectedStock.CostPrice;
                  this.requisition.RequisitionItems[i].DispatchedItems[j].AvailableQuantity = selectedStock.AvailableQuantity;
            }
      }
      AddDispatchRow(requisitionItemsIndex: number) {
            //check if the all the available stock lists are already selected. if yes, do not add more row.
            if (this.requisition.RequisitionItems[requisitionItemsIndex].AvailableStockList.length == this.requisition.RequisitionItems[requisitionItemsIndex].DispatchedItems.length) {
                  this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["No other batch to dispatch from"]);
            }
            else {
                  var newDispatchItem = new DispatchItemDto()
                  this.requisition.RequisitionItems[requisitionItemsIndex].DispatchedItems.push(newDispatchItem);
            }
      }
      RemoveDispatchRow(requisitionItemsIndex: number, dispatchItemsIndex: number) {
            this.requisition.RequisitionItems[requisitionItemsIndex].DispatchedItems.splice(dispatchItemsIndex, 1);
            if (this.requisition.RequisitionItems[requisitionItemsIndex].DispatchedItems.length == 0)
                  this.AddDispatchRow(requisitionItemsIndex)
      }
      SaveDispatchItems() {
            this.loading = true;
            //Create copy of requisition to send to DB
            var requisitionToSend = new RequisitionForDispatchModel();
            Object.assign(requisitionToSend, this.requisition);
            //Clear all the not dispatching requisition, save only reuqisition items to be dispatched
            requisitionToSend.RequisitionItems = requisitionToSend.RequisitionItems.filter(r => r.IsDispatchingNow == true);
            //Clear all the dispatched items with 0 quantity
            requisitionToSend.RequisitionItems.forEach(r => r.DispatchedItems = r.DispatchedItems.filter(d => d.DispatchedQuantity > 0));
            //if no requisition items is checked, or no items is being dispatched, stop the request.
            if (requisitionToSend.RequisitionItems.length == 0 || requisitionToSend.RequisitionItems.every(r => r.DispatchedItems.length == 0)) {
                  this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["No items to dispatch."]);
                  this.loading = false;
            }
            else if (requisitionToSend.RequisitionItems.some(r => r.DispatchedItems.some(d => d.DispatchedQuantity > d.AvailableQuantity))) {
                  this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Dispatched Quantity can not be greater than Available Quantity"]);
            }
            else {
                  var dispatchItemList: DispatchItemModel[] = [];
                  //Add all the dispatching items into a new object and send it to server side.
                  requisitionToSend.RequisitionItems.forEach(r => {
                        r.DispatchedItems.forEach((d, i) => {
                              var dispatchedItem = new DispatchItemModel();
                              dispatchedItem.RequisitionId = requisitionToSend.RequisitionId;
                              dispatchedItem.RequisitionItemId = r.RequisitionItemId;
                              dispatchedItem.BatchNo = d.BatchNo;
                              dispatchedItem.ExpiryDate = d.ExpiryDate;
                              dispatchedItem.SalePrice = d.SalePrice;
                              dispatchedItem.CostPrice = d.CostPrice;
                              dispatchedItem.DispatchedQuantity = d.DispatchedQuantity;
                              dispatchedItem.DispensaryId = requisitionToSend.RequestingDispensaryId;
                              dispatchedItem.ItemId = r.ItemId;
                              dispatchedItem.ReceivedBy = this.ReceivedBy;
                              dispatchedItem.PendingQuantity = r.PendingQuantity - d.DispatchedQuantity - (i > 0 ? r.DispatchedItems[i - 1].DispatchedQuantity : 0);
                              dispatchItemList.push(dispatchedItem);
                        });
                  });
                  this.PharmacyBLService.PostDispatch(dispatchItemList).finally(() => this.loading = false)
                        .subscribe(
                              (res: DanpheHTTPResponse) => {
                                    if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                                          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ["Dispatch Items detail Saved."]);
                                          this.PharmacyService._Id = res.Results.Result;
                                          this.RouteToDispatchDetailPage();
                                    }
                                    else {
                                          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["failed to add result.. please check log for details."]);
                                          this.logError(res.ErrorMessage);
                                    }
                              },
                              err => {
                                    this.logError(err);
                              });
            }
      }
      logError(err: any) {
            console.log(err);
      }
      //Cancel dispatching material and  navigate to Requisition list page
      Cancel() {
            this.dispatchingItems = new Array<PHRMStoreDispatchItems>();
            this.requisition = new RequisitionForDispatchModel();
            //this.router.navigate(['/Pharmacy/Store/StoreRequisition']);
            this.PharmacyService.Id = null;
            this.router.navigate(['/Pharmacy/SubstoreRequestAndDispatch/Requisitions']);
      }
      //Navigate to Requisition List
      RouteToDispatchDetailPage() {
            this.requisition = new RequisitionForDispatchModel();
            this.dispatchingItems = new Array<PHRMStoreDispatchItems>();
            // this.router.navigate(['/Pharmacy/Store/StoreDispatchDetails']);
            this.router.navigate(['/Pharmacy/SubstoreRequestAndDispatch/Requisitions']);
      }
}
