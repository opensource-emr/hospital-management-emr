import {
  FormGroup,
  Validators,
  FormBuilder,
} from '@angular/forms';
import * as moment from 'moment';

export class DeathDetails {
  public DeathId: number = 0;
  public PatientId: number;
  public MedicalRecordId: number;
  public PatientVisitId: number = 0;
  public DeathDate: string = moment().format("YYYY-MM-DD");
  public DeathTime: string = moment().format("HH:mm");
  public CertificateNumber: string;
  public FiscalYear: string = null;
  public CreatedBy: number = null;
  public ModifiedBy: number = null;
  public CertifiedBy: number = null;
  public CreatedOn: string = null;
  public ModifiedOn: string = null;

  public FatherName: string = null;
  public MotherName: string = null;
  public SpouseOf: string = null;
  public VisitCode: string = null;
  public CauseOfDeath: string = null;
  public PrintCount: number = 0;
  public PrintedBy: number = null;

  public Country: string = null;
  public CountrySubDivision: string = null;
  public Address: string = null;

  public Age: string = null;
  public Sex: string = null;

  public IsActive: boolean = true;

  public ShortName: string = null;



  public DeathDetailsValidator: FormGroup = null;

  constructor() {
    var _formBuilder = new FormBuilder();
    this.DeathDetailsValidator = _formBuilder.group({
      // 'CertificateNumber': ['', Validators.compose([Validators.required])],
      'DeathDate': [this.DeathDate, Validators.compose([Validators.required])],
      'DeathTime': [this.DeathTime, Validators.compose([Validators.required,Validators.pattern['']])]
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.DeathDetailsValidator.dirty;
    else
      return this.DeathDetailsValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean {
    if (this.DeathDetailsValidator.valid) { return true; } else { return false; }
  }

  public IsValidCheck(fieldName, validator): boolean {
    if (this.DeathDetailsValidator.valid) {
      return true;
    }
    if (fieldName == undefined)
      return this.DeathDetailsValidator.valid;
    else
      return !(this.DeathDetailsValidator.hasError(validator, fieldName));
  }
}

