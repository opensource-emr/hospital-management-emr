import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'

export class ServiceDepartment {


  public ServiceDepartmentId: number = 0;
  public ServiceDepartmentName: string = null;
  public ServiceDepartmentShortName: string = null;
  public DepartmentId: number = null;
  public ParentServiceDepartmentId: number = null;

  public CreatedBy: number = null;
  public ModifiedBy: number = null;

  public CreatedOn: string = null;
  public ModifiedOn: string = null;
  public IntegrationName: string = null;
  public IsActive: boolean = true;
  public ServiceDepartmentValidator: FormGroup = null;

  //only for reading purpose
  public DepartmentName: string = null;
  constructor() {

    var _formBuilder = new FormBuilder();
    this.ServiceDepartmentValidator = _formBuilder.group({
      'DepartmentId': ['', Validators.compose([Validators.required])],
      'ServiceDepartmentName': ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
      'IntegrationName': ['', Validators.compose([Validators.required])],
      //'ServiceDepartmentShortName': ['', Validators.compose([])],
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.ServiceDepartmentValidator.dirty;
    else
      return this.ServiceDepartmentValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean { if (this.ServiceDepartmentValidator.valid) { return true; } else { return false; } }
  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.ServiceDepartmentValidator.valid;

    }

    else
      return !(this.ServiceDepartmentValidator.hasError(validator, fieldName));
  }

  //this is used to enable/disable form control.
  //disabled attribute didn't work in form-control so we need this.
  //set enabled=false/true from calling function for enabling/disabling a specific corm control.
  public EnableControl(formControlName: string, enabled: boolean) {
    let currCtrol = this.ServiceDepartmentValidator.controls[formControlName];
    if (currCtrol) {
      if (enabled) {
        currCtrol.enable();
      }
      else {
        currCtrol.disable();
      }
    }
  }

  public RemoveFormValidator() {
    this.ServiceDepartmentValidator = null;
  }

  //public static EnableControl2(formGrp: FormGroup, formControlName: string, enabled: boolean) {
  //  let currCtrol = formGrp.controls[formControlName];
  //  if (currCtrol) {
  //    if (enabled) {
  //      currCtrol.enable();
  //    }
  //    else {
  //      currCtrol.disable();
  //    }
  //  }
  //}

}
