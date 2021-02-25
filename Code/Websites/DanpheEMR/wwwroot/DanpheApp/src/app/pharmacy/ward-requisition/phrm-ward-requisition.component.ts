import { PharmacyMainComponent } from '../pharmacy-main.component';
import { Component, ChangeDetectorRef } from "@angular/core"
import { Router } from '@angular/router';
import * as moment from 'moment/moment';
import { RouteFromService } from "../../shared/routefrom.service";
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import PHRMGridColumns from '../shared/phrm-grid-columns';
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { PatientsBLService } from "../../patients/shared/patients.bl.service";
import { PharmacyBLService } from "../shared/pharmacy.bl.service";
import { WardRequisitionModel } from '../../wardsupply/shared/ward-requisition.model';
import { PharmacyService } from "../shared/pharmacy.service";
import { PHRMInvoiceItemsModel } from '../shared/phrm-invoice-items.model'
import { WardStockModel } from '../../wardsupply/shared/ward-stock.model';
import { CommonFunctions } from "../../shared/common.functions";

import { WardSupplyBLService } from '../../wardsupply/shared/wardsupply.bl.service';
import { PHRMGoodsReceiptItemsModel } from "../shared/phrm-goods-receipt-items.model";
import { PHRMItemTypeModel } from "../shared/phrm-item-type.model";
import { WardispatchModel } from '../../wardsupply/shared/ward-dispatch.model';
import { WardDispatchItemsModel } from '../../wardsupply/shared/ward-dispatch-items.model';
@Component({
  templateUrl: "./phrm-ward-requisition.html"
})
export class WardRequisitionItems {
  public showRequestItemList: boolean = true;
  public WardRequestItemsList: any;
  public showDispatchItem: boolean = false;
  public WardRequestedItemsGridColumns: Array<any> = null;
  public wardReqDispatch: WardispatchModel = new WardispatchModel();
  public WardReqItemsList: Array<WardDispatchItemsModel> = new Array<WardDispatchItemsModel>();
  public postwardRequisitionitm: Array<WardRequisitionModel> = new Array<WardRequisitionModel>();

  public ItemListForSale: Array<any> = new Array<any>();
  public WardId: number;
  public stockDetailsList: any;
  public subTotal: any;
  public currWardRequestItems: Array<WardStockModel> = new Array<WardStockModel>();
  constructor(public msgBoxServ: MessageboxService,
    public changeDetectorRef: ChangeDetectorRef,
    public patientBlService: PatientsBLService,
    public router: Router,
    public pharmacyService: PharmacyService,
    public pharmacyBLService: PharmacyBLService,
    public wardSupplyBLService: WardSupplyBLService,
    public messageboxService: MessageboxService,
    public wardBLService: WardSupplyBLService) {
    this.WardRequestedItemsGridColumns = PHRMGridColumns.WardRequestItemsList;
    this.LoadRequestListByStatus();
    this.LoadItemTypeList();
  }

