import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';

import * as moment from 'moment/moment';

export class EditDoctorFeatureViewModel {

  public BillingTransactionItemId: number = null;
  public BillingTransactionId: number = null;
  public PatientId: number = null;
  public PatientName: string = null;
  public Date: string = "";
  public ServiceDepartmentId: number = null;
  public ServiceDepartmentName: string = null;
  public ItemId: number = null;
  public ItemName: string = null;
  public ProviderId: number = null;
  public ProviderName: string = null;
  public PatientCode: string = null;
  public Gender: string = null;
  public DateOfBirth: string = null;
  public PhoneNumber: string = null;
  public FromDate: string = null;
  public ToDate: string = null;
  public ReceiptNo: string = null;
  public BillStatus: string = null;
  public ReferredById: number = null;
  public ReferredByName: string = null;
  public DoctorMandatory: boolean = false;
  public RequisitionId: number = null;

  public EditDoctorValidator: FormGroup = null;

  constructor() {
    var _formBuilder = new FormBuilder();
    this.EditDoctorValidator = _formBuilder.group({
      'FromDate': ["", Validators.compose([Validators.required, this.dateValidatorsForPast])],
      'ToDate': ["", Validators.compose([Validators.required, this.dateValidatorsForPast])]//there will be no validation for providerid at the begining. it is conditional validation.
    });
  }
  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.EditDoctorValidator.dirty;
    else
      return this.EditDoctorValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean { if (this.EditDoctorValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined)
      return this.EditDoctorValidator.valid;
    else
      return !(this.EditDoctorValidator.hasError(validator, fieldName));
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

}
