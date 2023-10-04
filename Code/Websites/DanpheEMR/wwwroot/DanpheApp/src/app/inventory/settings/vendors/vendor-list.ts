
import { Component, ChangeDetectorRef } from "@angular/core";

import { VendorsModel } from '../shared/vendors.model';
import { InventorySettingBLService } from "../shared/inventory-settings.bl.service";

import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import * as moment from 'moment/moment';
import { InventoryService } from "../../shared/inventory.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
//testing
@Component({
  selector: 'vendor-list',
  templateUrl: './vendor-list.html',
})
export class VendorListComponent {
  public vendorList: Array<VendorsModel> = new Array<VendorsModel>();
  public showVendorList: boolean = true;
  public vendorGridColumns: Array<any> = null;

  public showAddPage: boolean = false;
  public selectedVendor: VendorsModel;
  public index: number;


  constructor(public invSettingBL: InventorySettingBLService, public inventoryService: InventoryService,
    public msgBoxService: MessageboxService,
    public changeDetector: ChangeDetectorRef) {
    this.vendorGridColumns = GridColumnSettings.vendorList;
    this.getVendorList();
  }
  public getVendorList() {
    try {
      this.vendorList = this.inventoryService.allVendorList;
      if (this.vendorList.length > 0) {
        this.showVendorList = true;
      }
      else {
        this.msgBoxService.showMessage("Failed", ["Can not load vendor list."])
      }
    } catch (ex) {
      this.msgBoxService.showMessage("Failed", ["Something went wrong while loading the Vendor List."])
    }
  }
  VendorGridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "edit": {
        this.selectedVendor = null;
        this.index = $event.RowIndex;
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.selectedVendor = $event.Data;
        this.selectedVendor.DefaultItem = JSON.parse(this.selectedVendor.DefaultItemJSON);
        this.showAddPage = true;
        this.FocusElementById('VendorName');
      }
      default:
        break;
    }
  }
  AddVendor() {
    this.showAddPage = false;
    this.FocusElementById('VendorName');
    this.changeDetector.detectChanges();
    this.showAddPage = true;
  }

  CallBackAdd($event) {
    if ($event != null) {
      //find the index of currently added/updated vendor in the list of all items (grid)
      let index = this.vendorList.findIndex(a => a.VendorId == $event.vendor.VendorId);
      //index will be -1 when this vendor is currently added. 
      if (index < 0) {
        this.vendorList.splice(0, 0, $event.vendor);//this will add this vendor to 0th index.
      }
      else {
        this.vendorList.splice(index, 1, $event.vendor);//this will replace one vendor at particular index. 
      }
    }
    this.vendorList = this.vendorList.slice();
    this.changeDetector.detectChanges();
    this.showAddPage = false;
    this.selectedVendor = null;
    this.index = null;
  }
  FocusElementById(id: string) {
    window.setTimeout(function () {
      let itmNameBox = document.getElementById(id);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 600);
  }

}
