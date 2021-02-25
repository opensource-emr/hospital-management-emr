import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';
import * as moment from 'moment/moment';

export class GoodReceiptEvaluationReport {
  public FromDate: string = null;
  public ToDate: string = null;
  public TransactionType: string = "";
  public GoodReceiptNo: number = null;
  public GoodReceiptEvaluationValidator: FormGroup = null;

  constructor() {

    var _formBuilder = new FormBuilder();
    this.GoodReceiptEvaluationValidator = _formBuilder.group({
      'FromDate': ['', Validators.compose([Validators.required, this.dateValidatorsForPast])],
      'ToDate': ['', Validators.compose([Validators.required, this.dateValidator])],
    });
  }

  dateValidator(control: FormControl): { [key: string]: boolean } {
    var currDate = moment().format('YYYY-MM-DD HH:mm');
    if (control.value) {
      if ((moment(control.value).diff(currDate) > 0)
        || (moment(currDate).diff(control.value, 'years') > 200))
        return { 'wrongDate': true };
    } else {
      return { 'wrongDate': true };
    }
  }

  dateValidatorsForPast(control: FormControl): { [key: string]: boolean } {
    var currDate = moment().format('YYYY-MM-DD');
    if (control.value) {
      if ((moment(control.value).diff(currDate) > 0)
        || (moment(currDate).diff(control.value, 'years') < -200))
        return { 'wrongDate': true };
    } else {
      return { 'wrongDate': true };
    }
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined) {
      return this.GoodReceiptEvaluationValidator.dirty;
    }
    else {
      return this.GoodReceiptEvaluationValidator.controls[fieldName].dirty;
    }
  }

  public IsValid(): boolean { if (this.GoodReceiptEvaluationValidator.valid) { return true; } else { return false; } }
  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.GoodReceiptEvaluationValidator.valid;
    } else {
      return !(this.GoodReceiptEvaluationValidator.hasError(validator, fieldName));
    }
  }
}
