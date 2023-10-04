import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';
import { ENUM_TermsApplication } from '../../shared/shared-enums';

export class TermsConditionsMasterModel {
    public TermsId: number = 0;
    public ShortName: string = null;
    public Text: string = "";
    public Type: string = null;
    public OrderBy: number = 0;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;
    public IsActive: boolean = true;
    public TermsApplicationEnumId: ENUM_TermsApplication = ENUM_TermsApplication.Inventory;
    
    public TermsValidators: FormGroup = null;

    constructor() {
        var _formBuilder = new FormBuilder();
        this.TermsValidators = _formBuilder.group({
            // 'Text': ['', Validators.compose([Validators.required, Validators.maxLength(100000000000)])],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.TermsValidators.dirty;
        else
            return this.TermsValidators.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.TermsValidators.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.TermsValidators.valid;
        }
        else
            return !(this.TermsValidators.hasError(validator, fieldName));
    }

}