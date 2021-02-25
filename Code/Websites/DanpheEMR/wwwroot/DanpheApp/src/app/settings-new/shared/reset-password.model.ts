import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';
import { AbstractControl } from '@angular/forms';

export class ResetPasswordModel {

   // public UserName: string = null;

   // public Password: string = null;
    public NewPassword: string = null;
    public ConfirmPassword: string = null;
   
    public ResetPasswordValidator: FormGroup = null;

    constructor() {

        var _formBuilder = new FormBuilder();
        this.ResetPasswordValidator = _formBuilder.group({
          /// 'Password': ['', Validators.compose([Validators.required,Validators.maxLength(20)])],
           'NewPassword': ['', Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(20)])],
           'ConfirmPassword': ['', Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(20)])]            
        }
        );
    }
    
    
    //static MatchPassword(AC: AbstractControl) {
    //    let newpassword = AC.get<any>('NewPassword').value; // to get value in input tag
    //    let confirmPassword = AC.get<any>('ConfirmPassword').value; // to get value in input tag
    //    let password = AC.get<any>('Password').value;

    //    //this Function is for matching newpassword and confirm password character and setting Error message to view Page
    //    if (confirmPassword != null && newpassword != null) {
    //        if (newpassword != confirmPassword) {
    //            ///when new password and Confirm password are differnt then set Password Not match error to View
    //            console.log('false');
    //            AC.get<any>('ConfirmPassword').setErrors({ MatchNewAndConfirmPassword: true })
    //        } else {
    //            console.log('true');
    //            return null
    //        }
    //    }

    //    //this Function is for matching Password and new password character and setting Error message to view Page
    //    if (password != null && newpassword != null) {
    //        if (password == newpassword) { 
    //            ////when current password and new password are equal then setting error to View
    //            console.log('true');
    //            AC.get<any>('NewPassword').setErrors({ MatchPasswordAndNewPassword: true })
    //        }
    //        else {
    //            console.log('false');
    //            return null
    //        }
    //    }
    //}

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.ResetPasswordValidator.dirty;
        else
            return this.ResetPasswordValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.ResetPasswordValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.ResetPasswordValidator.valid;
        }

        else
            return !(this.ResetPasswordValidator.hasError(validator, fieldName));
    }

   
}





