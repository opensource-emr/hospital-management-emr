import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NepaliCalendarService } from '../../../shared/calendar/np/nepali-calendar.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { PharmacyReceiptModel } from '../../shared/pharmacy-receipt.model';
import { PharmacyBLService } from '../../shared/pharmacy.bl.service';

@Component({
  selector: 'app-phrm-invoice-view',
  templateUrl: './phrm-invoice-view.html',
  styleUrls: ['./phrm-invoice-view.css'],
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class PhrmInvoiceViewComponent implements OnInit {
  @Input("showPopUp") showPopUp: boolean;
  @Input("invoiceId") invoiceId: number;
  @Output("call-back-close") CallBackClose: EventEmitter<any> = new EventEmitter();

  public pharmacyReceipt: PharmacyReceiptModel;

  constructor(public pharmacyBLService: PharmacyBLService, public msgBox: MessageboxService, public nepaliCalendarServ: NepaliCalendarService) { }

  ngOnInit() {
    this.GetInvoiceReceiptByInvoiceId();
  }

  GetInvoiceReceiptByInvoiceId() {
    this.pharmacyBLService.GetInvoiceReceiptByInvoiceId(this.invoiceId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.pharmacyReceipt = res.Results.pharmacyReceipt;
          this.pharmacyReceipt.localReceiptdate = this.nepaliCalendarServ.ConvertEngToNepDateString(this.pharmacyReceipt.ReceiptDate);
          this.pharmacyReceipt.localReceiptdate += " BS";
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
    this.showPopUp = false;
    this.CallBackClose.emit();
  }
  public hotkeys(event) {
    //For ESC key => close the pop up
    if (event.keyCode == 27) {
      this.Close();
    }
  }
}
