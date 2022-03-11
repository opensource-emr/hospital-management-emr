
import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';
import { Country } from './country.model';

export class CountrySubdivision {

    public CountrySubDivisionId: number = 0;
    public CountryId: number = null;
    public CountrySubDivisionName: string = null;
    public CountrySubDivisionCode: string = null;
    //public MapAreaCode: string = null;

    public CreatedBy: number = null;
    public CreatedOn: string = null;

    public IsActive: boolean = true;

    public ModifiedBy: number = null;
    public ModifiedOn: string = null;

    public SubdivisionValidator: FormGroup = null;

    constructor() {

        var _formBuilder = new FormBuilder();
        this.SubdivisionValidator = _formBuilder.group({
            'CountryId': ['', Validators.compose([Validators.required])],
            'CountrySubDivisionName': ['', Validators.compose([Validators.required])]
            //'MapAreaCode': ['', Validators.compose([Validators.required, Validators.pattern('^[A-Z]{1,10}$')])]
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.SubdivisionValidator.dirty;
        else
            return this.SubdivisionValidator.controls[fieldName].dirty;
    }

    public IsValid(): boolean { if (this.SubdivisionValidator.valid) { return true; } else { return false; } }
    public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.SubdivisionValidator.valid;
        }

        else
            return !(this.SubdivisionValidator.hasError(validator, fieldName));
    }


}



export class Municipality {
    public MunicipalityId: number = 0;
    public MunicipalityName: string = null;
    public CountrySubDivisionId: number = null;
    public CountryId: number = null;
    public CountrySubDivisionName: string = null;
    public CountryName: string = null;
    public Type: string = null;

    public CreatedBy: number = null;
    public CreatedOn: string = null;

    public IsActive: boolean = true;

    public ModifiedBy: number = null;
    public ModifiedOn: string = null;


    public MunicipalityValidator: FormGroup = null;

    constructor() {

        var _formBuilder = new FormBuilder();
        this.MunicipalityValidator = _formBuilder.group({
            'CountryId': ['', Validators.compose([Validators.required])],
            'SubDivisionId': ['', Validators.compose([Validators.required])],
            'MunicipalityName': ['', Validators.compose([Validators.required])]
            //'MapAreaCode': ['', Validators.compose([Validators.required, Validators.pattern('^[A-Z]{1,10}$')])]
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.MunicipalityValidator.dirty;
        else
            return this.MunicipalityValidator.controls[fieldName].dirty;
    }

    public IsValid(): boolean { if (this.MunicipalityValidator.valid) { return true; } else { return false; } }
    public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.MunicipalityValidator.valid;
        }

        else
            return !(this.MunicipalityValidator.hasError(validator, fieldName));
    }


}





