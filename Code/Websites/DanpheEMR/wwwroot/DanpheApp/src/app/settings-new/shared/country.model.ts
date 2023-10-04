
import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';
export class Country {
    public CountryId: number = 0;
    public CountryShortName: string = null;

    public CountryName: string = null;

    public ISDCode: string = null;
    public CountrySubDivisionType: string = null;

    public CreatedBy: number = null;
    public CreatedOn: string = null;

    public IsActive: boolean = true;    
    public ModifiedBy: number = null;    
    public ModifiedOn: string = null;

    public CountryValidator: FormGroup = null;

    constructor() {

        var _formBuilder = new FormBuilder();
        this.CountryValidator = _formBuilder.group({
            'CountryName': ['', Validators.compose([Validators.required, Validators.maxLength(30)])],
            'ISDCode': ['', Validators.compose([Validators.required])],
            'CountryShortName': ['', Validators.compose([Validators.required, Validators.pattern('^[A-Z]{1,10}$'), Validators.maxLength(10)])],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.CountryValidator.dirty;
        else
            return this.CountryValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.CountryValidator.valid){return true;}else{return false;}} 
    public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.CountryValidator.valid;
        }

        else
            return !(this.CountryValidator.hasError(validator, fieldName));
    }


}





