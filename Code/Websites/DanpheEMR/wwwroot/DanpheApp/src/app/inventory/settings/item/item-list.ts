import { Component, ChangeDetectorRef } from "@angular/core";
import { ItemModel } from '../shared/item.model';
import { InventorySettingBLService } from "../shared/inventory-settings.bl.service";
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import * as moment from 'moment/moment';
import { InventoryService } from "../../shared/inventory.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { CoreService } from "../../../core/shared/core.service";
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
  registerPageNumberParameter: { Show: boolean, LabelDisplayName: string } = { Show: false, LabelDisplayName: '' };

  constructor(
    public invSettingBL: InventorySettingBLService,
    public inventoryService: InventoryService,
    public messageBoxService: MessageboxService,
    public coreService: CoreService,
    public changeDetector: ChangeDetectorRef) {
    this.itemGridColumns = GridColumnSettings.ItemList;
    this.checkForRegPageNumCustomization();
    this.GetItemList();
  }
  private checkForRegPageNumCustomization() {
    this.registerPageNumberParameter = this.GetInvItemRegisterPageNODisplaySetting();
    if (this.registerPageNumberParameter) {
      if (this.registerPageNumberParameter.Show == false) {
        this.itemGridColumns = this.itemGridColumns.filter(a => a.field != "RegisterPageNumber");
      }
      else {
        var regPageNumGridCol = this.itemGridColumns.find(a =>  a.field == "RegisterPageNumber");
        regPageNumGridCol.headerName = this.registerPageNumberParameter.LabelDisplayName;
      }
    }
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
        this.FocusElementById('ItemName');
      }
      default:
        break;
    }
  }
  AddItem() {
    this.showAddPage = false;
    this.FocusElementById('ddlItemCategory');
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
      displayColumns: ["ItemName", "Code", "ItemType", "UOMName", "RegisterPageNumber", "SubCategoryName", "StandardRate", "IsVATApplicable", "IsActive"]
    };
    return gridExportOptions;
  }
  FocusElementById(id: string) {
    window.setTimeout(function () {
      let itmNameBox = document.getElementById(id);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 600);
  }

  public GetInvItemRegisterPageNODisplaySetting() {
    var param = this.coreService.Parameters.find(
      (val) =>
        val.ParameterName == "ItemAddDisplaySettings" &&
        val.ParameterGroupName.toLowerCase() == "inventory"
    );
    if (param) {
      return JSON.parse(param.ParameterValue).RegisterPageNumber;
    } else {
      this.messageBoxService.showMessage("warning", [
        "Please set ItemAddDisplaySettings for Inventory module in parameters",
      ]);
      return null;
    }
  }
}
