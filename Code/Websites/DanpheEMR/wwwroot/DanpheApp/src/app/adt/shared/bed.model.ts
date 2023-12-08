/// <reference path="ward.model.ts" />
//import { Ward } './ward.model';
//import { BedType } './bedtype.model';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import * as moment from 'moment';
import { ENUM_DateTimeFormat } from '../../shared/shared-enums';
import { BedFeature } from './bedfeature.model';
export class Bed {
  public BedId: number = 0;
  public BedCode: string = null;
  public BedFeature: BedFeature = new BedFeature();
  public BedNumber: string = null;
  // public BedNumFrm: string = null;
  // public BedNumTo: string = null;
  public WardId: number = null;
  public IsOccupied: boolean = false;
  public IsReserved: boolean = false;

  public CreatedBy: number = 0;
  public ModifiedBy: number = null;
  public IsActive: boolean = true;

  public CreatedOn: string = null;
  public ModifiedOn: string = null;

  public ReservedByPatient: string = null;
  public ReservedForDate: string = null;


  public BedMainValidator: FormGroup = null;
  //public Ward: Ward = new Ward();
  //public BedType: BedType = new BedType();

  constructor() {
    this.CreatedOn = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);
    var _formbuilder = new FormBuilder();
    this.BedMainValidator = _formbuilder.group({
      'WardId': ['', Validators.compose([Validators.required])],
      'BedNumber': ['', Validators.compose([Validators.required])]
    });
  }
  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.BedMainValidator.dirty;
    else
      return this.BedMainValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean { if (this.BedMainValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.BedMainValidator.valid;

    }

    else
      return !(this.BedMainValidator.hasError(validator, fieldName));
  }
}
