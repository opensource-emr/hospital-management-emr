import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';

export class Membership {

  public MembershipTypeId: number = 0;
  public CommunityName: string = null;//sundeep-7Nov'19
  public MembershipTypeName: string = null;
  public Description: string = null;
  public DiscountPercent: number = 0;
  public ExpiryMonths: number = 0;
  public CreatedBy: number = null;
  public CreatedOn: string = null;
  public ModifiedBy: number = null;
  public ModifiedOn: string = null;
  public IsActive: boolean = true;

  public MembershipDisplayName: string = null;//only to be used in client side.




  public MembershipValidator: FormGroup = null;

  constructor() {
    var _formBuilder = new FormBuilder();
    this.MembershipValidator = _formBuilder.group({
      'MembershipTypeName': ['', Validators.compose([Validators.required])],
      //'Description': ['', Validators.compose([Validators.pattern])],
      'DiscountPercent': ['', Validators.compose([Validators.required, Validators.min(0), Validators.max(100)])],
      'CommunityName': ['', Validators.compose([Validators.required])],
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.MembershipValidator.dirty;
    else
      return this.MembershipValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean {
    if (this.MembershipValidator.valid) {
      return true;
    } else {
      return false;
    }
  }
  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.MembershipValidator.valid;
    }
    else {
      return !(this.MembershipValidator.hasError(validator, fieldName));
    }
  }
}
