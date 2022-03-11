import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { PharmacyReceiptModel } from '../../../../pharmacy/shared/pharmacy-receipt.model';
import { PharmacyBLService } from '../../../../pharmacy/shared/pharmacy.bl.service';
import { PharmacyService } from '../../../../pharmacy/shared/pharmacy.service';
import PHRMGridColumns from '../../../../pharmacy/shared/phrm-grid-columns';
import { PHRMInvoiceReturnModel } from '../../../../pharmacy/shared/phrm-invoice-return.model ';
import { PHRMInvoiceModel } from '../../../../pharmacy/shared/phrm-invoice.model';
import { PHRMStoreModel } from '../../../../pharmacy/shared/phrm-store.model';
import { SecurityService } from '../../../../security/shared/security.service';
import { NepaliCalendarService } from '../../../../shared/calendar/np/nepali-calendar.service';
import { GridEmitModel } from '../../../../shared/danphe-grid/grid-emit.model';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { DispensaryService } from '../../../shared/dispensary.service';

@Component({
  selector: 'app-sales-return-list',
  templateUrl: './sales-return-list.component.html',
  styleUrls: ['./sales-return-list.component.css'],
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class SalesReturnListComponent implements OnInit {

  public saleListData: Array<PHRMInvoiceModel> = new Array<PHRMInvoiceModel>();
  public pharmListfiltered: Array<PHRMInvoiceModel> = new Array<PHRMInvoiceModel>();
  //variable for show invoice details with all items
  public saleInvoiceDetails: PHRMInvoiceModel = new PHRMInvoiceModel();
  //variable for show return invoice details with all items
  public saleInvoiceRetDetails: PHRMInvoiceReturnModel = new PHRMInvoiceReturnModel();
  // //It save InvoiceId with Invoice itmes details for local data access
  public saleInvoiceLocalData = new Array<{ InvoiceId: number, Invoice: PHRMInvoiceModel }>();
  public saleGridColumns: Array<any> = null;
  public showSaleItemsPopup: boolean = false;
  public fromDate: string = null;
  public toDate: string = null;
  public dateRange: string = "last1Week";
  public pharmacyReceipt: PharmacyReceiptModel = new PharmacyReceiptModel();
  public saleretDetails: any;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public saleretId: any;
  public CRNNO: any;
  public RetQty: any;

  public currentActiveDispensary: PHRMStoreModel;
  public isSelectedDispensaryInsurance: boolean;
  public returnSaleListSummary = { totalReturnAmount: 0 };
  loading: boolean = false;

  constructor(private _dispensaryService: DispensaryService,
    public router: Router, public pharmacyService: PharmacyService,
    public pharmacyBLService: PharmacyBLService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public securityService: SecurityService,
    public nepaliDate: NepaliCalendarService

  ) {
    this.fromDate = moment().format('YYYY-MM-DD');
    this.toDate = moment().format('YYYY-MM-DD');
    this.isSelectedDispensaryInsurance = this._dispensaryService.isInsuranceDispensarySelected;
    this.currentActiveDispensary = this._dispensaryService.activeDispensary;
    this.saleGridColumns = this.isSelectedDispensaryInsurance ? PHRMGridColumns.PHRMInsuranceSaleReturnList : PHRMGridColumns.PHRMSaleReturnList;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('CreateOn', false));
  }

  ngOnInit() {
  }

  //Load sale invoice return list
  LoadSaleInvoiceReturnList(): void {
    try {
      this.loading = true;
      this.pharmacyBLService.GetSaleReturnList(this.fromDate, this.toDate, this.currentActiveDispensary.StoreId)
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.saleListData = res.Results;
            this.pharmListfiltered = this.saleListData;
            this.loading = false;
            this.calculateSummary();
          }
          else {
            this.logError(res.ErrorMessage);
          }
        },
          err => {
            this.logError("failed to get patients")
          });
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  private calculateSummary() {
    this.returnSaleListSummary.totalReturnAmount = this.pharmListfiltered.reduce((a, b) => a + b.PaidAmount, 0);
  }

  logError(err: any) {
    this.msgBoxServ.showMessage("error", [err]);
    console.log(err);
  }
  // Date range change event for From To Date Selector
  OnDateRangeChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    // if (this.fromDate != null && this.toDate != null) {
    //   if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
    //   } else {
    //     this.loading = true;
    //     this.msgBoxServ.showMessage('failed', ['Please enter valid From date and To date']);
    //   }
    // }
  }

  //Grid actions fires this method
  SaleReturnListGridActions($event: GridEmitModel) {
    try {
      switch ($event.Action) {
        case "view": {
          if ($event.Data != null) {
            var selectedSaleInvoiceData = $event.Data;
            this.CRNNO = $event.Data.CreditNoteId;
            this.pharmacyReceipt.BillingUser = $event.Data.UserName;
            this.ShowSaleInvoiceDetail(selectedSaleInvoiceData);
          }
          break;
        }

        default:
          break;
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  ShowSaleCreditInvoiceDetail(InvoiceId) {
    //Pass the Purchase order Id  to Next page for getting PUrchaserOrderItems using inventoryService
    this.pharmacyService.Id = InvoiceId;
    this.router.navigate(['/Dispensary/Sale/SaleCredit']);
  }

  //Method to show details of single sale invoice
  public ShowSaleInvoiceDetail(selectedSaleInvoiceData) {
    try {
      this.saleretId = selectedSaleInvoiceData.InvoiceReturnId;
      if (selectedSaleInvoiceData) {
        this.saleInvoiceDetails = selectedSaleInvoiceData;

        if (this.saleretId) {
          this.pharmacyBLService.GetSaleReturnInvoiceItemsByInvoiceRetId(this.saleretId)
            .subscribe(res => {
              if (res.Status == 'OK') {
                this.showSaleItemsPopup = true;
                this.saleInvoiceDetails.Patient = res.Results.patientData;
                this.saleInvoiceDetails.InvoiceItems = res.Results.invoiceRetData;
                this.saleInvoiceRetDetails.InvoiceReturnItems = res.Results.invoiceRetData;
                this.saleInvoiceDetails.InvoiceItems = this.saleInvoiceDetails.InvoiceItems.filter(a => a.ReturnedQty > 0);
                let tempInvoice = { InvoiceId: this.saleInvoiceDetails.InvoiceId, Invoice: this.saleInvoiceDetails };
                this.saleInvoiceLocalData.push(tempInvoice);
                this.printReceipt(this.saleInvoiceDetails);
              }
              else {
                this.showSaleItemsPopup = false;
                this.logError(res.ErrorMessage);
              }
            },
              err => {
                this.showSaleItemsPopup = false;
                this.logError("failed to get invoice items")
              });
        }
      }

    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  public filterlist() {
    if (this.fromDate && this.toDate) {
      this.pharmListfiltered = [];
      this.saleListData.forEach(pharm => {
        let selPharmDate = moment(pharm.CreateOn).format('YYYY-MM-DD');
        let isGreterThanFrom = selPharmDate >= moment(this.fromDate).format('YYYY-MM-DD');
        let isSmallerThanTo = selPharmDate <= moment(this.toDate).format('YYYY-MM-DD')
        if (isGreterThanFrom && isSmallerThanTo) {
          this.pharmListfiltered.push(pharm);
        }
      });
    }
    else {
      this.pharmListfiltered = this.saleListData;
    }

  }
  //This function only for show catch messages in console 
  ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }
  Close() {
    this.showSaleItemsPopup = false;
  }

  printReceipt(invoiceItemData) {
    try {
      if (invoiceItemData) {
        let txnReceipt = PharmacyReceiptModel.GetReceiptForTransaction(invoiceItemData);
        txnReceipt.localReceiptdate = this.nepaliDate.ConvertEngToNepDateString(txnReceipt.ReceiptDate) + " BS";
        txnReceipt.IsValid = true;
        txnReceipt.ReceiptType = "Sale Return Receipt";
        txnReceipt.IsReturned = true;
        txnReceipt.BillingUser = invoiceItemData.UserName;
        txnReceipt.Patient = invoiceItemData.Patient;
        txnReceipt.Patient.NSHINumber = invoiceItemData.NSHINumber;
        txnReceipt.Remarks = invoiceItemData.Remarks;
        txnReceipt.CRNNo = this.CRNNO;
        txnReceipt.PrintCount = 1;
        txnReceipt.StoreId = invoiceItemData.StoreId;
        this.pharmacyReceipt.InvoiceItems = invoiceItemData.InvoiceItems;
        this.pharmacyService.globalPharmacyReceipt = txnReceipt;
        this.pharmacyReceipt = this.pharmacyService.globalPharmacyReceipt;
        this.showSaleItemsPopup = true;
      }
      else {
        this.msgBoxServ.showMessage("failed", ['no data,please try again']);
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  public hotkeys(event) {
    //For ESC key => close the pop up
    if (event.keyCode == 27) {
      this.Close();
    }
  }
}
