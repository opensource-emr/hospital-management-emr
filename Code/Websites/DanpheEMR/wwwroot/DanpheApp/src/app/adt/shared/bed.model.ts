/// <reference path="ward.model.ts" />
//import { Ward } './ward.model';
//import { BedType } './bedtype.model';
import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'
export class Bed {
  public BedId: number = 0;
  public BedCode: string = null;
  public BedNumber: number = 0;
  public BedNumFrm: number = null;
  public BedNumTo: number = null;
  public WardId: number = null;
  public IsOccupied: boolean = false;
  public IsReserved: boolean = false;

  public CreatedBy: number = null;
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
    var _formbuilder = new FormBuilder();
    this.BedMainValidator = _formbuilder.group({
      'WardId': ['', Validators.compose([Validators.required])],
      //'BedNumber': ['', Validators.compose([Validators.required])]
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
