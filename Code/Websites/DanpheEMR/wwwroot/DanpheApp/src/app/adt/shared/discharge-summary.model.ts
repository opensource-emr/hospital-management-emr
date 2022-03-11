import {
  FormGroup,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { DischargeSummaryMedication } from "./discharge-summary-medication.model";

export class DischargeSummary {
  public DischargeSummaryId: number = 0;
  public PatientVisitId: number = null;
  public DischargeTypeId: number = null;
  public ConsultantId: number = null;
  public DoctorInchargeId: number = null;
  public OperativeProcedure: string = null;
  public OperativeFindings: string = null;
  public AnaesthetistsId: number = null;
  public Anaesthetists: string = null;
  public Diagnosis: string = null;
  public CaseSummary: string = null;
  public Condition: string = null;
  public Treatment: string = null;
  public HistologyReport: string = null;
  public SpeicialNotes: string = null;
  public Medications: string = null;
  public Allergies: string = null;
  public Activities: string = null;
  public Diet: string = null;
  public RestDays: number = null;
  public FollowUp: number = null;
  public Others: string = null;
  public ResidenceDrId: number = null;

  public CreatedBy: number = null;
  public ModifiedBy: number = null;

  public CreatedOn: string = null;
  public ModifiedOn: string = null;
  public IsSubmitted: boolean = false;
  public DischargeSummaryValidator: FormGroup = null;
  public LabTests: string = null;
  public DischargeSummaryMedications: Array<DischargeSummaryMedication> = new Array<DischargeSummaryMedication>();
  //public BabyBirthDetails : Array<BabyBirthDetails> = new Array<BabyBirthDetails>();
  public DischargeConditionId: number = null;
  public DeliveryTypeId: number = null;
  //public BabyBirthConditionId: number = null;
  public DeathTypeId: number = null;
  //public BabysFathersName: string = null;
  //public DeathCertificateNumber: string =null;
  public PatientId: number = 0;
  public FiscalYearName: string = null;
  //public DeathPeriod: string = null;

  public ChiefComplaint: string = null;
  public PendingReports: string = null;
  public HospitalCourse: string = null;
  public PresentingIllness: string = null;
  public ProcedureNts: string = null;
  public SelectedImagingItems: string = null;
  public DischargeType: string = null;
  
  public ProvisionalDiagnosis: string = null;

  public DiagnosisFreeText: string;

  constructor() {

    var _formBuilder = new FormBuilder();
    this.DischargeSummaryValidator = _formBuilder.group({
      'DischargeTypeId': ['', Validators.compose([Validators.required])],
      'ConsultantId': ['', Validators.compose([Validators.required])],
      'DoctorInchargeId': ['', Validators.compose([Validators.required])],
      'OperativeProcedure': ['', Validators.compose([Validators.maxLength(1000)])],
      'OperativeFindings': ['', Validators.compose([Validators.maxLength(1000)])],
      //'Diagnosis': ['', Validators.compose([Validators.required, Validators.maxLength(1000)])],
      'CaseSummary': ['', Validators.compose([Validators.maxLength(1000)])],
      'Condition': ['', Validators.compose([Validators.maxLength(1000)])],
      //ramavtar: 12May18: Treatment is not mandatory
      'Treatment': ['', Validators.compose([Validators.maxLength(1000)])],
      'HistologyReport': ['', Validators.compose([Validators.maxLength(1000)])],
      'SpeicialNotes': ['', Validators.compose([Validators.maxLength(1000)])],
      //'Medications': ['', Validators.compose([Validators.maxLength(1000)])],
      'Allergies': ['', Validators.compose([Validators.maxLength(1000)])],
      'Activities': ['', Validators.compose([Validators.maxLength(1000)])],
      'Diet': ['', Validators.compose([Validators.maxLength(1000)])],
      'Others': ['', Validators.compose([Validators.maxLength(1000)])],
      'ChiefComplaint': ['', Validators.compose([Validators.maxLength(1000)])],
      'PendingReports': ['', Validators.compose([Validators.maxLength(1000)])],
      'HospitalCourse': ['', Validators.compose([Validators.maxLength(1000)])],
      'PresentingIllness': ['', Validators.compose([Validators.maxLength(1000)])],
      'ProcedureNts': ['', Validators.compose([Validators.maxLength(1000)])],
      
      'DischargeConditionId': ['', Validators.compose([])],
      'DiagnosisFreeText': ['', Validators.compose([Validators.maxLength(1000)])]
    });
  }
  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.DischargeSummaryValidator.dirty;
    else
      return this.DischargeSummaryValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean { if (this.DischargeSummaryValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined)
      return this.DischargeSummaryValidator.valid;
    else
      return !(this.DischargeSummaryValidator.hasError(validator, fieldName));
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
    this.DischargeSummaryValidator.controls[formControlName].validator = validator;
    this.DischargeSummaryValidator.controls[formControlName].updateValueAndValidity();
  }
}
