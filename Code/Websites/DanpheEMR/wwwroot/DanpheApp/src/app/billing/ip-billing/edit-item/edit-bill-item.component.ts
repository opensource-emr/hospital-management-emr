import { Component, Input, Output, EventEmitter, Renderer2 } from '@angular/core'
import { BillingTransactionItem } from '../../shared/billing-transaction-item.model';
import { BillingBLService } from '../../shared/billing.bl.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { CommonFunctions } from '../../../shared/common.functions';

@Component({
  selector: 'edit-bill-item',
  templateUrl: "./edit-bill-item.html"
})
export class EditBillItemComponent {

  @Input("itemToEdit")
  itemToEdit_Input: BillingTransactionItem = null;

  //Yubraj 29th July for DiscountApplicable 
  @Input("discountApplicable")
  public discountApplicable: boolean = null;

  public itemToEdit: BillingTransactionItem = null;

  @Input("EmpList")
  empList: Array<any> = [];

  @Input("DoctorsList")
  doctorList: Array<any> = null;

  @Output("on-closed")
  public onClose = new EventEmitter<object>();

  //sud: 11sept: This is kept for testing purpose, 
  globalListenFunc: Function;

  public docDDLSource: Array<any> = null;

  constructor(public renderer: Renderer2,
    public billingBlService: BillingBLService,
    public msgBoxService: MessageboxService) {

  }

  public ESCAPE_KEYCODE = 27;//to close the window on click of ESCape.

  ngOnInit() {
    if (this.itemToEdit_Input) {
      this.itemToEdit = Object.assign({}, this.itemToEdit_Input);
      if (this.doctorList) {
        this.docDDLSource = this.doctorList;
        this.selectedAssignedToDr = null;
        if (this.itemToEdit.ProviderId) {
          this.selectedAssignedToDr = { EmployeeId: null, FullName: null };
          this.selectedAssignedToDr["EmployeeId"] = this.itemToEdit.ProviderId;
          this.selectedAssignedToDr["FullName"] = this.itemToEdit.ProviderName;
        }
      }
    }

    this.globalListenFunc = this.renderer.listen('document', 'keydown', e => {
      if (e.keyCode == this.ESCAPE_KEYCODE) {
        this.onClose.emit({ CloseWindow: true, EventName: "close" });
      }
    });
    //console.log("from edit item component.");
    //console.log(this.docDDLSource);
  }

  ngOnDestroy() {
    // remove listener
    this.globalListenFunc();
  }

  CloseItemEdit($event) {
    this.onClose.emit({ CloseWindow: true, EventName: "close" });
  }


