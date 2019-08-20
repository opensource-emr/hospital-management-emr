import { Component, OnInit } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
import { StockLevelReport } from '../shared/stock-level-report.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { InventoryReportsBLService } from '../shared/inventory-reports.bl.service';
import { InventoryReportsDLService } from '../shared/inventory-reports.dl.service';
import { ReportingService } from "../../../reporting/shared/reporting-service";

import * as moment from 'moment/moment';
import { InventoryBLService } from '../../shared/inventory.bl.service';
@Component({
  //selector: 'my-app',
  templateUrl: "../../../view/inventory-view/Reports/StockLevel.html"  //"/InventoryReports/StockLevel"

})
export class StockLevelComponent implements OnInit {

  public ItemName: string = null;
  public CurrentStockLevel: StockLevelReport = new StockLevelReport();
  public ItemList: any[] = [];
  public fromDate: string = null;
  public toDate: string = null;
  public ItemId: number = 0;
  public filteredStockLevelReport: Array<StockLevelReport> = new Array<StockLevelReport>();

  StockLevelReportColumns: Array<any> = null;
  StockLevelReportData: Array<StockLevelReport> = new Array<StockLevelReport>();

  constructor(public inventoryBLService: InventoryReportsBLService,
    public inventoryDLService: InventoryReportsDLService,
    public inventoryService: InventoryBLService,
    public reportServ: ReportingService,
    public msgBoxServ: MessageboxService) {
    this.fromDate = moment().format('YYYY-MM-DD');
    this.toDate = moment().format('YYYY-MM-DD');

  }

  ngOnInit() {
    this.LoadItemList();
    this.ShowStockLevelReport();
  }

  gridExportOptions = {
    fileName: 'CurrentStockLevelList' + moment().format('YYYY-MM-DD') + '.xls',
    // displayColumns: ['Date', 'Patient_Name', 'AppointmentType', 'Doctor_Name', 'AppointmentStatus']
  };

  //used to format display item in ng-autocomplete
  public myListFormatter(data: any): string {
    let html = data["ItemName"];
    return html;
  }

  LoadItemList(): void {
    this.inventoryService.GetItemList()
      .subscribe(
        res =>
          this.CallBackGetItemList(res));


  }



  CallBackGetItemList(res) {
    if (res.Status == 'OK') {
      this.ItemList = [];
      if (res && res.Results) {
        res.Results.forEach(a => {
          this.ItemList.push({
            "ItemId": a.ItemId, "ItemName": a.ItemName, StandardRate: a.StandardRate, VAT: a.VAT
          });
        });

      }

    }
    else {
      err => {
        this.msgBoxServ.showMessage("failed", ['failed to get Item.. please check log for details.']);

      }
    }
  }

  SelectItemFromSearchBox(Item) {

    this.CurrentStockLevel.ItemId = Item.ItemId;
  }

  ShowStockLevelReport() {

    this.inventoryBLService.ShowStockLevelReportDataByItemId(this.CurrentStockLevel.ItemId)
      .map(res => res)
      .subscribe(res => this.Success(res),
        res => this.Error(res));
  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err]);
  }
  Success(res) {
    if (res.Status == "OK") {

      this.StockLevelReportColumns = this.reportServ.reportGridCols.CurrentStockLevelReport;
      this.StockLevelReportData = res.Results;
      this.filteredStockLevelReport = this.StockLevelReportData;
      this.loadReport();

    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }

  }
  loadReport() {
    if (this.fromDate && this.toDate) {
      this.filteredStockLevelReport = [];
      this.StockLevelReportData.forEach(rep => {
        let selrepDate = moment(rep.CreatedOn).format('YYYY-MM-DD');
        let isGreaterThanFrom = selrepDate >= moment(this.fromDate).format('YYYY-MM-DD');
        let isSmallerThanTo = selrepDate <= moment(this.toDate).format('YYYY-MM-DD')
        if (isGreaterThanFrom && isSmallerThanTo) {
          this.filteredStockLevelReport.push(rep);
        }
      });
      if (!this.filteredStockLevelReport.length) {
        this.msgBoxServ.showMessage("Note:", ["There are no stock available for this date"]);
      }
    }
    else {
      this.filteredStockLevelReport = this.StockLevelReportData;
    }

  }

}
