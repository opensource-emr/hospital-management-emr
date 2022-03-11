import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder
} from '@angular/forms';
import { DischargeSummary } from '../../adt/shared/discharge-summary.model';
import { EmergencyDischargeSummary } from './emergency-discharge-summary.model';
import { EmergencyPatientCases } from './emergency-patient-cases.model';

export class EmergencyPatientModel {
  public ERPatientNumber: number = 0;
  public ERPatientId: number = 0;
  public PatientId: number = null;
  public PatientVisitId: number = null;
  public PatientCode: string = null;
  public VisitDateTime: string = null;
  public ReferredBy: string = null;
  public ReferredTo: string = null;
  public FirstName: string = "";
  public MiddleName: string = "";
  public ShortName: string = null;
  public LastName: string = "";
  public DateOfBirth: string = null;
  public Gender: string = 'null';
  public Age: string = null;
  public AgeSex: string = null;
  public ContactNo: string = "";
  public CareOfPersonContactNumber: string = "";
  public Address: string = null;
  public Case: string = null;
  public ConditionOnArrival: string = null;
  public ModeOfArrivalName: string = null;
  public ModeOfArrival: number = null;
  public CareOfPerson: string = null;
  public TriagedOn: string = null;
  public TriagedBy: number = null;
  public TriageCode: string = null;
  public CreatedOn: string = null;
  public CreatedBy: number = null;
  public ModifiedOn: string = null;
  public ModifiedBy: number = null;
  //We have three status New => Triaged => Finalized
  public ERStatus: string = "new";
  public IsActive: boolean = false;
  public IsExistingPatient: boolean = false;

  public FinalizedStatus: string = null;
  public FinalizedRemarks: string = null;
  public FinalizedBy: number = null;
  public FinalizedOn: string = null;

  public OldPatientId: boolean = true;

  public FinalizedByName: string = null;
  public TriagedByName: string = null;
  public AgeUnit: string = 'Y';
  public FullName: string = null;
  public CountryId: number = 0;
  public CountrySubDivisionId: number = null;

  public ProviderId: number = null;
  public ProviderName: string = null;

  public IsPoliceCase: boolean = false;

  public ERDischargeSummaryId: number = null;
  public DefaultDepartmentName: string = null;

  public ERPatientValidator: FormGroup = null;

  public Sex: string = "";   // ag7_mig_fix: property doest not exist used in er-lama.html

  public MainCase: number = 0;
  public SubCase: number = null;
  public OtherCaseDetails: string = null;
  public MunicipalityId: number = 0;
  public MunicipalityName: string = null;

  public PatientCases: EmergencyPatientCases = new EmergencyPatientCases();
  
  constructor() {
    var _formBuilder = new FormBuilder();
    this.ERPatientValidator = _formBuilder.group({
      'FirstName': ['', Validators.compose([Validators.required, Validators.maxLength(40)])],
      'LastName': ['', Validators.compose([Validators.required, Validators.maxLength(40)])],
      'Gender': ['', Validators.required],
      'PhoneNumber': ['', Validators.compose([Validators.pattern('^[0-9]{1,10}$')])],
      'Age': ['', Validators.compose([Validators.required])],
      //'MainCase': ['', Validators.required]
    });

  }


  public IsDirty(fieldname): boolean {
    if (fieldname == undefined) {
      return this.ERPatientValidator.dirty;
    }
    else {
      return this.ERPatientValidator.controls[fieldname].dirty;
    }

  }

  public IsValid(fieldname, validator): boolean {
    if (this.ERPatientValidator.valid) {
      return true;
    }

    if (fieldname == undefined) {
      return this.ERPatientValidator.valid;
    }
    else {
      return !(this.ERPatientValidator.hasError(validator, fieldname));
    }
  }

  //to dynamically enable/disable any form-control. 
  //here [disabled] attribute was not working from cshtml, so written a separate logic to do it.   
  public EnableControl(formControlName: string, enabled: boolean) {
    let currCtrol = this.ERPatientValidator.controls[formControlName];
    if (currCtrol) {
      if (enabled) {
        currCtrol.enable();
      }
      else {
        currCtrol.disable();
      }
    }
  }

  //dynamically sets ON and OFF the validation on LastName controlname.
  public UpdateValidator(onOff: string, formControlName: string, validatorType: string) {
    let validator = null;
    if (validatorType == 'required' && onOff == "on") {
      validator = Validators.compose([Validators.required]);
    }
    else {
      validator = Validators.compose([]);
    }
    this.ERPatientValidator.controls[formControlName].validator = validator;
    this.ERPatientValidator.controls[formControlName].updateValueAndValidity();
  }

}

