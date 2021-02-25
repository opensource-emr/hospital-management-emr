import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';
import * as moment from 'moment/moment';
import { CoreService } from '../../core/shared/core.service';

export class BedReservationInfo{
  public ReservedBedInfoId: number = 0;
  public PatientId: number = null;
  public PatientVisitId: number = null;
  public RequestingDepartmentId: number = null;
  public AdmittingDoctorId: number = null;
  public WardId: number = null;
  public BedFeatureId: number = null;
  public BedId: number = null;
  //public BedQuantity: number = null;
  public AdmissionStartsOn: string = null;
  //public CareOfPersonName: string = null;
  //public CareOfPersonPhoneNo: string = null;
  //public CareOfPersonRelation: string = null;
  public AdmissionNotes: string = null;
  public ReservedOn: string = null;
  public ReservedBy: number = null;
  public CreatedBy: number = null;
  public CreatedOn: string = null;
  public ModifiedBy: number = null;
  public ModifiedOn: string = null;
  public CancelledBy: number = null;
  public CancelledOn: string = null;

  public IsActive: boolean = true;
  public AutoCancelledOn: string = null;
  public IsAutoCancelled: boolean = null;

  public BedReservationInfoValidator: FormGroup = null;

  constructor() {
    var _formBuilder = new FormBuilder();
    this.BedReservationInfoValidator = _formBuilder.group({
      'RequestingDepartmentId': ['', Validators.compose([Validators.required])],
      'AdmittingDoctorId': ['', Validators.compose([Validators.required])],
      'WardId': ['', Validators.compose([Validators.required])],
      'BedFeatureId': ['', Validators.compose([Validators.required])],
      'BedId': ['', Validators.compose([Validators.required])],
      'AdmissionStartsOn': ['', Validators.compose([Validators.required, this.dateValidator])],
      'AdmissionNotes': ['', Validators.compose([Validators.maxLength(1000)])]
    });
  }

  dateValidator(control: FormControl): { [key: string]: boolean } {
    //user can add admission entry  upto 15Aug 12:00AM 
    var limitDate = moment().format('YYYY-MM-DD HH:mm');
    if (control.value) {
      if ((moment(control.value).diff(moment().add(10, 'minutes').format('YYYY-MM-DD HH:mm')) < 0))
        return { 'wrongDate': true };
    }
    else
      return { 'wrongDate': true };
  }


  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.BedReservationInfoValidator.dirty;
    else
      return this.BedReservationInfoValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean { if (this.BedReservationInfoValidator.valid) { return true; } else { return false; } }

  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined)
      return this.BedReservationInfoValidator.valid;
    else
      return !(this.BedReservationInfoValidator.hasError(validator, fieldName));
  }

  public EnableControl(formControlName: string, enabled: boolean) {
    let currCtrol = this.BedReservationInfoValidator.controls[formControlName];
    if (currCtrol) {
      if (enabled) {
        currCtrol.enable();
      }
      else {
        currCtrol.disable();
      }
    }
  }

}
