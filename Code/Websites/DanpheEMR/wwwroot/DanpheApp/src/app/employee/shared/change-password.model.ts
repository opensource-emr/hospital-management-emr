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

export class ChangePasswordModel {

    public UserName: string = null;

    public Password: string = null;
    public NewPassword: string = null;
    public ConfirmPassword: string = null;
   
    public ChangePasswordValidator: FormGroup = null;

    constructor() {

        var _formBuilder = new FormBuilder();
        this.ChangePasswordValidator = _formBuilder.group({
           'Password': ['', Validators.compose([Validators.required,Validators.maxLength(20)])],
           'NewPassword': ['', Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(20)])],
           'ConfirmPassword': ['', Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(20)])]            
        }, {
                validator: ChangePasswordModel.MatchPassword // your validation method i.e Common Method to match the value of Differnt input field 
               
            }
        );
    }
    
    
    static MatchPassword(AC: AbstractControl) {
        let newpassword = AC.get('NewPassword').value; // to get value in input tag
        let confirmPassword = AC.get('ConfirmPassword').value; // to get value in input tag
        let password = AC.get('Password').value;

        //this Function is for matching newpassword and confirm password character and setting Error message to view Page
        if (confirmPassword != null && newpassword != null) {
            if (newpassword != confirmPassword) {
                ///when new password and Confirm password are differnt then set Password Not match error to View
                AC.get('ConfirmPassword').setErrors({ MatchNewAndConfirmPassword: true })
            } else {
               return null
            }
        }

        //this Function is for matching Password and new password character and setting Error message to view Page
        if (password != null && newpassword != null) {
            if (password == newpassword) { 
                ////when current password and new password are equal then setting error to View
                 AC.get('NewPassword').setErrors({ MatchPasswordAndNewPassword: true })
            }
            else {
                 return null
            }
        }
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.ChangePasswordValidator.dirty;
        else
            return this.ChangePasswordValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.ChangePasswordValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.ChangePasswordValidator.valid;
        }

        else
            return !(this.ChangePasswordValidator.hasError(validator, fieldName));
    }

   
}





