import { FormBuilder, FormGroup, Validators } from "@angular/forms";

export class ExternalReferralModel {

  public ExternalReferrerId: number = 0;
  public ReferrerName: string = null;
  public ContactAddress: string = null;
  public ContactNumber: number = null;
  public EmailAddress: string = null;

  public TDSPercent: number = 0; //pratik:15April'2020
  public PANNumber: string = null;//pratik:15April'2020
  public NMCNumber: string = null;
  public IsIncentiveApplicable: boolean = false;//pratik:15April'2020

  public IsActive: boolean = true;

  public CreatedBy: number = null;
  public ModifiedBy: number = null;

  public CreatedOn: string = null;
  public ModifiedOn: string = null;

  public ExternalRefValidator: FormGroup = null;


  constructor() {
    var _formBuilder = new FormBuilder();
    this.ExternalRefValidator = _formBuilder.group({
      'ReferrerName': ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
      //'ContactNumber': ['', Validators.compose([Validators.required, Validators.pattern('^[0-9]{1,10}$'), Validators.maxLength(15)])],
      'ContactNumber': ['', Validators.compose([Validators.pattern('^[a-zA-Z0-9_@./#)(&+-]+$')])],
      'EmailAddress': ['', Validators.compose([Validators.pattern('^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}$')])],
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined) {
      return this.ExternalRefValidator.dirty;
    }

    else
      return this.ExternalRefValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean {
    if (this.ExternalRefValidator.valid) {
      return true;
    }
    else {
      return false;
    }
  }

  public IsValidCheck(fieldName, validator): boolean {

    if (fieldName == undefined) {
      return this.ExternalRefValidator.valid;
    }
    else {
      return !(this.ExternalRefValidator.hasError(validator, fieldName));
    }

  }
}
