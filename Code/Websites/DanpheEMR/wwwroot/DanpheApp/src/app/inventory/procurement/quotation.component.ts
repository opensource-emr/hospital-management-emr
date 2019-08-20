import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { SecurityService } from '../../security/shared/security.service';
import { InventoryBLService } from "../shared/inventory.bl.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { InventoryService } from '../shared/inventory.service';
import { GridEmitModel } from '../../shared/danphe-grid/grid-emit.model';
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { QuotationModel } from '../shared/quotation.model';

@Component({
  selector: 'quotation-list',
  templateUrl: "../../view/inventory-view/Quotation.html"  // "/InventoryView/PurchaseOrderItems"
})
export class QuotationComponent {

  public quotationList: Array<QuotationModel> = new Array<QuotationModel>();
  public index: number = 0;
  public QuotationGridColumns: Array<any> = null;
  public polistVendorwiseGridColumns: Array<any> = null;
  public QuotationItems: any;
  public disable: boolean = true;
  public localDatalist: Array<any> = [];
  public showQuotationItemsList: boolean = false;
  public quoList: any;
  public selectedDatalist: Array<any> = [];
  public showReqForQuotationId: boolean = false;
  public showQuotationPrintPage: boolean = false;

  constructor(public inventoryBLService: InventoryBLService,
    public inventoryService: InventoryService,
    public changeDetectorRef: ChangeDetectorRef,
    public messageBoxService: MessageboxService,
    public securityService: SecurityService,
    public router: Router) {

    this.QuotationGridColumns = GridColumnSettings.QuotationList;
    let ReqForQuotationId = this.inventoryService.ReqForQuotationId;
    this.LoadQuotationListById(ReqForQuotationId);
  }

  AddQuotation() {
    this.router.navigate(['/Inventory/ProcurementMain/QuotationItems']);
  }

  LoadQuotationListById(ReqForQuotationId) {
    this.inventoryBLService.GetQuotationList(ReqForQuotationId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.quotationList = res.Results
        }
        else {
          this.messageBoxService.showMessage("failed", ['failed to get Quotation list.. please check log for details.']);
          console.log(res.ErrorMessage);
        }
      });
  }

  ngAfterViewChecked() {
    this.changeDetectorRef.detectChanges();
  }

  QuotationGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "view": {
        var data = $event.Data;
        this.ShowQuotationItemsById(data.QuotationId);
      }
        break;
      default:
        break;
    }
  }

  ShowQuotationItemsById(QuotationId) {
    this.inventoryBLService.GetQuotationItemsById(QuotationId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.QuotationItems = res.Results;
          this.showQuotationItemsList = true;
        } else {
          this.messageBoxService.showMessage("failed", ['Failed to get QuotationItem.' + res.ErrorMessage]);
        }
      },
        err => {
          this.messageBoxService.showMessage("error", ['Failed to get QuotationItem.' + err.ErrorMessage]);
        })
  }

  Close() {
    this.showReqForQuotationId = false;
    this.showQuotationItemsList = false;
    this.showQuotationPrintPage = false;
  }

  /// In Future client wants to print instead of view child so we can use this print func

  // print() {
  //   let popupWinindow;
  //   var printContents = document.getElementById("printpage").innerHTML;
  //   popupWinindow = window.open('');
  //   popupWinindow.document.open();
  //   popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../../themes/theme-default/ReceiptList.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
  //   popupWinindow.document.close();
  // }

}
