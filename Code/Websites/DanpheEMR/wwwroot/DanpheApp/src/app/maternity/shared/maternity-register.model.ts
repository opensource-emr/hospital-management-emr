import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import * as moment from "moment";

export class RegistrationDetails {
  public MaternityRegisterId: number = 0;
  public MaternityPatientId: number = 0;
  public PatientId: number = 0;
  public CreateOn: string = moment().format();
  public CreatedBy: number = 0;
  public ModifiedOn: string = moment().format();
  public ModifiedBy: number = 0;
  public IsActive: boolean = true;
  public PlaceOfDelivery: string = null;
  public DeliveryDate: string = moment().format();
  public Presentation: string = null;
  public Complications: string = null;
  public TypeOfDelivery: number = 0;
  public NumberOfBaby: number = 1;
  public Gender: string = null;
  public OutcomeOfBaby: string = null;
  public OutcomeOfMother: string = null;
  public WeightInGram: string = null;

  public ChildDetails: Array<ChildDetailsVM> = [];

  public MaternityRegisterDetailsValidator: FormGroup = null;
  constructor() {
    var _formBuilder = new FormBuilder();
    this.MaternityRegisterDetailsValidator = _formBuilder.group({
      'PlaceOfDelivery': ['', Validators.compose([Validators.required, Validators.maxLength(30)])],
      'TypeOfDelivery': ['', Validators.compose([Validators.required])],
      'Presentation': ['', Validators.compose([Validators.maxLength(30)])]
    });
  }

  public IsDirty(fieldname): boolean {
    if (fieldname == undefined) {
      return this.MaternityRegisterDetailsValidator.dirty;
    }
    else {
      return this.MaternityRegisterDetailsValidator.controls[fieldname].dirty;
    }

  }

  public IsValid(fieldname, validator): boolean {
    if (this.MaternityRegisterDetailsValidator.valid) {
      return true;
    }

    if (fieldname == undefined) {
      return this.MaternityRegisterDetailsValidator.valid;
    }
    else {
      return !(this.MaternityRegisterDetailsValidator.hasError(validator, fieldname));
    }
  }

  public IsValidCheck(fieldname, validator): boolean {
    // this is used to check for patient form is valid or not 
    if (this.MaternityRegisterDetailsValidator.valid) {
      return true;
    }

    if (fieldname == undefined) {
      return this.MaternityRegisterDetailsValidator.valid;
    }
    else {

      return !(this.MaternityRegisterDetailsValidator.hasError(validator, fieldname));
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

    let currCtrol = this.MaternityRegisterDetailsValidator.controls[formControlName];
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
export class ChildDetailsVM {
  public Gender: string = null;
  public OutcomeOfBaby: string = null;
  public OutcomeOfMother: string = null;
  public WeightInGram: string = null;

  public ChildDetailsValidator: FormGroup = null;

  constructor() {
    var _formBuilder = new FormBuilder();
    this.ChildDetailsValidator = _formBuilder.group({
      'Gender': ['', Validators.compose([Validators.required])],
      'WeightInGram': ['', Validators.compose([Validators.required])],
      'OutcomeOfBaby': ['', Validators.compose([Validators.required])],
      'OutcomeOfMother': ['', Validators.compose([Validators.required])]
    });
  }

  public IsDirty(fieldname): boolean {
    if (fieldname == undefined) {
      return this.ChildDetailsValidator.dirty;
    }
    else {
      return this.ChildDetailsValidator.controls[fieldname].dirty;
    }

  }

  public IsValid(fieldname, validator): boolean {
    if (this.ChildDetailsValidator.valid) {
      return true;
    }

    if (fieldname == undefined) {
      return this.ChildDetailsValidator.valid;
    }
    else {
      return !(this.ChildDetailsValidator.hasError(validator, fieldname));
    }
  }

  public IsValidCheck(fieldname, validator): boolean {
    // this is used to check for patient form is valid or not 
    if (this.ChildDetailsValidator.valid) {
      return true;
    }

    if (fieldname == undefined) {
      return this.ChildDetailsValidator.valid;
    }
    else {

      return !(this.ChildDetailsValidator.hasError(validator, fieldname));
    }
  }
}

export class MatPatientRegisterVm {
  public MaternityPatient: MatPatDetailsForRegister = new MatPatDetailsForRegister();
  public MaternityDetails: Array<MaternityRegister> = new Array<MaternityRegister>();
}

export class MatPatDetailsForRegister {
  public Complications: string = null;
  public DeliveryDate: string = moment().format();
  public MaternityPatientId: number = 0;
  public PatientId: number = 0;
  public PlaceOfDelivery: string = null;
  public Presentation: string = null;
  public TypeOfDelivery: number = 0;
}
export class MaternityRegister {
  public MaternityRegisterId: number = 0;
  public MaternityPatientId: number = 0;
  public PatientId: number = 0;
  public Gender: string = null;
  public OutcomeOfBaby: string = null;
  public OutcomeOfMother: string = null;
  public WeightInGram: string = null;
  public CreateOn: string = moment().format();
  public CreatedBy: number = 0;
  public ModifiedOn: string = moment().format();
  public ModifiedBy: number = 0;
  public IsActive: boolean = true;
}
