import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { CoreService } from '../../../../core/shared/core.service';
import { PharmacyReceiptModel } from '../../../../pharmacy/shared/pharmacy-receipt.model';
import { PharmacyBLService } from '../../../../pharmacy/shared/pharmacy.bl.service';
import { PharmacyService } from '../../../../pharmacy/shared/pharmacy.service';
import PHRMGridColumns from '../../../../pharmacy/shared/phrm-grid-columns';
import { PHRMInvoiceReturnModel } from '../../../../pharmacy/shared/phrm-invoice-return.model ';
import { PHRMInvoiceModel } from '../../../../pharmacy/shared/phrm-invoice.model';
import { PHRMStoreModel } from '../../../../pharmacy/shared/phrm-store.model';
import { SecurityService } from '../../../../security/shared/security.service';
import { GeneralFieldLabels } from '../../../../shared/DTOs/general-field-label.dto';
import { NepaliCalendarService } from '../../../../shared/calendar/np/nepali-calendar.service';
import { CommonFunctions } from '../../../../shared/common.functions';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { GridEmitModel } from '../../../../shared/danphe-grid/grid-emit.model';
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
  public showInvoicePopup: boolean = false;
  public fromDate: string = null;
  public toDate: string = null;
  public dateRange: string = "last1Week";
  public pharmacyReceipt: PharmacyReceiptModel = new PharmacyReceiptModel();
  public saleretDetails: any;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public saleretId: any;
  public CRNNO: any;
  public RetQty: any;
  public GeneralFieldLabel = new GeneralFieldLabels();

  public currentActiveDispensary: PHRMStoreModel;
  public isSelectedDispensaryInsurance: boolean;
  public returnSaleListSummary = { totalReturnAmount: 0 };
  loading: boolean = false;
  InvoiceReturnId: number = 0;

  constructor(private _dispensaryService: DispensaryService,
    public router: Router, public pharmacyService: PharmacyService,
    public pharmacyBLService: PharmacyBLService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public securityService: SecurityService,
    public nepaliDate: NepaliCalendarService,
    public coreService: CoreService

  ) {
    this.fromDate = moment().format('YYYY-MM-DD');
    this.toDate = moment().format('YYYY-MM-DD');
    this.isSelectedDispensaryInsurance = this._dispensaryService.isInsuranceDispensarySelected;
    this.currentActiveDispensary = this._dispensaryService.activeDispensary;
    this.saleGridColumns = this.isSelectedDispensaryInsurance ? PHRMGridColumns.PHRMInsuranceSaleReturnList : PHRMGridColumns.PHRMSaleReturnList;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('CreateOn', false));
    if (this.isSelectedDispensaryInsurance) {

      this.GeneralFieldLabel = coreService.GetFieldLabelParameter();
      this.saleGridColumns[4].headerName = `${this.GeneralFieldLabel.NSHINo} No.`;
    }
  }

  ngOnInit() {
  }

  //Load sale invoice return list
  LoadSaleInvoiceReturnList(): void {
    if (this.fromDate == null || this.toDate == null) {
      this.msgBoxServ.showMessage('Notice', ['Please provide valid date.']);
      return;
    }
    try {
      this.loading = true;
      this.pharmacyBLService.GetSaleReturnList(this.fromDate, this.toDate, this.currentActiveDispensary.StoreId)
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.saleListData = res.Results;
            this.pharmListfiltered = this.saleListData;
            this.pharmListfiltered.forEach(inv => {
              if (inv.InvoicePrintId === null) {
                inv.InvoicePrintId = inv.ReferenceInvoiceNo;
              }
            });
            this.pharmListfiltered = this.pharmListfiltered.slice();
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
            this.InvoiceReturnId = $event.Data.InvoiceReturnId;
            this.showInvoicePopup = true;
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
                let taxableAmount = 0;
                let nonTaxableAmt = 0;
                this.showInvoicePopup = true;
                this.saleInvoiceDetails.Patient = res.Results.patientData;
                this.saleInvoiceDetails.InvoiceItems = res.Results.invoiceRetData;
                this.saleInvoiceRetDetails.InvoiceReturnItems = res.Results.invoiceRetData;
                this.saleInvoiceDetails.InvoiceItems = this.saleInvoiceDetails.InvoiceItems.filter(a => a.ReturnedQty > 0);
                for (var index = 0; index < this.saleInvoiceDetails.InvoiceItems.length; index++) {
                  if (this.saleInvoiceDetails.InvoiceItems[index].VATPercentage > 0) {
                    taxableAmount = taxableAmount + (this.saleInvoiceDetails.InvoiceItems[index].SubTotal - this.saleInvoiceDetails.InvoiceItems[index].DiscountAmount);

                  }
                  else {
                    nonTaxableAmt = nonTaxableAmt + (this.saleInvoiceDetails.InvoiceItems[index].SubTotal - this.saleInvoiceDetails.InvoiceItems[index].DiscountAmount);
                  }
                }
                this.saleInvoiceDetails.TaxableAmount = CommonFunctions.parsePhrmAmount(taxableAmount);
                this.saleInvoiceDetails.NonTaxableAmount = CommonFunctions.parsePhrmAmount(nonTaxableAmt);
                this.saleInvoiceDetails.VATPercentage = CommonFunctions.parsePhrmAmount((this.saleInvoiceDetails.VATAmount / this.saleInvoiceDetails.TaxableAmount) * 100);
                let tempInvoice = { InvoiceId: this.saleInvoiceDetails.InvoiceId, Invoice: this.saleInvoiceDetails };
                this.saleInvoiceDetails.CashAmount = res.Results.invoiceReturnDetails.CashAmount;
                this.saleInvoiceDetails.CreditAmount = res.Results.invoiceReturnDetails.CreditAmount;
                this.saleInvoiceDetails.PolicyNo = res.Results.invoiceReturnDetails.PolicyNo;
                this.saleInvoiceDetails.ReferenceInvoiceNo = res.Results.invoiceReturnDetails.ReferenceInvoiceNo;
                this.saleInvoiceLocalData.push(tempInvoice);
                this.printReceipt(this.saleInvoiceDetails);
              }
              else {
                this.showInvoicePopup = false;
                this.logError(res.ErrorMessage);
              }
            },
              err => {
                this.showInvoicePopup = false;
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
    this.showInvoicePopup = false;
  }

  printReceipt(invoiceItemData) {
    try {
      if (invoiceItemData) {
        let txnReceipt = PharmacyReceiptModel.GetReceiptForTransaction(invoiceItemData);
        txnReceipt.localReceiptDate = this.nepaliDate.ConvertEngToNepDateString(txnReceipt.ReceiptDate) + " BS";
        txnReceipt.IsValid = true;
        txnReceipt.ReceiptType = "Sale Return Receipt";
        txnReceipt.IsReturned = true;
        txnReceipt.BillingUser = invoiceItemData.UserName;
        txnReceipt.Patient = invoiceItemData.Patient;
        txnReceipt.Patient.NSHINumber = invoiceItemData.NSHINumber;
        txnReceipt.Remarks = invoiceItemData.Remarks;
        txnReceipt.CRNNo = this.CRNNO;
        txnReceipt.ReferenceInvoiceNo = txnReceipt.ReceiptPrintNo === null ? invoiceItemData.ReferenceInvoiceNo : txnReceipt.ReceiptPrintNo.toString();
        txnReceipt.PrintCount = 1;
        txnReceipt.StoreId = invoiceItemData.StoreId;
        this.pharmacyReceipt.InvoiceItems = invoiceItemData.InvoiceItems;
        this.pharmacyService.globalPharmacyReceipt = txnReceipt;
        this.pharmacyReceipt = this.pharmacyService.globalPharmacyReceipt;
        this.showInvoicePopup = true;
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
