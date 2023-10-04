import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../../core/shared/core.service';
import { ActivateInventoryService } from '../../../shared/activate-inventory/activate-inventory.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ItemModel } from '../../settings/shared/item.model';
import { CapitalStockModel } from '../shared/capital-stock.model';
import { ConsumableStockModel } from '../shared/consumable-stock.model';
import { InventoryReportsBLService } from '../shared/inventory-reports.bl.service';

@Component({
  selector: 'app-capital-stock-ledger',
  templateUrl: './capital-stock-ledger.component.html'
})
export class CapitalStockLedgerComponent implements OnInit {

  public capitalStock: CapitalStockModel = new CapitalStockModel();
  public FromDate: string = null;
  public ToDate: string = null;
  public loading: boolean = false;
  dateRange: string;
  ItemName: any;
  public itemList: Array<ItemModel> = new Array<ItemModel>();
  public selecteditem: any;
  public selectedStoreId: any;
  CapitalStockLedgerData: CapitalStockModel[] = [];
  public headerDetail: { header1, header2, header3, header4, hospitalName, address, email, PANno, tel, DDA };
  public fiscalYearId: number = null;
  printDetaiils: HTMLElement;
  showPrint: boolean = false;
  ledgerOrderDetail: any = null;
  constructor(public msgBox: MessageboxService, public inventoryReportBLService: InventoryReportsBLService, public coreService: CoreService,
    public activatedInventoryService: ActivateInventoryService) {
    this.selectedStoreId = this.activatedInventoryService.activeInventory.StoreId;
  }

  ngOnInit() {
    this.GetItem()
    this.GetInventoryBillingHeaderParameter();
  }

  OnFromToDateChange($event) {
    this.capitalStock.FromDate = $event ? $event.fromDate : this.FromDate;
    this.capitalStock.ToDate = $event ? $event.toDate : this.ToDate;
    this.fiscalYearId = $event.fiscalYearId;
  }
  ngAfterViewChecked() {
    this.dateRange = "<b>From:</b>&nbsp;" + this.capitalStock.FromDate + "&nbsp;<b>To:</b>&nbsp;" + this.capitalStock.ToDate;
  }
  onItemChange() {
    let item = null;
    this.ItemName = this.selecteditem.ItemName;
    if (!this.selecteditem) {
      this.capitalStock.ItemId = null;
    }
    else if (typeof (this.selecteditem) == 'string') {
      item = this.itemList.find(a => a.ItemName.toLowerCase() == this.selecteditem.toLowerCase());

    }
    else if (typeof (this.selecteditem == "object")) {
      item = this.selecteditem;

    }
    if (item) {
      this.capitalStock.ItemId = item.ItemId;
    }
    else {
      this.capitalStock.ItemId = null;
    }
  }
  GetItem() {
    this.inventoryReportBLService.GetItem()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.itemList = res.Results.filter(a => a.IsActive == true && a.ItemType == 'Capital Goods');
        } else {
          this.msgBox.showMessage("error", [res.ErrorMessage]);
        }

      });
  }

  ItemListFormatter(data: any): string {
    return data["ItemName"] + (data["Description"] == null || data["Description"] == "" ? "" : "|" + data["Description"]);
  }
  GetReportData() {
    this.loading = true;
    if (this.selecteditem == undefined) {
      this.msgBox.showMessage('Notification', ['Please select Item.']);
      this.loading = false;
      return;
    }
    this.inventoryReportBLService.CapitalStockLedger(this.capitalStock, this.selectedStoreId, this.fiscalYearId).finally(() => {
      this.loading = false;
    }).subscribe(res => {
      if (res.Status == "OK") {
        this.CapitalStockLedgerData = new Array<CapitalStockModel>();
        this.CapitalStockLedgerData = res.Results.capitalStockLedgerDetailViewModel;
        if (this.CapitalStockLedgerData.length == 0) {
          this.msgBox.showMessage("Error", ["There is no data available."]);
        }
        this.ledgerOrderDetail = res.Results.capitalStockLegerViewModel;
      }
      else {
        this.msgBox.showMessage('Failed', [`Failed To Get Stock Details. ${res.ErrorMessage}`]);
      }
    },
      err => {
        this.msgBox.showMessage('Failed', [`Failed To Get Stock Details. ${err.ErrorMessage}`]);
      });
  }
  GetInventoryBillingHeaderParameter() {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Inventory Receipt Header').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    else
      this.msgBox.showMessage("error", ["Please enter parameter values for BillingHeader"]);
  }
  print() {
    this.printDetaiils = document.getElementById("printpage");
    this.showPrint = true;
  }
  callBackPrint() {
    this.printDetaiils = null;
    this.showPrint = false;
  }


}
