import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { CoreService } from '../../../core/shared/core.service';
import { Employee } from '../../../employee/shared/employee.model';
import { PHRMStoreModel } from '../../../pharmacy/shared/phrm-store.model';
import { ReportingService } from '../../../reporting/shared/reporting-service';
import { SettingsBLService } from '../../../settings-new/shared/settings.bl.service';
import { ActivateInventoryService } from '../../../shared/activate-inventory/activate-inventory.service';
import { CommonFunctions } from '../../../shared/common.functions';
import { IGridFilterParameter } from '../../../shared/danphe-grid/grid-filter-parameter.interface';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ItemModel } from '../../settings/shared/item.model';
import { InventoryBLService } from '../../shared/inventory.bl.service';
import { InventoryReportsBLService } from '../shared/inventory-reports.bl.service';
import { IssuedItemViewModel } from './issued-item-view-model';
import { ENUM_DanpheHTTPResponses } from '../../../shared/shared-enums';

@Component({
  selector: 'app-issued-item-list',
  templateUrl: './issued-item-list.component.html'
})
export class IssuedItemListComponent implements OnInit {
  public loading: boolean = false;
  public IssuedItemListReportColumns: Array<any> = new Array<any>();
  public IssuedItemListReportData: any[] = [];
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public FilterParameters: IGridFilterParameter[] = [];
  public selectedSubstore: any;
  public SubstoreList: any;
  public selecteditem: any;
  public itemList: any;
  public selectedEmployee: any;
  public EmployeeList: any;
  public selectedSubCategory: any;
  headerDetail: any;

  public FromDate: string = null;
  public ToDate: string = null;
  FiscalYearId: number = null;
  ItemId: number = null;
  ItemName: string = null;
  SubStoreId: number = null;
  public MainStoreId: number = null;
  EmployeeId: number = null;
  IssuedItemListData: IssuedItemViewModel[] = [];
  dateRange: string;
  SubStoreName: string = null;
  MainStore: string = null;
  EmployeeName: string = null;
  SummaryQuantity: number = 0;
  public SubCategoryList: any[] = [];
  SubCategoryId: number = null;
  SubCategoryName: string = null;


  constructor(public inventoryReportBLService: InventoryReportsBLService, public msgBox: MessageboxService, public changedDetector: ChangeDetectorRef, public _activateInventoryService: ActivateInventoryService,
    public settingsBLService: SettingsBLService, public coreService: CoreService, public reportServ: ReportingService, public inventoryBLservice: InventoryBLService) {
    this.IssuedItemListReportColumns = this.reportServ.reportGridCols.IssuedItemListReportColumns;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(...[new NepaliDateInGridColumnDetail('IssuedDate', false)]);
    this.GetItem()
    this.ShowStoreList();
    this.GetEmpList();
    this.getSubCategoryList();
  }

  ngOnInit() {
    this.MainStoreId = this._activateInventoryService.activeInventory.StoreId;
    this.MainStore = this._activateInventoryService.activeInventory.Name;
    this.GetInventoryBillingHeaderParameter();
  }

  OnFromToDateChange($event) {
    if ($event != null) {
      this.FromDate = $event.fromDate;
      this.ToDate = $event.toDate;
      this.FiscalYearId = $event.fiscalYearId;
    }
  }
  onSubstoreChange($event) {
    if ($event != null) {
      this.SubStoreId = $event.StoreId;
      this.SubStoreName = $event.Name;
    }
  }
  onItemChange($event) {
    if ($event != null) {
      this.ItemId = $event.ItemId;
      this.ItemName = $event.ItemName;
    }
  }
  onEmployeeChange($event) {
    if ($event != null) {
      this.EmployeeId = $event.EmployeeId;
      this.EmployeeName = $event.FullName;
    }
  }

  onSubCategoryChange($event) {
    if ($event != null) {
      this.SubCategoryId = $event.SubCategoryId;
      this.SubCategoryName = $event.SubCategoryName;
    }
  }
  SubstoreListFormatter(data: any): string {
    return data["Name"];
  }
  ItemListFormatter(data: any): string {
    return data["ItemName"] + (data["Description"] == null || data["Description"] == "" ? "" : "|" + data["Description"]);;
  }
  EmployeeListFormatter(data: any): string {
    return data["FullName"];
  }

  SubCategoryListFormatter(data: any): string {
    return data["SubCategoryName"];

  }
  ngAfterViewChecked() {
    this.dateRange = "<b>From:</b>&nbsp;" + this.FromDate + "&nbsp;<b>To:</b>&nbsp;" + this.ToDate;
  }
  public gridExportOptions = {
    fileName: 'IssuedItemListReport' + moment().format('YYYY-MM-DD') + '.xls',
  };

