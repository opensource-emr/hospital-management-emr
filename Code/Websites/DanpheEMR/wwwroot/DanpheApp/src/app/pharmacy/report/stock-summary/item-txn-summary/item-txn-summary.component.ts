import { Component, Input, OnInit } from '@angular/core';
import { PharmacyBLService } from '../../../shared/pharmacy.bl.service';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { ItemTxnSummaryReportModel } from './item-txn-summary-report-model';
import * as moment from 'moment';
import PHRMReportsGridColumns from '../../../shared/phrm-reports-grid-columns';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { GridEmitModel } from '../../../../shared/danphe-grid/grid-emit.model';
import { CoreService } from '../../../../core/shared/core.service';
import { CFGParameterModel } from '../../../../settings-new/shared/cfg-parameter.model';
import { SalesReturnComponent } from '../../../../dispensary/dispensary-main/sales-main/sales-return/sales-return.component';

@Component({
  selector: 'app-item-txn-summary-report',
  templateUrl: './item-txn-summary.component.html',
  styles: []
})
export class ItemTxnSummaryComponent implements OnInit {
  salesReturnComponent : SalesReturnComponent;

  @Input("fromDate") public FromDate: string = '2016-01-01';
  @Input("toDate") public ToDate: string = moment().format('YYYY-MM-DD');
  @Input("itemId") public ItemId: number = null;
  @Input("itemName") public ItemName: string = '';


  showGRPopUp: boolean;
  selectedGRId: number;
  showInvoicePopUp: boolean;
  showInvoiceReturnPopUp: boolean;
  selectedInvoiceId: number;
  selectedInvoiceReturnId: number;
  showDispatchPopUp: boolean;
  selectedDispatchId: number;

  ///ItemTxn Summary Report Columns variable
  ItemTxnSummaryReportColumns: Array<any> = null;
  ///ItemTxn Summary Report Data variable
  ItemTxnSummaryReportData: Array<ItemTxnSummaryReportModel> = new Array<ItemTxnSummaryReportModel>();
  NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public pharmacy: string = "pharmacy";
  showNepaliReceipt: boolean = false;
  showNepaliGRPopUp: boolean = false;

  constructor(private _pharmacyBLService: PharmacyBLService, private msgBox: MessageboxService, public coreService: CoreService) {
    this.ItemTxnSummaryReportColumns = PHRMReportsGridColumns.PHRMItemTxnSummaryReport;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("TransactionDate", true));
    var showNpReceiptParams = this.coreService.Parameters.find(a => a.ParameterGroupName == 'Common' && a.ParameterName == 'NepaliReceipt');
    this.checkForNepaliReceiptParameter(showNpReceiptParams);
  }
  private checkForNepaliReceiptParameter(showNpReceiptParams: CFGParameterModel) {
    if (!!showNpReceiptParams) {
      if (showNpReceiptParams.ParameterValue == true || showNpReceiptParams.ParameterValue == 'true')
        this.showNepaliReceipt = true;
    }
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
        if (this.showNepaliReceipt) {
          this.showNepaliGRPopUp = true;
        }
        else {
          this.showGRPopUp = true;
        }
        break;
      }
      case 'CGR': {
        this.selectedGRId = selectedItemTxnData.ReferenceNo;
        this.showGRPopUp = true;
        break;
      }
      case 'PH': {
        this.selectedInvoiceId = selectedItemTxnData.ReferenceNo;
        this.showInvoicePopUp = true;
        break;
      }
      case 'CR-PH': {
        this.selectedInvoiceReturnId = selectedItemTxnData.ReferenceNo;
        this.showInvoiceReturnPopUp = true;
        break;
      }
      case 'TR': {
        this.selectedDispatchId = selectedItemTxnData.ReferencePrintNo;
        if (this.showNepaliReceipt == true) {
          this.showDispatchPopUp = true;
        }
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

  OnInvoiceReturnPopUpClose() {
    this.showInvoiceReturnPopUp = false;
  }
  OnDispatchPopUpClose() {
    this.showDispatchPopUp = false;
  }
}
