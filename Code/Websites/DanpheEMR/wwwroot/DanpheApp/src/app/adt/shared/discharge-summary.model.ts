import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DischargeSummaryConsultant } from './discharge-summary-consultant.model';
import { DischargeSummaryMedication } from "./discharge-summary-medication.model";

export class DischargeSummary {
  public DischargeSummaryId: number = 0;
  public PatientVisitId: number = null;
  public DischargeTypeId: number = null;
  public DoctorInchargeId: number = null;
  public OperativeProcedure: string = null;
  public OperativeFindings: string = null;
  public AnaesthetistsId: number = null;
  public Anaesthetists: string = null;
  public Diagnosis: string;
  public CaseSummary: string = null;
  public Condition: string = null;
  public Treatment: string = null;
  public HistologyReport: string = null;
  public SpeicialNotes: string = null;
  public Medications: string = null;
  public Allergies: string = null;
  public Activities: string = null;
  public Diet: string = null;
  public RestDays: string = null;
  public FollowUp: string = null;
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
  // public DischargeSummaryConsultants: Array<DischargeSummaryConsultant> = new Array<DischargeSummaryConsultant>();
  public DischargeSummaryConsultants: Array<DischargeSummaryConsultant> = new Array<DischargeSummaryConsultant>();
  //public BabyBirthDetails : Array<BabyBirthDetails> = new Array<BabyBirthDetails>();
  public DischargeConditionId: number = null;
  public DeliveryTypeId: number = null;
  //public BabyBirthConditionId: number = null;
  public DeathTypeId: number = null;
  //public BabysFathersName: string = null;
  //public DeathCertificateNumber: string =null;
  public PatientId: any;
  public FiscalYearName: string = null;
  //public DeathPeriod: string = null;

  public ChiefComplaint: string = null;
  public PendingReports: string = null;
  public HospitalCourse: string = null;
  public PresentingIllness: string = null;
  public ProcedureNts: string = null;
  public SelectedImagingItems: string = null;
  public DischargeType: string = null;

  public ProvisionalDiagnosis: string;

  public DiagnosisFreeText: string;
  // public ConsultantId: Array<DischargeSummaryConsultant> = [];

  public BabyWeight: string; // Krishna, 17th,May'22, Fishtail Specific Changes
  // public CheckedBy: number; // Krishna, 17th,May'22, Fishtail Specific Changes
  public ClinicalFindings: string; //Rusha, 30th June'22, added for BIH specific changes
  public PastHistory: string = null; //Rohit, 18Nov'22, For Charak Memorial Hospital changes
  public PhysicalExamination: string = null; //Rohit, 18Nov'22, For Charak Memorial Hospital changes

  public DischargeSummaryTemplateId: number; //Bikesh 24th-july-2023 for DynamicDischargesummary
  public DischargeCondition: string;
  public DeathType: string;
  public BabyBirthCondition: string;
  public DeliveryType: string;
  public DoctorIncharge: string;
  public Age: number;
  public SelectedDiagnosis: string;
  public Anesthetists: string;
  public ResidenceDrName: string;
  public CheckedBy: string;
  public Consultants: string;
  public Consultant: String;
  public hospitalStayDate: number;
  public DrInchargeNMC: string;
  public ConsultantNMC: string;
  public ConsultantsSign: string;




  constructor() {

    var _formBuilder = new FormBuilder();
    this.DischargeSummaryValidator = _formBuilder.group({
      'DischargeTypeId': ['', Validators.compose([Validators.required])],
      // 'ConsultantId': ['', Validators.compose([Validators.required])],
      'DoctorInchargeId': ['', Validators.compose([Validators.required])],
      'DeathTypeId': ['', Validators.compose([Validators.required])],


      'AnaesthetistsId': ['', Validators.compose([Validators.required])],
      'ResidenceDrId': ['', Validators.compose([Validators.required])],
      'BabyWeight': ['', Validators.compose([Validators.required])],
      'icd10Description': ['', Validators.compose([Validators.required])],
      'RestDays': ['', Validators.compose([Validators.required])],
      'FollowUp': ['', Validators.compose([Validators.required])],


      'OperativeProcedure': ['', Validators.compose([Validators.maxLength(1000)])],
      'OperativeFindings': ['', Validators.compose([Validators.maxLength(1000), Validators.required])],
      //'Diagnosis': ['', Validators.compose([Validators.required, Validators.maxLength(1000)])],
      'CaseSummary': ['', Validators.compose([Validators.maxLength(8000), Validators.required])],
      'Condition': ['', Validators.compose([Validators.maxLength(5000), Validators.required])],
      //ramavtar: 12May18: Treatment is not mandatory
      'Treatment': ['', Validators.compose([Validators.maxLength(1000), Validators.required])],
      'HistologyReport': ['', Validators.compose([Validators.maxLength(1000), Validators.required])],
      'SpeicialNotes': ['', Validators.compose([Validators.maxLength(1000), Validators.required])],
      //'Medications': ['', Validators.compose([Validators.maxLength(1000)])],
      'Allergies': ['', Validators.compose([Validators.maxLength(1000), Validators.required])],
      'Activities': ['', Validators.compose([Validators.maxLength(1000), Validators.required])],
      'Diet': ['', Validators.compose([Validators.maxLength(1000), Validators.required])],
      'Others': ['', Validators.compose([Validators.maxLength(1000), Validators.required])],
      'ChiefComplaint': ['', Validators.compose([Validators.maxLength(1000), Validators.required])],
      'PendingReports': ['', Validators.compose([Validators.maxLength(1000), Validators.required])],
      'HospitalCourse': ['', Validators.compose([Validators.maxLength(5000), Validators.required])],
      'PresentingIllness': ['', Validators.compose([Validators.maxLength(1000), Validators.required])],
      'ProcedureNts': ['', Validators.compose([Validators.maxLength(1000), Validators.required])],
      'ClinicalFindings': ['', Validators.compose([Validators.required])],
      'PastHistory': ['', Validators.compose([Validators.required])],
      'DischargeConditionId': ['', Validators.compose([])],
      'DiagnosisFreeText': ['', Validators.compose([Validators.maxLength(1000), Validators.required])]
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
