import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'

export class ItemModel {
    public ItemId: number = 0;
    public ItemName: string = null;
    public LedgerId: number = null;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;
    public IsActive: boolean = true;
    public AvailableQuantity: number = null;
    public Description: string = null;
    public ItemValidator: FormGroup = null;
    public LedgerName: string = null;
    public checkSelectedItem: boolean = false;
    constructor() {

        var _formBuilder = new FormBuilder();
        this.ItemValidator = _formBuilder.group({
            //'ItemPrice': ['', Validators.compose([Validators.maxLength(200)])],
            'ItemName': ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
            'LedgerName': ['', Validators.compose([Validators.required])],

        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.ItemValidator.dirty;
        else
            return this.ItemValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.ItemValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.ItemValidator.valid;
            
        }

        else
            return !(this.ItemValidator.hasError(validator, fieldName));
    }
}