  ShowStoreList() {
    this.inventoryReportBLService.LoadInventoryStores()
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.changedDetector.detectChanges();
          if (res.Results.length > 0) {
            this.SubstoreList = res.Results;
            this.SubstoreList = this.SubstoreList.filter(store => store.Category == 'substore');
          }
          else {
            this.msgBox.showMessage('Notification', ['No Substore Is Found.'])
          }
        }
        else {
          this.msgBox.showMessage('Error', [`Failed to get Substore ${res.ErrorMessage}`])
        }
      },
        err => this.msgBox.showMessage('Error', [`Failed to get Substore ${err.error.ErrorMessage}`]));
  }
  GetItem() {
    this.inventoryReportBLService.GetItem()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.itemList = res.Results.filter(a => a.IsActive == true);
        } else {
          this.msgBox.showMessage("error", [res.ErrorMessage]);
        }
      });
  }
  public GetEmpList() {
    this.settingsBLService.GetEmployeeList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.EmployeeList = res.Results;
            this.EmployeeList.unshift({ "EmployeeId": null, "FullName": "All" });
            CommonFunctions.SortArrayOfObjects(this.EmployeeList, "FullName");
          }
          else {
            this.msgBox.showMessage("Failed to get Employee List", ['Check log for error message.']);
            this.logError(res.ErrorMessage);
          }
        }
      },
        err => {
          this.msgBox.showMessage("Failed to get EmployeeList", ['Check log for error message.']);
          this.logError(err.ErrorMessage);
        });
  }
  public getSubCategoryList() {
    this.inventoryBLservice.GetSubCategoryList().subscribe(res => {
      if (res.Status == "OK" && res.Results && res.Results.length > 0) {
        this.SubCategoryList = res.Results;
      }
      else {
        if (res.Results && res.Results.length == 0) {
          this.msgBox.showMessage("error", ["SubCategory Not Found. "]);
        }
      }
    },
      err => {
        this.msgBox.showMessage("error", ["Failed to get SubCategoryList. " + err.ErrorMessage]);
      })
  }

  logError(err: any) {
    console.log(err);
  }
  ShowIssuedItemList() {
    this.FilterParameters = [
      { DisplayName: "SubCategory:", Value: this.SubCategoryName == null ? 'All' : this.SubCategoryName },
      { DisplayName: "ItemName:", Value: this.ItemName == null ? 'All' : this.ItemName },
      { DisplayName: "SubStoreName:", Value: this.SubStoreName == undefined || null ? 'All' : this.SubStoreName },
      { DisplayName: "MainStore:", Value: this.MainStore == null ? 'All' : this.MainStore },
      { DisplayName: "EmployeeName:", Value: this.EmployeeName == null ? 'All' : this.EmployeeName },
      { DisplayName: "DateRange:", Value: this.dateRange },
    ];
    this.loading = true;
    this.inventoryReportBLService.IssuedItemListReport(this.FromDate, this.ToDate, this.FiscalYearId, this.ItemId, this.SubStoreId, this.MainStoreId, this.EmployeeId, this.SubCategoryId).finally(() => {
      this.loading = false;
    }).subscribe(res => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK) {
        this.IssuedItemListData = new Array<IssuedItemViewModel>();
        if (res.Results.length > 0) {
          this.IssuedItemListData = res.Results;
          this.GetSummaryDataMapped();
        }
        else {
          this.msgBox.showMessage("Notice", ["There is no data available."]);
        }
      }
      else {
        this.msgBox.showMessage('Failed', [`Failed To Get Data. ${res.ErrorMessage}`]);
      }
    },
      err => {
        this.msgBox.showMessage('Failed', [`Failed To Get Stock Details. ${err.ErrorMessage}`]);
      });
    //To clear the previous data entered in the form.
    this.SubStoreId = null;
    this.selectedSubstore = null;
    this.EmployeeId = null;
    this.selectedEmployee = null;
    this.ItemId = null
    this.selecteditem = null;
    this.selectedSubCategory = null;
    this.SubCategoryId = null;
  }
  GetInventoryBillingHeaderParameter() {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Inventory Receipt Header').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    else
      this.msgBox.showMessage("error", ["Please enter parameter values for BillingHeader"]);
  }

  public SummaryData: any[] = [];

  GetSummaryDataMapped() {
    this.SummaryData = [];
    this.SummaryQuantity = 0;

    if (this.ItemName != null && this.SubStoreName == null) {
      var data = this.IssuedItemListData.filter(a => a.ItemName == this.ItemName);
      this.SummaryQuantity = data.reduce((acc, currVal) => acc + currVal.Quantity, 0);
      var obj = { "ItemName": data[0].ItemName, "SubStoreName": "All" };
      this.SummaryData.push(obj);
    }
    if (this.ItemName == null && this.SubStoreName != null) {
      var data = this.IssuedItemListData.filter(a => a.SubStoreName == this.SubStoreName);
      this.SummaryQuantity = data.reduce((acc, currVal) => acc + currVal.Quantity, 0);
      var obj = { "ItemName": "All", "SubStoreName": data[0].SubStoreName }
      this.SummaryData.push(obj);
    }
    if (this.SubStoreName != null && this.ItemName != null) {
      var data = this.IssuedItemListData.filter(a => a.ItemName == this.ItemName && a.SubStoreName == this.SubStoreName);
      this.SummaryQuantity = data.reduce((acc, currVal) => acc + currVal.Quantity, 0);
      var obj = { "ItemName": data[0].ItemName, "SubStoreName": data[0].SubStoreName }
      this.SummaryData.push(obj);
    }
    if (this.SubStoreName == null && this.ItemName == null) {
      var data = this.IssuedItemListData;
      this.SummaryQuantity = data.reduce((acc, currVal) => acc + currVal.Quantity, 0);
      var obj = { "ItemName": "All", "SubStoreName": "All" }
      this.SummaryData.push(obj);
    }
    this.ItemName = null;
    this.SubStoreName = null;
  }

}
