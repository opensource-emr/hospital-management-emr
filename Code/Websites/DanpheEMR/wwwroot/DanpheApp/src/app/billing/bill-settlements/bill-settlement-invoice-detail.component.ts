import { Component, EventEmitter, Input, Output } from "@angular/core";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { CommonFunctions } from "../../shared/common.functions";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status, ENUM_ModuleName } from "../../shared/shared-enums";
import { BillingBLService } from "../shared/billing.bl.service";

@Component({
  selector: 'bill-settlement-invoice-detail',
  templateUrl: "./bill-settlement-invoice-detail.html"
})

// App Component class
export class BillSettlementInvoiceDetail {

  @Input('showInvoiceDetail')
  public showInvoiceDetail: boolean = false;

  @Input('BillingTransactionId')
  public BillingTransactionId: number = 0;

  @Input('PatientInfo')
  public PatientInfo: any = null;

  @Input('invoice-of')
  public InvoiceOf: string = "";

  @Output('InvoiceDetailCallBack')
  public closeInvoiceDetail: EventEmitter<Object> = new EventEmitter<Object>();

  //! Krishna, 24thApril'23, Need to Create DTO for all the below objects
  public InvoiceDetail: any = {};
  public InvoiceItems: any[] = [];
  public CreditNotes: any[] = [];
  public CreditNoteItems: any[] = [];
  public Age: any = null;

  constructor(
    public billingBLService: BillingBLService,
    public msgBoxServ: MessageboxService) {

  }
  ngOnInit() {
    this.GetSettlementSingleInvoicePreview();

    this.CalculateAge();
  }

  public GetSettlementSingleInvoicePreview() {
    if (this.showInvoiceDetail) {
      if (this.InvoiceOf !== ENUM_ModuleName.Pharmacy) {

        this.billingBLService.GetSettlementSingleInvoicePreview(this.BillingTransactionId).subscribe(
          (res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
              this.InvoiceDetail = res.Results.InvoiceInfo;
              this.InvoiceItems = res.Results.InvoiceItems;
              this.CreditNotes = res.Results.CreditNotes;
              this.CreditNoteItems = res.Results.CreditNoteItems;

              this.CreditNotes.forEach(a => {
                a['CreditNotesInfo'] = this.CreditNoteItems.filter(b => b.BillReturnId == a.BillReturnId);
              });
            }
            else {
              this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Couldn't fetch invoice detail."]);
            }
          });
      } else {
        this.billingBLService.GetSettlementSingleInvoicePreviewForPharmacy(this.BillingTransactionId).subscribe(
          (res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
              this.InvoiceDetail = res.Results.InvoiceInfo;
              this.InvoiceItems = res.Results.InvoiceItems;
              this.InvoiceItems.forEach(a => a.Price = a.SalePrice);
              this.CreditNotes = res.Results.CreditNotes;
              this.CreditNoteItems = res.Results.CreditNoteItems;

              this.CreditNotes.forEach(a => {
                a['CreditNotesInfo'] = this.CreditNoteItems.filter(b => b.BillReturnId == a.BillReturnId);
              });
            }
            else {
              this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Couldn't fetch invoice detail."]);
            }
          });
      }
    }
  }

  public CloseInvoiceDetail() {
    this.closeInvoiceDetail.emit({ "close": true });
  }

  public CalculateAge() {
    this.Age = CommonFunctions.GetFormattedAge(this.PatientInfo.DateOfBirth);
  }


}