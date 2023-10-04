import { Component } from '@angular/core';
import * as moment from 'moment';
import { ReportingService } from '../../../reporting/shared/reporting-service';
import { ActivateInventoryService } from '../../../shared/activate-inventory/activate-inventory.service';
import { IGridFilterParameter } from '../../../shared/danphe-grid/grid-filter-parameter.interface';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_StoreCategory } from '../../../shared/shared-enums';
import { InventoryReportsBLService } from '../shared/inventory-reports.bl.service';

@Component({
  templateUrl: './substore-wise-summary.component.html',
  styleUrls: ['./substore-wise-summary.component.css']
})
export class SubstoreWiseSummaryComponent {

  public SubstoreWiseSummaryReportColumn: Array<any> = new Array<any>();

  public fromDate: string = null;
  public toDate: string = null;
  public subStoreList: any[] = [];
  public StoreId: number = null;
  dateRange: string;
  FilterParameters: IGridFilterParameter[] = [];
  public SubstoreWiseSummaryReportData: any[] = [];
  StoreName: any;
  FiscalyearId: number = null;
  public summary = {
    OpeningQuantity: 0, OpeningValue: 0, DispatchedQty: 0, DispatchedValue: 0, ReceivedQTy: 0,
    ClosingQuantity: 0, ClosingValue: 0, ConsumptionQty: 0, ConsumptionValue: 0
  };

  constructor(private inventoryReportsBLService: InventoryReportsBLService,
    private reportService: ReportingService,
    public msgBoxServ: MessageboxService,
    public _activateInventoryService: ActivateInventoryService,
  ) {
    this.SubstoreWiseSummaryReportColumn = this.reportService.reportGridCols.SubstoreWiseSummaryReportColumns;
    this.ShowStoreList();
  }

  public ShowStoreList() {
    this.inventoryReportsBLService.LoadInventoryStores()
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK") {
          var storeList = res.Results;
          this.subStoreList = storeList.filter(s => s.Category === ENUM_StoreCategory.SubStore);
        }
      },
        err => console.log(err));
  }
  public GetReportData() {
    this.ClearSummaryData();
    this.FilterParameters = [
      { DisplayName: "Store:", Value: this.StoreName == undefined || null ? 'All' : this.StoreName },
      { DisplayName: "DateRange:", Value: this.dateRange },
    ]
    if (this.checkDateValidation()) {
      this.inventoryReportsBLService.GetSubstoreWiseSummaryReport(this.StoreId, this.fromDate, this.toDate, this.FiscalyearId)
        .subscribe(res => {
          if (res.Status == 'OK' && res.Results.length > 0) {
            this.SubstoreWiseSummaryReportData = res.Results;
            if (this.SubstoreWiseSummaryReportData.length > 0) {
              this.SubstoreWiseSummaryReportData.forEach((x, i) => {
                x.SN = i + 1;
              });
            }
            this.SummaryCalculation(res.Results);
          }
          if (res.Status == 'OK' && res.Results.length == 0) {
            this.SubstoreWiseSummaryReportData = [];
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
      this.FiscalyearId = $event.fiscalYearId;
    }
  }

  ngAfterViewChecked() {
    this.dateRange = "<b>From:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To:</b>&nbsp;" + this.toDate;
  }

  OnStoreChange() {
    let StoreDetails = this.subStoreList.filter(a => a.StoreId == this.StoreId);
  }

  SummaryCalculation(data) {
    this.ClearSummaryData();
    data.forEach(d => {
      this.summary.OpeningQuantity += d.OpeningQty;
      this.summary.OpeningValue += d.OpeningValue;
      this.summary.ClosingQuantity += d.ClosingQty;
      this.summary.ClosingValue += d.ClosingValue;
      this.summary.ConsumptionQty += d.ConsumedQty;
      this.summary.ConsumptionValue += d.ConsumedValue;
      this.summary.DispatchedQty += d.DispatchedQty;
      this.summary.DispatchedValue += d.DispatchedValue;
      this.summary.ReceivedQTy += d.ReceivedQty;

    })
  }


  private ClearSummaryData() {
    this.summary.OpeningQuantity = this.summary.OpeningValue = this.summary.ClosingQuantity = this.summary.ClosingValue = this.summary.ClosingQuantity = this.summary.ConsumptionQty = this.summary.ConsumptionValue = this.summary.DispatchedQty =
      this.summary.DispatchedValue = this.summary.ReceivedQTy = this.summary.ReceivedQTy = 0;
  }
}
