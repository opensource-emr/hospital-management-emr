import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'

export class BillingPackage {
    public BillingPackageId: number = 0;
    public BillingPackageName: string = null;
    public Description: string = null;
    public TotalPrice: number = 0;
    public DiscountPercent: number = 0;
    public BillingItemsXML: string = null;
    public PackageCode: string = null;
    public CreatedBy: number = null;
    public CreatedOn: string = null;
    public ModifiedBy: number = null;
    public ModifiedOn: string = null;
    public IsActive: boolean = true;
    public IsSelected: boolean = false;
    public BillingPackageValidator: FormGroup = null;

    constructor() {
        var _formBuilder = new FormBuilder();
        this.BillingPackageValidator = _formBuilder.group({
            'BillingPackageName': ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
            'Description': ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
            'PackageCode': ['', Validators.compose([Validators.maxLength(20)])]
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.BillingPackageValidator.dirty;
        else
            return this.BillingPackageValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.BillingPackageValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined)
            return this.BillingPackageValidator.valid;
        else
            return !(this.BillingPackageValidator.hasError(validator, fieldName));
    }

}