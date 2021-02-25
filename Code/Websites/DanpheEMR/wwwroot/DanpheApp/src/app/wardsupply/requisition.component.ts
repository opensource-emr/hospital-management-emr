import { Component, ChangeDetectorRef } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router'
import PHRMGridColumns from '../pharmacy/shared/phrm-grid-columns';
import { GridEmitModel } from "../shared/danphe-grid/grid-emit.model";
import { PHRMGoodsReceiptItemsModel } from "../pharmacy/shared/phrm-goods-receipt-items.model";
import { RouteFromService } from "../shared/routefrom.service";
import { MessageboxService } from '../shared/messagebox/messagebox.service';
import { WardModel } from '../wardsupply/shared/ward.model'
import { WardRequisitionModel } from '../wardsupply/shared/ward-requisition.model'
import { WardRequisitionItemsModel } from '../wardsupply/shared/ward-requisition-items.model'
import { WardSupplyBLService } from '../wardsupply/shared/wardsupply.bl.service'
import WARDGridColumns from '../wardsupply/shared/ward-grid-cloumns'
import { SecurityService } from '../security/shared/security.service';
@Component({
  templateUrl: "../../app/view/ward-supply-view/Requisition.html"   //"/WardSupplyView/Requisition"
})
export class RequisitionComponent {

  //ward request list.
  public PHRMWardRequisitionGridColumns: Array<any> = null;
  public RequisitionGridData: any;
  public RequisitionGridDataFiltered: any;
  public RequisitionStatusFilter : string = "all";
  public showWardReqList: boolean = true;
  //ward request to phrm.
  public showDetails: boolean = false;
  public addNewRequest: boolean = false;
  public CurrentStoreId: number = 0;
  public wardName: string = null;
  public showAddItemPopUp: boolean = false;
  public showWardReqItem: boolean = false;

  public wardRequistion: WardRequisitionModel = new WardRequisitionModel();
  public wardRequistionItems: Array<WardRequisitionItemsModel> = new Array<WardRequisitionItemsModel>();
  public ItemListForReq: Array<PHRMGoodsReceiptItemsModel> = new Array<PHRMGoodsReceiptItemsModel>();
  public itemIdGRItemsMapData = new Array<{ ItemId: number, GRItems: Array<PHRMGoodsReceiptItemsModel> }>();
  public ItemTypeListWithItems: Array<any> = new Array<any>();

  public WardReqItemsList: Array<WardRequisitionItemsModel> = new Array<WardRequisitionItemsModel>();
  public WardDispatchList: Array<WardRequisitionItemsModel> = new Array<WardRequisitionItemsModel>();

  constructor(public wardsupplyBLService: WardSupplyBLService,
    public routeFromService: RouteFromService,
    public messageboxService: MessageboxService,
    public securityService: SecurityService,
    public changeDetectorRef: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public router: Router) {
    try {
      this.CurrentStoreId = this.securityService.getActiveStore().StoreId;
      if (!this.CurrentStoreId) {
        this.LoadSubStoreSelectionPage()
      }
      else {
        this.PHRMWardRequisitionGridColumns = WARDGridColumns.WARDRequestList;
        this.LoadItemTypeList();
        this.GetAllRequisitionByStoreId();
      }
    }
    catch (ex) {
      this.msgBoxServ.showMessage("Error", [ex.ErrorMessage]);
    }

  }

  LoadSubStoreSelectionPage() {
    this.router.navigate(['/WardSupply']);
  }

  switchTextBox(index) {
    window.setTimeout(function () {
      document.getElementById('qty-box' + index).focus();
    }, 0);
  }

  //START: ward Request code.

