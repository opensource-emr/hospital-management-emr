import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Employee } from "../../employee/shared/employee.model";
import { OperationTheatreTeam } from "./ot-team.model";
import * as moment from 'moment/moment';

export class OperationTheatreBookingModel {
  public OTBookingId: number = 0;
  public BookedForDate: string = null;
  public CreatedBy: number = 0;
  public CreatedOn: string = null;
  public SurgeryType: string = null;
  public SurgeonName: string = null;
  public OtAssistantName: string = null;
  public Diagnosis: any;
  public ProcedureType: string = null;
  public AnesthesiaType: string = null;
  public Remarks: string = null;
  public CancelledBy: number = null;
  public CancelledOn: string = null;
  public CancellationRemarks: string = null;
  public ConsentFormPath: string = null;
  public PACFormPath: string = null;
  public IsActive: boolean = true;

  public OtSurgeonList: Array<Employee> = new Array<Employee>();
  public AnesthetistDoctor: Employee;
  public AnesthetistAssistant: Employee;
  public ScrubNurse: Employee;
  public OtAssistantList: Array<Employee> = new Array<Employee>();

  //for patient details
  public PatientId: number;
  public PatientVisitId: number;

  public OtTeam: Array<OperationTheatreTeam> = new Array<OperationTheatreTeam>();

  public OperationTheatreValidator: FormGroup = null;

  constructor() {
    var _formBuilder = new FormBuilder();
    this.OperationTheatreValidator = _formBuilder.group({
      'SurgeryType': ['', Validators.compose([Validators.required])],
      'BookedForDate': ['', Validators.compose([Validators.required, this.dateValidator])],
      'Diagnosis': ['', Validators.compose([Validators.required])],
      'ProcedureType': ['', Validators.compose([Validators.required])],
      'Remarks': ['', Validators.compose([Validators.required])]
    });
  }

  public IsDirty(fieldname): boolean {
    if (fieldname == undefined) {
      return this.OperationTheatreValidator.dirty;
    }
    else {
      return this.OperationTheatreValidator.controls[fieldname].dirty;
    }

  }

  public IsValid(fieldname, validator): boolean {
    if (this.OperationTheatreValidator.valid) {
      return true;
    }

    if (fieldname == undefined) {
      return this.OperationTheatreValidator.valid;
    }
    else {
      return !(this.OperationTheatreValidator.hasError(validator, fieldname));
    }
  }

  public IsValidCheck(fieldname, validator): boolean {
    // this is used to check for patient form is valid or not 
    if (this.OperationTheatreValidator.valid) {
      return true;
    }

    if (fieldname == undefined) {
      return this.OperationTheatreValidator.valid;
    }
    else {

      return !(this.OperationTheatreValidator.hasError(validator, fieldname));
    }
  }

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
}