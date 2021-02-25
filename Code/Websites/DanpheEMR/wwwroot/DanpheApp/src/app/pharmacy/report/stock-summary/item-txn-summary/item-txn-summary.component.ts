import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { PharmacyBLService } from '../../../shared/pharmacy.bl.service';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { ItemTxnSummaryReportModel } from './item-txn-summary-report-model';
import * as moment from 'moment';
import PHRMReportsGridColumns from '../../../shared/phrm-reports-grid-columns';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { GridEmitModel } from '../../../../shared/danphe-grid/grid-emit.model';

@Component({
  selector: 'app-item-txn-summary-report',
  templateUrl: './item-txn-summary.component.html',
  styles: []
})
export class ItemTxnSummaryComponent implements OnInit, OnChanges {

  @Input("fromDate") public FromDate: string = '2016-01-01';
  @Input("toDate") public ToDate: string = moment().format('YYYY-MM-DD');
  @Input("itemId") public ItemId: number = null;
  @Input("itemName") public ItemName: string = '';


  showGRPopUp: boolean;
  selectedGRId: number;
  showInvoicePopUp: boolean;
  selectedInvoiceId: number;

  ///ItemTxn Summary Report Columns variable
  ItemTxnSummaryReportColumns: Array<any> = null;
  ///ItemTxn Summary Report Data variable
  ItemTxnSummaryReportData: Array<ItemTxnSummaryReportModel> = new Array<ItemTxnSummaryReportModel>();
  NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  constructor(private _pharmacyBLService: PharmacyBLService, private msgBox: MessageboxService) {
    this.ItemTxnSummaryReportColumns = PHRMReportsGridColumns.PHRMItemTxnSummaryReport;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(...[new NepaliDateInGridColumnDetail("Date", false), new NepaliDateInGridColumnDetail("ExpiryDate", false)]);
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.GetItemTxnData();
  }
  ngOnInit() {
    this.GetItemTxnData();
  }
  GetItemTxnData() {
    this._pharmacyBLService.GetItemTxnSummaryReport(this.FromDate, this.ToDate, this.ItemId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.ItemTxnSummaryReportData = res.Results as ItemTxnSummaryReportModel[];
        }
        else {
          this.msgBox.showMessage("Failed", ["Failed to load data."]);
        }
      }, _err => {
        this.msgBox.showMessage("Failed", ["Failed to load data."]);
      });
  }

  gridExportOptions = {
    fileName: `${this.ItemName}_ItemTransactionReport_${moment().format('YYYY-MM-DD')}.xls`,
  };

  ItemTxnSummaryGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case 'showPrintPopUp': {
        this.ShowRespectivePopUp($event.Data);
        break;
      }
      default:
        break;
    }
  }

  ShowRespectivePopUp(selectedItemTxnData) {
    switch (selectedItemTxnData.ReferenceNoPrefix) {
      case 'GR': {
        this.selectedGRId = selectedItemTxnData.ReferenceNo;
        this.showGRPopUp = true;
        break;
      }
      case 'CGR': {
        this.selectedGRId = selectedItemTxnData.ReferenceNo;
        this.showGRPopUp = true;
        break;
      }
      case 'PHRMS': {
        this.selectedInvoiceId = selectedItemTxnData.ReferenceNo;
        this.showInvoicePopUp = true;
        break;
      }
      default:
        break;
    }
  }
  OnGRPopUpClose() {
    this.showGRPopUp = false;
  }
  OnInvoicePopUpClose() {
    this.showInvoicePopUp = false;
  }
}
