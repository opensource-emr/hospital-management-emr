import { ChangeDetectorRef, Component } from '@angular/core';
import { BillingBLService } from '../../shared/billing.bl.service';
import { BillingTransaction } from '../../shared/billing-transaction.model';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';

import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { DanpheLoadingInterceptor } from '../../../shared/danphe-loader-intercepter/danphe-loading.services';
import { CoreService } from '../../../core/shared/core.service';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({
  templateUrl: './duplicate-invoice-list.html',
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: DanpheLoadingInterceptor,
    multi: true,
  }],
  host: { '(window:keydown)': 'hotkeys($event)' }
})

// App Component class
export class BIL_DuplicatePrint_InvoiceListComponent {

  public showPrintPopup: boolean = false;


  public AllTransactionList: Array<BillingTransaction> = new Array<BillingTransaction>();
  public filteredTransactionList: Array<BillingTransaction> = new Array<BillingTransaction>();
  public duplicateBillPrintGridColumns: Array<any> = null;

  public showCustomDate: boolean = true;
  public showNormalReceipt: boolean = true;//sud: 20Aug'18--for DischargeReceipt
  public showInpatientReceipt: boolean = false; //sud: 20Aug'18--for DischargeReceipt

  public fromDate: string = null;
  public toDate: string = null;

  public isFromDuplicatePrints: boolean = true;

  previousInvoiceNo: number = 0;
  nextInvoiceNo: number = 0;

  public showInsuranceInvoice: boolean = false;
  public loading: boolean = false;


  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public QueueNoSetting = { "ShowInInvoice": false, "ShowInSticker": false };

  constructor(
    public BillingBLService: BillingBLService,
    public msgBoxServ: MessageboxService, public coreService: CoreService, public changeDetectorRef: ChangeDetectorRef) {
    this.duplicateBillPrintGridColumns = GridColumnSettings.DuplicateInvoiceList;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('TransactionDate', false));
    this.QueueNoSetting = this.coreService.GetQueueNoSetting();

  }

  GetInvoiceListForDuplicatebill() {
    this.coreService.loading = true;
    this.BillingBLService.GetInvoiceDetailsForDuplicatebill(this.fromDate, this.toDate)
      .finally(() => {
        this.loading = false;
        this.coreService.loading = false;
      })//re-enable button after response comes back.
      .subscribe(res => {
        this.AllTransactionList = res.Results;

        if (this.showInsuranceInvoice) {
          this.filteredTransactionList = this.AllTransactionList.filter(a => a.IsInsuranceBilling == true);
        }
        else {
          this.filteredTransactionList = this.AllTransactionList;
        }
      });
  }


  DuplicateBillPrintGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "showDetails":
        {
          var data = $event.Data;
          this.LoadInvoice(data.InvoiceNumber, data.FiscalYearId, data.BillingTransactionId);

          this.previousInvoiceNo = data.InvoiceNumber - 1;
          this.nextInvoiceNo = data.InvoiceNumber + 1;

        }
        break;
      default:
        break;
    }
  }

  public bil_InvoiceNo: number = null;
  public bil_FiscalYrId: number = null;
  public bil_BilTxnId: number = null;

  LoadInvoice(invoiceNo: number, fiscYrId: number, billingTxnId: number) {
    this.bil_InvoiceNo = invoiceNo;
    this.bil_FiscalYrId = fiscYrId;
    this.bil_BilTxnId = billingTxnId;
    this.showPrintPopup = true;
  }




  //start: sud: 19Jul'19 -- for Insurance Txn Date--
  ShowInsTransactionDate(): boolean {
    let retValue: boolean = false;

    //getting emergency name from the parameterized data
    let txnParam = this.coreService.Parameters.find(p => p.ParameterGroupName.toLowerCase() == "billing" && p.ParameterName.toLowerCase() == "showinstransactiondate");

    if (txnParam && txnParam.ParameterValue && txnParam.ParameterValue.toLowerCase() == "true") {
      retValue = true;
    }
    else {
      retValue = false;
    }

    return retValue;
  }
  //end: sud: 19Jul'19 -- for Insurance Txn Date--


  OnDateRangeChange($event) {
    if ($event) {
      this.fromDate = $event.fromDate;
      this.toDate = $event.toDate;
    }
    //this.loadDailyCollectionVsHandoverReport();
  }

  CloseInvoicePrintPopup() {
    this.showPrintPopup = false;
  }

  hotkeys(event) {
    if (event.keyCode == 27) {
      this.CloseInvoicePrintPopup();
    }
  }

  AfterPrintCallBack(data) {
    if (data.Close == "close") {
      this.showPrintPopup = false;
    }
  }

  public FilterGridData() {
    if (this.showInsuranceInvoice) {
      this.filteredTransactionList = this.AllTransactionList.filter(a => a.IsInsuranceBilling == true);
    }
    else {
      this.filteredTransactionList = this.AllTransactionList;
    }
  }

}
