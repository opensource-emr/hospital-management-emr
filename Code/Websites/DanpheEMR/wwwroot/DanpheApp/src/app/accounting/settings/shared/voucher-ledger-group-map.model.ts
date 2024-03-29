﻿import {
    FormBuilder,
    FormGroup
} from '@angular/forms';
import * as moment from 'moment';
import { ENUM_DateTimeFormat } from '../../../shared/shared-enums';

export class VoucherLedgerGroupMapModel {
    public VoucherLedgerGroupMapId: number = 0;
    public VoucherId: number = 0;
    public LedgerGroupId: number = 0;
    public IsDebit: boolean = false;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;
    public IsActive: boolean = true;
    public flagCredit: boolean = true;
    public flagDebit: boolean = true;
    public voucherName: string = null;
    public isMapped: boolean = false;
    public actionName: string = null;
    public VoucherCode: string = null;
    public VoucherLedgerGroupMapValidator: FormGroup = null;
    constructor() {
        this.CreatedOn = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);
        var _formBuilder = new FormBuilder();
        this.VoucherLedgerGroupMapValidator = _formBuilder.group({
            ///// 'VoucherName': ['', Validators.compose([Validators.required])],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.VoucherLedgerGroupMapValidator.dirty;
        else
            return this.VoucherLedgerGroupMapValidator.controls[fieldName].dirty;
    }

    public IsValid(): boolean { if (this.VoucherLedgerGroupMapValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.VoucherLedgerGroupMapValidator.valid;

        }

        else
            return !(this.VoucherLedgerGroupMapValidator.hasError(validator, fieldName));
    }
}