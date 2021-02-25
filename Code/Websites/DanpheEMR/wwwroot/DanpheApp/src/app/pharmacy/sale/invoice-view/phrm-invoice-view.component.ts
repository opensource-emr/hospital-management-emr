import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { PharmacyReceiptModel } from '../../shared/pharmacy-receipt.model';
import { PharmacyBLService } from '../../shared/pharmacy.bl.service';

@Component({
  selector: 'app-phrm-invoice-view',
  templateUrl: './phrm-invoice-view.html',
  styleUrls: ['./phrm-invoice-view.css']
})
export class PhrmInvoiceViewComponent implements OnInit {
  @Input("showPopUp") showPopUp: boolean;
  @Input("invoiceId") invoiceId: number;
  @Output("call-back-close") CallBackClose: EventEmitter<any> = new EventEmitter();

  public pharmacyReceipt: PharmacyReceiptModel;

  constructor(public pharmacyBLService: PharmacyBLService, public msgBox: MessageboxService) { }

  ngOnInit() {
    this.GetInvoiceReceiptByInvoiceId();
  }

  GetInvoiceReceiptByInvoiceId() {
    this.pharmacyBLService.GetInvoiceReceiptByInvoiceId(this.invoiceId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.pharmacyReceipt = res.Results.pharmacyReceipt;
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
  OnInvoicePrint(){
    this.Close();
  }
}
