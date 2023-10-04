import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import * as moment from 'moment/moment';
import { ENUM_DateTimeFormat } from '../../shared/shared-enums';
export class Ward {
  public WardId: number = 0;
  public StoreId: number = 0;
  public WardCode: string = "";
  public WardName: string = "";
  public WardLocation: string = null;

  public CreatedBy: number = 0;
  public ModifiedBy: number = null;
  public IsActive: boolean = true;

  public CreatedOn: string = null;
  public ModifiedOn: string = null;

  public WardValidator: FormGroup = null;
  public TotalBeds: number = 0;
  public VacantBeds: number = 0;
  public OccupiedBeds: number = 0;

  constructor() {
    this.CreatedOn = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);
    var _formbuilder = new FormBuilder();
    this.WardValidator = _formbuilder.group({
      'WardName': ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      'WardCode': ['', Validators.compose([Validators.required, Validators.maxLength(20)])],
    });
  }
  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.WardValidator.dirty;
    else
      return this.WardValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean { if (this.WardValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.WardValidator.valid;
    }
    else
      return !(this.WardValidator.hasError(validator, fieldName));
  }
}
