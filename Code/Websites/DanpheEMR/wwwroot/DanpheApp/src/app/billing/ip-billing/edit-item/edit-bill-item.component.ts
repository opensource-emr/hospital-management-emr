import { Component, Input, Output, EventEmitter, Renderer2 } from '@angular/core'
import { BillingTransactionItem } from '../../shared/billing-transaction-item.model';
import { BillingBLService } from '../../shared/billing.bl.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { CommonFunctions } from '../../../shared/common.functions';
import { CoreService } from '../../../core/shared/core.service';
import { Patient } from '../../../patients/shared/patient.model';
import { BillingService } from '../../shared/billing.service';

@Component({
  selector: 'edit-bill-item',
  templateUrl: "./edit-bill-item.html",
  host: { '(window:keydown)': 'hotkeys($event)' }
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

  public showCancelPrintPopup: boolean = false;
  //sud: 11sept: This is kept for testing purpose, 
  globalListenFunc: Function;

  public requestedByDr: any = null;

  public docDDLSource: Array<any> = null;

  @Input("current-pat-info")
  selPatInfo: Patient = null;//sud:12Apr'20--To show Patient Information in Header.

  public itemList: Array<any> = [];


  constructor(public renderer: Renderer2,
    public billingBlService: BillingBLService,
    public coreService: CoreService,
    public billingService: BillingService,
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

        if (this.itemToEdit.RequestedBy) {
          let req = this.doctorList.find(e => e.EmployeeId == this.itemToEdit.RequestedBy);
          this.requestedByDr = { EmployeeId: null, FullName: null };
          if (req) {
            console.log(req);
            this.requestedByDr["EmployeeId"] = req.EmployeeId;
            this.requestedByDr["FullName"] = req.FullName;
          }
        }
      }
      this.itemList = this.billingService.allBillItemsPriceList;
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

  CloseCancelPrintPopup() {
    this.showCancelPrintPopup = false;
    this.onClose.emit({ CloseWindow: true, EventName: "cancelled" });
  }

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

              this.showCancelPrintPopup = true;
              //alert("Item Cancelled Successfully.");
              //this.onClose.emit({ CloseWindow: true, EventName: "cancelled" });
            }
          });
      }
    }
  }

  Print() {
    try {
      let popupWinindow;
      var printContents = document.getElementById("printpage").innerHTML;
      popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
      popupWinindow.document.open();

      let documentContent = "<html><head>";
      documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../themes/theme-default/DanphePrintStyle.css"/>';
      documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
      documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
      documentContent += '</head>';
      documentContent += '<body onload="window.print()">' + printContents + '</body></html>'

      popupWinindow.document.write(documentContent);
      popupWinindow.document.close();
    } catch (ex) {
      console.log(ex);
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


  AssignSelectedRequestedDoctor() {
    if (this.requestedByDr != null && typeof (this.requestedByDr) == 'object') {
      this.itemToEdit.RequestedBy = this.requestedByDr.EmployeeId;
      this.itemToEdit.RequestedByName = this.requestedByDr.FullName;
    }
    else {
      this.itemToEdit.RequestedBy = null;
      this.itemToEdit.RequestedBy = null;
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
    // if (this.itemToEdit.Price != null) {
    //   if (this.itemToEdit.Price < 0) {
    //     valSummary.IsValid = false;
    //     valSummary.Messages.push("Price cannot be negative.");
    //   }
    //   else if (!this.itemToEdit.IsZeroPriceAllowed && this.itemToEdit.Price == 0) {
    //     valSummary.IsValid = false;
    //     valSummary.Messages.push("Price cannot be zero(0).");
    //   }
    // }
    // else {
    //   valSummary.IsValid = false;
    //   valSummary.Messages.push("Price cannot be empty");
    // }
    if (this.itemToEdit.Price == null) {
      valSummary.IsValid = false;
      valSummary.Messages.push("Price cannot be empty.");
    }
    var item = this.itemList.find(a => a.ItemId == this.itemToEdit.ItemId && a.ServiceDepartmentId == this.itemToEdit.ServiceDepartmentId);
    if ((item && !item.IsZeroPriceAllowed) && this.itemToEdit.Price <= 0) {
      valSummary.IsValid = false;
      valSummary.Messages.push("Price cannot zero or negative.");
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

    if (this.itemToEdit.IsDoctorMandatory && !this.itemToEdit.ProviderId) {
      valSummary.IsValid = false;
      valSummary.Messages.push("Assign To Doctor is Mandatory");
    }

    // if (!this.itemToEdit.RequestedBy) {
    //   valSummary.IsValid = false;
    //   valSummary.Messages.push("Referred By Doctor is Mandatory");
    // }

    return valSummary;
  }
  public hotkeys(event) {
    if (event.keyCode == 27) {//key->ESC
      this.CloseItemEdit(event);
    }
  }
}
