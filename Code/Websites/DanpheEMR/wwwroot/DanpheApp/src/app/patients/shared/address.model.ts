
import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms'

export class Address {
    public AddressType: string = null;
    public PatientAddressId: number = null;
    public PatientId: number = null;
    public Street1: string = null;
    public Street2: string = null;
    public CountryId: number = null;
    public CountrySubDivisionId: number = null;
    public City: string = null;
    public ZipCode: string = null;
    public AddressValidator: FormGroup = null;

    //this is used to show ...text in client
    public CountryName: string = null;
    public CountrySubDivisionName: string = null;

    public IsDirty(fieldname): boolean {
        if (fieldname == undefined) {
            return this.AddressValidator.dirty;
        }
        else {
            return this.AddressValidator.controls[fieldname].dirty;
        }

    }

    public IsValid():boolean{if(this.AddressValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldname, validator): boolean {

        //if nothing's has changed in Addess then return true..
        //else check if the form is valid or not.. <needs revision: Sudarshan 27Dec'16>
        if (!this.AddressValidator.dirty) {
            return true;
        }

        if (fieldname == undefined) {
            return this.AddressValidator.valid;
        }
        else {

            return !(this.AddressValidator.hasError(validator, fieldname));
        }
    }


    constructor(defAddressType: string) {
        this.PatientAddressId = 0;
        this.PatientId = 0;

        if (defAddressType) {
            this.AddressType = defAddressType;
        }


        var _formBuilder = new FormBuilder();
        this.AddressValidator = _formBuilder.group({
            //setting default value of addresstype from the constuctor
            'AddressType': [defAddressType, Validators.required,],
            'Street1': ['', Validators.compose([Validators.required, Validators.maxLength(30)])],
            'CountryId': ['', Validators.required,],
            'CountrySubDivisionId': ['', Validators.required,],
            'City': ['', Validators.required,]
        });


    }

}


