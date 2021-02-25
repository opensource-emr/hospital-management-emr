import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'

export class BabyBirthDetails {
  public BabyBirthDetailsId: number = 0;
  public CertificateNumber: string = null;
  public Sex: string = "";
  public FathersName: string = null;
  public WeightOfBaby: number = 0;
  public BirthDate: string = null;
  public BirthTime: string = null;
  public BirthType: string = null;
  public BirthNumberType: string = null;
  public FiscalYear: string = null;
  public DischargeSummaryId: number = 0;
  public MedicalRecordsId: number = 0;
  public PrintCount: number = 0;
  public PrintedBy: number = null;
  public CertifiedBy: number = null;
  public IssuedBy: number = null; 
  public PatientVisitId: number = null;  
  public PatientId: number = null;
  public NumberOfBabies: number = 1;
  public CreatedBy: number = null;
  public ModifiedBy: number = null;
  public CreatedOn: string = null;
  public ModifiedOn: string = null;
  public IsActive: boolean = true;  

  public MotherName: string = null;
  public Country: string = null;
  public CountrySubDivision: string = null;
  public Address: string = null;

  public BabyBirthDetailsValidator: FormGroup = null;

  constructor() {
    var _formBuilder = new FormBuilder();
    this.BabyBirthDetailsValidator = _formBuilder.group({
      'Sex': ['', Validators.compose([Validators.required])],
      'BirthDate': ['', Validators.compose([Validators.required])],
      'BirthTime': ['', Validators.compose([Validators.required])],
      'WeightOfBaby': ['', Validators.compose([Validators.required])],
    });
  }
  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.BabyBirthDetailsValidator.dirty;
    else
      return this.BabyBirthDetailsValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean {
    if (this.BabyBirthDetailsValidator.valid) { return true; } else { return false; }
  }

  public IsValidCheck(fieldName, validator): boolean {
    if (this.BabyBirthDetailsValidator.valid) {
      return true;
    }
    if (fieldName == undefined)
      return this.BabyBirthDetailsValidator.valid;
    else
      return !(this.BabyBirthDetailsValidator.hasError(validator, fieldName));
  }

}

