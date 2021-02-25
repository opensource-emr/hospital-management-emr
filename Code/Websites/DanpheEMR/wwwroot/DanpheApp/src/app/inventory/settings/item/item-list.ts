import { Component, ChangeDetectorRef } from "@angular/core";
import { ItemModel } from '../shared/item.model';
import { InventorySettingBLService } from "../shared/inventory-settings.bl.service";
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import * as moment from 'moment/moment';
import { InventoryService } from "../../shared/inventory.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
//testing
@Component({
  selector: 'item-list',
  templateUrl: './item-list.html',
})
export class ItemListComponent {
  public itemList: Array<ItemModel> = new Array<ItemModel>();
  public showitemList: boolean = true;
  public itemGridColumns: Array<any> = null;
  public showAddPage: boolean = false;
  public selectedItem: ItemModel;
  public index: number;

  constructor(
    public invSettingBL: InventorySettingBLService,
    public inventoryService: InventoryService,
    public messageBoxService: MessageboxService,
    public changeDetector: ChangeDetectorRef) {
    this.itemGridColumns = GridColumnSettings.ItemList;
    this.GetItemList();
  }
  GetItemList() {
    try {
      this.itemList = this.inventoryService.allItemList;
      this.itemList = this.itemList.slice();
      if (this.itemList.length == 0) {
        this.messageBoxService.showMessage("Failed", ["No items found."])
      }
    } catch (ex) {
      this.messageBoxService.showMessage("Failed", ["Something went wrong while loading the item list."])
    }
  }

  ItemGridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "edit": {
        this.selectedItem = null;
        this.index = $event.RowIndex;
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.selectedItem = $event.Data;
        this.showAddPage = true;
      }
      default:
        break;
    }
  }
  AddItem() {
    this.showAddPage = false;
    this.changeDetector.detectChanges();
    this.showAddPage = true;
  }

  CallBackAdd($event) {
    this.GetItemList();
    this.changeDetector.detectChanges();
    this.showAddPage = false;
    this.selectedItem = null;
    this.index = null;
  }

  GetGridExportOptions() {
    let gridExportOptions = {
      fileName: 'InventoryItemList_' + moment().format('YYYY-MM-DD') + '.xls',
      displayColumns: ["ItemName", "Code", "ItemType", "UOMName", "SubCategoryName", "StandardRate","IsVATApplicable", "IsActive"]
    };
    return gridExportOptions;
  }
}
