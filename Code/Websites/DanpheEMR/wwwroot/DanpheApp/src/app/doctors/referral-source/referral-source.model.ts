import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';
import * as moment from 'moment/moment';
export class ReferralSource {
  public ReferralSourceId: number = 0;
  public PatientId: number = 0;
  public Newspaper: boolean;
  public Unknown: boolean;
  public Doctor: boolean;
  public Radio: boolean;
  public WebPage: boolean;
  public FriendAndFamily: boolean;
  public Staff: boolean;
  public Magazine: boolean;
  public TV: boolean;
  public Others: string = null;
  public CreatedDate: string = "";
  public Note: string = null;
  public CreatedBy: number = null;
  public ModifiedBy: number = null;
  public CreatedOn: string = null;
  public ModifiedOn: string = null;
  public ReferralSourceValidator: FormGroup = null;

  constructor() {
    var _formBuilder = new FormBuilder();
    this.ReferralSourceValidator = _formBuilder.group({
      //'Note': ['', Validators.compose([Validators.required,Validators.maxLength(200)])],
      //'Occupation': ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.ReferralSourceValidator.dirty;
    else
      return this.ReferralSourceValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean { if (this.ReferralSourceValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined)
      return this.ReferralSourceValidator.valid;
    else
      return !(this.ReferralSourceValidator.hasError(validator, fieldName));
  }

}
