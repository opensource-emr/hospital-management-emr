import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ENUM_CreditModule, ENUM_DanpheHTTPResponseText, ENUM_MessageBox_Status } from '../../shared/shared-enums';
import { ClaimBillReviewDTO } from '../shared/DTOs/ClaimManagement_BillReview_DTO';
import { BillingCreditBillItem_DTO } from '../shared/DTOs/billing-credit-bill-item.dto';
import { BillingCreditNote_DTO } from '../shared/DTOs/billing-credit-note.dto';
import { PharmacyCreditBillItem_DTO } from '../shared/DTOs/pharmacy-credit-bill-item.dto';
import { PharmacyCreditNote_DTO } from '../shared/DTOs/pharmacy-credit-notes.dto';
import { ClaimManagementBLService } from '../shared/claim-management.bl.service';

@Component({
  selector: 'ins-bill-preview',
  templateUrl: './ins-bill-preview.component.html',
  styleUrls: ['./ins-bill-preview.component.css'],
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class InsBillPreviewComponent implements OnInit {
  @Input("show-bill-preview-page")
  public showBillPreviewPage: boolean;
  @Input("selected-bill")
  public selectedBill: ClaimBillReviewDTO;
  @Input("redirectionPathAfterPrint")
  public redirectionPathAfterPrint: string = '/ClaimManagement/BillReview';
  public editBillItemStatus: boolean = null;
  public displayInvoice: boolean = null;
  @Output("hide-bill-preview-page")
  public hideBillPreviewPage: EventEmitter<boolean> = new EventEmitter<boolean>();
  public billingCreditModule: string = ENUM_CreditModule.Billing;
  public pharmacyCreditModule: string = ENUM_CreditModule.Pharmacy;
  public BillingCreditNotes: Array<BillingCreditNote_DTO> = new Array<BillingCreditNote_DTO>();
  public PharmacyCreditNotes: Array<PharmacyCreditNote_DTO> = new Array<PharmacyCreditNote_DTO>();
  public isBillingCreditNoteFound: boolean = false;
  public isPharmacyCreditNoteFound: boolean = false;
  public showBillingInvoice: boolean = false;
  public showPharmacyInvoice: boolean = false;
  public billingCreditBillItems: Array<BillingCreditBillItem_DTO> = new Array<BillingCreditBillItem_DTO>();
  public pharmacyCreditBillItems: Array<PharmacyCreditBillItem_DTO> = new Array<PharmacyCreditBillItem_DTO>();
  constructor(
    private messageBoxService: MessageboxService,
    private claimManagementBLService: ClaimManagementBLService,
  ) {
  }

  ngOnInit() {
    if (this.selectedBill.CreditModule === ENUM_CreditModule.Billing) {
      this.GetBillingCreditNotesByBillingTransactionId();
      this.showBillingInvoice = true;
    }
    else if (this.selectedBill.CreditModule === ENUM_CreditModule.Pharmacy) {
      this.GetPharmacyCreditNotesByInvoiceId();
      this.showPharmacyInvoice = true;
    }
    this.displayInvoice = true;
  }

  public CloseBillPreviewPopUp(): void {
    this.showBillPreviewPage = false;
    this.hideBillPreviewPage.emit(true);
  }

  public EditBillItemStatus(CreditModule: string): void {
    if (CreditModule == ENUM_CreditModule.Billing) {
      this.GetBillingCreditBillItems(this.selectedBill.InvoiceRefId);
    }
    else if (CreditModule == ENUM_CreditModule.Pharmacy) {
      this.GetPharmacyCreditBillItems(this.selectedBill.InvoiceRefId)
    }
  }

  public BackToPreview(): void {
    this.editBillItemStatus = false;
    this.showBillPreviewPage = true;
    this.displayInvoice = true;
  }

  public ExtractInvoiceNoFromFormattedInvoiceNo(formattedInvoiceNumber: string): number {
    const regex = /(\d+)/g;
    const InvoiceNumber = formattedInvoiceNumber.match(regex);
    if (InvoiceNumber && InvoiceNumber.length > 0) {
      return Number(InvoiceNumber[InvoiceNumber.length - 1]);
    } else {
      return null;
    }
  }

  public GetBillingCreditNotesByBillingTransactionId(): void {
    this.claimManagementBLService.GetBillingCreditNotesByBillingTransactionId(this.selectedBill.InvoiceRefId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          if (res.Results) {
            this.BillingCreditNotes = res.Results;
            this.isBillingCreditNoteFound = true;
          }
        }
      },
        (err: DanpheHTTPResponse) => {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Error : ${err.ErrorMessage}`]);
        })
  }

  public GetPharmacyCreditNotesByInvoiceId(): void {
    this.claimManagementBLService.GetPharmacyCreditNotesByInvoiceId(this.selectedBill.InvoiceRefId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          if (res.Results) {
            this.PharmacyCreditNotes = res.Results;
            this.isPharmacyCreditNoteFound = true;
          }
        }
      },
        (err: DanpheHTTPResponse) => {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Error : ${err.ErrorMessage}`]);
        })
  }

  public GetBillingCreditBillItems(BillingTransactionId: number): void {
    this.claimManagementBLService.GetBillingCreditBillItems(BillingTransactionId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          if (res.Results) {
            this.billingCreditBillItems = res.Results;
            this.displayInvoice = false;
            this.showBillPreviewPage = true;
            this.editBillItemStatus = true;
          }
        }
      },
        (err: DanpheHTTPResponse) => {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Error : ${err.ErrorMessage}`]);
        })
  }

  public GetPharmacyCreditBillItems(PharmacyInvoiceId: number): void {
    this.claimManagementBLService.GetPharmacyCreditBillItems(PharmacyInvoiceId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          if (res.Results) {
            this.pharmacyCreditBillItems = res.Results;
            this.displayInvoice = false;
            this.showBillPreviewPage = true;
            this.editBillItemStatus = true;
          }
        }
      },
        (err: DanpheHTTPResponse) => {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Error : ${err.ErrorMessage}`]);
        })
  }

  public UpdateBillingCreditItemClaimableStatus(BillingCreditBillItem: BillingCreditBillItem_DTO): void {
    BillingCreditBillItem.IsClaimable = !(BillingCreditBillItem.IsClaimable);
    BillingCreditBillItem.NetTotalAmount = BillingCreditBillItem.TotalAmount;
    this.claimManagementBLService.UpdateBillingCreditItemClaimableStatus(BillingCreditBillItem)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.selectedBill.NonClaimableAmount = res.Results;
          this.GetBillingCreditBillItems(BillingCreditBillItem.BillingTransactionId);
          this.EditBillItemStatus(this.billingCreditModule);
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [`Bill Item is successfully updated as ` + (BillingCreditBillItem.IsClaimable ? "Claimable" : "Non-Claimable")]);
        }
        else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Unable to update claimable status of this Bill Item.`]);
        }
      },
        (err: DanpheHTTPResponse) => {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Exception: ${err.ErrorMessage}`]);
        }
      );
  }

  public UpdatePharmacyCreditItemClaimableStatus(PharmacyCreditBillItem: PharmacyCreditBillItem_DTO): void {
    PharmacyCreditBillItem.IsClaimable = !(PharmacyCreditBillItem.IsClaimable);
    PharmacyCreditBillItem.NetTotalAmount = (PharmacyCreditBillItem.TotalAmount);
    this.claimManagementBLService.UpdatePharmacyCreditItemClaimableStatus(PharmacyCreditBillItem)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.selectedBill.NonClaimableAmount = res.Results;
          this.GetPharmacyCreditBillItems(PharmacyCreditBillItem.InvoiceId);
          this.EditBillItemStatus(this.pharmacyCreditModule);
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [`Bill Item is successfully updated as ` + (PharmacyCreditBillItem.IsClaimable ? "Claimable" : "Non-Claimable")]);
        }
        else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Unable to update claimable status of this Bill Item.`]);
        }
      },
        (err: DanpheHTTPResponse) => {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Exception: ${err.ErrorMessage}`]);
        }
      );
  }

  public hotkeys(event): void {
    if (event.keyCode === 27) {
      this.CloseBillPreviewPopUp();
    }
  }

}
