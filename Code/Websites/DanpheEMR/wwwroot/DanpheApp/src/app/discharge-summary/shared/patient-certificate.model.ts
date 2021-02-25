import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'


export class PatientCertificate {
  public CertificateId: number = 0;
  public FiscalYearName: string = null;
  public CreatedOn: string = null;
  public CreatedBy: number = 0;
  public CertificateNumber: string = null;
  public DischargeSummaryId: number = 0;
  public CertificateType: string = null;
  public CertifiedBySignatories: string = null;
  public IssuedBySignatories: string = null;
  public BirthType: string = null;
  public BabyBirthDetailsId: number = 0;
  public DeathDate: string = null;
  public DeathTime: string = null;
  public DeathCause: string = null;
  public Spouse: string = null;
  public FatherName: string = null;
  public MotherName: string = null;

  public PatientCertificateValidator: FormGroup = null;
  constructor() {

    // var _formBuilder = new FormBuilder();
    // this.PatientCertificateValidator = _formBuilder.group({
    //     'IssuedBySignatories': ['', Validators.compose([Validators.required])],
    //     'CertifiedBySignatories': ['', Validators.compose([Validators.required])],
    //     'MotherName': ['', Validators.compose([])],
    //     'DeathTime': ['', Validators.compose([])],
    //     'DeathDate': ['', Validators.compose([])],
    //     'DeathCause': ['', Validators.compose([])],
    //     'FatherName': ['', Validators.compose([])],

    // });
  }
  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.PatientCertificateValidator.dirty;
    else
      return this.PatientCertificateValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean { if (this.PatientCertificateValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined)
      return this.PatientCertificateValidator.valid;
    else
      return !(this.PatientCertificateValidator.hasError(validator, fieldName));
  }

  //Dynamically add validator
  public UpdateValidator(onOff: string, formControlName: string, validatorType: string) {
    let validator = null;
    if (validatorType == 'required' && onOff == "on") {
      validator = Validators.compose([Validators.required]);
    }
    else {
      validator = Validators.compose([]);
    }
    this.PatientCertificateValidator.controls[formControlName].validator = validator;
    this.PatientCertificateValidator.controls[formControlName].updateValueAndValidity();
  }
}
