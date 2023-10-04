import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import * as moment from 'moment';
import { ENUM_DateTimeFormat } from '../../../shared/shared-enums';

export class ledgerGroupCategoryModel {
    public LedgerGroupCategoryId: number = 0;
    public LedgerGroupCategoryName: string = null;
    public ChartOfAccountId: number = null;
    ///public AccountingReportId: string = null;
    public Description: string = "";
    public IsDebit: boolean = false;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;
    public IsActive: boolean = true;


    public LedgerGroupCategoryValidator: FormGroup = null;

    constructor() {
        this.CreatedOn = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);
        var _formBuilder = new FormBuilder();
        this.LedgerGroupCategoryValidator = _formBuilder.group({
            'LedgerGroupCategoryName': ['', Validators.compose([Validators.required])],
            'ChartOfAccountId': ['', Validators.compose([Validators.required])],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.LedgerGroupCategoryValidator.dirty;
        else
            return this.LedgerGroupCategoryValidator.controls[fieldName].dirty;
    }

    public IsValid(): boolean { if (this.LedgerGroupCategoryValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.LedgerGroupCategoryValidator.valid;
        }
        else
            return !(this.LedgerGroupCategoryValidator.hasError(validator, fieldName));
    }
}