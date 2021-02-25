import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'

export class VoucherHeadModel {
    public IsSelected: any;
    public VoucherHeadId: number = 0;
    public VoucherHeadName: string = null;
    public Description: string = null;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;
    public ModifiedBy: number = 0;
    public ModifiedOn: string = null;
    public IsActive: boolean = true;
    public IsDefault : boolean = false;
    public VoucherHeadValidator: FormGroup = null;
    constructor() {

        var _formBuilder = new FormBuilder();
        this.VoucherHeadValidator = _formBuilder.group({
            'VoucherHeadName': ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.VoucherHeadValidator.dirty;
        else
            return this.VoucherHeadValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.VoucherHeadValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.VoucherHeadValidator.valid;

        }

        else
            return !(this.VoucherHeadValidator.hasError(validator, fieldName));
    }
}