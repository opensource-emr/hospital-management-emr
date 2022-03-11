import { Component, EventEmitter, Input, Output } from "@angular/core";
import * as moment from "moment";
import { CommonFunctions } from "../../shared/common.functions";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { BillingBLService } from "../shared/billing.bl.service";

@Component({
    selector: 'bill-settlement-invoice-detail',
    templateUrl: "./bill-settlement-invoice-detail.html"
  })
  
  // App Component class
  export class BillSettlementInvoiceDetail {

    @Input('showInvoiceDetail')
    public showInvoiceDetail:boolean = false;

    @Input('BillingTransactionId')
    public BillingTransactionId:number = 0;

    @Input('PatientInfo')
    public PatientInfo:any = null;

    @Output('InvoiceDetailCallBack')
    public closeInvoiceDetail:EventEmitter<Object> = new EventEmitter<Object>();

    public InvoiceDetail:any = {};
    public InvoiceItems:any[] = [];
    public CreditNotes:any[] = [];
    public CreditNoteItems:any[] = [];
    public Age:any = null;

    constructor(
      public billingBLService: BillingBLService,
      public msgBoxServ: MessageboxService) {
      
    }
    ngOnInit(){
      this.GetSettlementSingleInvoicePreview();

      this.CalculateAge();
    }

    public GetSettlementSingleInvoicePreview(){
      if(this.showInvoiceDetail){
        this.billingBLService.GetSettlementSingleInvoicePreview(this.BillingTransactionId).subscribe(
          res =>{
            if (res.Status == "OK") {
              this.InvoiceDetail = res.Results.InvoiceInfo;
              this.InvoiceItems = res.Results.InvoiceItems;
              this.CreditNotes = res.Results.CreditNotes;
              this.CreditNoteItems = res.Results.CreditNoteItems;

              this.CreditNotes.forEach(a => {
              a['CreditNotesInfo'] = this.CreditNoteItems.filter(b => b.BillReturnId == a.BillReturnId);
              });
            }
            else{
              this.msgBoxServ.showMessage("failed", ["Couldn't fetch invoice detail."]);
            }
          }
        )
      }
    }

    public CloseInvoiceDetail(){
        this.closeInvoiceDetail.emit({"close":true});
    }

    public CalculateAge(){
      this.Age = CommonFunctions.GetFormattedAge(this.PatientInfo.DateOfBirth);
    }


  }