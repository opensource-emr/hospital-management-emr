import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../../../inventory/shared/inventory.service';
import { Router } from '@angular/router';
import { WardSupplyBLService } from '../../../shared/wardsupply.bl.service';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';

@Component({
  selector: 'app-inventory-ward-receive-stock',
  templateUrl: './inventory-ward-receive-stock.html',
})
export class InventoryWardReceiveStockComponent implements OnInit {
  public Requisition: IRequisitionDetail;
  public DispatchList: Array<IDispatchListView> = [];
  public loading:boolean;
  constructor(public InventoryService: InventoryService,
    public wardsupplyBLService: WardSupplyBLService,
    public messageBoxService: MessageboxService,
    public router: Router) { }

  ngOnInit() {
    this.LoadDispatchListByRequisitionId();
  }

  private LoadDispatchListByRequisitionId() {
    var RequisitionId = this.InventoryService.RequisitionId;
    if (RequisitionId > 0) {
      this.loading = true;
      this.wardsupplyBLService.GetDispatchListForItemReceive(RequisitionId)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.Requisition = res.Results.RequisitionDetail;
            this.DispatchList = res.Results.DispatchDetail;
            this.loading = false;
            this.setFocusById('ReceivedRemarks');
          }
          else {
            this.messageBoxService.showMessage("Failed",[res.ErrorMessage]);
          }
        }, err => {
          this.messageBoxService.showMessage("Failed",[err.error.ErrorMessage]);
        })
    }
    else {
      this.RouteBack();
    }
  }
  ReceiveDispatchById(dispatchId: number,receivedRemarks:string) {
    this.loading = true;
    this.wardsupplyBLService.PutUpdateDispatchedItemsReceiveStatus(dispatchId,receivedRemarks)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.messageBoxService.showMessage("Success", ["Items Received Successfully.", "Stock updated."]);
          this.LoadDispatchListByRequisitionId();
        }
        else{
          this.messageBoxService.showMessage("Failed",[res.ErrorMessage]);
          this.loading = false;
        }
      },err=>{
        this.messageBoxService.showMessage("Failed",[err.error.ErrorMessage]);
        this.loading = false;
      })
  }
  Print() {
    //this is used to print the receipt

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
    this.InventoryService.RequisitionId = 0;
    this.router.navigate(['/WardSupply/Inventory/InventoryRequisitionList']);
  }
  setFocusById(targetId: string, waitingTimeinMS: number = 10) {
    var timer = window.setTimeout(function () {
      let htmlObject = document.getElementById(targetId);
      if (htmlObject) {
        htmlObject.focus();
      }
      clearTimeout(timer);
    }, waitingTimeinMS);
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
  DispatchItems: {
    DispatchItemId: number;
    ItemId: number;
    ItemName: string;
    RequestedQuantity: number;
    DispatchedQuantity: number;
    PendingQuantity: number;
  };
}