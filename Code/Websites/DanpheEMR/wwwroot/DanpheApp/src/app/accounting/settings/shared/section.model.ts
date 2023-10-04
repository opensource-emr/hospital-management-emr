import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'

export class SectionModel {

  public SectionId: number = null;
  public SectionName: string = null;
  public SectionCode: string = null;
  public SectionValidator: FormGroup = null;
  public IsDefault: boolean = false;
  public IsActive: boolean = true;

  constructor() {

    var _formBuilder = new FormBuilder();
    this.SectionValidator = _formBuilder.group({
      // 'SectionCode': ['', Validators.compose([ Validators.required])],
      'SectionName': ['', Validators.compose([Validators.required])],
      'SectionId': ['', Validators.compose([Validators.required])],
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.SectionValidator.dirty;
    else
      return this.SectionValidator.controls[fieldName].dirty;
  }
  public IsValid(): boolean { if (this.SectionValidator.valid) { return true; } else { return false; } }
  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.SectionValidator.valid;
      //if (this.IsValidTime())
      ////return this.EmployeeValidator.valid;
      //  return this.EmployeeValidator.valid;
      //else
      //   return false;
    }

    else
      return !(this.SectionValidator.hasError(validator, fieldName));
  }


}
