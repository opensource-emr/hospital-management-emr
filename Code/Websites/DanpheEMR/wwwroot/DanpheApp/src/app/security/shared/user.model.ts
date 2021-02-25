import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'

import { Employee } from '../../employee/shared/employee.model';
import { AbstractControl } from '@angular/forms';

export class User {
  public UserId: number = 0;
  public EmployeeId: number = 0;
  public UserName: string = null;
  public Password: string = null;
  public Email: string = null;
  public IsActive: boolean = true;

  // public NewPassword: string = null;
  public ConfirmPassword: string = null;
  public Employee: Employee = null;
  public Profile: any = {};

  public CreatedBy: number = null;
  public ModifiedBy: number = null;

  public CreatedOn: string = null;
  public ModifiedOn: string = null;
  public IsSystemAdmin: boolean = false;

  public NeedsPasswordUpdate: boolean = true;
  //Ajay 07 Aug 19 -- landing page after login user
  public LandingPageRouteId: number = null;  

  public UserProfileValidator: FormGroup = null;


  constructor() {

    var _formBuilder = new FormBuilder();
    this.UserProfileValidator = _formBuilder.group({
      'EmployeeId': ['', Validators.compose([Validators.required])],
      'UserName': ['', Validators.compose([Validators.required, Validators.maxLength(30)])],
      'Email': ['', Validators.compose([Validators.required, Validators.pattern('^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}$')])],
      'Password': ['', Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(20)])],
      'ConfirmPassword': ['', Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(20)])]
      ///// Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(20)])
    }, {
        validator: User.MatchPassword // your validation method i.e Common Method to match the value of Differnt input field 

      }

    );
  }

  static MatchPassword(AC: AbstractControl) {
    let newpassword = AC.get('Password').value; // to get value in input tag
    let confirmPassword = AC.get('ConfirmPassword').value; // to get value in input tag


    //this Function is for matching newpassword and confirm password character and setting Error message to view Page
    if (confirmPassword != null && newpassword != null) {
      if (newpassword != confirmPassword) {
        ///when new password and Confirm password are differnt then set Password Not match error to View
        AC.get('ConfirmPassword').setErrors({ MatchNewAndConfirmPassword: true })
      } else {
        return null
      }
    }


  }
  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.UserProfileValidator.dirty;
    else
      return this.UserProfileValidator.controls[fieldName].dirty;
  }


  public IsValid(): boolean {
    if (this.UserProfileValidator.valid) {
      return true;
    } else {
      return false;
    }
  }
  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.UserProfileValidator.valid;

    }

    else
      return !(this.UserProfileValidator.hasError(validator, fieldName));
  }

  public RemoveValidators(formControls: Array<string>) {
    if (formControls != null && formControls.length > 0) {
      for (var i = 0; i < formControls.length; i++) {
        this.UserProfileValidator.controls[formControls[i]].validator = Validators.compose([]);
      }
    }
  }

}
