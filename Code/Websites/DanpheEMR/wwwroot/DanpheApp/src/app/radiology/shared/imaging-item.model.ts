import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';


export class ImagingItem {
    public ImagingItemId: number = 0;
    public ImagingTypeId: number = 0;
    public ImagingItemName: string= null; 
    public ProcedureCode: string= null;

    public IsSelected: boolean = false;

    public CreatedBy: number = null;
    public ModifiedBy: number = null;
    public IsActive: boolean = true;

    public CreatedOn: string = null;
    public ModifiedOn: string = null;
    public IsPreference: boolean = false;
    public TemplateId: number = null;
    public ImagingItemValidator: FormGroup = null;

    constructor() {
        var _formBuilder = new FormBuilder();
        this.ImagingItemValidator = _formBuilder.group({
            'ImagingTypeId': ['', Validators.compose([Validators.required])],
            'ImagingItemName': ['', Validators.compose([Validators.required])]
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.ImagingItemValidator.dirty;
        else
            return this.ImagingItemValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.ImagingItemValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined)
            return this.ImagingItemValidator.valid;
        else
            return !(this.ImagingItemValidator.hasError(validator, fieldName));
    }

}                  