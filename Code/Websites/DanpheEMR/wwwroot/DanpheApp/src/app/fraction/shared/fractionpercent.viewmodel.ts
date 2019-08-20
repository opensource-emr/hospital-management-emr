import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';

export class FractionPercentViewModel {
    public PercentSettingId: number = 0;
    public BillItemPriceId: number = 0;
    public HospitalPercent: number = 0;
    public DoctorPercent: number = 0;
    public Description: string = null;
    public CreatedOn: string = null;
    public CreatedBy: number = 0;
    public ItemName: string = null;
    public ItemPrice: number = 0;
    public FractionPercentValidator: FormGroup = null;


    constructor() {
        var _formBuilder = new FormBuilder();
        this.FractionPercentValidator = _formBuilder.group({
            'DoctorPercent': ['', Validators.compose([Validators.required,this.positiveNumberValdiator])],
            'HospitalPercent': ['', Validators.compose([Validators.required,this.positiveNumberValdiator])],
            //'Email': ['', Validators.compose([Validators.email])]
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.FractionPercentValidator.dirty;
        else
            return this.FractionPercentValidator.controls[fieldName].dirty;
    }

    public IsValid(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.FractionPercentValidator.valid;
        }
        else
            return !(this.FractionPercentValidator.hasError(validator, fieldName));
    }
    positiveNumberValdiator(control: FormControl): { [key: string]: boolean } {
        if (control) {
            if (control.value!= null && control.value < 0)
                return { 'invalidPercent': true };
        }

    }
}