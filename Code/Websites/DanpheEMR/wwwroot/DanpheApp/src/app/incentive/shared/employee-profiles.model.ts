import { FormGroup, FormBuilder, Validators } from '@angular/forms';


export class EmployeeProfilesModel {

  EmployeeId: number = null;
  EmployeeName: string = '';
  //Profiles: Array<EmployeeProfileMapModel> = new Array<EmployeeProfileMapModel>();

  EMPProfilesValidator: FormGroup = null;

  constructor() {
    const _fb = new FormBuilder();
    this.EMPProfilesValidator = _fb.group({
      'EmployeeId': ['', Validators.required],
      'Profiles': [null, Validators.length > 0]
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined) {
      return this.EMPProfilesValidator.dirty;
    }
    else {
      return this.EMPProfilesValidator.controls[fieldName].dirty;
    }
  }
  public IsValid(): boolean { if (this.EMPProfilesValidator.valid) { return true; } else { return false; } }
  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.EMPProfilesValidator.valid;
    }
    else {
      return !(this.EMPProfilesValidator.hasError(validator, fieldName));
    }
  }

}
