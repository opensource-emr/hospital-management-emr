import {
    FormGroup,
    FormBuilder,
    Validators,
    FormControl
} from "@angular/forms";
import { DenominationModel } from "./denomination.model";

export class HandOverModel {
    public HandoverId: number = null;
    public UserId: number = null;
    public Username: string = null;
    public CounterId: number = null;
    public HandoverType: string = null;
    public PreviousAmount: number = 0;
    public HandoverAmount: number = 0;
    public TotalAmount: number = 0;
    public CreatedBy: number = null;
    public CreatedOn: Date = null;
    public denomination: Array<DenominationModel> = new Array<DenominationModel>();
    public HandoverValidator: FormGroup = null;
    public IsValidSelAssignedToUser: boolean = true;
    constructor() {

        var _formBuilder = new FormBuilder();
        this.HandoverValidator = _formBuilder.group({
            'HandoverType': ['', Validators.compose([Validators.required])],
            'PreviousAmount': ['', Validators.compose([this.positiveNumberValdiator])],
            'UserId': ['', Validators.compose([Validators.required])],
        });
    }

    positiveNumberValdiator(control: FormControl): { [key: string]: boolean } {
        if (control) {
            if (control.value < 0)
                return { 'invalidNumber': true };
        }

    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.HandoverValidator.dirty;
        else
            return this.HandoverValidator.controls[fieldName].dirty;
    }
    public IsValid(): boolean { if (this.HandoverValidator.valid) { return true; } else { return false; } }
    public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.HandoverValidator.valid;
        }

        else
            return !(this.HandoverValidator.hasError(validator, fieldName));
    }
}
