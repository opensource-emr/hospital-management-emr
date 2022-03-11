import { Component } from "@angular/core";
import { Router } from '@angular/router';

import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import { Requisition } from "../../../inventory/shared/requisition.model";
import { RequisitionItems } from "../../../inventory/shared/requisition-items.model";
import { InventoryBLService } from "../../../inventory/shared/inventory.bl.service"
import { InventoryService } from '../../../inventory/shared/inventory.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../../shared/routefrom.service';
import { SecurityService } from "../../../security/shared/security.service";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import * as moment from "moment";
import { WardSupplyBLService } from "../../shared/wardsupply.bl.service";
import { CoreService } from "../../../core/shared/core.service";
import { PHRMStoreModel } from "../../../pharmacy/shared/phrm-store.model";

@Component({
  templateUrl: "./inventory-ward-requisition-list.html" // "/InventoryView/RequisitionList"
})
export class InventoryRequisitionListComponent {
  public CurrentStoreId: number = 0;
  public RequisitionStatusFilter: string = "pending";
  public RequisitionGridData: Array<Requisition> = Array <Requisition>();
  public RequisitionGridDataFiltered: Array<Requisition> = Array <Requisition>();
  public deptwiseGridColumns: Array<any> = null;
  public itemRequisitionList: Array<any> = null;
  public itemwiseGridColumns: Array<any> = null;

  public itemchecked: boolean = true;
  public showItemwise: boolean = false;
  public index: number = 0;
  public itemId: number = 0;
  public itemName: string = null;


  public fromDate: string = null;
  public toDate: string = null;
  public dateRange: string = null;
  public NepaliDateInGridSettings = new NepaliDateInGridParams();
  public inventoryList: PHRMStoreModel[] = [];
  public selectedInventoryId: number = null;

  constructor(
    public InventoryBLService: InventoryBLService,
    public inventoryService: InventoryService,
    public wardsupplyBLService: WardSupplyBLService,
    public router: Router,
    public routeFrom: RouteFromService,
    public securityService: SecurityService,
    public messageBoxService: MessageboxService,
    public coreService: CoreService) {
    this.CheckForSubstoreActivation();
  }