  // get phrm items list.
  LoadItemTypeList(): void {
    try {
      //this.pharmacyBLService.GetItemTypeListWithItems()
      //    .subscribe(res => this.CallBackGetItemTypeList(res));

      this.wardBLService.GetItemTypeListWithItems()
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
          this.ItemListForSale = new Array<any>();
          this.ItemListForSale = res.Results;
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

  // Load ward request list
  LoadRequestListByStatus() {

    var Status = "pending,partial";
    this.pharmacyBLService.GetWardRequestedItemList(Status)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.WardRequestItemsList = res.Results;
          for (let i = 0; i < this.WardRequestItemsList.length; i++) {
            this.WardId = this.WardRequestItemsList[i].WardId;
          }
        } else {
          this.msgBoxServ.showMessage("failed", ['Failed to get OrderList.' + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ['Failed to get OrderList.' + err.ErrorMessage]);
        }
      );
  }

  PHRMWardRequestItemsGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "dispatch":
        {
          var data = $event.Data;
          this.pharmacyService.RequisitionId = $event.Data.RequisitionId;
          this.showRequestItemList = false;
          this.SetWardReqItemsData(data);
        }
        break;
      default:
        break;
    }
  }
  public SetWardReqItemsData(selectedData) {
    if (selectedData) {
      this.wardSupplyBLService.GetWardReqItemList(selectedData.RequisitionId)
        .subscribe(res => {
          if (res.Status == "OK") {
            let temp: Array<WardDispatchItemsModel> = res.Results;
            this.wardReqDispatch.RequisitionId = selectedData.RequisitionId;
            this.wardReqDispatch.StoreId = selectedData.StoreId;
            for (let i = 0; i < temp.length; i++) {
              try {
                let item = this.ItemListForSale.find(a => a.ItemId == temp[i].ItemId);
                temp[i].BatchNo = item.BatchNo;
                temp[i].ExpiryDate = item.ExpiryDate;
                temp[i].TotalQty = item.AvailableQty;
                temp[i].MRP = item.MRP;
                temp[i].CreatedOn = moment(new Date()).format('YYYY-MM-DD');
                if (temp[i].DispatchedQty >= temp[i].Quantity) {
                  continue;
                }
                else {
                  temp[i].Quantity -= temp[i].DispatchedQty;
                  temp[i].DispatchedQty = temp[i].Quantity;
                }
                this.WardReqItemsList.push(temp[i]);
                this.ValueChanged(i);
              }
              catch (ex) {
                this.msgBoxServ.showMessage("Notice", [temp[i].ItemName + "is not available"]);
              }
            }
          } else {
            this.msgBoxServ.showMessage("failed", ['Failed to get List.' + res.ErrorMessage]);
          }
        },
          err => {
            this.msgBoxServ.showMessage("error", ['Failed to get List.' + err.error.ErrorMessage]);
          });
    }
  }
  ValueChanged(index) {
    try {
      let tempWard = new Array<WardDispatchItemsModel>();
      tempWard = this.WardReqItemsList;

      if (this.WardReqItemsList[index].DispatchedQty <= 0) {
        tempWard[index].notValid = true;
      }
      else {
        tempWard[index].notValid = false;
      }
      this.WardReqItemsList = tempWard;
      let temp = (this.WardReqItemsList[index].DispatchedQty) * this.WardReqItemsList[index].MRP;
      this.WardReqItemsList[index].SubTotal = CommonFunctions.parseAmount(temp);

      this.subTotal = 0;
      this.WardReqItemsList.forEach(a => this.subTotal += a.SubTotal);

    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }


  }

  // saved requested data into pharmacy ward dispatch table
  Save() {
    try {
      let check: boolean = true;
      var qntCheck = true

      for (var j in this.wardReqDispatch.DispatchValidator.controls) {
        this.wardReqDispatch.DispatchValidator.controls[j].markAsDirty();
        this.wardReqDispatch.DispatchValidator.controls[j].updateValueAndValidity();
      }

      for (let i = 0; i < this.WardReqItemsList.length; i++) {
        this.WardReqItemsList[i].notValid = (this.WardReqItemsList[i].DispatchedQty <= 0) ? true : this.WardReqItemsList[i].notValid;
        this.WardReqItemsList[i].notValid = (this.WardReqItemsList[i].DispatchedQty === undefined) ? true : this.WardReqItemsList[i].notValid;
        qntCheck = (this.WardReqItemsList[i].TotalQty < this.WardReqItemsList[i].DispatchedQty) ? false : qntCheck;
        if (this.WardReqItemsList[i].notValid == true) {
          check = false;
        }

      }
      if (!qntCheck) {
        check = false;
        this.msgBoxServ.showMessage("error", ['please check error, try again !']);
      }
      if (check && this.wardReqDispatch.IsValidCheck(undefined, undefined)) {
        //  if (this.CheckValidaiton()) {

        for (var i = 0; i < this.WardReqItemsList.length; i++) {
          this.WardReqItemsList[i].Quantity = this.WardReqItemsList[i].DispatchedQty;
          this.WardReqItemsList[i].Remark = this.wardReqDispatch.Remark;
        }
        this.wardReqDispatch.WardDispatchedItemsList = this.WardReqItemsList;
        this.pharmacyBLService.PostWardRequisitionItems(this.wardReqDispatch).
          subscribe(res => {
            if (res.Status == "OK") {

              this.msgBoxServ.showMessage("success", ["successfully saved"]);
              this.LoadRequestListByStatus();
              this.LoadItemTypeList();
              this.WardReqItemsList = new Array<WardDispatchItemsModel>();
              this.wardReqDispatch = new WardispatchModel();
              this.showRequestItemList = true;


            } else {
              this.msgBoxServ.showMessage("Failed", ["Failed "]);
            }
          });
        // }
      }
      else {
        this.messageboxService.showMessage("error", ['please check error, try again !']);
      }

    }
    catch (ex) {
    }

  }
  //to delete the row
  DeleteRow(index) {
    try {
      this.WardReqItemsList.splice(index, 1);
      if (index == 0 && this.WardReqItemsList.length == 0) {
        this.AddRowRequest(0);
      }
      else {
        this.changeDetectorRef.detectChanges();
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }
  //Add New row into list
  AddRowRequest(index) {
    try {
      var tempReq: WardDispatchItemsModel = new WardDispatchItemsModel();
      this.WardReqItemsList.push(tempReq[0]);
      if (this.WardReqItemsList.length == 0) {
        this.WardReqItemsList.push(tempReq[0]);

      } else {

      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }

  AddRowRequestOnClick(index) {
    try {
      var tempReq: WardDispatchItemsModel = new WardDispatchItemsModel();
      this.WardReqItemsList.push(tempReq);
      if (this.WardReqItemsList.length == 0) {
        this.WardReqItemsList.push(tempReq);

      } else {

      }


    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }

  //This function only for show catch messages
  ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
      //this.messageboxService.showMessage("error", [ex.message + "     " + ex.stack]);
    }
  }
  Cancel() {
    this.showRequestItemList = true;
    this.wardReqDispatch = new WardispatchModel();
    this.WardReqItemsList = new Array<WardDispatchItemsModel>();
    this.subTotal = null;
  }

  myItemListFormatter(data: any): string {
    let html = data["ItemName"] + " |B.No.|" + data["BatchNo"] + " |M.R.P|" + data["MRP"];
    return html;
  }

  onChangeItem($event, index) {
    try {

      if ($event.ItemId > 0) {
        let itemId = $event.ItemId;
        this.WardReqItemsList[index].Quantity = $event.Quantity;
        this.WardReqItemsList[index].BatchNo = $event.BatchNo;
        this.WardReqItemsList[index].ExpiryDate = $event.ExpiryDate;
        this.WardReqItemsList[index].MRP = $event.MRP;
        this.WardReqItemsList[index].TotalQty = $event.AvailableQuantity;
        this.WardReqItemsList[index].ItemId = this.ItemListForSale.find(a => a.ItemId == $event.ItemId).ItemId;
        this.WardReqItemsList[index].ItemName = this.ItemListForSale.find(a => a.ItemId == $event.ItemId).ItemName;

      }
      else {

      }

    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
} 
