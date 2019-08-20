import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';
export class PHRMDispensaryModel {
  public DispensaryId: number = 0;
  public Name: string = "";
  public Address: string = "";
  public ContactNo: string = "";
  public Email: string = "";
  public DispensaryLabel: string = "";
  public DispensaryDescription: string = "";
  public CreatedBy: number = 0;
  public CreatedOn: Date = new Date();
  public IsActive: boolean = false;

  public DispensaryValidator: FormGroup = null;

  constructor() {
    var _formBuilder = new FormBuilder();
    this.DispensaryValidator = _formBuilder.group({
      'Name': ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
      'ContactNo': ['', Validators.compose([Validators.required, Validators.pattern('^[0-9]{10}$')])],
      'Email': ['', Validators.pattern('^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}$')]
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.DispensaryValidator.dirty;
    else
      return this.DispensaryValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean { if (this.DispensaryValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.DispensaryValidator.valid;
    }
    else
      return !(this.DispensaryValidator.hasError(validator, fieldName));
  }
}
