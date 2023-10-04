import { FormControl, FormGroup, FormBuilder, Validators } from "@angular/forms";
import * as moment from "moment";

export class MaternityANCModel {
  public MaternityANCId: number = 0;
  public PatientId: number;
  public MaternityPatientId: number;
  public PregnancyPeriodInWeeks: number;
  public ANCDateTime: string = moment().format();
  public VisitNumber: string;
  public ANCPlace: string;
  public ConditionOfANC: string;
  public IsActive: boolean = true;
  public CreatedOn: string = moment().format();
  public CreatedBy: number = 0;
  public ModifiedOn: string = null;
  public ModifiedBy: number = 0;
  public Weight: number = 0;

  public ANCValidator: FormGroup = null;

  constructor() {
    var _formBuilder = new FormBuilder();
    this.ANCValidator = _formBuilder.group({
      'PregnancyPeriodInWeeks': ['', Validators.compose([Validators.required])],
      'VisitNumber': ['', Validators.compose([Validators.required])],
      'ANCPlace': ['', Validators.compose([Validators.required])],
      'ConditionOfANC': ['', Validators.compose([Validators.required])],
      'Weight': ['', Validators.compose([Validators.required, Validators.pattern('^[1-9][0-9]{1,2}\d*(\.[0-9]+)?$')])],
    });

  }

  public IsDirty(fieldname): boolean {
    if (fieldname == undefined) {
      return this.ANCValidator.dirty;
    }
    else {
      return this.ANCValidator.controls[fieldname].dirty;
    }

  }

  public IsValid(fieldname, validator): boolean {
    if (this.ANCValidator.valid) {
      return true;
    }

    if (fieldname == undefined) {
      return this.ANCValidator.valid;
    }
    else {
      return !(this.ANCValidator.hasError(validator, fieldname));
    }
  }

  public IsValidCheck(fieldname, validator): boolean {
    // this is used to check for patient form is valid or not 
    if (this.ANCValidator.valid) {
      return true;
    }

    if (fieldname == undefined) {
      return this.ANCValidator.valid;
    }
    else {

      return !(this.ANCValidator.hasError(validator, fieldname));
    }
  }
}
