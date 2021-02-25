import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { ProfileItemMapModel } from './profile-item-map.model';

export class ProfileItemsModel {

  ProfileId: number = null;
  ProfileName: string = '';
  PriceCategoryId: number = null;
  PriceCategoryName: string = '';
  Items: Array<ProfileItemMapModel> = new Array<ProfileItemMapModel>();

  // display properties
  GroupAssignedToPercent: number = null;
  GroupReferredByPercent: number = null;

  ProfileItemsValidator: FormGroup = null;

  constructor() {
    //const _fb = new FormBuilder();
    //this.ProfileItemsValidator = _fb.group({
    //  'Items': [null, Validators.length > 0],
    //  'GroupAssignedToPercent': ['', Validators.required],
    //  'GroupReferredByPercent': ['', Validators.required]
    //});
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined) {
      return this.ProfileItemsValidator.dirty;
    }
    else {
      return this.ProfileItemsValidator.controls[fieldName].dirty;
    }
  }
  public IsValid(): boolean { if (this.ProfileItemsValidator.valid) { return true; } else { return false; } }
  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.ProfileItemsValidator.valid;
    }
    else {
      return !(this.ProfileItemsValidator.hasError(validator, fieldName));
    }
  }


  //to dynamically enable/disable any form-control. 
  //here [disabled] attribute was not working from cshtml, so written a separate logic to do it.
  public EnableControl(formControlName: string, enabled: boolean) {

    let currCtrol = this.ProfileItemsValidator.controls[formControlName];
    if (currCtrol) {
      if (enabled) {
        currCtrol.enable();
      }
      else {
        currCtrol.disable();
      }
    }
  }
}