  GetAllRequisitionByStoreId() {
    var Status = "pending,partial,active,complete";
    this.wardsupplyBLService.GetWardRequisitionList(Status, this.CurrentStoreId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.RequisitionGridData = res.Results;
          this.LoadRequisitionListByStatus()
        } else {
          this.msgBoxServ.showMessage("failed", ['Failed to get OrderList.' + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ['Failed to get OrderList.' + err.ErrorMessage]);
        }
      );
  }
  LoadRequisitionListByStatus() {
    switch (this.RequisitionStatusFilter) {
      case "pending": {
        this.RequisitionGridDataFiltered = this.RequisitionGridData.filter(R => ["active", "partial","pending"].includes(R.Status));
        break;
      }
      case "complete": {
        this.RequisitionGridDataFiltered = this.RequisitionGridData.filter(R => R.Status == "complete");
        break;
      }
      default: {
        this.RequisitionGridDataFiltered = this.RequisitionGridData
      }
    }
  }
  PHRMWardRequestListGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "view":
        {
          var data = $event.Data;
          this.showWardReqItem = true;
          this.ShowWardRequisitionItemsDetailsById(data.RequisitionId);
        }
        break;
      default:
        break;
    }
  }

  ShowWardRequisitionItemsDetailsById(requsitionId) {

    this.wardsupplyBLService.GetWardReqItemList(requsitionId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.WardReqItemsList = res.Results;

        } else {
          this.msgBoxServ.showMessage("failed", ['Failed to get List.' + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ['Failed to get List.' + err.ErrorMessage]);
        }
      )

  }

  // END: ward Request code.

  //START: ward Request to phrm.

  // Load Item List 
  LoadItemTypeList(): void {
    try {
      this.wardsupplyBLService.GetItemTypeListWithItems()
        .subscribe(res => this.CallBackGetItemTypeList(res));
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  CallBackGetItemTypeList(res) {
    try {
      if (res.Status == 'OK') {
        if (res.Results) {
          this.ItemListForReq = new Array<PHRMGoodsReceiptItemsModel>();
          this.ItemListForReq = res.Results;
          this.AddRowRequest(0);
        }
      }
      else {
        err => {
          this.messageboxService.showMessage("failed", ['failed to get ItemTypeList..']);
        }
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  //This method calls when Item selection changed
  onChangeItem($event, index) {
    try {
      if ($event.ItemId > 0) {
        let itemId = $event.ItemId;
        this.wardRequistionItems[index].selectedItem = Object.assign(this.wardRequistionItems[index].selectedItem, $event);
        this.wardRequistionItems[index].BatchNo = $event.BatchNo;
        this.wardRequistionItems[index].ExpiryDate = $event.ExpiryDate;
      }
      else {
        // this.wardRequistionItems[index].GRItems = [];
      }

    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  //Add New row into list
  AddRowRequest(index) {
    try {
      var tempSale: WardRequisitionItemsModel = new WardRequisitionItemsModel();
      var new_index = index + 1;
      this.wardRequistionItems.push(tempSale);
      if (this.wardRequistionItems.length == 0) {
        this.wardRequistionItems.push(tempSale);

      } else {

      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }

  AddRowRequestOnClick(index) {
    try {
      var tempSale: WardRequisitionItemsModel = new WardRequisitionItemsModel();
      var new_index = index + 1;
      this.wardRequistionItems.push(tempSale);
      if (this.wardRequistionItems.length == 0) {
        this.wardRequistionItems.push(tempSale);

      } else {

      }
      window.setTimeout(function () {
        document.getElementById('item-box' + new_index).focus();
      }, 0);
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }
  //to delete the row
  DeleteRow(index) {
    try {
      this.wardRequistionItems.splice(index, 1);
      if (index == 0 && this.wardRequistionItems.length == 0) {
        this.AddRowRequest(0);
        // this.itemTypeId = 0;
      }
      else {
        this.changeDetectorRef.detectChanges();
      }

    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }

  CheckValidaiton(): boolean {
    try {
      let flag: boolean = true;
      for (var i = 0; i < this.wardRequistionItems.length; i++) {

        if (!this.wardRequistionItems[i].selectedItem && !this.wardRequistionItems[i].ItemName) {
          this.messageboxService.showMessage("Notice", ["Please select Medicine on row no. " + (i + 1).toString()]);
          flag = false;
          break;
        }
        if (this.wardRequistionItems[i].Quantity == 0) {
          this.messageboxService.showMessage("Notice", ["Please enter Quantity"]);
          flag = false;
          break;
        }

      }

      return flag;
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  //used to format display of item in ng-autocomplete
  myItemListFormatter(data: any): string {
    let html = "<font color='blue' size='03'>" + data["ItemName"] + "</font>(" + data["GenericName"] + ") B." + data["BatchNo"] + " <b>Q." + data["AvailableQty"]+"</b>";
    return html;
  }

  //This function only for show catch messages
  ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      this.routeFromService.RouteFrom = null;
      this.messageboxService.showMessage("error", ["Check error in Console log !"]);
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);

    }
  }

  //assign all values to post.
  AssignAllValues() {
    try {

      for (var i = 0; i < this.wardRequistionItems.length; i++) {

        if (this.wardRequistionItems[i].enableItmSearch) {
          this.wardRequistionItems[i].ItemId = this.wardRequistionItems[i].selectedItem.ItemId;
          this.wardRequistionItems[i].ItemName = this.wardRequistionItems[i].selectedItem.ItemName;
        }
        else {

          let curItmId = this.wardRequistionItems[i].ItemId;
          let curItm = this.ItemTypeListWithItems.find(itm => itm.ItemId == curItmId);

        }
      }

    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  // post ward request data to phrm.
  wardRequest() {
    try {

      let check: boolean = true;
      for (var j = 0; j < this.wardRequistionItems.length; j++) {
        for (var i in this.wardRequistionItems[j].WardRequestValidator.controls) {
          this.wardRequistionItems[j].WardRequestValidator.controls[i].markAsDirty();
          this.wardRequistionItems[j].WardRequestValidator.controls[i].updateValueAndValidity();
        }

      }
      if (check) {
        if (this.CheckValidaiton()) {
          this.AssignAllValues();
          this.wardRequistion.WardRequisitionItemsList = this.wardRequistionItems;
          this.wardRequistion.StoreId = this.CurrentStoreId;
          this.wardsupplyBLService.PostWardRequisition(this.wardRequistion).
            subscribe(res => {
              if (res.Status == "OK") {

                this.msgBoxServ.showMessage("success", ["Ward Request send successfully"]);
                this.Close();
              } else {

                this.msgBoxServ.showMessage("Failed", ["Failed to Ward Request "]);
              }
            });
        }
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }

  //close popup screen.
  Close() {
    this.addNewRequest = false;
    this.showWardReqItem = false;
    this.GetAllRequisitionByStoreId();
  }
  // open new request popup.
  CreateRequisition() {
    this.wardRequistionItems = new Array<WardRequisitionItemsModel>();
    this.AddRowRequest(0);
    this.addNewRequest = true;
  }

  //END: ward Request to phrm.
  AddItemPopUp() {
    this.showAddItemPopUp = false;
    this.changeDetectorRef.detectChanges();
    this.showAddItemPopUp = true;
  }

  OnNewItemAdded($event) {
    this.showAddItemPopUp = false;
    if ($event != undefined) {
      var item = $event.item;
      this.ItemListForReq.push(item);
      this.ItemListForReq.slice();
    }
  }
}
