import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';
import * as moment from 'moment/moment';

export class CancelledPOandGRReport {
  public FromDate: string = null;
  public ToDate: string = null;
  public isGR: string = 'true';
  public CancelledPOGRValidator: FormGroup = null;

  constructor() {

    var _formBuilder = new FormBuilder();
    this.CancelledPOGRValidator = _formBuilder.group({
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
      return this.CancelledPOGRValidator.dirty;
    }
    else {
      return this.CancelledPOGRValidator.controls[fieldName].dirty;
    }
  }

  public IsValid(): boolean { if (this.CancelledPOGRValidator.valid) { return true; } else { return false; } }
  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.CancelledPOGRValidator.valid;
    } else {
      return !(this.CancelledPOGRValidator.hasError(validator, fieldName));
    }
  }
}
