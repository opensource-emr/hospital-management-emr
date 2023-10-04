import {FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import * as moment from 'moment/moment';

export class INCTV_TXN_PaymentInfoModel {
  public PaymentDate: string = '';
  public ReceiverId: number = 0;
  public TotalAmount: number = 0;
  public TDSAmount: number = 0;
  public NetPayAmount: number = 0;
  public AdjustedAmount: number = 0;
  public CreatedBy: number = 0;
  public IsPostedToAccounting: boolean = false;
  public AccountingPostedDate: string = '';
  
  public IsActive: boolean = true;
  public IsSelected: boolean = false;//only for client side.
  public PaymentInfoValidator: FormGroup = null;

  public FromDate: string = '';
  public ToDate: string = '';
  public EmployeeId: number = 0;
  
  constructor() {
    var _formBuilder = new FormBuilder();
    //this.PaymentInfoValidator = _formBuilder.group({
    //  'fromDate': ['', Validators.compose([Validators.required, this.dateValidatorsForPast])],
    //  'toDate': ['', Validators.compose([Validators.required, this.dateValidator])]
    //});
  }

  dateValidator(control: FormControl): { [key: string]: boolean } {
    var currDate = moment().format('YYYY-MM-DD HH:mm');
    if (control.value) { // gets empty string for invalid date such as 30th Feb or 31st Nov)
      if ((moment(control.value).diff(currDate) > 0)
        || (moment(currDate).diff(control.value, 'years') > 200)) //can select date upto 200 year past from today.
        return { 'wrongDate': true };
    }
    else
      return { 'wrongDate': true };
  }

  dateValidatorsForPast(control: FormControl): { [key: string]: boolean } {
    //get current date, month and time
    var currDate = moment().format('YYYY-MM-DD');
    if (control.value) {
      //if positive then selected date is of future else it of the past
      if ((moment(control.value).diff(currDate) > 0) ||
        (moment(control.value).diff(currDate, 'years') < -200)) // this will not allow the age diff more than 200 is past
        return { 'wrongDate': true };
    }
    else
      return { 'wrongDate': true };
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.PaymentInfoValidator.dirty;
    else
      return this.PaymentInfoValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean {
    if (this.PaymentInfoValidator.valid) { return true; }
    else { return false; }
  } public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined)
      return this.PaymentInfoValidator.valid;
    else
      return !(this.PaymentInfoValidator.hasError(validator, fieldName));
  }
}
