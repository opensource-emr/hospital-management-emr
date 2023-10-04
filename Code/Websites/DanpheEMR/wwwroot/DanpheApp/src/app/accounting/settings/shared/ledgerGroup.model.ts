import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import * as moment from 'moment';
import { ENUM_DateTimeFormat } from '../../../shared/shared-enums';
export class ledgerGroupModel {
    public LedgerGroupId: number = 0;
    public LedgerGroupName: string = ``;
    public Description: string = null;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;
    public IsActive: boolean = true;
    public COA: string = null;
    public PrimaryGroup: string = "";
    public SectionId: number = null;
    public ModifiedBy: number = null;
    public ModifiedOn: string = null;
    public Name: string = "";
    public LedgerGroupValidator: FormGroup = null;
    public COAId: number = 0;
    constructor() {
        this.CreatedOn = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);
        var _formBuilder = new FormBuilder();
        this.LedgerGroupValidator = _formBuilder.group({
            'LedgerGroupName': ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
            'PrimaryGroup': ['', Validators.compose([Validators.required])],
            'COA': ['', Validators.compose([Validators.required])],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.LedgerGroupValidator.dirty;
        else
            return this.LedgerGroupValidator.controls[fieldName].dirty;
    }
    public IsValid(): boolean { if (this.LedgerGroupValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.LedgerGroupValidator.valid;
        }
        else
            return !(this.LedgerGroupValidator.hasError(validator, fieldName));
    }
}
