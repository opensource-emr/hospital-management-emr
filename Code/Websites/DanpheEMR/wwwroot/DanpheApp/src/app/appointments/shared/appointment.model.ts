
import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';

export class Appointment {
  public AppointmentId: number = 0;
  public PatientId: number = 0;
  public FirstName: string = "";
  public MiddleName: string = "";
  public LastName: string = "";
  public Gender: string = "";
  public ContactNumber: string = "";
  public AppointmentDate: string = "";
  public AppointmentTime: string = "";
  public ProviderId: number = null;
  public ProviderName: string = "";
  public AppointmentType: string = "";
  public PatientType: string = "outpatient";
  public AppointmentStatus: string = "";
  public CreatedOn: string = "";
  public CreatedBy: number = null;
  public CancelledOn: string = "";
  public CancelledBy: number = null;
  public CancelledRemarks: string = null;
  public DepartmentId: number = null;
  public DoctorName: string = null;

  //reason mentioned in task no 152
  public Reason: string = "";
  public AppointmentList: any = null;
  //--quickappointment--this features/functions is not used: removed since this is not useful and has some defects..--sudarshan: 6May'16
  //public CountryId: number = null;
  //public CountrySubDivisionId: number = null;
  //public DateOfBirth: string = null;
  public AppointmentValidator: FormGroup = null;


  constructor() {

    var _formBuilder = new FormBuilder();
    this.AppointmentValidator = _formBuilder.group({
      'FirstName': ['', Validators.compose([Validators.required, Validators.maxLength(30)])],
      'MiddleName': ['', Validators.compose([])],
      'LastName': ['', Validators.compose([Validators.required, Validators.maxLength(30)])],
      'Gender': ['', Validators.compose([Validators.required])],
      'ContactNumber': ['', Validators.compose([Validators.required, Validators.pattern('^[0-9]{1,10}$')])],
      //'DateOfBirth': ['', Validators.compose([this.dateValidatorsForPast])],
      'AppointmentDate': ['', Validators.compose([Validators.required, this.dateValidator])],
      //Appointment validators empty ..but we need declaration to check this in IsSSDirty
      'AppointmentTime': ['', Validators.compose([])],
      //'Doctor': ['', Validators.compose([Validators.required])],
      //'AppointmentType': ['', Validators.compose([Validators.required])],
      //--duration--this features/functions is not used: removed since this is not useful and has some defects..--sudarshan: 6May'16
      //'Duration': ['', Validators.compose([this.durationValidator])],

    });
  }

  //--duration--this features/functions is not used: removed since this is not useful and has some defects..--sudarshan: 6May'16
  //durationValidator(control: FormControl): { [key: string]: boolean } {

  //    if (Number(control.value) < 5 || Number(control.value) > 60)
  //        return { 'valid': false };
  //}

  dateValidator(control: FormControl): { [key: string]: boolean } {

    //get current date, month and time
    var currDate = moment().format('YYYY-MM-DD');
    //if positive then selected date is of future else it of the past || selected year can't be of future
    if (control.value) {
      if ((moment(control.value).diff(currDate) < 0)
        || (moment(control.value).diff(currDate, 'years') > 1)) //can make appointent upto 1 year from today only.
        return { 'wrongDate': true };
    }


    else
      return { 'wrongDate': true };

  }
  //the date should be in past and we are allowing till 200yrs in past
  dateValidatorsForPast(control: FormControl): { [key: string]: boolean } {

    //get current date, month and time
    var currDate = moment().format('YYYY-MM-DD');
    if (control.value) {
      //if positive then selected date is of future else it of the past
      if ((moment(control.value).diff(currDate) > 0) ||
        (moment(control.value).diff(currDate, 'years') < -200)) // this will not allow the age diff more than 200 is past
        return { 'wrongDate': true };
    }


    else
      return { 'wrongDate': true };



  }

  public IsValidTime(): boolean {
    let _date = this.AppointmentValidator.controls["AppointmentDate"].value;
    let _time = this.AppointmentValidator.controls["AppointmentTime"].value;
    let _dateTime = moment(_date + " " + _time);

    var _currDate = moment().format('YYYY-MM-DD HH:mm');

    //if positive then selected time is of future else it of the past
    if (moment(_dateTime).diff(_currDate) > 0)
      return true;
    else
      return false;
  }

  public IsValidAppointmentTime(): boolean {
    let appointmentDate = this.AppointmentValidator.controls["AppointmentDate"].value;
    let appointmentTime = this.AppointmentValidator.controls["AppointmentTime"].value;

    var appointmentList = this.AppointmentList;

    var currentAppointmentDateTime = moment(appointmentDate + " " + appointmentTime).format('YYYY-MM-DD HH:mm');
    var currentDate = moment().format('YYYY-MM-DD HH:mm');

    var durationDiffForPastEntry = moment.duration(moment(currentAppointmentDateTime).diff(currentDate));
    var diffInSecForPastEntry = durationDiffForPastEntry.asSeconds();

    if (diffInSecForPastEntry > 599) {
      if (appointmentList && appointmentList.length) {
        var valid: boolean = true;
        for (var i = 0; i < appointmentList.length; i++) {
          var val = appointmentList[i];
          let singleApptDateTimeFromList = moment(moment(val.Date).format('YYYY-MM-DD') + " " + val.Time).format('YYYY-MM-DD HH:mm');
          let durationDiffForSingleAppointment = moment.duration(moment(currentAppointmentDateTime).diff(singleApptDateTimeFromList));
          let diffeneceInSec = Math.abs(durationDiffForSingleAppointment.asSeconds());

          if (diffeneceInSec < 600) {
            valid = false;
          }
        }

        return valid;
      }
      else {
        return true;
      }
    }
    else {
      return false;
    }
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.AppointmentValidator.dirty;
    else
      return this.AppointmentValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean {
    if (this.AppointmentValidator.valid) {
      return true;
    }
    else {
      return false;
    }
  }
  public IsValidCheck(fieldName, validator): boolean {
    console.log(this);
    if (fieldName == undefined) {
      if (this.IsValidTime() && this.IsValidAppointmentTime())
        return this.AppointmentValidator.valid;
      else
        return false;
    }

    else
      return !(this.AppointmentValidator.hasError(validator, fieldName));
  }
}
