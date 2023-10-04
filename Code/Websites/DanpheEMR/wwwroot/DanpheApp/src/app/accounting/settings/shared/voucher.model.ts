import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import * as moment from 'moment';
import { ENUM_DateTimeFormat } from '../../../shared/shared-enums';

export class VoucherModel {
    public VoucherId: number = 0;
    public VoucherName: string = null;
    public Description: string = null;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;
    public IsActive: boolean = true;
    public VoucherCode: string = null;

    public VoucherValidator: FormGroup = null;
    public ShowChequeNumber: boolean = false;
    public ShowPayeeName: boolean = false;
    constructor() {
        this.CreatedOn = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);
        var _formBuilder = new FormBuilder();
        this.VoucherValidator = _formBuilder.group({
            'VoucherName': ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
            'VoucherCode': ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
            'Description': ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.VoucherValidator.dirty;
        else
            return this.VoucherValidator.controls[fieldName].dirty;
    }

    public IsValid(): boolean { if (this.VoucherValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.VoucherValidator.valid;

        }

        else
            return !(this.VoucherValidator.hasError(validator, fieldName));
    }
}