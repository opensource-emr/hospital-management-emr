import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';
export class PHRMTAXModel {
    public TAXId: number = 0;
    public TAXName: string = null;
    public TAXPercentage: number = null;
    public Description: string = null;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;

    public TAXValidator: FormGroup = null;

    constructor() {
        var _formBuilder = new FormBuilder();
        this.TAXValidator = _formBuilder.group({
            'TAXName': ['', Validators.required],
            'TAXPercentage': ['', Validators.compose([Validators.required, Validators.pattern('^(0|[1-9]{1}[0-9]{0,1})(\.[0-9]{1,2})?$')])],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.TAXValidator.dirty;
        else
            return this.TAXValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.TAXValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.TAXValidator.valid;
        }
        else
            return !(this.TAXValidator.hasError(validator, fieldName));
    }
}