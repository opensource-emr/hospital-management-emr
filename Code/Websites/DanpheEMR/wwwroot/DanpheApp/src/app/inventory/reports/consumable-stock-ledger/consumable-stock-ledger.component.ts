import { Component, OnInit } from '@angular/core';
import { AccHospitalInfoVM } from '../../../accounting/shared/acc-view-models';
import { CoreService } from '../../../core/shared/core.service';
import { ActivateInventoryService } from '../../../shared/activate-inventory/activate-inventory.service';
import { IGridFilterParameter } from '../../../shared/danphe-grid/grid-filter-parameter.interface';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ItemModel } from '../../settings/shared/item.model';
import { ConsumableStockModel } from '../shared/consumable-stock.model';
import { InventoryReportsBLService } from '../shared/inventory-reports.bl.service';

@Component({
  selector: 'app-consumable-stock-ledger',
  templateUrl: './consumable-stock-ledger.component.html'
})
export class ConsumableStockLedgerComponent implements OnInit {

  public consumableStock: ConsumableStockModel = new ConsumableStockModel();
  public FromDate: string = null;
  public ToDate: string = null;
  public loading: boolean = false;
  FilterParameters: IGridFilterParameter[] = [];
  dateRange: string;
  ItemName: any;
  public itemList: Array<ItemModel> = new Array<ItemModel>();
  public selecteditem: any;
  public selectedStoreId: any;
  ConsumableStockLedgerData: ConsumableStockModel[] = [];
  public headerDetail: { header1, header2, header3, header4, hospitalName, address, email, PANno, tel, DDA };
  public fiscalYearId: number = null;
  public HospitalInfoMaster: AccHospitalInfoVM;

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
    if ($event) {
      this.consumableStock.FromDate = $event.fromDate;
      this.consumableStock.ToDate = $event.toDate;
      this.fiscalYearId = $event.fiscalYearId;
    }
  }
  ngAfterViewChecked() {
    this.dateRange = "<b>From:</b>&nbsp;" + this.consumableStock.FromDate + "&nbsp;<b>To:</b>&nbsp;" + this.consumableStock.ToDate;
  }
  onItemChange() {
    let item = null;
    this.ItemName = this.selecteditem.ItemName;
    if (!this.selecteditem) {
      this.consumableStock.ItemId = null;
    }
    else if (typeof (this.selecteditem) == 'string') {
      item = this.itemList.find(a => a.ItemName.toLowerCase() == this.selecteditem.toLowerCase());

    }
    else if (typeof (this.selecteditem == "object")) {
      item = this.selecteditem;

    }
    if (item) {
      this.consumableStock.ItemId = item.ItemId;
    }
    else {
      this.consumableStock.ItemId = null;
    }
  }
  GetItem() {
    this.inventoryReportBLService.GetItem()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.itemList = res.Results.filter(a => a.IsActive == true && a.ItemType == 'Consumables');
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
    if (this.consumableStock.FromDate == null || this.consumableStock.ToDate == null || this.fiscalYearId == null) {
      this.msgBox.showMessage('Notification', ['Please select valid date.']);
      this.loading = false;
      return;
    }
    this.inventoryReportBLService.ConsumableStockLedger(this.consumableStock, this.selectedStoreId, this.fiscalYearId).finally(() => {
      this.loading = false;
    }).subscribe(res => {
      if (res.Status == "OK") {
        this.ConsumableStockLedgerData = new Array<ConsumableStockModel>();
        this.ConsumableStockLedgerData = res.Results.consumableStockLedgerDetailViewModel;
        if (this.ConsumableStockLedgerData.length == 0) {
          this.msgBox.showMessage("Error", ["There is no data available."]);
        }
        this.ledgerOrderDetail = res.Results.consumableStockLegerViewModel;
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
