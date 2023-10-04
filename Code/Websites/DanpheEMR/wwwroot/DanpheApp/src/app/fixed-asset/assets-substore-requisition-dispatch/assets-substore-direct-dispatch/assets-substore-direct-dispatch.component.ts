import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FixedAssetBLService } from '../../shared/fixed-asset.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { FixedAssetDispatch } from '../../shared/fixed-asset-dispatch.model';
import { FixedAssetDispatchItems } from '../../shared/fixed-asset-dispatch-items.model';
import { ActivateInventoryService } from '../../../shared/activate-inventory/activate-inventory.service';
import { DispatchItemDto } from '../assets-substore-requisition-dispatch-model';
import { Router } from '@angular/router';
@Component({
  templateUrl: "./assets-substore-direct-dispatch.component.html"
})
export class DirectDispatchComponent {

  ////binding logic
  public dispatch: FixedAssetDispatch = new FixedAssetDispatch();
  public currentRequItem: FixedAssetDispatchItems = new FixedAssetDispatchItems();
  public StoreList: any;
  public selectedStore: any;
  public ItemList: any;
  public SelectedItem: any;
  public checkIsItemPresent: boolean = false;
  ReceivedBy: string = "";
  Remarks: string = "";
  BarCodeNumberList: any;
  ////this is to add or delete the number of row in ui
  public rowCount: number = 0;
  loading: boolean = false;
  public AllItemList: any;
   public barcodelist: any;
 

  constructor(
    public changeDetectorRef: ChangeDetectorRef,
    public activeInventoryService: ActivateInventoryService,
    public messageBoxService: MessageboxService,
    public fixedAssetBLService: FixedAssetBLService,
    public router: Router) {
    ////pushing currentPOItem for the first Row in UI 
    this.AdditemRowRequest();
    this.GetActiveStoreList();
   
  }
  ngOnInit(): void {
    //actually the requisition is requested by substore and dispatched by main store, so for requisition, source is the target.
    this.dispatch.StoreId = this.activeInventoryService.activeInventory.StoreId;
    // this.requisition.RequisitionValidator.get("TargetStoreId").setValue(this.requisition.RequisitionStoreId.toString());
    this.LoadItemList();
  }

  ////to load the item in the start
  LoadItemList() {
    this.fixedAssetBLService.GetFixedAssetStockByStoreId(this.dispatch.StoreId)
      .subscribe(res => this.CallBackGetItemList(res));
  }
  CallBackGetItemList(res) {
    if (res.Status == 'OK') {
      this.ItemList = [];
      if (res && res.Results) {
        res.Results.forEach(a => {
          this.ItemList.push({
            "FixedAssetStockId": a.FixedAssetStockId,
            "ItemId": a.ItemId, "ItemName": a.ItemName, "VendorName": a.VendorName,
            "Code": a.ItemCode, "BatchNo": a.BatchNo, "SerialNo": a.SerialNo,
            "BarCodeNumber": a.BarCodeNumber, "IsActive": a.IsActive, "Remark": "",
            "StoreId": a.StoreId
          });
        });
        this.ItemList.forEach(function (item, index) {
          item.Id = index;
        });

      }
      this.ItemList = this.ItemList.filter(item => item.IsActive == true);

      this.AllItemList = this.ItemList;
      // this.CommonList=this.ItemList;
      this.FilterDistinctItem(this.ItemList);
    }
    else {
      err => {
        this.messageBoxService.showMessage("failed", ['failed to get Item.. please check log for details.']);

      }
    }
  }

  public FilterDistinctItem(items) {
    if (items && items.length) {
        let distinctItem = new Array<any>();
        distinctItem.push(this.ItemList.find(srv => srv.ItemName == items[0].ItemName));
        items.forEach(itm => {
            //push only if current type isn't already added.
            if (!distinctItem.find(dst => dst.ItemName == itm.ItemName)) {
                distinctItem.push(this.ItemList.find(srv => srv.ItemName == itm.ItemName));
            }
        });
        this.ItemList = distinctItem;
    }
}

