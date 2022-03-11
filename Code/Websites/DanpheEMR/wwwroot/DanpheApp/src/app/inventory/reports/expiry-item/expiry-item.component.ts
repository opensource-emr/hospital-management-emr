import { ChangeDetectorRef, Component } from "@angular/core";
import { InventoryReportsBLService } from "../shared/inventory-reports.bl.service";
import { ReportingService } from "../../../reporting/shared/reporting-service";
import * as moment from 'moment/moment';
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ActivateInventoryService } from "../../../shared/activate-inventory/activate-inventory.service";
import { InventoryService} from '../../shared/inventory.service';

@Component({
  templateUrl: "./expiry-item.component.html"
})
export class ExpiryItemComponent {
  public expiryItemGridColumns: Array<any> = new Array<any>();
  public fromDate: string = null;
  public toDate: string = null;
  public ItemList: any[] = [];
  public subStoreList: any[] = [];
  public ItemId: number = null;
  public StoreId: number = null;
  public expiryItemData: Array<any> = new Array<any>();

  constructor(private inventoryReportsBLService: InventoryReportsBLService,
    private reportService: ReportingService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public _activateInventoryService: ActivateInventoryService,
    public inventoryService: InventoryService) {
    this.expiryItemGridColumns = this.reportService.reportGridCols.ExpiryItemReport;
    this.GetItemList();
    this.ShowStoreList();
  }

  public GetItemList() {
    var itemList = this.inventoryService.allItemList;
    if (itemList == undefined || itemList.length == 0) {
      this.msgBoxServ.showMessage("failed", ["failed to get Item list"]);
    }
    else{
      this.ItemList=itemList;
    }
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
    if (this.checkDateValidation()) {
      this.inventoryReportsBLService.GetExpiryItemReport(this.ItemId, this.StoreId, this.fromDate, this.toDate)
        .subscribe(res => {
          if (res.Status == 'OK' && res.Results.length > 0) {
            this.expiryItemData = res.Results;
          }
          if (res.Status == 'OK' && res.Results.length == 0) {
            this.expiryItemData = null;
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
  //Export data grid options for excel file
  public gridExportOptions = {
    fileName: 'ExpiryItemReport' + moment().format('YYYY-MM-DD') + '.xls',
  };
  public OnDateRangeChange($event) {
    if ($event) {
     this.fromDate = $event.fromDate;
      this.toDate = $event.toDate;
    }
  }
}