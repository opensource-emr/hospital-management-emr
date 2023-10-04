import { FormBuilder, FormGroup, Validators } from "@angular/forms";

export class PatientScheme {
  public PatientSchemeId: number = 0;
  public PatientId: number = 0;
  public PatientCode: string = null;
  public LatestPatientVisitId: number = 0;
  public SchemeId: number = 0;
  public PriceCategoryId: number = 0; //! Krishna, 16thMarch'23, We need to remove this later
  public PolicyNo: string = "";
  public OpCreditLimit: number = 0;
  public IpCreditLimit: number = 0;
  public PolicyHolderEmployerName: string = null;
  public PolicyHolderEmployerID: string = "";
  public PolicyHolderUID: string = "";
  public RegistrationCase: string = "Medical"; //! Krishna, 16thMarch'23, We need to remove this later
  public RegistrationSubCase: string = "non work related"; //! Krishna, 16thMarch'23, We need to remove this later
  public LatestClaimCode: number = 0;
  public OtherInfo: string = null;
  public IsActive: boolean = true;
  public GeneralCreditLimit: number = 0;
  public PatientSchemeValidator: FormGroup;
  public SubSchemeId: number = null;

  constructor() {
    var _formBuilder = new FormBuilder();
    this.PatientSchemeValidator = _formBuilder.group({
      'PolicyNo': ['', Validators.compose([Validators.required])]
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined) {
      return this.PatientSchemeValidator.dirty;
    }
    else {
      return this.PatientSchemeValidator.controls[fieldName].dirty;
    }

  }

  public IsValid(): boolean {
    if (this.PatientSchemeValidator.valid) {
      return true;
    } else { return false; }
  }
  public IsValidCheck(fieldName, validator): boolean {
    // this is used to check for patientVsPriceCategoryMap form is valid or not
    if (this.PatientSchemeValidator.valid) {
      return true;
    }

    if (fieldName == undefined) {
      return this.PatientSchemeValidator.valid;
    }
    else {

      return !(this.PatientSchemeValidator.hasError(validator, fieldName));
    }
  }


}
