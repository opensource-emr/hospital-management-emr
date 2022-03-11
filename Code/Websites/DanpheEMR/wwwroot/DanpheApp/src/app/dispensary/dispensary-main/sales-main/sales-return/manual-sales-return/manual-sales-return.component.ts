import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { PharmacyCounter } from '../../../../../pharmacy/shared/pharmacy-counter.model';
import { PharmacyReceiptModel } from '../../../../../pharmacy/shared/pharmacy-receipt.model';
import { PharmacyBLService } from '../../../../../pharmacy/shared/pharmacy.bl.service';
import { PHRMInvoiceReturnItemsModel } from '../../../../../pharmacy/shared/phrm-invoice-return-items.model';
import { PHRMInvoiceReturnModel } from '../../../../../pharmacy/shared/phrm-invoice-return.model ';
import { PHRMStoreModel } from '../../../../../pharmacy/shared/phrm-store.model';
import { SecurityService } from '../../../../../security/shared/security.service';
import { MessageboxService } from '../../../../../shared/messagebox/messagebox.service';
import { DispensaryService } from '../../../../shared/dispensary.service';

@Component({
  selector: 'app-manual-sales-return',
  templateUrl: './manual-sales-return.component.html',
  styleUrls: ['./manual-sales-return.component.css'],
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class ManualSalesReturnComponent implements OnInit {
  salesReturn: PHRMInvoiceReturnModel = new PHRMInvoiceReturnModel();
  currentCounter: PharmacyCounter;
  currentActiveDispensary: PHRMStoreModel;
  searchedPatient: any;
  itemList: any[] = [];
  isDataLoaded: boolean = false;
  isRequestLoading: boolean = false;
  showReturnReceipt: boolean = false;
  pharmacyReceipt: PharmacyReceiptModel = new PharmacyReceiptModel();
  @Output('call-back-close') callBackClose: EventEmitter<any> = new EventEmitter();
  isCurrentDispensaryInsurance: boolean;
  constructor(private _dispensaryService: DispensaryService, public pharmacyBLService: PharmacyBLService, private _securityService: SecurityService, private _msgBox: MessageboxService) {
    this.getItemList();
    this.currentCounter = this._securityService.getPHRMLoggedInCounter();
    this.currentActiveDispensary = this._dispensaryService.activeDispensary;
    this.isCurrentDispensaryInsurance = this._dispensaryService.isInsuranceDispensarySelected;
    this.salesReturn.IsManualReturn = true;
    this.salesReturn.InvoiceId = null;
    this.salesReturn.CounterId = this.currentCounter.CounterId;
    this.salesReturn.StoreId = this.currentActiveDispensary.StoreId;
    this.salesReturn.PaymentMode = this.isCurrentDispensaryInsurance ? 'credit' : 'cash';
    this.salesReturn.InvoiceReturnValidator.addControl('Patient', new FormControl('', [Validators.required, this.registeredPatientValdiator]));
    this.salesReturn.InvoiceReturnValidator.addControl('ReferenceInvoiceNo', new FormControl('', Validators.required));
    this.salesReturn.InvoiceReturnValidator.get('Remark').setValidators([Validators.required, Validators.minLength(5), this.noTextRemarksValidator])
    this.addRow();
  }

  ngOnInit() {
  }
  // Prequisities
  getItemList() {
    this.pharmacyBLService.getItemListForManualReturn().subscribe(res => {
      if (res.Status == "OK") {
        this.itemList = res.Results;
        this.isDataLoaded = true;
        this.setFocusById('SearchPatientBox', 100);

      }
      else {
        this._msgBox.showMessage("Failed", ["Failed to load item lists."]);
      }
    });
  }
  public AllPatientSearchAsync = (keyword: any): Observable<any[]> => {

    return this.pharmacyBLService.GetPatients(keyword, this.isCurrentDispensaryInsurance);

  }
  // Form Action Functions
  deleteRow(index: number) {
    this.salesReturn.InvoiceReturnItems.splice(index, 1);
    if (this.salesReturn.InvoiceReturnItems.length == 0) {
      this.addRow();
      this.setFocusById('drugName' + 0);
    }
  }
  public addRow() {
    let newRow = new PHRMInvoiceReturnItemsModel();
    newRow.InvoiceId = null;
    newRow.InvoiceItemId = null;
    newRow.CounterId = this.currentCounter.CounterId;
    newRow.StoreId = this.currentActiveDispensary.StoreId;
    newRow.VATPercentage = 0;
    newRow.DiscountPercentage = 0;
    newRow.DiscountAmount = 0;
    newRow.Price = 0;
    newRow.InvoiceItemsReturnValidator.removeControl('Quantity');
    newRow.InvoiceItemsReturnValidator.addControl('DrugName', new FormControl('', [Validators.required, this.registeredDrugValidator]));
    newRow.InvoiceItemsReturnValidator.addControl('BatchNo', new FormControl('', [Validators.required,]));
    newRow.InvoiceItemsReturnValidator.addControl('MRP', new FormControl('', [Validators.required, Validators.min(0.1)]));
    newRow.InvoiceItemsReturnValidator.get('ReturnedQty').setValidators([Validators.required, Validators.min(1)]);
    this.salesReturn.InvoiceReturnItems.push(newRow);
  }
  setFocusById(id: string, focusDelayInMs: number = 0) {
    var Timer = setTimeout(() => {
      if (document.getElementById(id)) {
        let nextEl = <HTMLInputElement>document.getElementById(id);
        nextEl.focus();
        clearTimeout(Timer);
      }
    }, focusDelayInMs)
  }

  // Event Listeners
  onPatientChanged() {
    if (this.searchedPatient == null) return;
    if (typeof (this.searchedPatient) == "string") {
      // this.searchedPatient = this.patien.find(a => a.ItemName == this.searchedPatient);
    }
    if (typeof (this.searchedPatient) == "object") {
      this.salesReturn.PatientId = this.searchedPatient.PatientId;
      this.salesReturn.PatientName = this.searchedPatient.PatientName;
      if (this.isCurrentDispensaryInsurance) {
        this.salesReturn.ClaimCode = this.searchedPatient.ClaimCode;
      }
    }
  }
  onDrugNameChanged(index: number) {
    let selectedItemRow = this.salesReturn.InvoiceReturnItems[index];
    if (selectedItemRow.drugReturnItemObj != null && selectedItemRow.ItemId == selectedItemRow.drugReturnItemObj.ItemId) return;
    selectedItemRow.availableBatches = [];
    if (selectedItemRow.drugReturnItemObj == null) return;
    if (typeof (selectedItemRow.drugReturnItemObj) == "string") {
      selectedItemRow.drugReturnItemObj = this.itemList.find(a => a.ItemName == selectedItemRow.drugReturnItemObj);
    }
    if (typeof (selectedItemRow.drugReturnItemObj) == "object") {
      selectedItemRow.ItemId = selectedItemRow.drugReturnItemObj.ItemId;
      selectedItemRow.ItemName = selectedItemRow.drugReturnItemObj.ItemName;
      this.pharmacyBLService.getAvailableBatchesByItemId(selectedItemRow.ItemId).subscribe(res => {
        if (res.Status == "OK") {
          selectedItemRow.availableBatches = res.Results;
          this.selectAvailableBatches(index);
        }
        else {
          this._msgBox.showMessage("Notice-Message", ["No Batches Available for this item."]);
          this.allowAddNewBatch(index);
        }
      })
    }
    else {
      selectedItemRow.availableBatches = [];
      selectedItemRow.BatchNo = '';
      selectedItemRow.selectedBatch = null;
    }
  }
  onBatchNoClicked(index: number) {
    let selectedItemRow = this.salesReturn.InvoiceReturnItems[index];
    if (selectedItemRow.selectedBatch.BatchNo == null) {
      this.allowAddNewBatch(index);
      this.setFocusById('batch' + index, 100);
    }
    else {
      selectedItemRow.BatchNo = selectedItemRow.selectedBatch.BatchNo;
      selectedItemRow.ExpiryDate = moment(selectedItemRow.selectedBatch.ExpiryDate).format('YYYY-MM-DD');
      selectedItemRow.MRP = selectedItemRow.selectedBatch.MRP;
      this.setFocusById('returnQty' + index);
    }
  }
  allowAddNewBatch(index: number) {
    // reset the selected batch if any
    let selectedItemRow = this.salesReturn.InvoiceReturnItems[index];
    selectedItemRow.BatchNo = '';
    selectedItemRow.ExpiryDate = moment().add(5, 'years').format('YYYY-MM-DD');
    selectedItemRow.MRP = 0;
    selectedItemRow.allowNewBatch = true;
  }
  selectAvailableBatches(index: number) {
    // reset the selected batch if any
    let selectedItemRow = this.salesReturn.InvoiceReturnItems[index];
    selectedItemRow.BatchNo = '';
    selectedItemRow.ExpiryDate = moment().format('YYYY-MM-DD');
    selectedItemRow.MRP = 0;
    selectedItemRow.selectedBatch = null;
    selectedItemRow.allowNewBatch = false;
  }
  onChangeInMRPOrQty(index: number) {
    let selectedItemRow = this.salesReturn.InvoiceReturnItems[index];
    selectedItemRow.Quantity = selectedItemRow.ReturnedQty;
    selectedItemRow.SubTotal = selectedItemRow.ReturnedQty * selectedItemRow.MRP;
    selectedItemRow.TotalAmount = selectedItemRow.SubTotal;
    this.calculation()
  }
  onPressedEnterKeyInDrugName(index: number) {
    let selectedItemRow = this.salesReturn.InvoiceReturnItems[index];
    if (selectedItemRow.InvoiceItemsReturnValidator.get("DrugName").valid) {
      this.setFocusById('batch' + index);
    }
    else {
      if (this.salesReturn.InvoiceReturnItems.length == 1 || (index < this.salesReturn.InvoiceReturnItems.length - 1)) {
        this.setFocusById('drugName' + index);
      }
      else {
        this.salesReturn.InvoiceReturnItems.pop();
        this.setFocusById('remarksBox');
      }
    }
  }
  onPressedEnterKeyInMRPField(index: number) {
    if (index < this.salesReturn.InvoiceReturnItems.length - 1) {
      this.setFocusById('drugName' + (index + 1));
    }
    else if (this.salesReturn.InvoiceReturnItems.every(a => a.InvoiceItemsReturnValidator.valid)) {
      this.addRow();
      this.setFocusById('drugName' + (index + 1), 100);
    }
    else {
      this._msgBox.showMessage('Notice-Message', ['Some of the values are not valid.']);
      this.setFocusById('mrp' + index);
    }
  }
  // Calculation Functions
  calculation() {
    let totalAmount = this.salesReturn.InvoiceReturnItems.reduce((sum, current) => sum + current.TotalAmount, 0);
    this.salesReturn.SubTotal = totalAmount;
    this.salesReturn.TotalAmount = totalAmount;
    this.salesReturn.Tender = totalAmount;
    this.salesReturn.PaidAmount = totalAmount;
  }
  // Post Return
  postManualReturn() {
    this.salesReturn.InvoiceReturnValidator.updateValueAndValidity();
    this.salesReturn.InvoiceReturnItems.forEach(item => item.InvoiceItemsReturnValidator.updateValueAndValidity())
    let formValidity = this.salesReturn.InvoiceReturnValidator.valid && (this.salesReturn.InvoiceReturnItems.every(a => a.InvoiceItemsReturnValidator.valid));
    if (formValidity) {
      this.isRequestLoading = true;
      this.pharmacyBLService.postManualReturn(this.salesReturn).finally(() => this.isRequestLoading = false).subscribe(res => {
        if (res.Status == "OK") {
          this._msgBox.showMessage("Success", ["Returned Successfully."]);
          this.showReceipt(res.Results);
        }
        else {
          this._msgBox.showMessage("Failed", ["Could not perform your request."]);
        }
      });
    }
    else {
      let errorMessages: string[] = ['Could not perform your request.'];
      for (var x in this.salesReturn.InvoiceReturnValidator.controls) {
        this.salesReturn.InvoiceReturnValidator.controls[x].markAsTouched();
        this.salesReturn.InvoiceReturnValidator.controls[x].updateValueAndValidity();
        if (this.salesReturn.InvoiceReturnValidator.controls[x].invalid) {
          errorMessages.push(`${x} is invalid.`);
        }
      }
      for (var i = 0; i < this.salesReturn.InvoiceReturnItems.length; i++) {
        for (var x in this.salesReturn.InvoiceReturnItems[i].InvoiceItemsReturnValidator.controls) {
          this.salesReturn.InvoiceReturnItems[i].InvoiceItemsReturnValidator.controls[x].markAsTouched();
          this.salesReturn.InvoiceReturnItems[i].InvoiceItemsReturnValidator.controls[x].updateValueAndValidity();
          if (this.salesReturn.InvoiceReturnItems[i].InvoiceItemsReturnValidator.controls[x].invalid) {
            errorMessages.push(`${x} is invalid for item no. ${i + 1}.`);
          }
        }
      }
      this._msgBox.showMessage("Failed", errorMessages);
    }
  }
  // Print Receipt Functions
  showReceipt(invoiceDataFromServer) {
    this.pharmacyReceipt.Patient.ShortName = this.searchedPatient.ShortName;
    this.pharmacyReceipt.Patient.PatientCode = this.searchedPatient.PatientCode;
    this.pharmacyReceipt.Patient.Address = this.searchedPatient.Address;
    this.pharmacyReceipt.Patient.DateOfBirth = this.searchedPatient.DateOfBirth;
    this.pharmacyReceipt.Patient.Gender = this.searchedPatient.Gender;
    this.pharmacyReceipt.Patient.PhoneNumber = this.searchedPatient.PhoneNumber;
    this.pharmacyReceipt.Patient.PANNumber = this.searchedPatient.PANNumber;
    this.pharmacyReceipt.Patient.PatientId = this.searchedPatient.PatientId;
    this.pharmacyReceipt.TotalAmount = invoiceDataFromServer.TotalAmount;
    this.pharmacyReceipt.PaymentMode = invoiceDataFromServer.PaymentMode;

    this.pharmacyReceipt.ReceiptDate = invoiceDataFromServer.ReferenceInvoiceDate;
    this.pharmacyReceipt.BillingUser = this._securityService.GetLoggedInUser().UserName;
    this.pharmacyReceipt.Tender = invoiceDataFromServer.Tender;
    this.pharmacyReceipt.Change = invoiceDataFromServer.Change;
    this.pharmacyReceipt.DiscountAmount = invoiceDataFromServer.DiscountAmount;
    this.pharmacyReceipt.SubTotal = invoiceDataFromServer.SubTotal;
    this.pharmacyReceipt.CurrentFinYear = '';
    this.pharmacyReceipt.ReceiptPrintNo = invoiceDataFromServer.CreditNoteId;
    this.pharmacyReceipt.Remarks = invoiceDataFromServer.Remarks;
    this.pharmacyReceipt.IsReturned = true;
    this.pharmacyReceipt.ReceiptDate = invoiceDataFromServer.CreatedOn;
    this.pharmacyReceipt.CRNNo = invoiceDataFromServer.CreditNoteId;
    this.pharmacyReceipt.InvoiceItems = invoiceDataFromServer.InvoiceReturnItems;
    this.pharmacyReceipt.InvoiceItems = this.pharmacyReceipt.InvoiceItems.filter(a => a.ReturnedQty > 0);
    this.pharmacyReceipt.ClaimCode = invoiceDataFromServer.ClaimCode;
    this.pharmacyReceipt.Patient.NSHINumber = invoiceDataFromServer.NSHINo;
    this.pharmacyReceipt.PrintCount = 0;
    this.showReturnReceipt = true;
  }
  closeReceipt() {
    this.showReturnReceipt = false;
    this.callBackClose.emit();
  }
  // Autocomplete List Formatters
  phrmItemListFormatter(data: any): string {
    //if (data[])
    let html = "";
    if (data["ItemId"]) {
      html = `${data["GenericName"]} | <font color='blue'; size=03 >${data["ItemName"]}</font>"`;
    }
    else {
      html = data["ItemName"];
    }
    return html;
  }
  patientListFormatter(data: any): string {
    let html = `${data["ShortName"]} [ ${data['PatientCode']} ]`;
    return html;
  }
  insPatientListFormatter(data: any): string {
    let html = `[${data['PatientCode']}] | ${data["ShortName"]} | NSHI [ ${data['NSHINumber']}]`;
    return html;
  }

  // Custom Validators
  registeredPatientValdiator(control: FormControl): { [key: string]: boolean } {
    if (typeof (control.value) == "object" && (control.value.PatientId > 0 || control.value.PatientId == -1))
      return;
    else {
      return { 'notRegisteredPatient': true };
    }
  }
  registeredDrugValidator(control: FormControl): { [key: string]: boolean } {
    if (typeof (control.value) == "object" && control.value.ItemId > 0)
      return;
    else
      return { 'notRegisteredDrug': true };
  }
  noTextRemarksValidator(control: FormControl): { [key: string]: boolean } {
    if (control.value.trim() != "")
      return;
    else
      return { 'noText': true };
  }
  // Keyboard Shortcuts
  public hotkeys(event) {
    //For ESC key => close the pop up
    if (event.keyCode == 27) {
      if (this.showReturnReceipt)
        this.closeReceipt();
    }
    if (event.altKey) {
      switch (event.keyCode) {
        case 80: {// => ALT+P comes here
          this.postManualReturn();
          break;
        }
        default:
          break;
      }
    }
  }
}
