import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';

export class PHRMSalesCategoryModel {
  public SalesCategoryId: number = 0;
  public Name: string = "";
  public Description: string = "";
  public CreatedOn: Date = new Date();
  public CreatedBy: number = 0;
  public IsBatchApplicable: boolean = true;
  public IsExpiryApplicable: boolean = true;
  public SalesCategoryValidator: FormGroup = null;

  constructor() {
    var _formBuilder = new FormBuilder();
    this.SalesCategoryValidator = _formBuilder.group({
      'Name': ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.SalesCategoryValidator.dirty;
    else
      return this.SalesCategoryValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean { if (this.SalesCategoryValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.SalesCategoryValidator.valid;
    }
    else
      return !(this.SalesCategoryValidator.hasError(validator, fieldName));
  }
}
