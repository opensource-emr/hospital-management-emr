import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { PharmacyBLService } from '../../../shared/pharmacy.bl.service';
import PHRMReportsGridColumns from '../../../shared/phrm-reports-grid-columns';

@Component({
  selector: 'app-stock-transfers-report',
  templateUrl: './stock-transfers-report.component.html',
  styleUrls: ['./stock-transfers-report.component.css']
})
export class StockTransfersReportComponent implements OnInit {
  fromDate: string;
  toDate: string;
  allItemList: any[] = [];
  sourceStoreList: any[] = [];
  targetStoreList: any[] = [];
  public ItemId: number = null;
  public selectedItem: any;
  public selectedSourceStore: any = null;
  public selectedTargetStore: any = null;
  public NotReceivedStocks: boolean = false;
  stockTransfersResult: any[] = [];
  sourceStoreDetails: any;
  targetStoreDetails: any;
  sourceStoreId: number;
  targetStoreId: number;
  stockTransfersGridColumns: Array<any> = null;
  receivedStocks: any;
  transitionStocks: any[];
  grandTotal: any = { totalReceivedQuantity: 0, totalReceivedPurchaseValue: 0, totalReceivedSalesValue: 0, totalTransitionQuantity: 0, totalTransitionPurchaseValue: 0, totalTransitionSalesValue: 0, grandTotalTransferredQuantity: 0, grandTotalPurchaseValue: 0, grandTotalSalesValue: 0 }
  public footerContent = '';
  public dateRange: string = "";
  public pharmacy: string = "pharmacy";
  NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams()
  public loading: boolean = false;

  constructor(private phrmBLService: PharmacyBLService, private msgBoxServ: MessageboxService, public changeDetector: ChangeDetectorRef) {
    this.stockTransfersGridColumns = PHRMReportsGridColumns.PHRMStockTransfersReportList;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(
      ...[new NepaliDateInGridColumnDetail('TransferredOn', true),
      new NepaliDateInGridColumnDetail('ApprovedOn', true),
      new NepaliDateInGridColumnDetail('ReceivedOn', true)]
    );
    this.GetActiveStore();
    this.GetItemList();
  }

  ngOnInit() {
  }
  ngAfterViewChecked() {
    this.footerContent = document.getElementById("print_summary").innerHTML;
  }
  GetItemList() {
    this.phrmBLService.GetItemList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.allItemList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("Notice-Message", ["Failed to load item data."]);
        }
      }, () => {
        this.msgBoxServ.showMessage("Failed", ["Failed to load item data."]);
      });
  }
  GetActiveStore() {
    this.phrmBLService.GetActiveStore()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.sourceStoreList = res.Results;
          this.targetStoreList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("Notice-Message", ["Failed to load stores."]);
        }
      }, () => {
        this.msgBoxServ.showMessage("Failed", ["Failed to load stores."]);
      });
  }
  GetReportData() {
    this.loading = true;
    this.stockTransfersResult = [];
    this.grandTotal = { totalReceivedQuantity: 0, totalReceivedPurchaseValue: 0, totalReceivedSalesValue: 0, totalTransitionQuantity: 0, totalTransitionPurchaseValue: 0, totalTransitionSalesValue: 0, grandTotalTransferredQuantity: 0, grandTotalPurchaseValue: 0, grandTotalSalesValue: 0 }

    this.sourceStoreDetails = this.selectedSourceStore;
    this.targetStoreDetails = this.selectedTargetStore;
    this.sourceStoreId = this.sourceStoreDetails ? this.sourceStoreDetails.StoreId : null;
    this.targetStoreId = this.targetStoreDetails ? this.targetStoreDetails.StoreId : null;

    this.phrmBLService.getStockTransfersReport(this.fromDate, this.toDate, this.ItemId, this.sourceStoreId, this.targetStoreId, this.NotReceivedStocks)
      .subscribe(res => {
        if (res.Status == 'OK' && res.Results.length > 0) {
          this.stockTransfersResult = res.Results;
          this.receivedStocks = this.stockTransfersResult.filter(a => a.ReceivedBy != null && a.ReceivedOn != null); // filter the already received stcoks
          this.transitionStocks = this.stockTransfersResult.filter(a => a.ReceivedBy == null && a.ReceivedOn == null); // filter the transition or not received stocks
          this.grandTotal.grandTotalTransferredQuantity = this.stockTransfersResult.reduce((a, b) => a + b.TransferQuantity, 0);
          this.grandTotal.grandTotalPurchaseValue = this.stockTransfersResult.reduce((a, b) => a + b.PurchaseValue, 0);
          this.grandTotal.grandTotalSalesValue = this.stockTransfersResult.reduce((a, b) => a + b.SalesValue, 0);
          this.grandTotal.totalReceivedQuantity = this.receivedStocks.reduce((a, b) => a + b.TransferQuantity, 0);
          this.grandTotal.totalReceivedPurchaseValue = this.receivedStocks.reduce((a, b) => a + b.PurchaseValue, 0);
          this.grandTotal.totalReceivedSalesValue = this.receivedStocks.reduce((a, b) => a + b.SalesValue, 0);
          this.grandTotal.totalTransitionQuantity = this.transitionStocks.reduce((a, b) => a + b.TransferQuantity, 0);
          this.grandTotal.totalTransitionPurchaseValue = this.transitionStocks.reduce((a, b) => a + b.PurchaseValue, 0);
          this.grandTotal.totalTransitionSalesValue = this.transitionStocks.reduce((a, b) => a + b.SalesValue, 0);
          this.changeDetector.detectChanges();
          this.footerContent = document.getElementById("print_summary").innerHTML;
        }
        else if (res.Status == 'OK' && res.Results.length == 0) {
          this.msgBoxServ.showMessage("Notice-Message", ["No Data is Available for Selected Record"]);
        }
        else {
          console.log(res.ErrorMessage)
          this.msgBoxServ.showMessage("Failed", ["Cannot load data. Check console for details. "]);
        }
        this.loading = false;
      });
  }
  myItemListFormatter(data: any): string {
    let html = data["GenericName"] + " | " + data["ItemName"];
    return html;
  }
  onChangeItem($event) {
    try {
      if ($event.ItemId != null) {
        this.ItemId = this.selectedItem.ItemId;
      }
      else {
        this.ItemId = null;
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  CheckProperSelectedItem() {
    try {
      if ((typeof this.selectedItem !== 'object') || (typeof this.selectedItem === "undefined") || (typeof this.selectedItem === null)) {
        this.selectedItem = null;
        this.ItemId = null;
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;
    this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
  }
  gridExportOptions = {
    fileName: 'StockTransfersReport_' + moment().format('YYYY-MM-DD') + '.xls',
  };

}
