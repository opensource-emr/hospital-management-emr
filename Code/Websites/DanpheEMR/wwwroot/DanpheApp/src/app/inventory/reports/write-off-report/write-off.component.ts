import { Component, OnInit } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { InventoryReportsBLService } from '../shared/inventory-reports.bl.service';
import { InventoryReportsDLService } from '../shared/inventory-reports.dl.service';
import { ReportingService } from "../../../reporting/shared/reporting-service";

import * as moment from 'moment/moment';
import { InventoryBLService } from '../../shared/inventory.bl.service';
import { WriteOffReport } from '../shared/write-off-report.model';
import { ActivateInventoryService } from '../../../shared/activate-inventory/activate-inventory.service';
@Component({
  //selector: 'my-app',
  templateUrl: "../../../view/inventory-view/Reports/WriteOffReport.html"  //"/InventoryReports/WriteOff"

})
export class WriteOffComponent implements OnInit {

  public ItemName: string = null;
  public CurrentWriteOff: WriteOffReport = new WriteOffReport();
  public ItemList: any[] = [];
  public fromDate: string = null;
  public toDate: string = null;
  public ItemId: number = 0;
  public filteredWriteOffReport: any[];

  WriteOffReportColumns: Array<any> = null;
  WriteOffReportData: Array<WriteOffReport> = new Array<WriteOffReport>();

  constructor(public inventoryBLService: InventoryReportsBLService,
    public inventoryDLService: InventoryReportsDLService,
    public inventoryService: InventoryBLService,
    public reportServ: ReportingService,
    private _activeInventoryService: ActivateInventoryService,
    public msgBoxServ: MessageboxService) {
    this.fromDate = moment().format('YYYY-MM-DD');
    this.toDate = moment().format('YYYY-MM-DD');

  }

  ngOnInit() {
    this.LoadItemList();
    //this.loadReport();
    this.ShowWriteOffReport();

  }

  gridExportOptions = {
    fileName: 'CurrentWriteOffList' + moment().format('YYYY-MM-DD') + '.xls',
  };

  //used to format display item in ng-autocomplete
  public myListFormatter(data: any): string {
    let html = data["ItemName"];
    return html;
  }

  LoadItemList(): void {
    this.inventoryService.GetItemListByStoreId(this._activeInventoryService.activeInventory.StoreId)
      .subscribe( res => {
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
            this.msgBoxServ.showMessage("failed", ['failed to get Item.. please check log for details.']);
          }
        });
  }

  SelectItemFromSearchBox(Item) {

    this.CurrentWriteOff.ItemId = Item.ItemId;
  }

  ShowWriteOffReport() {
    this.filteredWriteOffReport = null;

    this.inventoryBLService.ShowWriteOffReport(this.CurrentWriteOff.ItemId)
      .map(res => res)
      .subscribe(res => this.Success(res),
        res => this.Error(res));
  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err]);
  }
  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {

      this.WriteOffReportColumns = this.reportServ.reportGridCols.WriteOffReport;
      this.WriteOffReportData = res.Results;
      this.filteredWriteOffReport = this.WriteOffReportData;
    }
    else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("Error", ["There is no data available."]);
    }

    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
  }
  loadReport() {
    if (this.fromDate && this.toDate) {
      this.filteredWriteOffReport = [];
      this.WriteOffReportData.forEach(rep => {
        let selrepDate = moment(rep.CreatedOn).format('YYYY-MM-DD');
        let isGreaterThanFrom = selrepDate >= moment(this.fromDate).format('YYYY-MM-DD');
        let isSmallerThanTo = selrepDate <= moment(this.toDate).format('YYYY-MM-DD')
        if (isGreaterThanFrom && isSmallerThanTo) {
          this.filteredWriteOffReport.push(rep);
        }
      });
      if (this.filteredWriteOffReport.length == 0) {
        this.msgBoxServ.showMessage("Error", ["There is no data available."]);
      }
    }
    else {
      this.filteredWriteOffReport = this.WriteOffReportData;
    }
  }
}
