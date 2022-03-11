import { Component } from "@angular/core";
import { Router } from '@angular/router';

import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import { Requisition } from "../../../inventory/shared/requisition.model";
import { InventoryBLService } from "../../../inventory/shared/inventory.bl.service"
import { InventoryService } from '../../../inventory/shared/inventory.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../../shared/routefrom.service';
import { SecurityService } from "../../../security/shared/security.service";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import * as moment from "moment";
import { WardSupplyBLService } from "../../shared/wardsupply.bl.service";
import { CoreService } from "../../../core/shared/core.service";
import { wardsupplyService } from "../../shared/wardsupply.service";
import { PHRMStoreModel } from "../../../pharmacy/shared/phrm-store.model";
import { WardSupplyAssetRequisitionModel } from "../../shared/wardsupply-asset-requisition.model";
import WARDGridColumns from "../../shared/ward-grid-cloumns";

@Component({

  templateUrl: "./wardsupply-asset-requisition-list.component.html" 

})
export class WardSupplyAssetRequisitionListComponent {
  public activeSubstoreId: number = 0;
  public RequisitionStatusFilter: string = "pending";
  public RequisitionGridData: Array<WardSupplyAssetRequisitionModel> = new Array<WardSupplyAssetRequisitionModel>();
  public RequisitionGridDataFiltered: Array<WardSupplyAssetRequisitionModel> = new Array<WardSupplyAssetRequisitionModel>();
  public SubstoreAssetRequisitionGridColumns: Array<any> =[] ;
  public itemRequisitionList: Array<any> = null;
  public itemwiseGridColumns: Array<any> = null;

  public itemchecked: boolean = true;
  public showItemwise: boolean = false;
  public index: number = 0;
  public itemId: number = 0;
  public itemName: string = null;
  public showCreateRequisition = false;
  public showRequisitionDetails = false;
  public showRequisitionList = true;
  public showdispatchList=false;
  public fromDate: string = null;
  public toDate: string = null;
  public dateRange: string = null;
  public NepaliDateInGridSettings = new NepaliDateInGridParams();
  public inventoryList:Array<PHRMStoreModel> = new Array<PHRMStoreModel>();
  public selectedInventory:number=0;
  public requisitionId: number = 0;
  public departmentName: any;
  public requisitionDate: string = null;
  public showDispatchList: boolean = false;

  public loading:boolean=false;
  public Requisition: IRequisitionDetail;
  public DispatchList: Array<IDispatchListView> = [];
  public showReceivedItems: boolean = false;
  constructor(
    public InventoryBLService: InventoryBLService,
    public inventoryService: InventoryService,
    public wardsupplyBLService: WardSupplyBLService,
    public router: Router,
    public routeFrom: RouteFromService,
    public securityService: SecurityService,
    public messageBoxService: MessageboxService,
    public coreService: CoreService, public wardsupplyService:wardsupplyService) {  
      this.activeSubstoreId=  this.wardsupplyService.activeSubstoreId;
      this.GetInventoryList();
  }

