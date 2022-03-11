import {
  FormGroup,
  Validators,
  FormBuilder
} from '@angular/forms'
import * as moment from 'moment';
import { single } from 'rxjs/operators';

export class BabyBirthDetails {
  public BabyBirthDetailsId: number = 0;
  public CertificateNumber: string;
  public Sex: string = "";
  public FathersName: string = null;
  public WeightOfBaby: number;
  public BirthDate: string = moment().format("YYYY-MM-DD");
  public BirthTime: string = moment().format("HH:mm");
  public BirthType: string;
  public BirthNumberType: string = "single";
  public FiscalYear: string = null;
  public DischargeSummaryId: number = 0;
  public MedicalRecordsId: number = 0;
  public PrintCount: number = 0;
  public PrintedBy: number = null;
  public CertifiedBy: number = null;
  public IssuedBy: number = null;
  public PatientVisitId: number = 0;
  public PatientId: number = null;
  public CreatedBy: number = null;
  public ModifiedBy: number = null;
  public CreatedOn: string = null;
  public ModifiedOn: string = null;
  public IsActive: boolean = true;

  public MotherName: string = null;
  public Country: string = null;
  public CountrySubDivision: string = null;
  public Address: string = null;

  public BirthConditionId: number = null;
  public BirthConditionType: string;
  public IsLiveBirthCase: boolean = true;

  public BabyBirthDetailsValidator: FormGroup = null;
  public NumberOfBabies: number = null;

  public IssuedSignatory: number;

  public ConditionAtBirth: string;

  // public SelectedBirthCondition: BabyBirthConditionModel = new BabyBirthConditionModel();


  constructor() {
    var _formBuilder = new FormBuilder();
    this.BabyBirthDetailsValidator = _formBuilder.group({
      'Sex': ['', Validators.compose([Validators.required])],
      'BirthDate': ['', Validators.compose([Validators.required])],
      'BirthTime': ['', Validators.compose([Validators.required])],
      'WeightOfBaby': ['', Validators.compose([Validators.required, Validators.min(1)])],
      'BirthConditionId': ['', Validators.compose([Validators.required])],


      // 'BirthNumberType': ['', Validators.compose([Validators.required])],
      // 'IssuedBy': ['', Validators.compose([Validators.required])],
      // 'CertifiedBy': ['', Validators.compose([Validators.required])],
      // 'CertificateNumber': ['', Validators.compose([Validators.required])],
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

