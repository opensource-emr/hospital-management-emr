import {Component} from "@angular/core";
import { Router } from '@angular/router';
import { ActivateInventoryService } from "../../shared/activate-inventory/activate-inventory.service";
import { PHRMStoreModel } from "../../pharmacy/shared/phrm-store.model";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../shared/danphe-grid/NepaliColGridSettingsModel";
import { WardSupplyAssetRequisitionModel } from "../../wardsupply/shared/wardsupply-asset-requisition.model";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { InventoryService } from "../../inventory/shared/inventory.service";
import GridColumnSettings from "../../shared/danphe-grid/grid-column-settings.constant";
import * as moment from "moment";
import { FixedAssetBLService } from "../shared/fixed-asset.bl.service";
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
//swapnil-2-april-2021
import { DispatchItemDto,AvailableStockDto, RequisitionForDispatchModel, RequisitionItemDto } from "./assets-substore-requisition-dispatch-model";
import { FixedAssetDispatchItems } from "../shared/fixed-asset-dispatch-items.model";
import { FixedAssetDispatch } from "../shared/fixed-asset-dispatch.model";
import { FixedAssetService } from "../shared/fixed-asset.service";


@Component({
    templateUrl: "./assets-substore-requisition-dispatch.component.html"
})

export class AssetSubstoreRequisitionDispatchComponent{
    public activeSubstoreId: number = 0;
    public RequisitionStatusFilter: string = "pending";
    public RequisitionGridData: Array<WardSupplyAssetRequisitionModel> = new Array<WardSupplyAssetRequisitionModel>();
    public RequisitionGridDataFiltered: Array<WardSupplyAssetRequisitionModel> = new Array<WardSupplyAssetRequisitionModel>();
    public SubstoreAssetRequisitionGridColumns: Array<any> =[] ;
    public showRequisitionDetails = false;
    public showRequisitionList = true;
    public fromDate: string = null;
    public toDate: string = null;
    public dateRange: string = null;
    public NepaliDateInGridSettings = new NepaliDateInGridParams();
    public inventoryList:Array<PHRMStoreModel> = new Array<PHRMStoreModel>();
    public selectedInventory:PHRMStoreModel = new PHRMStoreModel();
    //swapnil-2-april-2021
    public requisition: RequisitionForDispatchModel = new RequisitionForDispatchModel();
    selectAllRequisition: boolean = true;
    ReceivedBy: string = "";
    loading: boolean = false;
    showDispatchRequisition:boolean=false;

    //fixedAssetDispatch:FixedAssetDispatch=new FixedAssetDispatch();
    Dispatch:FixedAssetDispatch=new FixedAssetDispatch();
    fixedAssetDispatchItems:Array<FixedAssetDispatchItems>=new Array<FixedAssetDispatchItems>();
    