  GetInventoryList()
  {  
    this.inventoryList=this.wardsupplyService.inventoryList;   
    if(this.wardsupplyService.inventoryList.length >0 ){  
      this.selectedInventory=this.inventoryList[0].StoreId;   
      this.SubstoreAssetRequisitionGridColumns =WARDGridColumns.SubstoreAssetRequisitionList ;
      //this.itemwiseGridColumns = GridColumnSettings.ItemwiseRequisitionList;
      this.dateRange = 'None';
      this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('RequisitionDate', false));      
    }
  }
  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.LoadSubStoreReqListByDate();
      } else {
        this.messageBoxService.showMessage('failed', ['Please enter valid From date and To date']);
      }
    }
  }  
  //get substore assets requisition list by date
  LoadSubStoreReqListByDate(): void {
    this.wardsupplyBLService.GetSubstoreAssetRequistionList(this.fromDate, this.toDate, this.activeSubstoreId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.RequisitionGridData = res.Results;        
          if (this.RequisitionGridData.length == 0) {
            this.messageBoxService.showMessage("Notice", [
              "No Requisition Found. Please check the date."
            ]);
          }
          else {
            this.LoadRequisitionListByStatus();
          }
        }
        else {
          this.messageBoxService.showMessage("failed", ['failed to get Requisitions.....please check log for details.']);
          ;
          console.log(res.ErrorMessage);
        }
      });
  }
  LoadRequisitionListByStatus() {
    switch (this.RequisitionStatusFilter) {
      case "pending": {
        this.RequisitionGridDataFiltered = this.RequisitionGridData.filter(R => ["active", "partial"].includes(R.RequisitionStatus) && R.StoreId==this.selectedInventory );
        break;
      }
      case "complete": {
        this.RequisitionGridDataFiltered = this.RequisitionGridData.filter(R => R.RequisitionStatus == "complete" && R.StoreId==this.selectedInventory );
        break;
      }
      case "cancelled": {
        this.RequisitionGridDataFiltered = this.RequisitionGridData.filter(R => R.RequisitionStatus == "cancelled" && R.StoreId==this.selectedInventory);
        break;
      }
      case "withdrawn": {
        this.RequisitionGridDataFiltered = this.RequisitionGridData.filter(R => R.RequisitionStatus == "withdrawn" && R.StoreId==this.selectedInventory);
        break;
      }
      default: {
        this.RequisitionGridDataFiltered = this.RequisitionGridData.filter(R=> R.StoreId==this.selectedInventory);
      }
    }
  }
  OnInventoryChange(){
    this.LoadRequisitionListByStatus();
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
    this.LoadSubStoreReqListByDate();
  }
   
  RequisitionGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "view": {
        var data = $event.Data;
        this.RouteToViewDetail(data);
        break;
      }
      case "dispatchList":
      {
        var data = $event.Data;
         this.wardsupplyService.RequisitionId = data.RequisitionId;
        // this.departmentName = data.DepartmentName;
         this.requisitionDate = data.RequisitionDate;
        this.showDispatchList = true;
        this.router.navigate(["/WardSupply/FixedAsset/RequisitionDispatch"]);
        break;;
      }
      case "receiveItems": {
        var data = $event.Data;
        this.showRequisitionList=false;
        this.showReceivedItems=true;
        this.LoadDispatchListByRequisitionId(data.RequisitionId);
        this.setFocusById('remarks');
        break;
      }
      default:
        break;
    }
  }
 
  RouteToCreateCopy(data) {   
  }
  RouteToViewDetail(data) {
    //pass the Requisition Id to RequisitionView page for List of Details about requisition
    this.wardsupplyService.RequisitionId = data.RequisitionId;
    this.wardsupplyService.DepartmentName = data.DepartmentName;     
    this.showCreateRequisition = false;
    this.showRequisitionDetails = true;
    this.showRequisitionList = false
    this.router.navigate(['/WardSupply/FixedAsset/Requisition/View'])
  }
  private CheckIfModificationApplicable(data: Requisition): boolean {
    return (data.RequisitionStatus == "active" && data.CurrentVerificationLevelCount == 0) ? true : false;
  }

  //route to create Requisition page
  CreateRequisition() {    
    this.showCreateRequisition = true;
    this.showRequisitionDetails = false;
    this.showRequisitionList = false;
    this.showdispatchList=false;
  }
  CallBackNewReq(event){    
    this.showCreateRequisition=false;
    this.showRequisitionList=true;
    this.showdispatchList=false;
    this.LoadSubStoreReqListByDate();
  }
  CallBackDetails(event){
    this.showRequisitionDetails=false;
    this.showRequisitionList=true;
  }
  private LoadDispatchListByRequisitionId(RequisitionId) {
    //var RequisitionId = this.wardsupplyService.RequisitionId;
    if (RequisitionId > 0) {
      this.loading = true;
      this.wardsupplyBLService.GetFixedAssetDispatchListForItemReceive(RequisitionId)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.Requisition = res.Results.RequisitionDetail;
           this.DispatchList = res.Results.DispatchDetail;
           if(this.DispatchList.length==0)this.RouteBack();
            this.loading = false;
          }
          else {
            this.messageBoxService.showMessage("Failed", [res.ErrorMessage]);
          }
        }, err => {
          this.messageBoxService.showMessage("Failed", [err.error.ErrorMessage]);
        })
    }
    else {
      this.RouteBack();
    }
  }
  setFocusById(id: string) {
    var Timer = setTimeout(() => {
      if (document.getElementById(id)) {
        let nextEl = <HTMLInputElement>document.getElementById(id);
        nextEl.focus();
        clearTimeout(Timer);
      }
    }, 50)
  }
  Print() {
    let popupWinindow;
    var printContents = document.getElementById("printpage").innerHTML;
    popupWinindow = window.open(
      "",
      "_blank",
      "width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no"
    );
    popupWinindow.document.open();
    popupWinindow.document.write(
      `<html>
        <head>
          <style>
            .img-responsive{ position: relative;left: -65px;top: 10px;}
            .qr-code{position: absolute; left: 1001px;top: 9px;}
          </style>
          <link rel="stylesheet" type="text/css" href="../../themes/theme-default/ReceiptList.css" />
        </head>
        <style>
          .printStyle {border: dotted 1px;margin: 10px 100px;}
          .print-border-top {border-top: dotted 1px;}
          .print-border-bottom {border-bottom: dotted 1px;}
          .print-border {border: dotted 1px;}.cener-style {text-align: center;}
          .border-up-down {border-top: dotted 1px;border-bottom: dotted 1px;}
          .hidden-in-print { display:none !important}
        </style>
        <body onload="window.print()">` +
      printContents +
      "</html>"
    );
    popupWinindow.document.close();
  }
  RouteBack() {
    this.showReceivedItems=false;
    this.showRequisitionList=true;
   // this.dispensaryRequisitionService.RequisitionId = 0;
    //this.router.navigate(['/Dispensary/Stock/Requisition/List']);
  }
}
interface IRequisitionDetail {
  RequisitionNo: number;
  RequisitionDate: string;
  RequisitionStatus: string;
}
interface IDispatchListView {
  DispatchId: number;
  ReceivedBy: string;
  ReceivedOn: string;
  ReceivedRemarks: string;
  DispatchItems: IDispatchItemsView[];
}
interface IDispatchItemsView {
  DispatchItemId: number;
  ItemId: number;
  ItemName: string;
  BatchNo: string;
  BarCodeNumber: number;
}

 