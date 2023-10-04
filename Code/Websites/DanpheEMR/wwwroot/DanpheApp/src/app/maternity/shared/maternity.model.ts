import { FormControl, FormGroup, FormBuilder, Validators } from "@angular/forms";
import * as moment from "moment";

export class MaternityPatientListModel {
  public PatientId: number;
  public MaternityPatientId: number;
  public PatientCode: string;
  public ShortName: string;
  public Address: string;
  public PhoneNumber: string;
  public HusbandName: string;
  public Age: string;
  public DateOfBirth: string;
  public Gender: string;
  public Height: number = 0;
  public Weight: number = 0;
  public LastMenstrualPeriod: string = moment().format();;
  public ExpectedDeliveryDate: string = moment().format();;
  public DeliveryDate: string = null;
  public IsActive: boolean = true;
  public IsConcluded: boolean = false;
  public IsDelivered: boolean = false;
}

export class MaternityPatient {
  public PatientId: number = 0;
  public HusbandName: string = null;
  public Height: number = 0;
  public Weight: number = 0;
  public LastMenstrualPeriod: string = moment().format();;
  public ExpectedDeliveryDate: string = moment().format();;
  public PlaceOfDelivery: string = null;
  public DeliveryDate: string = null;
  public TypeOfDelivery: number = 0;
  public OBSHistory: string = null;
  public CreatedOn: string = null;
  public CreatedBy: number = 0;
  public ModifiedOn: string = null;
  public ModifiedBy: number = 0;
  public ConcludedOn: string = null;
  public ConcludedBy: number = 0;
  public IsActive: boolean = true;
  public IsConcluded: boolean = false;
}

export class MaternityPatientVM {
  public PatientId: number = 0;
  public HusbandName: string = null;
  public Height: number = 0;
  public Weight: number = 0;
  public MaternityPatientId: number = 0;
  public LastMenstrualPeriod: string = moment().format();
  public ExpectedDeliveryDate: string = moment().format();
  public OBSHistory: string = null;
  public IsActive: boolean = true;
  public IsConcluded: boolean = false;

  public MaternityPatientValidator: FormGroup = null;
  constructor() {
    var _formBuilder = new FormBuilder();
    this.MaternityPatientValidator = _formBuilder.group({
      'HusbandName': ['', Validators.compose([Validators.required, Validators.maxLength(30)])],
      'Height': ['', Validators.compose([Validators.required, Validators.maxLength(30)])],
      'Weight': ['', Validators.compose([Validators.maxLength(30)])],
      //'OBSHistory': ['', Validators.compose([Validators.required])],
      // 'ExpectedDeliveryDate': ['', Validators.required]
    });

  }

  public IsDirty(fieldname): boolean {
    if (fieldname == undefined) {
      return this.MaternityPatientValidator.dirty;
    }
    else {
      return this.MaternityPatientValidator.controls[fieldname].dirty;
    }

  }

  public IsValid(fieldname, validator): boolean {
    if (this.MaternityPatientValidator.valid) {
      return true;
    }

    if (fieldname == undefined) {
      return this.MaternityPatientValidator.valid;
    }
    else {
      return !(this.MaternityPatientValidator.hasError(validator, fieldname));
    }
  }

  public IsValidCheck(fieldname, validator): boolean {
    // this is used to check for patient form is valid or not 
    if (this.MaternityPatientValidator.valid) {
      return true;
    }

    if (fieldname == undefined) {
      return this.MaternityPatientValidator.valid;
    }
    else {

      return !(this.MaternityPatientValidator.hasError(validator, fieldname));
    }
  }



  dateValidators(control: FormControl): { [key: string]: boolean } {
    //get current date, month and time
    var currDate = moment().format('YYYY-MM-DD');
    //if positive then selected date is of future else it of the past
    if ((moment(control.value).diff(currDate) > 0) ||
      (moment(control.value).diff(currDate, 'years') < -200)) // this will not allow the age diff more than 200 is past
      return { 'wrongDate': true };
  }

  //to dynamically enable/disable any form-control. 
  //here [disabled] attribute was not working from cshtml, so written a separate logic to do it.
  public EnableControl(formControlName: string, enabled: boolean) {

    let currCtrol = this.MaternityPatientValidator.controls[formControlName];
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
