import {
  FormBuilder, FormGroup, Validators
} from '@angular/forms';
import * as moment from 'moment';
export class CreditOrganization {
  public OrganizationId: number = 0;
  public OrganizationName: string = "";
  public IsActive: boolean = false;
  public CreatedOn: string = "";
  public CreatedBy: number = null;
  public ModifiedOn: string = "";
  public ModifiedBy: number = null;
  public IsDefault: boolean = false;
  public IsClaimManagementApplicable: boolean = false;
  public IsClaimCodeCompulsory: boolean = false;
  public IsClaimCodeAutoGenerate: boolean = false;
  public DisplayName: string = "";
  public CreditOrganizationCode: string = "";
  public CreditOrganizationValidator: FormGroup = null;


  constructor() {
    this.CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");

    const _formBuilder = new FormBuilder();
    this.CreditOrganizationValidator = _formBuilder.group({
      'OrganizationName': ['', Validators.compose([Validators.required])],
      'CreditOrganizationCode': ['', Validators.compose([Validators.required])],
      'DisplayName': ['', Validators.compose([Validators.required])],
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.CreditOrganizationValidator.dirty;
    else
      return this.CreditOrganizationValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean { if (this.CreditOrganizationValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.CreditOrganizationValidator.valid;
    }

    else
      return !(this.CreditOrganizationValidator.hasError(validator, fieldName));
  }

}





