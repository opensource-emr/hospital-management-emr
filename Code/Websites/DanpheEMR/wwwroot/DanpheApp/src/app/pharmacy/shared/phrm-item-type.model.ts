import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';
import { PHRMItemMasterModel } from "./phrm-item-master.model";

export class PHRMItemTypeModel {
    public ItemTypeId: number = 0;
    public CategoryId: number = null;
    public ItemTypeName: string = '';
    public Description: string = null;
    public CreatedBy: number = null;
    public CreatedOn: string = null;
    public IsActive: boolean = true;
    public Items: Array<PHRMItemMasterModel> = new Array<PHRMItemMasterModel>();
    //This is only for local use
    public ItemList: Array<PHRMItemMasterModel> = new Array<PHRMItemMasterModel>();

    public ItemTypeValidator: FormGroup = null;

    constructor() {
        var _formBuilder = new FormBuilder();
        this.ItemTypeValidator = _formBuilder.group({
            'ItemTypeName': ['', Validators.required],
            'CategoryId': ['', Validators.required]
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.ItemTypeValidator.dirty;
        else
            return this.ItemTypeValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.ItemTypeValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined)
            return this.ItemTypeValidator.valid;
        else
            return !(this.ItemTypeValidator.hasError(validator, fieldName));
    }
}