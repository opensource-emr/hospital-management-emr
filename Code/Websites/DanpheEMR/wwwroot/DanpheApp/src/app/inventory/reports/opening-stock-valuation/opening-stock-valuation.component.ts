import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ReportingService } from '../../../reporting/shared/reporting-service';
import { ActivateInventoryService } from '../../../shared/activate-inventory/activate-inventory.service';
import { IGridFilterParameter } from '../../../shared/danphe-grid/grid-filter-parameter.interface';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { InventoryBLService } from '../../shared/inventory.bl.service';
import { InventoryReportsBLService } from '../shared/inventory-reports.bl.service';

@Component({
  selector: 'app-opening-stock-valuation',
  templateUrl: './opening-stock-valuation.component.html'
})
export class OpeningStockValuationComponent implements OnInit {
  tillDate: string = moment().format("YYYY-MM-DD");
  loading: boolean = false;
  InvOpeningStockReportResult: Array<any> = new Array<any>();
  NewInvOpeningStockReportResult: Array<any> = new Array<any>();
  InvOpeningStockReportColumns: Array<any> = null;
  public dateRange: string = "";
  FilterParameters: IGridFilterParameter[] = [];
  storeList: any[] = [];
  selectedStore: any;
  StoreId: number = null;
  StoreName: string = null;



  constructor(public inventoryReportsBLService: InventoryReportsBLService, public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef, public reportServ: ReportingService) {
    this.InvOpeningStockReportColumns = this.reportServ.reportGridCols.OpeningStockValuationReportColumns;
    this.GetAllStoreList();
  }

  ngOnInit() {
  }
  ngAfterViewChecked() {
    this.dateRange = "<b>Opening On Date:</b>&nbsp;" + this.tillDate;
  }
  gridExportOptions = {
    fileName: 'InventoryOpeningStockValuationReport_' + moment().format('YYYY-MM-DD') + '.xls',
  };
  OnDateChange() {
    this.dateRange = "<b>Date:</b>&nbsp;" + this.tillDate;
    this.changeDetector.detectChanges();
  }

  private GetAllStoreList() {
    this.inventoryReportsBLService.GetAllStoreList().subscribe(res => {
      if (res.Status == "OK") {
        this.storeList = res.Results;
        this.storeList.unshift({ 'StoreId': 0, 'StoreName': 'Total' });
      }
      else {
        this.msgBoxServ.showMessage("Notice-Message", ["Failed to load Department list."]);
      }
    }, err => {
      console.log(err);
      this.msgBoxServ.showMessage("Failed", ["Failed to load Department list."]);
    });
  }
  onStoreChange() {
    let store = null;
    if (!this.selectedStore) {
      this.StoreId = null;
    }
    else if (this.selectedStore) {
      store = this.storeList.find(a => a.StoreId == this.selectedStore.StoreId);
      this.StoreName = store.StoreName;
    }
    else if (typeof (this.selectedStore) == "object") {
      store = this.selectedStore;
    }
    if (store) {
      this.StoreId = store.StoreId;

    }
    else {
      this.StoreId = null;
    }
    if (this.StoreId != null) {
      this.InvOpeningStockReportResult = this.NewInvOpeningStockReportResult.filter(a => a.StoreId == this.StoreId);
    }
    else {
      this.msgBoxServ.showMessage('Notification', ['Please Select Valid StoreName']);
    }
  }
  StoreListFormatter(data: any): string {
    return data["StoreName"];
  }
  LoadReport() {
    this.loading = true;
    this.FilterParameters = [
      { DisplayName: "DateRange:", Value: this.dateRange }
    ]
    this.inventoryReportsBLService.GetOpeningStockValuationReport(this.tillDate).finally(() => {
      this.loading = false;
    }).subscribe(res => {
      if (res.Status == "OK") {
        if (res.Results.length > 0) {
          this.InvOpeningStockReportResult = res.Results;
          this.NewInvOpeningStockReportResult = res.Results;
          this.selectedStore = null;
        }
        else {
          this.msgBoxServ.showMessage('Notification', ['There Is No Data Available.'])
        }
      }
    })
  }
}