    public data:any;
    public requisitionDate: string = null;
    public showDispatchList: boolean = false;
    constructor(
        public activateInventoryService:ActivateInventoryService,
        public msgBox:MessageboxService,         
        public fixedAssetBLService: FixedAssetBLService,
        public fixedAssetService:FixedAssetService,
        public router: Router,
        )
    {
        this.selectedInventory= this.activateInventoryService.activeInventory;        
        this.SubstoreAssetRequisitionGridColumns = GridColumnSettings.FixedAssetRequestList;
        this.dateRange = 'None';
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('RequisitionDate', false));  
    }
      onDateChange($event) {
        this.fromDate = $event.fromDate;
        this.toDate = $event.toDate;
        if (this.fromDate != null && this.toDate != null) {
          if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
            this.LoadSubStoreReqListByDate();
          } else {
            this.msgBox.showMessage('failed', ['Please enter valid From date and To date']);
          }
        }
      }
      LoadSubStoreReqListByDate(): void {
        this.fixedAssetBLService.GetSubstoreAssetRequistionList(this.fromDate, this.toDate, this.selectedInventory.StoreId)
          .subscribe(res => {
            if (res.Status == "OK") {
              this.RequisitionGridData = res.Results;        
              if (this.RequisitionGridData.length == 0) {
                this.msgBox.showMessage("Notice", [
                  "No Requisition Found. Please check the date."
                ]);
              }
              else {
                this.LoadRequisitionListByStatus();
              }
            }
            else {
              this.msgBox.showMessage("failed", ['failed to get Requisitions.....please check log for details.']);
              ;
              console.log(res.ErrorMessage);
            }
          });
      }  
      LoadRequisitionListByStatus() {
        switch (this.RequisitionStatusFilter) {
          case "pending": {
            this.RequisitionGridDataFiltered = this.RequisitionGridData.filter(R => ["active", "partial"].includes(R.RequisitionStatus)  );
            break;
          }
          case "complete": {
            this.RequisitionGridDataFiltered = this.RequisitionGridData.filter(R => R.RequisitionStatus == "complete"  );
            break;
          }
          case "cancelled": {
            this.RequisitionGridDataFiltered = this.RequisitionGridData.filter(R => R.RequisitionStatus == "cancelled" );
            break;
          }
          case "withdrawn": {
            this.RequisitionGridDataFiltered = this.RequisitionGridData.filter(R => R.RequisitionStatus == "withdrawn" );
            break;
          }
          default: {
            this.RequisitionGridDataFiltered = this.RequisitionGridData;
          }
        }
      }
      RequisitionGridAction($event: GridEmitModel) {
        switch ($event.Action) {
          case "view": {
            var data = $event.Data;
            this.RouteToViewDetail(data);           
            break;
          }
          case "dispatch":{
            var data = $event.Data;   
            //swapnil-2-april-2021
            this.data=data
            this.Load(data.RequisitionId)   
            this.showRequisitionList=false;
            this.showDispatchRequisition=true;    
            break;
          }
          case "dispatchList":
            {
              var data = $event.Data;
               this.fixedAssetService.RequisitionId = data.RequisitionId;
              // this.departmentName = data.DepartmentName;
               this.requisitionDate = data.RequisitionDate;
              this.showDispatchList = true;
              this.router.navigate(["/FixedAssets/RequisitionDispatch"]);
              break;;
            }
  
          default:
            break;
        }
      }     
      //start-swapnil-2-april-2021 
      //Get Requisition and Requisition Items for Dispatch
      Load(RequisitionId: number) {
        this.requisition =new RequisitionForDispatchModel();
            if (RequisitionId != null && RequisitionId != 0) {
                  this.fixedAssetBLService.GetRequisitionDetailsForDispatch(RequisitionId)
                        .subscribe(res => {
                              if (res.Status == "OK") {
                                    this.requisition = Object.assign(this.requisition, res.Results.Requisition);
                                    //this.AddDispatchItemsByReqItem();
                                    this.checkIfAllSelected();
                                    this.checkIfDispatchIsAllowed();                                                                    
                              }
                              else {
                                    this.msgBox.showMessage("notice-message", ["Requisition is not Authorized or Created !"]);
                              }
                        });
            }
      }      
      public checkIfDispatchIsAllowed() {
            let IsDispatchForbidden = this.requisition.RequisitionItems.every(a => a.IsDispatchForbidden == true);
            if (IsDispatchForbidden == true) {
                  this.msgBox.showMessage("Notice-Message", ["No items in stock to dispatch."]);
            }
            if(this.requisition && this.requisition.RequisitionItems.length > 0){
                this.requisition.RequisitionItems.forEach(ele=>{
                    if(ele.AvailableQuantity > 0 ){              
                        ele.DispatchedItems
                        var dispatchItm = new DispatchItemDto();
                        dispatchItm.BarCodeNumberList=ele.AvailableStockList;        
                        ele.DispatchedItems.push(dispatchItm);
                    }            
                });
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
        //IsDispatchForbidden means allow to add item or stock available
        //IsDispatchingNow means allow to dispatch
            const dispatchableRequisition = this.requisition.RequisitionItems.filter(a => a.IsDispatchForbidden == false);
            this.selectAllRequisition = dispatchableRequisition.length > 0 && dispatchableRequisition.every(a => a.IsDispatchingNow == true);
      }
    
      OnBarCodeChange(i,j,selectedBarCode:any,itemId) {
        let checkIsItem=false;
        if (typeof selectedBarCode === "object" && !Array.isArray(selectedBarCode) && selectedBarCode !== null) {
          for (var p = 0; p < this.requisition.RequisitionItems[i].DispatchedItems.length; p++) {
              if (this.requisition.RequisitionItems[i].DispatchedItems[p].BarCodeNumber == selectedBarCode.BarCodeNumber && p !=j) {
                  checkIsItem = true;
              }
          }       
          if (checkIsItem == true) {
              this.msgBox.showMessage("notice-message", ["BarCodeNumber is already added Please Check!!!"]);
              this.requisition.RequisitionItems[i].DispatchedItems.splice(j,1);             
              checkIsItem = false;              
              //this.changeDetectorRef.detectChanges();
          }
          else {               
            this.requisition.RequisitionItems[i].DispatchedItems[j].BarCodeNumber=selectedBarCode.BarCodeNumber;
            this.requisition.RequisitionItems[i].DispatchedItems[j].BatchNo =selectedBarCode.BatchNo;
            this.requisition.RequisitionItems[i].DispatchedItems[j].FixedAssetStockId =selectedBarCode.FixedAssetStockId;              
          }
        }           
            
      }
      SaveDispatchItems() {            
            this.Dispatch= new FixedAssetDispatch()   
            let countItm=0;
            let checkBarcodeValid=true;
            this.requisition.RequisitionItems.forEach(itm=>{     
              if(itm.IsDispatchingNow){
                countItm=itm.DispatchedItems.length+countItm;
                let isBarcCodeSelected=itm.DispatchedItems.every(a => a.FixedAssetStockId >0);               
                if(isBarcCodeSelected==false){
                  checkBarcodeValid=false;
                }
              }                   
            });
            if(countItm==0){
              this.msgBox.showMessage("notice-message", ["No items selected or added for dispatch , please check once!!"]);
              return;
            }
            if( !checkBarcodeValid){
              this.msgBox.showMessage("notice-message", ["Please select barcode and try again !!"]);
              return;
            }

                      
            this.loading = true;
            this.Dispatch.RequisitionId=this.requisition.RequisitionId
            this.Dispatch.ReceivedBy=this.ReceivedBy
            this.Dispatch.StoreId=this.requisition.RequisitionStoreId
            this.Dispatch.SubStoreId=this.requisition.RequisitionSubStoreId
            for(let a=0;a < this.requisition.RequisitionItems.length; a++){
              if(this.requisition.RequisitionItems[a].IsDispatchingNow){
                this.requisition.RequisitionItems[a].DispatchedItems.forEach(ele=>{
                  if(ele.BarCodeNumber){
                    var data=new FixedAssetDispatchItems();
                    data.BarCodeNumber=ele.BarCodeNumber;
                    data.ItemId= this.requisition.RequisitionItems[a].ItemId
                    data.ItemName=this.requisition.RequisitionItems[a].ItemName
                    data.RequisitionItemId=this.requisition.RequisitionItems[a].RequisitionItemId
                    data.BatchNo=ele.BatchNo
                    data.FixedAssetStockId=ele.FixedAssetStockId
                    data.RequestedQuantity=this.requisition.RequisitionItems[a].RequestedQuantity;
                    data.ReceivedQuantity=this.requisition.RequisitionItems[a].ReceivedQuantity+ this.requisition.RequisitionItems[a].DispatchedItems.length;
                    data.PendingQuantity=  this.requisition.RequisitionItems[a].PendingQuantity-this.requisition.RequisitionItems[a].DispatchedItems.length;
                    data.PendingQuantity=(data.PendingQuantity <0 )?0:data.PendingQuantity;
                    data.AvailableQuantity=this.requisition.RequisitionItems[a].AvailableQuantity - this.requisition.RequisitionItems[a].DispatchedItems.length;
                    data.DispatchedQuantity=1;
                    this.Dispatch.DispatchItems.push(data);
                  }
                });
              }               
            }   
            this.fixedAssetBLService.PostDispatch(this.Dispatch).finally(() => this.loading = false)
                        .subscribe(
                              res => {
                                    if (res.Status == "OK") {
                                          this.msgBox.showMessage("success", ["Dispatch Items detail Saved."]);
                                          this.loading = false;
                                          this.requisition=new RequisitionForDispatchModel()
                                          this.Dispatch =new FixedAssetDispatch()
                                          this.RouteToDispatchDetailPage();
                                    }
                                    else {
                                          this.loading = false;
                                          this.msgBox.showMessage("failed", ["failed to add result.. please check log for details."]);
                                          this.logError(res.ErrorMessage);
                                    }
                              },
                              err => {
                                    this.logError(err);
                              });
         
      }
      logError(err: any) {
            console.log(err);
      }
      Cancel() {
      
            this.requisition = new RequisitionForDispatchModel();
            this.showRequisitionList=true;
            this.showDispatchRequisition=false;   
      }
      //Navigate to Requisition List
      RouteToDispatchDetailPage() {
            this.requisition = new RequisitionForDispatchModel();
            this.showRequisitionList=true;
            this.showDispatchRequisition=false;   
          
      }
      ////add a new row
    AddRowRequest(i,id) {
      if((i==0 || i>0) && (id >0)){
        if(this.requisition.RequisitionItems[i].AvailableQuantity ==this.requisition.RequisitionItems[i].DispatchedItems.length){
          this.msgBox.showMessage("Notice-Message", ["No more barcode available for dispatch"]);
          return;
        }
        var dispatchItm = new DispatchItemDto();
        dispatchItm.BarCodeNumberList=this.requisition.RequisitionItems[i].AvailableStockList;        
        this.requisition.RequisitionItems[i].DispatchedItems.push(dispatchItm);       
      }else
      {
        this.Cancel();
      }
    
  }
  public SetFocusOnItemName(index: number) {
      let elementToBeFocused = 'itemName' + index;
      this.SetFocusById(elementToBeFocused);
  }
  public SetFocusById(id: string) {
      window.setTimeout(function () {
          let elementToBeFocused = document.getElementById(id);
          if (elementToBeFocused) {
              elementToBeFocused.focus();
          }
      }, 600);
  }

  DeleteAction(i,j) {     
      this.requisition.RequisitionItems[i].DispatchedItems.splice(j,1);
      if(this.requisition.RequisitionItems[i].DispatchedItems.length==0 && this.requisition.RequisitionItems[i].AvailableQuantity >0) {                      
        var dispatchItm = new DispatchItemDto();
        dispatchItm.BarCodeNumberList=this.requisition.RequisitionItems[i].AvailableStockList;        
        this.requisition.RequisitionItems[i].DispatchedItems.push(dispatchItm);
      }       
  }
  
  ListFormatter(data: any): string {
      let html = data["BarCodeNumber"];
      return html;
  }
    //end-swapnil-2-april-2021 
    RouteToViewDetail(data) {
      //pass the Requisition Id to RequisitionView page for List of Details about requisition
      this.fixedAssetService.RequisitionId = data.RequisitionId;
      this.showRequisitionDetails = true;
      this.showRequisitionList = false
    }
    CallBackDetails(event){
      this.showRequisitionDetails=false;
      this.showRequisitionList=true;
    }
    
      //route to create Requisition page
  DirectDispatch() {
    this.router.navigate(['/FixedAssets/AssetsSubstoreDirectDispatch']);
  }
}