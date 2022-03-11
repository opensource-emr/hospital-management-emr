import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';
export class PatientBedInfo {
  public PatientBedInfoId: number = 0;
  public PatientVisitId: number = 0;
  public PatientId: number = null;

  public WardId: number = null;
  public BedFeatureId: number = null;
  public BedId: number = null;
  public BedPrice: number = 0;
  public Action: string = null;
  public OutAction: string = null;//pratik:18May2020
  public Remarks: string = null;
  public StartedOn: string = null;
  public EndedOn: string = null;
  public SecondaryDoctorId: number = null;
  public SecondaryDoctorName: string = null;
  public CreatedBy: number = null;
  public CreatedOn: string = null;
  public IsActive: boolean = true;
  public ReservedBedId: number = null;
  public PatientBedInfoValidator: FormGroup = null;

  public RequestingDeptId: number = null;//sud:19Jun'18
  public IsValidReqDepartment: boolean = true; //yub:25th Oct' 18
  public IsExistBedFeatureId: boolean = false;
  public IsInsurancePatient: boolean = false;

  public ReceivedBy: number = null;
  public ReceivedOn: string = null;


  constructor() {
    var _formBuilder = new FormBuilder();
    this.PatientBedInfoValidator = _formBuilder.group({
      'RequestingDeptId': [0, Validators.compose([Validators.required])],
      'BedFeatureId': [0, Validators.compose([Validators.required])],
      'WardId': [0, Validators.compose([Validators.required])],
      'BedId': [0, Validators.compose([Validators.required])],
      'Remarks': ['', Validators.compose([])]
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.PatientBedInfoValidator.dirty;
    else
      return this.PatientBedInfoValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean {
    if (this.PatientBedInfoValidator.valid) {
      return true;
    } else {
      return false;
    }
  }

  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined)
      return this.PatientBedInfoValidator.valid;
    else
      return !(this.PatientBedInfoValidator.hasError(validator, fieldName));
  }
}
