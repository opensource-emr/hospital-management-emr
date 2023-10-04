import {
    FormBuilder, FormGroup, Validators
} from '@angular/forms';
import * as moment from 'moment';
import { ENUM_DateTimeFormat } from '../../shared/shared-enums';
export class BedFeature {
    public BedFeatureId: number = 0;
    public BedFeatureCode: string = "";//sud:28Mar'23--This is made 'not null' in Db, so we need to add a Text field to enter this soon
    public BedFeatureName: string = "";
    public BedFeatureFullName: string = "";
    public BedPrice: number = 0;

    public CreatedBy: number = 0;
    public ModifiedBy: number = 0;
    public IsActive: boolean = true;

    public CreatedOn: string = null;
    public ModifiedOn: string = null;
    public BedFeatureValidator: FormGroup = null;

    public IsSelected: boolean = false;
    public TaxApplicable: boolean = false //added for adding in Bill Item price table: yubraj 11th Oct 2018

    constructor() {
        this.CreatedOn = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);
        var _formbuilder = new FormBuilder();
        this.BedFeatureValidator = _formbuilder.group({
            'BedFeatureCode': ['', Validators.compose([Validators.required, Validators.maxLength(10)])],
            'BedFeatureName': ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
            'BedFeatureFullName': ['', Validators.compose([Validators.maxLength(100)])],
            'BedPrice': [0, Validators.compose([Validators.required])],


        });
    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.BedFeatureValidator.dirty;
        else
            return this.BedFeatureValidator.controls[fieldName].dirty;
    }

    public IsValid(): boolean { if (this.BedFeatureValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.BedFeatureValidator.valid;

        }

        else
            return !(this.BedFeatureValidator.hasError(validator, fieldName));
    }

}
