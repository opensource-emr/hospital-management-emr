import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';
import * as moment from 'moment/moment';
export class AuditTrailModel {
  public AuditId: number = 0;
  public InsertedDate: string = "";
  public UserName: string = "";
  public DbContext: string = "";
  public MachineUserName: string = "";
  public MachineName: string = "";
  public DomainName: string = "";
  public CallingMethodName: string = "";
  public ChangedByUserId: string = "";
  public ChangedByUserName: string = "";
  public Table_Database: string = "";
  public ActionName: string = "";
  public Table_Name: string = "";
  public PrimaryKey: string = "";
  public ColumnValues: string = "";

  public FromDate: string = "";
  public ToDate: string = "";
  // not mapped
  public TableDisplayName: string = '';

  public AuditTrailValidator: FormGroup = null;

  constructor() {
    var _formBuilder = new FormBuilder();
    this.AuditTrailValidator = _formBuilder.group({
      'FromDate': ['', Validators.compose([Validators.required, this.dateValidatorsForPast])],
      'ToDate': ['', Validators.compose([Validators.required, this.dateValidators])],

    });

  }

  public dateValidatorsForPast(control: FormControl): { [key: string]: boolean } {
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


  public dateValidators(control: FormControl): { [key: string]: boolean } {

    //get current date, month and time
    var currDate = moment().format('YYYY-MM-DD');

    //if positive then selected date is of future else it of the past
    if ((moment(control.value).diff(currDate) > 0) ||
      (moment(control.value).diff(currDate, 'years') < -200)) // this will not allow the age diff more than 200 is past
      return { 'wrongDate': true };
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.AuditTrailValidator.dirty;
    else
      return this.AuditTrailValidator.controls[fieldName].dirty;
  }

  public IsValid(fieldName, validator): boolean {
    if (!fieldName)
      return this.AuditTrailValidator.valid;
    else
      return !(this.AuditTrailValidator.hasError(validator, fieldName));
  }


}