  SaveItem() {
    let valSummary = this.GetItemValidationSummary();

    if (valSummary.IsValid) {
      this.billingBlService.UpdateBillItem_PriceQtyDiscNDoctor(this.itemToEdit)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status == "OK") {
            this.onClose.emit({ CloseWindow: true, EventName: "update", updatedItem: res.Results });
          }
          else {
            this.msgBoxService.showMessage("error", [res.ErrorMessage]);
          }
        },
          err => {
            this.msgBoxService.showMessage("error", [err.ErrorMessage]);
          });
    }
    else {
      this.msgBoxService.showMessage("failed", valSummary.Messages);
    }
  }

  public cancelRemarks: string = null;

  CancelBillItem() {
    if (!this.cancelRemarks || this.cancelRemarks.trim() == '') {
      this.msgBoxService.showMessage("failed", ["Remarks is Compulsory for Cancellation"]);
    }
    else {
      this.itemToEdit.CancelRemarks = this.cancelRemarks;
      let sure = window.confirm("This item will be cancelled. Are you sure you want to continue ?");
      if (sure) {
        this.billingBlService.CancelMultipleTxnItems([this.itemToEdit])
          .subscribe((res: DanpheHTTPResponse) => {
            if (res.Status == "OK") {
              //alert("Item Cancelled Successfully.");
              this.onClose.emit({ CloseWindow: true, EventName: "cancelled" });
            }
          });
      }
    }
  }

  //for doctor's list binding.
  selectedAssignedToDr: any;

  AssignedToDocListFormatter(data: any): string {
    return data["FullName"];
  }

  AssignSelectedDoctor() {
    if (this.selectedAssignedToDr != null && typeof (this.selectedAssignedToDr) == 'object') {
      this.itemToEdit.ProviderId = this.selectedAssignedToDr.EmployeeId;
      this.itemToEdit.ProviderName = this.selectedAssignedToDr.FullName;
    }
    else {
      this.itemToEdit.ProviderId = null;
      this.itemToEdit.ProviderName = null;
    }
    //console.log(this.selectedAssignedToDr);
  }

  OnPriceChanged() {
    this.itemToEdit.SubTotal = CommonFunctions.parseAmount(this.itemToEdit.Quantity * this.itemToEdit.Price);
    this.itemToEdit.DiscountAmount = CommonFunctions.parseAmount(this.itemToEdit.SubTotal * (this.itemToEdit.DiscountPercent / 100));
    this.itemToEdit.TotalAmount = CommonFunctions.parseAmount(this.itemToEdit.SubTotal - this.itemToEdit.DiscountAmount);
    this.CalculateTaxableNonTaxableAmt();
  }

  OnQtyChanged() {
    this.itemToEdit.SubTotal = CommonFunctions.parseAmount(this.itemToEdit.Quantity * this.itemToEdit.Price);
    this.itemToEdit.TotalAmount = CommonFunctions.parseAmount(this.itemToEdit.SubTotal - this.itemToEdit.DiscountAmount);
    this.CalculateTaxableNonTaxableAmt();
    this.OnDiscPercentChanged();
  }
  OnDiscPercentChanged() {
    this.itemToEdit.DiscountPercentAgg = this.itemToEdit.DiscountPercent;
    this.itemToEdit.DiscountAmount = CommonFunctions.parseAmount(this.itemToEdit.SubTotal * (this.itemToEdit.DiscountPercent / 100));
    this.itemToEdit.TotalAmount = CommonFunctions.parseAmount(this.itemToEdit.SubTotal - this.itemToEdit.DiscountAmount);
    this.CalculateTaxableNonTaxableAmt();
  }

  CalculateTaxableNonTaxableAmt() {
    let taxableAmt = this.itemToEdit.IsTaxApplicable ? (this.itemToEdit.SubTotal - this.itemToEdit.DiscountAmount) : 0;//added: sud: 29May'18
    let nonTaxableAmt = this.itemToEdit.IsTaxApplicable ? 0 : (this.itemToEdit.SubTotal - this.itemToEdit.DiscountAmount);//added: sud: 29May'18
    this.itemToEdit.TaxableAmount = CommonFunctions.parseAmount(taxableAmt);
    this.itemToEdit.NonTaxableAmount = CommonFunctions.parseAmount(nonTaxableAmt);
  }

  // public validationSummary = { IsValid: true, ValidationMessages: [] };

  GetItemValidationSummary() {
    //Create new validation summary everytime
    let valSummary = { IsValid: true, Messages: [] };

    //for price.
    if (this.itemToEdit.Price) {
      if (this.itemToEdit.Price <= 0) {
        valSummary.IsValid = false;
        valSummary.Messages.push("Price cannot be empty.");
      }
    }
    else {
      valSummary.IsValid = false;
      valSummary.Messages.push("Price cannot be zero or negative");
    }
    //for quantity
    if (this.itemToEdit.Quantity) {
      if (this.itemToEdit.Quantity <= 0) {
        valSummary.IsValid = false;
        valSummary.Messages.push("Quantity cannot be zero or negative.");
      }
    }
    else {
      valSummary.IsValid = false;
      valSummary.Messages.push("Quantity cannot be empty");
    }

    //for discountpercent
    if (this.itemToEdit.DiscountPercent && this.itemToEdit.DiscountPercent < 0) {
      valSummary.IsValid = false;
      valSummary.Messages.push("Discount percent can't be negative.");
    }
    //else {
    //    this.itemToEdit.DiscountPercent = 0;
    //    this.itemToEdit.DiscountAmount = 0;
    //}

    return valSummary;
  }

}
