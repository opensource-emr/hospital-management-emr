import { ChangeDetectorRef, Component } from "@angular/core";
import * as moment from 'moment/moment';
import { CoreService } from "../../../core/shared/core.service";
import { SecurityService } from "../../../security/shared/security.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { SettingsGridColumnSettings } from "../../../shared/danphe-grid/settings-grid-column-settings";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { IntegrationName } from "../../shared/integration-name.model";
import { SettingsService } from '../../shared/settings-service';
import { SettingsBLService } from '../../shared/settings.bl.service';
import { BillServiceItemModel, ServiceCategories } from '../shared/bill-service-item.model';


@Component({
  selector: 'app-bill-service-item-list',
  templateUrl: './bill-service-item-list.component.html',
})
export class BillServiceItemListComponent {

  public serviceItemList: Array<BillServiceItemModel> = new Array<BillServiceItemModel>();
  public showGrid: boolean = false;
  public billingItemGridColumns: Array<any> = null;
  public showBillItemPriceHistoryPage: boolean = false;
  public integrationNameList: Array<IntegrationName> = new Array<IntegrationName>();
  public showAddPage: boolean = false;
  public selectedItem: BillServiceItemModel;
  public index: number;
  public itemId: number = null;
  public selectedIntegration: IntegrationName;
  public setBillItmGriColumns: SettingsGridColumnSettings = null;
  public update: boolean;
  public ServiceCategoryList: Array<ServiceCategories> = new Array<ServiceCategories>();
  public selectedServiceCategory: ServiceCategories;

  constructor(public settingsBLService: SettingsBLService,
    public settingsServ: SettingsService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public securityService: SecurityService

  ) {

    this.setBillItmGriColumns = new SettingsGridColumnSettings(this.coreService.taxLabel, this.securityService);
    this.billingItemGridColumns = this.setBillItmGriColumns.BillingServiceItemList
    this.getServiceItemList();
    this.IntegrationNameList();
    this.GetServiceCategories();


  }
  public getServiceItemList() {
    this.settingsBLService.GetServiceItemList()
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.serviceItemList = res.Results;
          this.showGrid = true;
        }
        else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to get Service Items, check log for details']);
        }

      });
  }
  ServiceItemGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "edit": {
        this.selectedItem = null;
        this.index = $event.RowIndex;
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.selectedItem = $event.Data;
        console.log(this.selectedItem);
        this.showAddPage = true;
        this.update = true;

        break;
      }
      case "activateDeactivateServiceItem": {
        if ($event.Data != null) {
          this.selectedItem = null;
          this.selectedItem = $event.Data;
          this.ActivateDeactivateServiceItem(this.selectedItem);
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
    if ($event != null) {
      let action = $event.action;

      if (action === "add" || action === "update") {
        let itmIndex = this.serviceItemList.findIndex(a => a.ItemId == $event.item.ItemId && a.ServiceDepartmentId == $event.item.ServiceDepartmentId);
        if (itmIndex < 0) {
          this.serviceItemList.splice(0, 0, $event.item);
        }
        else {
          this.serviceItemList.splice(itmIndex, 1, $event.item);
        }
      }
      this.serviceItemList = this.serviceItemList.slice();
      this.changeDetector.detectChanges();
      this.getServiceItemList();
      this.showAddPage = false;
      this.itemId = null;
      this.selectedItem = null;
      this.index = null;
    }
    else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['Failed']);
    }




  }
  ActivateDeactivateServiceItem(currBillItem: BillServiceItemModel) {
    if (currBillItem != null) {

      let proceed: boolean = true;

      if (currBillItem.IsActive) {
        proceed = window.confirm("This item will stop to show in Billing-Search. Are you sure you want to proceed ?")
      }

      if (proceed) {
        let status = currBillItem.IsActive === true ? false : true;
        currBillItem.IsActive = status;
        this.settingsBLService.ActivateDeactivateServiceItem(currBillItem)
          .subscribe(
            (res: DanpheHTTPResponse) => {

              if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, [' Service Item Status updated successfully']);
                let billItemUpdated = { item: currBillItem };
                this.CallBackAdd(billItemUpdated);
              }
              else {
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Something wrong, Please Try again..!']);
              }
            },
            err => {
              this.logError(err);
            });
      }
    }

  }



  //Show Bill Item Price change history details

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

  IntegrationNameList() {
    this.settingsBLService.GetIntegrationNameList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == ENUM_DanpheHTTPResponses.OK) {
          if (res.Results.length) {
            this.integrationNameList = res.Results;
          }
        }
        else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Check log for error message."]);
          this.logError(res.ErrorMessage);
        }
      },
        err => {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Failed to get Integration Name List. Check log for error message."]);
          this.logError(err.ErrorMessage);
        });
  }
  public GetServiceCategories() {

    this.settingsBLService.GetServiceCategories()
      .subscribe(res => {
        if (res.Status == ENUM_DanpheHTTPResponses.OK) {
          if (res.Results.length) {
            this.ServiceCategoryList = res.Results;
          }
          else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Check log for error message."]);
            this.logError(res.ErrorMessage);
          }
        }
      },
        err => {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Failed to get service departments Check log for error message."]);
          this.logError(err.ErrorMessage);
        });

  }
}



