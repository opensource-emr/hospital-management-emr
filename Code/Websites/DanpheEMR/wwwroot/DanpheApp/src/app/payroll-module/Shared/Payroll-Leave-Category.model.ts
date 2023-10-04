import
{NgForm,
FormGroup,
FormControl,
Validators,
FormBuilder,
ReactiveFormsModule
} from '@angular/forms'

export class LeaveCategories{
    public LeaveCategoryId:number = 0;
    public LeaveCategoryName:string = "";
    public Description:string = "";
    public CreatedBy: number = 0;
    public CreatedOn : string = "";
    public ApprovedBy: number = 0;
    public IsActive :boolean = false;
    public CategoryCode: string ="";
        
    public LeaveCategoryValidator: FormGroup = null;
    constructor() {

        var _formBuilder = new FormBuilder();
        this.LeaveCategoryValidator = _formBuilder.group({
            'LeaveCategoryName': ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
            'CategoryCode': ['', Validators.compose([Validators.required, Validators.maxLength(30)])],
            'Description': ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.LeaveCategoryValidator.dirty;
        else
            return this.LeaveCategoryValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.LeaveCategoryValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.LeaveCategoryValidator.valid;
            
        }

        else
            return !(this.LeaveCategoryValidator.hasError(validator, fieldName));
    }
}