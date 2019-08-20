import { Component } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';

import { RequisitionItems } from "../shared/requisition-items.model";
import { ItemMaster } from "../shared/item-master.model";
import { InventoryBLService } from "../shared/inventory.bl.service";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { RouteFromService } from "../../shared/routefrom.service";
import { InventoryService } from '../shared/inventory.service';
import { CoreService } from "../../core/shared/core.service"
import * as moment from 'moment/moment';
@Component({
  templateUrl: "../../view/inventory-view/RequisitionDetails.html"  // "/InventoryView/RequisitionDetails"
})
export class RequisitionDetailsComponent {
  public requisitionItemsDetails: Array<RequisitionItems> = new Array<RequisitionItems>();
  public departmentName: string = "";
  public requisitionId: number = 0;
  public requisitionDate: string = null;
  public ShowOutput: number = 0;
  public header: any = null;
  public createdby: string = "";
  public dispatchedby: string = "";
  public receivedby: string = "";
    msgBoxServ: any;


  constructor(
    public InventoryBLService: InventoryBLService,
    public inventoryService: InventoryService,
    public messageBoxService: MessageboxService,
    public router: Router,
    public routeFrom: RouteFromService,
    public coreservice: CoreService) {
    this.LoadRequisitionDetails(this.inventoryService.Id);
    this.GetInventoryBillingHeaderParameter();;
  }

  LoadRequisitionDetails(RequisitionId: number) {
    if (RequisitionId != null) {
      this.requisitionId = RequisitionId;
      this.departmentName = this.inventoryService.Name;
      this.InventoryBLService.GetRequisitionItemsByRID(RequisitionId)
        .subscribe(res => this.ShowRequisitionDetails(res));
    }
    else {
      this.messageBoxService.showMessage("notice-message", ['Please, Select Requisition for Details.']);
      // this.router.navigate(['/Inventory/InternalMain/RequisitionList']);
      this.requisitionList();
    }
  }

  ShowRequisitionDetails(res) {
    if (res.Status == "OK") {
      this.requisitionItemsDetails = res.Results;

      //Check if there is requisition created without any Requisition Item then simply go to requisition List 
      //Because If there is no Items then we can't show anything.
      if (this.requisitionItemsDetails.length > 0) {
        this.requisitionItemsDetails.forEach(itm => {
          itm.CreatedOn = moment(itm.CreatedOn).format('YYYY-MM-DD');
        });
        this.requisitionDate = this.requisitionItemsDetails[0].CreatedOn;
        this.createdby = this.requisitionItemsDetails[0].CreatedByName;
        this.dispatchedby = this.requisitionItemsDetails[0].DispatchedByName;
        this.receivedby = this.requisitionItemsDetails.find(a => a.ReceivedBy != null).ReceivedBy;
        var status = this.requisitionItemsDetails.find(a => a.RequisitionId == this.requisitionId);
        var updatedstatus = status.RequisitionItemStatus;

      }
      else {
        this.messageBoxService.showMessage("notice-message", ["Selected Requisition is without Items"]);
        this.requisitionList();
      }


    }
    else {
      this.messageBoxService.showMessage("notice-message", ["There is no Requisition details !"]);
      this.requisitionList();

    }
  }

  //this is used to print the receipt
  print() {
    let popupWinindow;
    var printContents = document.getElementById("printpage").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/ReceiptList.css" /></head><style>.printStyle {border: dotted 1px;margin: 10px 100px;}.print-border-top {border-top: dotted 1px;}.print-border-bottom {border-bottom: dotted 1px;}.print-border {border: dotted 1px;}.center-style {text-align: center;}.border-up-down {border-top: dotted 1px;border-bottom: dotted 1px;}</style><body onload="window.print()">' + printContents + '</html>');
    popupWinindow.document.close();
  }
  //route back
  requisitionList() {
    this.routeFrom.RouteFrom = "RequisitionDetails"
    this.router.navigate(['/Inventory/InternalMain/RequisitionList']);
  }

  public headerDetail: { hospitalName, address, email, PANno, tel, DDA };

  //Get Pharmacy Billing Header Parameter from Core Service (Database) assign to local variable
  GetInventoryBillingHeaderParameter() {
    var paramValue = this.coreservice.Parameters.find(a => a.ParameterName == 'Inventory BillingHeader').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    else
      this.msgBoxServ.showMessage("error", ["Please enter parameter values for BillingHeader"]);
  }
}
