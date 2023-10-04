import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ReportingService } from '../../../reporting/shared/reporting-service';
import { ActivateInventoryService } from '../../../shared/activate-inventory/activate-inventory.service';
import { IGridFilterParameter } from '../../../shared/danphe-grid/grid-filter-parameter.interface';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { InventoryBLService } from '../../shared/inventory.bl.service';
import { InventoryService } from '../../shared/inventory.service';
import { InventoryReportsBLService } from '../shared/inventory-reports.bl.service';

@Component({
  selector: 'app-substore-dispatch-and-consumption',
  templateUrl: './substore-dispatch-and-consumption.component.html',
  styleUrls: ['./substore-dispatch-and-consumption.component.css']
})
export class SubstoreDispatchAndConsumptionComponent {

  public SubstoreDispatchAndConsumptionReportColumn: Array<any> = new Array<any>();
  public fromDate: string = null;
  public toDate: string = null;
  public subStoreList: any[] = [];
  public StoreId: number = null;
  public SubCategoryId: number = null;
  public DispatchAndConsumptionData: any[] = [];
  public ItemId: number = null;
  dateRange: string;
  FilterParameters: IGridFilterParameter[] = [];
  StoreName: any;
  SubCategoryList: Array<SubCategory> = new Array<SubCategory>();
  ItemList: Array<Item> = new Array<Item>();

  constructor(private inventoryReportsBLService: InventoryReportsBLService,
    private reportService: ReportingService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public _activateInventoryService: ActivateInventoryService,
    public inventoryService: InventoryService,
    public inventoryBLService: InventoryBLService) {
    this.SubstoreDispatchAndConsumptionReportColumn = this.reportService.reportGridCols.SubstoreDispatchAndConsumptionReportColumns;
    this.ShowStoreList();
    this.GetSubCategoryList();
    this.GetAllItemsList();
  }

  public ShowStoreList() {
    this.inventoryReportsBLService.LoadInventoryStores()
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK") {
          var storeList = res.Results;
          this.subStoreList = storeList.filter(s => s.StoreId != this._activateInventoryService.activeInventory.StoreId);
        }
      },
        err => console.log(err));
  }
  public GetReportData() {
    this.FilterParameters = [
      { DisplayName: "Store:", Value: this.StoreName == undefined || null ? 'All' : this.StoreName },
      { DisplayName: "DateRange:", Value: this.dateRange },
    ]
    if (this.checkDateValidation()) {
      this.inventoryReportsBLService.GetSubstoreDispatchedAndConsumptionReport(this.StoreId, this.ItemId, this.SubCategoryId, this.fromDate, this.toDate)
        .subscribe(res => {
          if (res.Status == 'OK' && res.Results.length > 0) {
            this.DispatchAndConsumptionData = res.Results;
            if (this.DispatchAndConsumptionData.length > 0) {
              this.DispatchAndConsumptionData.forEach((x, i) => {
                x.SN = i + 1;
              });
            }
          }
          if (res.Status == 'OK' && res.Results.length == 0) {
            this.DispatchAndConsumptionData = [];
            this.msgBoxServ.showMessage("notice-message", ["Data is not available"]);
          }
        },
          err => console.log(err));
    }
  }
  public checkDateValidation() {
    if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
      return true;
    } else {
      this.msgBoxServ.showMessage('failed', ['Please enter valid From date and To date']);
      return false;
    }
  }
  public gridExportOptions = {
    fileName: 'SubstoreDispatchAndConsumptionReport' + moment().format('YYYY-MM-DD') + '.xls',
  };
  public OnDateRangeChange($event) {
    if ($event) {
      this.fromDate = $event.fromDate;
      this.toDate = $event.toDate;
    }
  }

  ngAfterViewChecked() {
    this.dateRange = "<b>From:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To:</b>&nbsp;" + this.toDate;
  }

  OnStoreChange() {
    let StoreDetails = this.subStoreList.filter(a => a.StoreId == this.StoreId);
  }
  GetSubCategoryList() {
    this.inventoryBLService.GetSubCategoryList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.SubCategoryList = res.Results;
        }
      })
  }
  public GetAllItemsList() {
    this.inventoryReportsBLService.GetAllItemsList().subscribe(res => {
      if (res.Status == "OK") {
        this.ItemList = res.Results;
      }
      else {
        this.msgBoxServ.showMessage("Notice-Message", ["Failed to load Items list."]);
      }
    }, err => {
      console.log(err);
      this.msgBoxServ.showMessage("Failed", ["Failed to load Items list."]);
    });
  }
}

export class SubCategory {
  SubCategoryId: number = null;
  SubCategoryName: string = "";
}
export class Item {
  ItemId: number = null;
  ItemName: string = "";
}