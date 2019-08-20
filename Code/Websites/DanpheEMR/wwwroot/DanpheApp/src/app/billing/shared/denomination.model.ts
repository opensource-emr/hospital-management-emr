
import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';

export class DenominationModel {
    public DenominationId: number = null;
    public HandoverId: number = null;
    public CurrencyType:number=0;
    public Quantity: number=0;
    public HandoverAmount: number = 0;
    // public DenominationValidator: FormGroup = null;

    constructor() {
        var _formBuilder = new FormBuilder();
    //     this.DenominationValidator = _formBuilder.group({
    //         'Quantity': ['', Validators.compose([this.positiveNumberValdiator])],
    //     });
    }

    // positiveNumberValdiator(control: FormControl): { [key: string]: boolean } {
    //     if (control) {
    //         if (control.value < 0)
    //             return { 'invalidNumber': true };
    //     }

    // }
    // public IsDirty(fieldName): boolean {
    //     if (fieldName == undefined)
    //         return this.DenominationValidator.dirty;
    //     else
    //         return this.DenominationValidator.controls[fieldName].dirty;
    // }
    // public IsValid():boolean{
    //     if(this.DenominationValidator.valid)
    //     {
    //         return true;
    //     }
    //     else
    //     {
    //         return false;
    //     } 
    // }
    // public IsValidCheck(fieldName, validator): boolean {
    //     if (fieldName == undefined) {
    //         return this.DenominationValidator.valid;
    //     }

    //     else
    //         return !(this.DenominationValidator.hasError(validator, fieldName));
    // }
}