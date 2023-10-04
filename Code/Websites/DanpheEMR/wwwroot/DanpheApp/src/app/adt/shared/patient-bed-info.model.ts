import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import * as moment from 'moment/moment';
import { ENUM_DateTimeFormat } from '../../shared/shared-enums';
export class PatientBedInfo {
  public PatientBedInfoId: number = 0;
  public PatientVisitId: number = 0;
  public PatientId: number = 0;

  public WardId: number = 0;
  public BedFeatureId: number = 0;
  public BedId: number = 0;
  public BedPrice: number = 0;
  public Action: string = "";
  public OutAction: string = null;//pratik:18May2020
  public Remarks: string = "";
  public StartedOn: string = null;
  public EndedOn: string = null;
  public SecondaryDoctorId: number = null;
  public SecondaryDoctorName: string = "";
  public CreatedBy: number = 0;
  public CreatedOn: string = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);
  public IsActive: boolean = true;
  public ReservedBedId: number = 0;
  public PatientBedInfoValidator: FormGroup = null;

  public RequestingDeptId: number = 0;//sud:19Jun'18
  public IsValidReqDepartment: boolean = true; //yub:25th Oct' 18
  public IsExistBedFeatureId: boolean = false;
  public IsInsurancePatient: boolean = false;

  public ReceivedBy: number = null;
  public ReceivedOn: string = null;


  constructor() {
    this.StartedOn = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);
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
