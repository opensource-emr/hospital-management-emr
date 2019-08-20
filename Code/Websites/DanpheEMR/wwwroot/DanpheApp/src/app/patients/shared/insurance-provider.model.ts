import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms'

import * as moment from 'moment/moment';

export class InsuranceProviderModel {

    public InsuranceProviderId: number = 0;
    public InsuranceProviderName: string = null;
    public Description: string = null;
    public CreatedOn: string = null;

    public CreatedBy: number = 0;
    public ModifiedBy: number = 0;
    public IsActive: Boolean = false;

    public InsuranceProviderValidator: FormGroup = null;

    //creating constructor
    constructor() {
        //creating object for FormBuilder
        var _formBuilder = new FormBuilder();

        this.InsuranceProviderValidator = _formBuilder.group({
            //VAlidation message dine 
            'InsuranceProviderName': ['', Validators.compose([Validators.required])], //'' means giving default value
        });
    }

    public IsDirty(fieldName: any): boolean {
        if (fieldName == undefined)
            return this.InsuranceProviderValidator.dirty; //dirty refers to false
        else
            return this.InsuranceProviderValidator.controls[fieldName].dirty;
    }

    public IsValid(fieldName: any, validator: any): boolean {
        if (fieldName == undefined) {
            return this.InsuranceProviderValidator.valid;
        }
        else
            return !(this.InsuranceProviderValidator.hasError(validator, fieldName));
    }

}