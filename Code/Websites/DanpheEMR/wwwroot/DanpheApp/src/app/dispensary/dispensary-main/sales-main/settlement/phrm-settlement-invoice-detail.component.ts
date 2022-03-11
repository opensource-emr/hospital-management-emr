import { Component, EventEmitter, Input, Output } from "@angular/core";
import * as moment from "moment";
import { PharmacyBLService } from "../../../../pharmacy/shared/pharmacy.bl.service";
import { CommonFunctions } from "../../../../shared/common.functions";
import { MessageboxService } from "../../../../shared/messagebox/messagebox.service";

@Component({
  selector: 'phrm-settlement-invoice-detail',
  templateUrl: "./phrm-settlement-invoice-detail.html"
})

// App Component class
export class PHRMSettlementInvoiceDetail {

  @Input('showInvoiceDetail')
  public showInvoiceDetail: boolean = false;

  @Input('InvoiceId')
  public InvoiceId: number = 0;

  @Input('PatientInfo')
  public PatientInfo: any = null;

  @Output('InvoiceDetailCallBack')
  public closeInvoiceDetail: EventEmitter<Object> = new EventEmitter<Object>();

  public InvoiceDetail: any = {};
  public InvoiceItems: any[] = [];
  public CreditNotes: any[] = [];
  public CreditNoteItems: any[] = [];
  public Age: any = null;
  salesTotalAmount: number = 0;
  creditNoteTotal: number = 0;

  constructor(
    public pharmacyBLService: PharmacyBLService,
    public msgBoxServ: MessageboxService) {

  }
  ngOnInit() {
    this.GetSettlementSingleInvoicePreview();

    this.CalculateAge();
  }

  public GetSettlementSingleInvoicePreview() {
    if (this.showInvoiceDetail) {
      this.pharmacyBLService.GetSettlementSingleInvoicePreview(this.InvoiceId).subscribe(
        res => {
          if (res.Status == "OK") {
            this.InvoiceDetail = res.Results.InvoiceInfo;
            this.InvoiceItems = res.Results.InvoiceItems;
            this.CreditNotes = res.Results.CreditNotes;
            this.CreditNoteItems = res.Results.CreditNoteItems;
            this.salesTotalAmount = this.InvoiceItems.reduce((a, b) => a + b.TotalAmount, 0);
            this.creditNoteTotal = this.CreditNoteItems.reduce((a, b) => a + b.TotalAmount, 0)
            this.CreditNotes.forEach(a => {
              a['CreditNotesInfo'] = this.CreditNoteItems.filter(b => b.InvoiceReturnId == a.InvoiceReturnId);
            });
          }
          else {
            this.msgBoxServ.showMessage("failed", ["Couldn't fetch invoice detail."]);
          }
        }
      )
    }
  }

  public CloseInvoiceDetail() {
    this.closeInvoiceDetail.emit({ "close": true });
  }

  public CalculateAge() {
    this.Age = CommonFunctions.GetFormattedAge(this.PatientInfo.DateOfBirth);
  }

}