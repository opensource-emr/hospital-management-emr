import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
import { DailyItemDispatchReport } from '../shared/daily-item-dispatch-report.model'
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { InventoryReportsBLService } from '../shared/inventory-reports.bl.service';
import { InventoryReportsDLService } from '../shared/inventory-reports.dl.service';
import { ReportingService } from "../../../reporting/shared/reporting-service";

import * as moment from 'moment/moment';
@Component({
  //selector: 'my-app',
  templateUrl: "../../../view/inventory-view/Reports/DailyItemDispatch.html" // "/InventoryReports/DailyItemDispatch"

})
export class DailyItemDispatchComponent {
  public FromDate: Date = null;
  public ToDate: Date = null;
  public DepartmentName: string = null;

  public CurrentItemDispatch: DailyItemDispatchReport = new DailyItemDispatchReport();
  ListFiltered: Array<DailyItemDispatchReport> = new Array<DailyItemDispatchReport>();
  public StoreList: any[] = [];

  DailyItemDispatchReportColumns: Array<any> = null;
  DailyItemDispatchReportData: Array<DailyItemDispatchReport> = new Array<DailyItemDispatchReport>();
  constructor(public inventoryBLService: InventoryReportsBLService,
    public inventoryDLService: InventoryReportsDLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService
  ) {
    this.LoadInventoryStores();
    this.CurrentItemDispatch.FromDate = moment().format('YYYY-MM-DD');
    this.CurrentItemDispatch.ToDate = moment().format('YYYY-MM-DD');
    this.DailyItemDispatchReportColumns = this.reportServ.reportGridCols.DailyItemDispatchReport;
  }
  gridExportOptions = {
    fileName: 'ItemDispatchList' + moment().format('YYYY-MM-DD') + '.xls',
  };

  public myListFormatter(data: any): string {
    let html = data["StoreName"];
    return html;
  }

  LoadInventoryStores() {
    this.StoreList = [];
    this.inventoryBLService.LoadInventoryStores()
      .subscribe(res =>
        this.CallBackGetStoreList(res));
  }

  CallBackGetStoreList(res) {
    if (res.Status == 'OK') {
      if (res && res.Results) {
        var storeList: any[] = [];
        storeList = res.Results;
        this.StoreList = storeList.map(s => { return { StoreId: s.StoreId, StoreName: s.Name } });
      }
    }
    else {
      err => {
        this.msgBoxServ.showMessage("failed", ['failed to get StoreName.. please check log for details.']);
      }
    }
  }

  SelectStoreFromSearchBox(Store) {
    this.CurrentItemDispatch.StoreId = Store.StoreId;
  }

  ShowDailyItemDispatch() {
    this.inventoryBLService.ShowDailyItemDispatch(this.CurrentItemDispatch.FromDate, this.CurrentItemDispatch.ToDate, this.CurrentItemDispatch.StoreId)
      .map(res => res)
      .subscribe(res => this.Success(res),
        res => this.Error(res));
  }
  Error(err) {
    this.msgBoxServ.showMessage("Error", ["There is no data available."]);
  }
  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {
      this.DailyItemDispatchReportData = res.Results;
      this.ListFiltered = this.DailyItemDispatchReportData;
    }
    else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("Error", ["There is no data available."]);
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }

  }
  public filterlist() {
    if (this.FromDate && this.ToDate) {
      this.ListFiltered = [];
      this.DailyItemDispatchReportData.forEach(inv => {
        let selinvDate = moment(inv.CreatedOn).format('YYYY-MM-DD');
        let isGreterThanFrom = selinvDate >= moment(this.FromDate).format('YYYY-MM-DD');
        let isSmallerThanTo = selinvDate <= moment(this.ToDate).format('YYYY-MM-DD')
        if (isGreterThanFrom && isSmallerThanTo) {
          this.ListFiltered.push(inv);
        }
      });
    }
    else {
      this.ListFiltered = this.DailyItemDispatchReportData;
    }

  }

}