  CheckForSubstoreActivation() {
    this.CurrentStoreId = this.securityService.getActiveStore().StoreId;
    try {
      if (!this.CurrentStoreId) {
        //routeback to substore selection page.
        this.router.navigate(['/WardSupply']);
      }
      else {
        //write whatever is need to be initialise in constructor here.
        this.deptwiseGridColumns = GridColumnSettings.SubstoreRequisitionList;
        this.itemwiseGridColumns = GridColumnSettings.ItemwiseRequisitionList;
        this.dateRange = 'None';
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('RequisitionDate', false));
        this.GetAllInventory();
      }
    } catch (exception) {
      this.messageBoxService.showMessage("Error", [exception]);
    }
  }
  private GetAllInventory() {
    this.wardsupplyBLService.GetInventoryList().subscribe(res => {
      if (res.Status == "OK") {
        this.inventoryList = res.Results;
      }
      else {
        console.log(res);
        this.messageBoxService.showMessage("Failed", ["Failed to load inventory list"]);
      }
    }, err => {
      console.log(err);
      this.messageBoxService.showMessage("Failed", ["Failed to load inventory list"]);
    });
  }
  //loading item wise requisition list
  LoadItemwiseList(): void {
    this.showItemwise = true;
    this.InventoryBLService.GetItemwiseRequistionList().
      subscribe(res => {
        if (res.Status == 'OK') {
          this.itemRequisitionList = res.Results;
        }
        else {
          this.messageBoxService.showMessage("failed", [res.ErrorMessage]);
        }
      },
        err => {
          this.messageBoxService.showMessage("failed", ['failed to get Requisitions.....please check log for details.']);
        });
  }
  //grid actions for item-wise requisition list
  ItemGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "itemDispatch":
        {
          // this.ItemDispatch($event.Data);
          break;
        }
      default:
        break;
    }
  }

  BackToGrid() {
    this.showItemwise = false;
    this.LoadDeptwiseList();
  }

  LoadDeptwiseList(): void {
    this.wardsupplyBLService.GetSubstoreRequistionList(this.fromDate, this.toDate, this.CurrentStoreId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.RequisitionGridData = res.Results;
          var isReceiveItemsEnabled = this.CheckIfItemReceiveEnabled();
          this.RequisitionGridData.forEach(req => req.isReceiveItemsEnabled = isReceiveItemsEnabled)
          if (this.RequisitionGridData.length == 0) {
            this.messageBoxService.showMessage("Notice", ["No Requisition Found. Please check the date."]);
          }
            this.LoadRequisitionListByStatus();
        }
        else {
          this.messageBoxService.showMessage("failed", ['failed to get Requisitions.....please check log for details.']);
          console.log(res.ErrorMessage);
        }
      });
  }
  LoadRequisitionListByStatus() {
    switch (this.RequisitionStatusFilter) {
      case "pending": {
        this.RequisitionGridDataFiltered = this.RequisitionGridData.filter(R => ["active", "partial"].includes(R.RequisitionStatus) || R.NewDispatchAvailable == true);
        break;
      }
      case "complete": {
        this.RequisitionGridDataFiltered = this.RequisitionGridData.filter(R => R.RequisitionStatus == "complete" && R.NewDispatchAvailable == false);
        break;
      }
      case "cancelled": {
        this.RequisitionGridDataFiltered = this.RequisitionGridData.filter(R => R.RequisitionStatus == "cancelled");
        break;
      }
      case "withdrawn": {
        this.RequisitionGridDataFiltered = this.RequisitionGridData.filter(R => R.RequisitionStatus == "withdrawn");
        break;
      }
      default: {
        this.RequisitionGridDataFiltered = this.RequisitionGridData
      }
    }
    this.filterStockByInventory();
  }
  filterStockByInventory() {
    if (this.selectedInventoryId == null)
      this.RequisitionGridDataFiltered = this.RequisitionGridDataFiltered;
    else
      this.RequisitionGridDataFiltered = this.RequisitionGridDataFiltered.filter(a => a.RequestToStoreId == this.selectedInventoryId);
  }
  RequisitionGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "view": {
        var data = $event.Data;
        this.RouteToViewDetail(data);
        break;
      }
      case "receiveDispatchedItems": {
        var requisitionId = $event.Data.RequisitionId; //$event.Data.dispatchId;
        this.inventoryService.RequisitionId = requisitionId;
        this.router.navigate(['/WardSupply/Inventory/ReceiveStock']);
        break;
      }
      case "CreateCopy": {
        var data = $event.Data
        this.RouteToCreateCopy(data);
        break;

      }
      default:
        break;
    }
  }
  private CheckIfItemReceiveEnabled() {
    return this.coreService.Parameters.find(p => p.ParameterGroupName == "Inventory" && p.ParameterName == 'EnableReceivedItemInSubstore').ParameterValue == "true" ? true : false;
  }

  RouteToCreateCopy(data) {
    this.inventoryService.RequisitionId = data.RequisitionId;
    this.inventoryService.isRecreateMode = true;
    this.router.navigate(['WardSupply/Inventory/InventoryRequisitionItem'])

  }
  RouteToViewDetail(data) {
    //pass the Requisition Id to RequisitionView page for List of Details about requisition
    this.inventoryService.RequisitionId = data.RequisitionId;//sud:3Mar'20-Property Rename in InventoryService
    this.inventoryService.DepartmentName = data.DepartmentName;//sud:3Mar'20-Property Rename in InventoryService
    this.inventoryService.isModificationAllowed = this.CheckIfModificationApplicable(data);
    this.router.navigate(['/WardSupply/Inventory/InventoryRequisitionDetails']);
  }
  private CheckIfModificationApplicable(data: Requisition): boolean {
    return (data.RequisitionStatus == "active" && data.CurrentVerificationLevelCount == 0) ? true : false;
  }

  //route to create Requisition page
  CreateRequisition() {
    this.inventoryService.RequisitionId = 0;
    this.router.navigate(['/WardSupply/Inventory/InventoryRequisitionItem']);
  }
  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.LoadDeptwiseList();
      } else {
        this.messageBoxService.showMessage('failed', ['Please enter valid From date and To date']);
      }

    }
  }
}
