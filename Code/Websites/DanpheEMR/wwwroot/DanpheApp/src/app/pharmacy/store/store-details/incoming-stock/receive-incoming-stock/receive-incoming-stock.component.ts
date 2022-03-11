
import { Component, ChangeDetectorRef, Input, OnInit, EventEmitter, Output } from "@angular/core";
import { PharmacyBLService } from "../../../../shared/pharmacy.bl.service"
import { MessageboxService } from '../../../../../shared/messagebox/messagebox.service';

@Component({
  selector: 'app-receive-incoming-stock',
  templateUrl: './receive-incoming-stock.component.html',
  styleUrls: ['./receive-incoming-stock.component.css'],
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class ReceiveIncomingStock implements OnInit {
  @Input('dispatchId') dispatchId: number;
  incomingStockDetail: any;
  receivingRemarks: any;
  @Output('callback-update') callBackUpdate: EventEmitter<Object> = new EventEmitter<Object>();
  constructor(public pharmacyBLService: PharmacyBLService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService) {
    this.setFocusById('remarks');
  }
  ngOnInit(): void {
    this.pharmacyBLService.GetMainStoreIncomingStockById(this.dispatchId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.incomingStockDetail = res.Results.IncomingStockDetail;
        }
        else {
          this.msgBoxServ.showMessage("Failed", ["Failed to load data."]);
          console.log(res.ErrorMessage);
        }
      })
  }
  ReceiveIncomingStock(dispatchId: number, receivingRemarks: string) {
    this.pharmacyBLService.ReceiveIncomingStock(dispatchId, receivingRemarks)
      .subscribe(
        res => {
          if (res.Status == "OK" && res.Results != null) {
            this.msgBoxServ.showMessage("success", ['Stock Received Successfully!']);
            this.callBackUpdate.emit({ event: 'success' })
          }
          else {
            this.msgBoxServ.showMessage("failed", ["Something Wrong " + res.ErrorMessage]);
          }
        },
        err => {
          this.msgBoxServ.showMessage("error", ["Something Wrong " + err.error.ErrorMessage]);
        });

  }
  Close() {
    this.incomingStockDetail = null;
    this.callBackUpdate.emit({ event: 'close' })
  }
  setFocusById(id: string) {
    var Timer = setTimeout(() => {
      if (document.getElementById(id)) {
        let nextEl = <HTMLInputElement>document.getElementById(id);
        nextEl.focus();
        clearTimeout(Timer);
      }
    }, 100)
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

  hotkeys(event) {
    //ESC Key shortcut handling
    if (event.keyCode == 27) {
      this.Close();
    }
  }
}


