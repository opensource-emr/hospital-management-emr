import {
    FormGroup,
    Validators,
    FormBuilder,
  } from '@angular/forms';
import { PatientVisitProcedureModel } from './clinical-patient-visit-procedure.model';
import { ICD10 } from './icd10.model';
  
  export class PatientVisitNoteModel {
    public  PatientVisitNoteId :number=0;
    public PatientId :number=0;
    public PatientVisitId:number=0;
    public ProviderId :number=0;
   
    public ChiefComplaint :string=null;
    public HistoryOfPresentingIllness :string=null;
    public ReviewOfSystems :string=null;
    public Diagnosis :string=null;
     
    public HEENT :string=null;
    public Chest :string=null;
    public CVS :string=null;
    public Abdomen :string=null;
    public Extremity :string=null;
    public Skin :string=null;
    public Neurological :string=null;
    
    public LinesProse :string=null;
    public ProsDate :string=null;
    public Site :string=null;
    public ProsRemarks :string=null;
    public FreeText :string=null;
    
    public FollowUp :number=0;
    public FollowUpUnit :string='day';
    public Remarks :string=null;
  
    public CreatedBy :number=0;
    public CreatedOn : string = null;
    public ModifiedBy :number=0;
    public ModifiedOn : string = null;
    public IsActive :boolean=true;
    public ICDList: Array<ICD10> = [];
    
    public PatientVisitNoteValidator: FormGroup = null;
    constructor() {
  
      var _formBuilder = new FormBuilder();
      this.PatientVisitNoteValidator = _formBuilder.group({
       
        
        'DischargeConditionId': ['', Validators.compose([])],
        // 'DiagnosisFreeText': ['', Validators.compose([Validators.maxLength(1000)])],
        // 'Diagnosis': ['', Validators.compose([Validators.required, Validators.maxLength(1000)])],
      });
    }
    public IsDirty(fieldName): boolean {
      if (fieldName == undefined)
        return this.PatientVisitNoteValidator.dirty;
      else
        return this.PatientVisitNoteValidator.controls[fieldName].dirty;
    }
  
    public IsValid(): boolean { if (this.PatientVisitNoteValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
      if (fieldName == undefined)
        return this.PatientVisitNoteValidator.valid;
      else
        return !(this.PatientVisitNoteValidator.hasError(validator, fieldName));
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
      this.PatientVisitNoteValidator.controls[formControlName].validator = validator;
      this.PatientVisitNoteValidator.controls[formControlName].updateValueAndValidity();
    }
  }
  