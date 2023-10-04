import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';


export class ItemCategoryModel {
    public ItemCategoryId: number = 0;
    public ItemCategoryName: string = null;
    public Description: string = null;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;
    public IsActive: boolean = true;
   
    public ItemCategoryValidator: FormGroup = null;
    constructor() {

        var _formBuilder = new FormBuilder();
        this.ItemCategoryValidator = _formBuilder.group({
            'ItemCategoryName': ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.ItemCategoryValidator.dirty;
        else
            return this.ItemCategoryValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.ItemCategoryValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.ItemCategoryValidator.valid;
        }
        else
            return !(this.ItemCategoryValidator.hasError(validator, fieldName));
    }
}