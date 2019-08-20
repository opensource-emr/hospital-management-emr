import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';

export class AccountHeadModel {
    public AccountHeadId: number = 0;
    public AccountHeadName: string = null;
    public Description: string = null;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;
    public IsActive: boolean = true;

    public AccountHeadValidator: FormGroup = null;

    constructor() {
        var _formBuilder = new FormBuilder();
        this.AccountHeadValidator = _formBuilder.group({
            'AccountHeadName': ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.AccountHeadValidator.dirty;
        else
            return this.AccountHeadValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.AccountHeadValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.AccountHeadValidator.valid;
        }
        else
            return !(this.AccountHeadValidator.hasError(validator, fieldName));
    }
}