import { Component, ChangeDetectorRef } from "@angular/core";
import { SettingsBLService } from '../../shared/settings.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { SettingsService } from '../../shared/settings-service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { CoreService } from "../../../core/shared/core.service";
import { SecurityService } from "../../../security/shared/security.service";
import { SettingsGridColumnSettings } from "../../../shared/danphe-grid/settings-grid-column-settings";
import { ReportingItemsModel } from "../../shared/reporting-items.model";
import { DynamicReportNameModel } from "../../shared/dynamic-report-names.model";

@Component({
  selector: 'reporting-items-list',
  templateUrl: './reporting-items-list.html',
})
export class ReportingItemsListComponent {
  public reportingItemsList: Array<ReportingItemsModel> = new Array<ReportingItemsModel>();
  public showGrid: boolean = false;
  public reportingItemsGridColumns: Array<any> = null;
  public showManageItem:boolean = false;

  public showAddPage: boolean = false;
  public selectedItem: ReportingItemsModel;
  public index: number;
  public itemId: number = null;

  public setBillItmGriColumns: SettingsGridColumnSettings = null;
  public dynamicReportNameObj: DynamicReportNameModel = new DynamicReportNameModel();
  public dynamicReportNameList: Array<DynamicReportNameModel> = [];

  constructor(public settingsBLService: SettingsBLService,
    public settingsServ: SettingsService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public securityService: SecurityService) {

    this.setBillItmGriColumns = new SettingsGridColumnSettings(this.coreService.taxLabel, this.securityService);
    this.reportingItemsGridColumns = this.setBillItmGriColumns.ReportingItemsList;
    //this.billingItemGridColumns = this.settingsServ.settingsGridCols.BillingItemList;
    this.GetDynamicReportNameList();
  }
  public GetReportingItemsList() {
    this.settingsBLService.GetReportingItemList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.reportingItemsList = res.Results;
          this.reportingItemsList.forEach(ele => {
            ele.ReportName = this.dynamicReportNameList.find(a => a.DynamicReportId == ele.DynamicReportId).ReportName;
          })
          this.showGrid = true;
        }
        else {
          alert("Failed ! " + res.ErrorMessage);
        }

      });
  }

  GetDynamicReportNameList(){
    this.settingsBLService.GetDynamicReportNameList()
    .subscribe((res:any)=>{
      if (res.Status == "OK") {
        this.dynamicReportNameList = res.Results;
        this.GetReportingItemsList();
      }
    })
  }

  ReportingItemGridActions($event: GridEmitModel) {

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
      case "activateDeactivate": {
        if ($event.Data != null) {
          this.selectedItem = null;
          this.selectedItem = $event.Data;
          this.ActivateDeactivateBillItem(this.selectedItem);
        }
        break;
      }
      case "manageReportingItem": {//manage items mapping
        if ($event.Data != null) {
            this.selectedItem = null;
            this.changeDetector.detectChanges();
            this.showManageItem = false;
            this.selectedItem = $event.Data;
            this.showManageItem  = true;
            this.showGrid = false;
    
            break;
          //show manage items
        }
        break;
      }
      default:
        break;
    }
  }
  AddReportingItem() {
    this.showAddPage = false;
    this.changeDetector.detectChanges();
    this.showAddPage = true;
  }

  HideManage() {
    this.showManageItem = false;
    this.showGrid = true;
    this.selectedItem = null;
    this.changeDetector.detectChanges();
  }

  CallBackAdd($event) {

    let action = $event.action;

    if (action == "add" || action == "update") {
      // console.log($event.item);
      //find the index of currently added/updated item in the list of all items (grid)
      let itmIndex = this.reportingItemsList.findIndex(a => a.ReportingItemsId == $event.item.ReportingItemsId);
      //index will be -1 when this item is currently added. 
      if (itmIndex < 0) {
        this.reportingItemsList.splice(0, 0, $event.item);//this will add this item to 0th index.
      }
      else {
        this.reportingItemsList.splice(itmIndex, 1, $event.item);//this will replace one item at particular index. 
      }
    }


    this.reportingItemsList = this.reportingItemsList.slice();
    this.changeDetector.detectChanges();
    this.GetReportingItemsList();
    this.showAddPage = false;
    this.itemId = null;
    this.selectedItem = null;
    this.index = null;
  }

  //Update BillingItem status- Activate or Deactivate 
  ActivateDeactivateBillItem(currReportingItem: ReportingItemsModel) {
    if (currReportingItem != null) {

      let proceed: boolean = true;

      if (currReportingItem.IsActive) {
        proceed = window.confirm("Are you sure you want to proceed ?")
      }

      if (proceed) {
        let status = currReportingItem.IsActive == true ? false : true;
        currReportingItem.IsActive = status;
        this.settingsBLService.UpdateReportingItem(currReportingItem)
          .subscribe(
            (res: DanpheHTTPResponse) => {

              if (res.Status == "OK") {
                this.msgBoxServ.showMessage("success", ['Service Status updated successfully']);
                //This for send to callbackadd function
                let reportingItemUpdated = { item: currReportingItem };
                this.CallBackAdd(reportingItemUpdated);
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


  logError(err: any) {
    console.log(err);
    this.msgBoxServ.showMessage("error", [err]);
  }
}
