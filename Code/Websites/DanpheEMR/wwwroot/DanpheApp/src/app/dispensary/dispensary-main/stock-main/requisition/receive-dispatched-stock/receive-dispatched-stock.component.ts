import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageboxService } from '../../../../../shared/messagebox/messagebox.service';
import { DispensaryRequisitionService } from '../dispensary-requisition.service';

@Component({
  selector: 'app-receive-dispatched-stock',
  templateUrl: './receive-dispatched-stock.component.html',
  styleUrls: ['./receive-dispatched-stock.component.css']
})
export class ReceiveDispatchedStockComponent implements OnInit {
  public Requisition: IRequisitionDetail;
  public DispatchList: Array<IDispatchListView> = [];
  public loading: boolean;
  constructor(public dispensaryRequisitionService: DispensaryRequisitionService, public messageBoxService: MessageboxService, public router: Router) { }

  ngOnInit() {
    this.LoadDispatchListByRequisitionId();
    this.setFocusById('remarks');
  }
  private LoadDispatchListByRequisitionId() {
    var RequisitionId = this.dispensaryRequisitionService.RequisitionId;
    if (RequisitionId > 0) {
      this.loading = true;
      this.dispensaryRequisitionService.GetDispatchListForItemReceive(RequisitionId)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.Requisition = res.Results.RequisitionDetail;
            this.DispatchList = res.Results.DispatchDetail;
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
  ReceiveDispatchById(dispatchId: number, receivedRemarks: string) {
    this.loading = true;
    this.dispensaryRequisitionService.ReceiveDispatchedItems(dispatchId, receivedRemarks)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.messageBoxService.showMessage("Success", ["Items Received Successfully.", "Stock updated."]);
          this.LoadDispatchListByRequisitionId();
        }
        else {
          this.messageBoxService.showMessage("Failed", [res.ErrorMessage]);
          this.loading = false;
        }
      }, err => {
        this.messageBoxService.showMessage("Failed", [err.error.ErrorMessage]);
        this.loading = false;
      })
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
            .noPrint{display: none; visibility: hidden;}
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
    this.dispensaryRequisitionService.RequisitionId = 0;
    this.router.navigate(['/Dispensary/Stock/Requisition/List']);
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
  RequisitionItems: IRequisitionItemView[];
}
export interface IRequisitionItemView {
  ItemId: number;
  ItemName: string;
  GenericName: string;
  RequestedQuantity: number | null;
  PendingQuantity: number | null;
  DispatchedItems: IDispatchItemsView[];
}
interface IDispatchItemsView {
  DispatchItemId: number;
  ItemId: number;
  ItemName: string;
  BatchNo: string;
  ExpiryDate: string;
  RequestedQuantity: number;
  DispatchedQuantity: number;
  PendingQuantity: number;
}