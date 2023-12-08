import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BillItemPrice } from "../../../../billing/shared/billitem-price.model";
import { SecurityService } from '../../../../security/shared/security.service';
import { ReportingItemBillingItemMappingModel } from "../../../../settings-new/shared/reporting-items-bill-item-mapping.model";
import { ReportingItemsModel } from "../../../../settings-new/shared/reporting-items.model";
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_Data_Type, ENUM_MessageBox_Status } from "../../../../shared/shared-enums";
import { ReportingItemServiceItemMapping_DTO } from "../../../shared/DTOs/reporting-item-service-item-mapping.dto";
import { SettingsBLService } from '../../../shared/settings.bl.service';

@Component({
  selector: 'manage-reporting-items',
  templateUrl: "./manage-reporting-items.html"
})
export class ReportingItemAndBillItemMapComponent {

  public billingItemList: Array<ReportingItemServiceItemMapping_DTO> = [];

  public selectedReportingItemBillItemList: Array<ReportingItemBillingItemMappingModel> = new Array<ReportingItemBillingItemMappingModel>();
  public existingReportingItemBillItemList: Array<ReportingItemBillingItemMappingModel> = new Array<ReportingItemBillingItemMappingModel>();
  public existingModifiedReportingItemBillItemInList: Array<ReportingItemBillingItemMappingModel> = new Array<ReportingItemBillingItemMappingModel>();

  public selectedItem: BillItemPrice;
  public reportingItemsId: number;

  @Input("selectedReportingItem")
  public selectedReportingItem: ReportingItemsModel;

  @Output("callback-manage")
  callbackManage: EventEmitter<Object> = new EventEmitter<Object>();

  constructor(public settingsBLService: SettingsBLService,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService) {
  }

  ngOnInit() {
    if (this.selectedReportingItem) {
      this.reportingItemsId = this.selectedReportingItem.ReportingItemsId;
      this.GetBillingItemList();
    }
  }

