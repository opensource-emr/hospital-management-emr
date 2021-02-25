import { Component, ChangeDetectorRef } from "@angular/core";
import { SettingsBLService } from '../../shared/settings.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { SettingsService } from '../../shared/settings-service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { BillItemPriceModel } from '../../shared/bill-item-price.model';
import * as moment from 'moment/moment';
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { DLService } from "../../../shared/dl.service";
import { CoreService } from "../../../core/shared/core.service";
import { SecurityService } from "../../../security/shared/security.service";
import { SettingsGridColumnSettings } from "../../../shared/danphe-grid/settings-grid-column-settings";

@Component({
  selector: 'billingItem-list',
  templateUrl: './billing-item-list.html',
})
export class BillingItemListComponent {
  public billingItemList: Array<BillItemPriceModel> = new Array<BillItemPriceModel>();
  public showGrid: boolean = false;
  public billingItemGridColumns: Array<any> = null;
  public showBillItemPriceHistoryPage: boolean = false;
  public billItemPriceChangeHistoryList: any;

  public showAddPage: boolean = false;
  public selectedItem: BillItemPriceModel;
  public index: number;
  public itemId: number = null;

  public setBillItmGriColumns: SettingsGridColumnSettings = null;

  constructor(public settingsBLService: SettingsBLService,
    public settingsServ: SettingsService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public securityService: SecurityService) {

    this.setBillItmGriColumns = new SettingsGridColumnSettings(this.coreService.taxLabel, this.securityService);
    this.billingItemGridColumns = this.setBillItmGriColumns.BillingItemList
    //this.billingItemGridColumns = this.settingsServ.settingsGridCols.BillingItemList;
    this.getBillingItemList();
    this.showBillItemPriceHistoryPage = false;
  }
  public getBillingItemList() {
    this.settingsBLService.GetBillingItemList(false)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.billingItemList = res.Results;
          this.showGrid = true;
        }
        else {
          alert("Failed ! " + res.ErrorMessage);
        }

      });
  }
  BillingItemGridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "edit": {
        this.selectedItem = null;
        this.index = $event.RowIndex;
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.selectedItem = $event.Data;
         console.log(this.selectedItem);
        this.showAddPage = true;
        break;
      }
      case "activateDeactivateBillItem": {
        if ($event.Data != null) {
          this.selectedItem = null;
          this.selectedItem = $event.Data;
          this.ActivateDeactivateBillItem(this.selectedItem);
        }
        break;
      }
      case "showHistory": {//view Price change history
        if ($event.Data != null) {
          this.selectedItem = null;
          this.selectedItem = $event.Data;
          this.ShowPriceChangeHistory(this.selectedItem);
        }
        break;
      }
      default:
        break;
    }
  }
  AddBillingItem() {
    this.showAddPage = false;
    this.changeDetector.detectChanges();
    this.showAddPage = true;
  }

  CallBackAdd($event) {

    let action = $event.action;

    if (action == "add" || action == "update") {
      // console.log($event.item);
      //find the index of currently added/updated item in the list of all items (grid)
      let itmIndex = this.billingItemList.findIndex(a => a.ItemId == $event.item.ItemId && a.ServiceDepartmentId == $event.item.ServiceDepartmentId);
      //index will be -1 when this item is currently added. 
      if (itmIndex < 0) {
        this.billingItemList.splice(0, 0, $event.item);//this will add this item to 0th index.
      }
      else {
        this.billingItemList.splice(itmIndex, 1, $event.item);//this will replace one item at particular index. 
      }
    }


    this.billingItemList = this.billingItemList.slice();
    this.changeDetector.detectChanges();
    this.getBillingItemList();
    this.showAddPage = false;
    this.itemId = null;
    this.selectedItem = null;
    this.index = null;




  }

  //Update BillingItem status- Activate or Deactivate 
  ActivateDeactivateBillItem(currBillItem: BillItemPriceModel) {
    if (currBillItem != null) {

      let proceed: boolean = true;

      if (currBillItem.IsActive) {
        proceed = window.confirm("This item will stop to show in Billing-Search. Are you sure you want to proceed ?")
      }

      if (proceed) {
        let status = currBillItem.IsActive == true ? false : true;
        currBillItem.IsActive = status;
        this.settingsBLService.UpdateBillingItem(currBillItem)
          .subscribe(
            (res: DanpheHTTPResponse) => {

              if (res.Status == "OK") {
                this.msgBoxServ.showMessage("success", ['Item Status updated successfully']);
                //This for send to callbackadd function
                let billItemUpdated = { item: currBillItem };
                this.CallBackAdd(billItemUpdated);
              }
              else {
                this.msgBoxServ.showMessage("error", ['Something wrong, Please Try again..!']);
              }
            },
            err => {
              this.logError(err);
            });
      }
    }

  }

  //Get and show BillItem Price change history
  ShowPriceChangeHistory(billItem: BillItemPriceModel) {
    if (billItem != null) {
      this.selectedItem = null;
      this.selectedItem = billItem;
      this.settingsBLService.GetBillItemChangeHistoryList(this.selectedItem.ItemId, this.selectedItem.ServiceDepartmentId)
        .subscribe(
          res => {
            this.CallBackBillItemChangeHistory(res);
          },
          err => {
            this.logError(err);
          });
    }
    else {
      this.msgBoxServ.showMessage("error", ['Something wrong, Please Try again..!']);
    }
  }

  //Show Bill Item Price change history details
  CallBackBillItemChangeHistory(res): void {
    if (res.Status == "OK" && res.Results != null) {
      this.showBillItemPriceHistoryPage = true;
      //below variable is not a strongly typed            
      this.billItemPriceChangeHistoryList = res.Results.filter(item => item.createdOn = moment(item.createdOn).format('DD-MMM-YYYY hh:mm A'));
    } else {
      this.msgBoxServ.showMessage("error", ['There is no bill item change history found, Please try again']);
    }
  }
  logError(err: any) {
    console.log(err);
    this.msgBoxServ.showMessage("error", [err]);
  }
  //Close Billing Item Price Change History Popup
  Close() {
    this.showBillItemPriceHistoryPage = false;
    this.selectedItem = null;
  }

  GetGridExportOptions() {
    let gridExportOptions = {
      fileName: 'Billing-Item-List-' + moment().format('YYYY-MM-DD') + '.xls',
      displayColumns: ["ServiceDepartmentName", "ItemCode", "ItemName", "Price", "IsFractionApplicable", "IsDoctorMandatory", "IsActive"]
    };
    return gridExportOptions;
  }
}