  GetActiveStoreList() {
    this.fixedAssetBLService.GetActiveSubStoreList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.StoreList = res.Results;
        }
      })
  }

  ////add a new row 
  AdditemRowRequest() {
    for (var i = 0; i < this.dispatch.DispatchItems.length; i++) {
      // for loop is used to show RequisitionItemValidator message ..if required  field is not filled
      for (var a in this.dispatch.DispatchItems[i].RequisitionItemValidator.controls) {
        this.dispatch.DispatchItems[i].RequisitionItemValidator.controls[a].markAsDirty();
        this.dispatch.DispatchItems[i].RequisitionItemValidator.controls[a].updateValueAndValidity();
      }
    }
    //row can be added if only if the item is selected is last row
    //if (this.currentRequItem.ItemId != 0 && this.currentRequItem.ItemId != null) {
    this.rowCount++;
    this.currentRequItem = new FixedAssetDispatchItems();
    //this.currentRequItem.Quantity = 1;
    this.dispatch.DispatchItems.push(this.currentRequItem);


    let nextInputIndex = this.dispatch.DispatchItems.length - 1;
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
  DeleteitemRow(index) {
    try {
      this.dispatch.DispatchItems.splice(index, 1);
      if (this.dispatch.DispatchItems.length == 0) {
        this.AdditemRowRequest();
      }
    }
    catch (exception) {
      this.messageBoxService.showMessage("Error", [exception]);
    }
  }

  SelectItemFromSearchBox(Item: any, index) {   
    if (typeof Item === "object" && !Array.isArray(Item) && Item !== null) {    
        for (var a = 0; a < this.dispatch.DispatchItems.length; a++) {         
          if (a == index) {
            this.dispatch.DispatchItems[index].ItemId = Item.ItemId;
            this.dispatch.DispatchItems[index].Code = Item.Code;
            this.dispatch.DispatchItems[index].ItemName = Item.ItemName;                     

           this.barcodelist = this.AllItemList.filter(item => item.ItemId == Item.ItemId);

          }
        }     
    }
  }

  OnBarCodeChange(i,j,selectedBarCode:any,itemId) {
    let checkIsItem=false;
    if (typeof selectedBarCode === "object" && !Array.isArray(selectedBarCode) && selectedBarCode !== null) {
      for (var p = 0; p < this.dispatch.DispatchItems.length; p++) {
          if (this.dispatch.DispatchItems[p].BarCodeNumber == selectedBarCode.BarCodeNumber && this.dispatch.DispatchItems[p].ItemId == selectedBarCode.ItemId ) {
              checkIsItem = true;
          }
      }       
      if (checkIsItem == true) {
          this.messageBoxService.showMessage("notice-message", ["BarCodeNumber is already added Please Check!!!"]);
          this.dispatch.DispatchItems[i].selectedBarCode =null; 
          this.dispatch.DispatchItems.splice(i, 1);         
          checkIsItem = false;              
          //this.changeDetectorRef.detectChanges();
      }
      else {               
        this.dispatch.DispatchItems[i].BarCodeNumber=selectedBarCode.BarCodeNumber;
        this.dispatch.DispatchItems[i].BatchNo =selectedBarCode.BatchNo;
        this.dispatch.DispatchItems[i].FixedAssetStockId =selectedBarCode.FixedAssetStockId;              
      }
    }           
        
  }


  DirectDispatch() {

    this.loading = true;
    var errorMessages: Array<string> = [];
    var CheckIsValid = true;
    let checkBarcodeValid=true;
    this.dispatch.Remark = this.Remarks;
    this.dispatch.ReceivedBy = this.ReceivedBy;
 
    for (var i = 0; i < this.dispatch.DispatchItems.length; i++) {
      //Assign all the dispatchitems with the zero index dispatch items as we are saving all the details in only first dispatch item. 
      for (var a in this.dispatch.RequisitionValidator.controls) {
        this.dispatch.RequisitionValidator.controls[a].markAsDirty();
        this.dispatch.RequisitionValidator.controls[a].updateValueAndValidity();
      }

      if (this.dispatch.IsValidCheck(undefined, undefined) == false) {
        CheckIsValid = false;
      }
      for (var a in this.dispatch.RequisitionValidator.controls) {
        this.dispatch.RequisitionValidator.controls[a].markAsDirty();
        this.dispatch.RequisitionValidator.controls[a].updateValueAndValidity();
      }

      if (this.dispatch.IsValidCheck(undefined, undefined) == false) {
        CheckIsValid = false;
      }
    }
    for (var i = 0; i < this.dispatch.DispatchItems.length; i++) {
      // for loop is used to show RequisitionItemValidator message ..if required  field is not filled
      for (var a in this.dispatch.DispatchItems[i].RequisitionItemValidator.controls) {
        this.dispatch.DispatchItems[i].RequisitionItemValidator.controls[a].markAsDirty();
        this.dispatch.DispatchItems[i].RequisitionItemValidator.controls[a].updateValueAndValidity();
      }
      if (this.dispatch.DispatchItems[i].IsValidCheck(undefined, undefined) == false) {
        CheckIsValid = false;
      }    
    }
   
    if (!this.dispatch.Remark || this.dispatch.Remark.trim() == "") {      
      this.messageBoxService.showMessage("notice-message", ["Remarks is mandatory. Please fill remarks."]);
      CheckIsValid = false;
      this.loading = false;      
    }
    this.dispatch.DispatchItems.forEach(itm=>{        
      let isBarcCodeSelected=itm.FixedAssetStockId >0;               
      if(isBarcCodeSelected==false){
        checkBarcodeValid=false;
      }                    
  });
    if( !checkBarcodeValid){
      this.messageBoxService.showMessage("notice-message", ["Please select barcode and try again !!"]);
      this.loading = false;
      
    }
    if(CheckIsValid){
    this.fixedAssetBLService.PostdirectDispatch(this.dispatch).finally(() => this.loading = false)
      .subscribe(
        res => {
          if (res.Status == "OK") {
            this.messageBoxService.showMessage("success", ["Dispatch done successfully."]);
            this.loading = false;

            this.dispatch = new FixedAssetDispatch()
            this.AdditemRowRequest();
            this.Remarks = null;
            this.ReceivedBy = null;
            this.router.navigate(["/FixedAssets/AssetsSubstoreRequisition"]);
           
          }
          else {
            this.loading = false;
            this.messageBoxService.showMessage("failed", ["failed to add result.. please check log for details."]);
            this.logError(res.ErrorMessage);
           
          }
        },
        err => {
          this.logError(err);
        });
      } else { 
      this.loading = false; }
  }
  logError(err: any) {
    console.log(err);
  }

  //used to select store in autocomplete
  OnStoreChange() {
    let store = null;
    if (!this.selectedStore) {
      this.dispatch.SubStoreId = null;
    }
    else if (typeof (this.selectedStore) == 'string') {
      store = this.StoreList.find(a => a.ServiceDepartmentName.toLowerCase() == this.selectedStore.toLowerCase());
    }
    else if (typeof (this.selectedStore) == "object") {
      store = this.selectedStore;
    }
    if (store) {
      this.dispatch.SubStoreId = store.StoreId;
      this.dispatch.SubStoreName = store.Name;
      this.dispatch.RequisitionValidator.get("SubStoreId").setValue(store.Name);
    }
    else {
      this.dispatch.SubStoreId = null;
      this.dispatch.SubStoreName = "";
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
  ListFormatter(data: any): string {
    let html = data["BarCodeNumber"];
    return html;
}

  Cancel() {

    this.dispatch = new FixedAssetDispatch();
    this.Remarks = null;
    this.ReceivedBy = null;
    this.AdditemRowRequest();
  }

}