  GetBillingItemList() {
    this.settingsBLService.GetBillingItemList(false)
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.billingItemList = res.Results;
          this.GetReportingItemBillItemList(this.reportingItemsId);
        } else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [res.ErrorMessage]);

        }
      },
        err => {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Failed to get role list.. please check log for details.'], err.ErrorMessage);
        });
  }

  GetReportingItemBillItemList(reportingItemId: number) {
    this.settingsBLService.GetReportingItemBillItemList(reportingItemId)
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.existingReportingItemBillItemList = res.Results;
          this.SelectExistingFromList();

        } else
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [res.ErrorMessage]);
      },
        err => {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Failed to get list.. please check log for details.'], err.ErrorMessage);
        });
  }

  /// for search box and calling the SelectImaging function
  SelectItemSearchBox(selectedItem: BillItemPrice) {
    if (typeof selectedItem === ENUM_Data_Type.Object && !Array.isArray(selectedItem) && selectedItem !== null) {
      //check if the item already exisit on the selected list.
      for (let sel of this.selectedReportingItemBillItemList) {
        if (sel.ServiceItemId === selectedItem.BillItemPriceId) {
          var check = true;
          break;
        }
      }
      if (!check) {
        selectedItem.IsSelected = true;
        this.BillItemEventHandler(selectedItem);
        this.ChangeMainListSelectStatus(selectedItem.BillItemPriceId, true);
      }
      else {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["This item is already added"]);
      }
    }
    this.selectedItem = null;
  }
  public BillItemEventHandler(currItem) {

    if (currItem.IsSelected) {
      //add item to selectedItemList or exisitingModifiedList depending on condition
      var reportingItemandBillMap: ReportingItemBillingItemMappingModel = new ReportingItemBillingItemMappingModel();
      var IsExisting: boolean = false;
      for (let existingItem of this.existingReportingItemBillItemList) {
        if (existingItem.ServiceItemId === currItem.BillItemPriceId) {
          reportingItemandBillMap = existingItem;
          IsExisting = true;
          break;
        }
      }
      if (IsExisting) {
        //add item to exisitingModifiedList
        this.ModifyExistingReportingItemandBillMap(reportingItemandBillMap, true);
      }
      else {
        //add item to selectedList
        reportingItemandBillMap.ReportingItemsId = this.reportingItemsId;
        reportingItemandBillMap.ServiceItemId = currItem.ServiceItemId;
        reportingItemandBillMap.IsSelected = true;
        reportingItemandBillMap.IsActive = true;
        for (let per of this.billingItemList)
          if (per.ServiceItemId === reportingItemandBillMap.ServiceItemId) {
            reportingItemandBillMap.ItemName = per.ItemName;
            reportingItemandBillMap.ServiceDepartmentName = per.ServiceDepartmentName;
            break;
          }
      }
      //either modified or newly added item should be displayed on the selected list
      this.selectedReportingItemBillItemList.push(reportingItemandBillMap);
    }
    //remove item from selectedList ofr exisitingModifiedList
    else {
      //for existing item add to exisitingModifiedList for update
      for (let reportingItemandBillMap of this.existingReportingItemBillItemList) {
        if (reportingItemandBillMap.ServiceItemId === currItem.BillItemPriceId)
          this.ModifyExistingReportingItemandBillMap(reportingItemandBillMap, false);
      }
      //remove from selectedList
      var index = this.selectedReportingItemBillItemList.findIndex(x => x.ServiceItemId == currItem.BillItemPriceId);
      this.selectedReportingItemBillItemList.splice(index, 1);
      this.ChangeMainListSelectStatus(currItem.BillItemPriceId, false);
    }
  }
  //change the IsActive Status of already exisiting item based on condition
  ModifyExistingReportingItemandBillMap(reportingItemandBillMap: ReportingItemBillingItemMappingModel, activeStatus: boolean) {
    reportingItemandBillMap.IsSelected = activeStatus;
    reportingItemandBillMap.IsActive = activeStatus;
    var index = this.existingModifiedReportingItemBillItemInList.findIndex(x => x.ServiceItemId == reportingItemandBillMap.ServiceItemId);
    if (index >= 0)
      this.existingModifiedReportingItemBillItemInList.splice(index, 1);
    else
      this.existingModifiedReportingItemBillItemInList.push(reportingItemandBillMap);
  }
  //for initially selecting the items in main list existing item from the existingItemList
  SelectExistingFromList() {
    this.existingReportingItemBillItemList.forEach((ex: ReportingItemBillingItemMappingModel) => {
      if (ex.IsActive) {
        ex.IsSelected = ex.IsActive;
        const foundItemName = this.billingItemList.find(a => a.ServiceItemId === ex.ServiceItemId);
        ex.ItemName = foundItemName ? foundItemName.ItemName : '';
        const foundDepartmentName = this.billingItemList.find(a => a.ServiceItemId === ex.ServiceItemId);
        ex.ServiceDepartmentName = foundDepartmentName ? foundDepartmentName.ServiceDepartmentName : '';
        this.selectedReportingItemBillItemList.push(ex);
        this.ChangeMainListSelectStatus(ex.ServiceItemId, true)
      }
    });
  }
  ChangeMainListSelectStatus(itemId: number, val: boolean) {
    for (let item of this.billingItemList) {
      if (item.ServiceItemId === itemId) {
        item.IsSelected = val;
        break;
      }
    }
  }

  Submit() {
    var addList: Array<ReportingItemBillingItemMappingModel>;
    addList = this.selectedReportingItemBillItemList.filter(sel => (!sel.RptItem_BillItemMappingId));
    if (addList.length || this.existingModifiedReportingItemBillItemInList.length) {
      if (addList.length) {
        this.settingsBLService.AddReportingItemsAndBillItemMapping(addList)
          .subscribe(res => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
              if (this.existingModifiedReportingItemBillItemInList.length) {
                this.Update();
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Added and Updated"]);
              }
              else {
                this.callbackManage.emit();
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Added"]);
              }
            }
            else {
              this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Failed to Add.Check log for error message."]);
              this.logError(res.ErrorMessage);
            }
          });
      }
      else if (this.existingModifiedReportingItemBillItemInList.length) {
        this.Update();
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Updated"]);
      }
    }
    else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Add or Remove Items before submit."]);
    }

  }
  Update() {
    this.settingsBLService.UpdateReportingItemAndBillItemMapping(this.existingModifiedReportingItemBillItemInList)
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.callbackManage.emit();
        }
        else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Failed to Update Existing Items.Check log for error message."]);
          this.logError(res.ErrorMessage);
        }
      });
  }
  //used to format display item in ng-autocomplete
  myListFormatter(data: any): string {
    let html = data["ItemName"];
    return html;
  }
  logError(err: any) {
    console.log(err);
  }

  selectItem($data) {
    if ($data.IsSelected === true) {
      $data.IsSelected = false;
      this.BillItemEventHandler($data);
    } else {
      $data.IsSelected = true;
      this.BillItemEventHandler($data);
    }
  }
}
