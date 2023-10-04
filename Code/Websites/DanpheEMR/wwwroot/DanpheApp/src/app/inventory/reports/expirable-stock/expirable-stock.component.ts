import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import ProcurementGridColumns from '../../../procurement/shared/procurement-grid-column';

import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ItemModel } from '../../settings/shared/item.model';
import { InventoryBLService } from '../../shared/inventory.bl.service';
import { InventorySettingBLService } from '../../settings/shared/inventory-settings.bl.service';
import { ActivateInventoryService } from '../../../shared/activate-inventory/activate-inventory.service';

@Component({
  selector: 'app-consumable-stock-ledger',
  templateUrl: './expirable-stock.component.html'
})
export class ExpirableStockComponent implements OnInit {
  public loading: boolean = false;
  public fiscalYearId: number = null;
  public expirableStockGridColumns: Array<any> = [];
  public fromDate: string = '';
  public toDate: string = '';
  public dateRange: string = 'None';
  public selectedCategory: number = 0;
  public selectedSubCategory: number = 0;
  showDetailsBox: boolean = false;
  selectedItemId: number = -1;
  public itemList: Array<ItemModel> = new Array<ItemModel>();
  filteredItemList: Array<ItemModel> = new Array<ItemModel>();
  public categoryList: any[] = [];
  public subCategoryList: any[] = [];
  public filteredSubCategoryList: any[] = [];
  selectedStoreId: number = null;

  constructor(public msgBox: MessageboxService,
    public inventorySettingBLService: InventorySettingBLService,
    public inventoryBLService: InventoryBLService, public activatedInventoryService: ActivateInventoryService) {
    this.expirableStockGridColumns = ProcurementGridColumns.ExpirableStockList
    this.selectedStoreId = this.activatedInventoryService.activeInventory.StoreId;
  }

  ngOnInit(): void {
    this.loadCategory();
    this.loadSubCategory();
    this.loadItems();
  }

  loadCategory() {
    this.inventorySettingBLService.GetItemCategory().subscribe(res => {
      if (res.Status == "OK") {
        this.categoryList = res.Results;
      }
    }, err => {
      this.msgBox.showMessage("Error", ["Unable to get item category. Check console for details"]);
    });

  }

  loadSubCategory() {
    this.inventorySettingBLService.GetItemSubCategory().subscribe(res => {
      if (res.Status == "OK") {
        this.subCategoryList = res.Results;
        this.filteredSubCategoryList = this.subCategoryList;
      }
    }, err => {
      this.msgBox.showMessage("Error", ["Unable to get item sub category. Check console for details"]);
    });
  }

  loadItems() {
    this.inventoryBLService.GetItemListByStoreId(this.selectedStoreId).subscribe(res => {
      if (res.Status == "OK") {
        this.itemList = res.Results;
        this.filteredItemList = this.itemList;
      }
    })
  }

  //handles change of SubCategory Selection
  onChangeColumnSelection($event) {
    let subCat = [];
    $event.map(x => {
      subCat.push(x.SubCategoryId);
    })
    if (subCat.length != 0) {
      if (this.selectedCategory && this.selectedCategory != 0) {
        this.filteredItemList = this.itemList.filter(x => x.ItemCategoryId == this.selectedCategory && subCat.includes(x.SubCategoryId));
      } else {
        this.filteredItemList = this.itemList.filter(x => subCat.includes(x.SubCategoryId));
      }
    } else {
      if (this.selectedCategory && this.selectedCategory != 0) {
        this.filteredItemList = this.itemList.filter(x => x.ItemCategoryId == this.selectedCategory);
      } else {
        this.filteredItemList = this.itemList;
      }
    }
  }

  onFromToDateChange($event) {

    if ($event && $event != null) {
      if ($event.fromDate != this.fromDate || $event.toDate != this.toDate || this.fiscalYearId != $event.fiscalYearId) {
        this.fromDate = $event.fromDate;
        this.toDate = $event.toDate;
        this.fiscalYearId = $event.fiscalYearId;
      }
    }
  }

  handleGridAction($event) {
    switch ($event.Action) {
      case "view":
        {
          const body = <HTMLElement>document.getElementsByTagName("BODY")[0];
          body.style.overflow = 'hidden';
          this.selectedItemId = $event.Data.ItemId;
          this.showDetailsBox = true;
          break;
        }
      default:
        break;
    }
  }

  close() {
    const body = <HTMLElement>document.getElementsByTagName("BODY")[0];
    body.style.overflow = 'auto';
    this.selectedItemId = -1;
    this.showDetailsBox = false;
  }
  getGridExportOptions() {
    let gridExportOptions = {
      fileName: 'PurchaseOrderList-' + moment().format('YYYY-MM-DD') + '.xls',
      displayColumns: ["PurchaseOrderId", "PoDate", "PRNumber", "VendorName", "VendorContact", "TotalAmount", "POStatus"]
    };
    return gridExportOptions;
  }

  onCategoryChange(selectedCategory) {
    this.filteredSubCategoryList = this.subCategoryList;
    if (selectedCategory && selectedCategory != 0) {
      this.filteredItemList = this.itemList.filter(x => x.ItemCategoryId == selectedCategory);
      if (selectedCategory == 1) {
        this.filteredSubCategoryList = this.subCategoryList.filter(x => x.IsConsumable == false);
      } else if (selectedCategory == 2) {
        this.filteredSubCategoryList = this.subCategoryList.filter(x => x.IsConsumable == true);

      }
    }
    else {
      this.filteredItemList = this.itemList;
    }
  }

}