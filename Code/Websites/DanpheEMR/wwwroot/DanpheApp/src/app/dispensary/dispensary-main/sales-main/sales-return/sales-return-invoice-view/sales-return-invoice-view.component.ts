import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PharmacyReceiptModel } from '../../../../../pharmacy/shared/pharmacy-receipt.model';
import { PharmacyBLService } from '../../../../../pharmacy/shared/pharmacy.bl.service';
import { SecurityService } from '../../../../../security/shared/security.service';
import { NepaliCalendarService } from '../../../../../shared/calendar/np/nepali-calendar.service';
import { MessageboxService } from '../../../../../shared/messagebox/messagebox.service';

@Component({
  selector: 'app-sales-return-invoice-view',
  templateUrl: './sales-return-invoice-view.component.html',
  styleUrls: ['./sales-return-invoice-view.component.css'],
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class SalesReturnInvoiceViewComponent implements OnInit {
  @Input("showInvoiceReturnPopUp") showInvoiceReturnPopUp: boolean;
  @Input("invoiceReturnId") invoiceReturnId: number;
  @Output("invoice-return-popup-close") CallBackClose: EventEmitter<any> = new EventEmitter();

  public pharmacyReceipt: PharmacyReceiptModel = new PharmacyReceiptModel ();
  invoiceDetails: any;

  constructor(public pharmacyBLService: PharmacyBLService, public msgBox: MessageboxService, public nepaliCalendarServ: NepaliCalendarService, private securityService: SecurityService) { }

  ngOnInit() {
    this.getSalesReturnInvoiceReceiptByInvoiceReturnId();
  }

  getSalesReturnInvoiceReceiptByInvoiceReturnId() {
    this.pharmacyBLService.GetSaleReturnInvoiceItemsByInvoiceRetId(this.invoiceReturnId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.invoiceDetails = res.Results.invoiceData;
          let retReceipt: PharmacyReceiptModel = new PharmacyReceiptModel();
          retReceipt.ReceiptNo = this.invoiceDetails.InvoiceId;
          retReceipt.ReceiptPrintNo = this.invoiceDetails.InvoicePrintId;
          retReceipt.ClaimCode = this.invoiceDetails.ClaimCode;
          retReceipt.ProviderNMCNumber = this.invoiceDetails.ProviderNMCNumber;
          retReceipt.ProviderName = this.invoiceDetails.ProviderName;
          this.pharmacyReceipt = Object.assign(retReceipt);
          this.pharmacyReceipt.InvoiceItems = res.Results.invoiceRetData;
          for (let index = 0; index < this.pharmacyReceipt.InvoiceItems.length; index++) {
            this.pharmacyReceipt.SubTotal += this.pharmacyReceipt.InvoiceItems[index].SubTotal; 
            this.pharmacyReceipt.TotalAmount += this.pharmacyReceipt.InvoiceItems[index].TotalAmount; 
          }
          this.pharmacyReceipt.Patient = res.Results.patientData;
          this.pharmacyReceipt.PrintCount = 1;
          this.pharmacyReceipt.IsReturned = true;
          this.pharmacyReceipt.CRNNo = this.pharmacyReceipt.InvoiceItems[0].CreditNoteId;
          this.pharmacyReceipt.CurrentFinYear = this.pharmacyReceipt.InvoiceItems[0].FiscalYearName;
          this.pharmacyReceipt.Remarks = this.pharmacyReceipt.InvoiceItems[0].Remark;
          this.pharmacyReceipt.ReceiptDate = this.pharmacyReceipt.InvoiceItems[0].CreatedOn;
          this.pharmacyReceipt.BillingUser = this.securityService.GetLoggedInUser().UserName;
          this.showInvoiceReturnPopUp = true;
          // this.pharmacyReceipt.localReceiptdate = this.nepaliCalendarServ.ConvertEngToNepDateString(this.pharmacyReceipt.ReceiptDate);
          // this.pharmacyReceipt.localReceiptdate += " BS";
        }
        else {
          this.msgBox.showMessage("Failed", ["Failed to load data."]);
        }
      }, err => {
        console.log(err);
        this.msgBox.showMessage("Failed", ["Failed to load data."]);
      })
  }

  Close() {
    this.showInvoiceReturnPopUp = false;
    this.CallBackClose.emit();
  }
  public hotkeys(event) {
    //For ESC key => close the pop up
    if (event.keyCode == 27) {
      this.Close();
    }
  }


}
