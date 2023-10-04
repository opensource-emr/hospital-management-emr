import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
export class ShiftsMasterModel {
    public ShiftId: number = 0;
    public ShiftName: string = null;
    public StartTime: string = null;
    public EndTime: string = null;
    public CreatedBy: number = null;
    public CreatedOn: string = null;
    public ModifiedBy: number = null;
    public ModifiedOn: string = null;
    public TotalHrs: number = null;
    public IsDefault: boolean = true;

    //display purpose
    public IsActive: boolean = false;
    public EmployeeShiftMapId: number = 0;
    public IsEditable: boolean = true;
    public IsSelected: boolean = false;

    public ShiftValidator: FormGroup = null;

    constructor() {
        var _formBuilder = new FormBuilder();
        this.ShiftValidator = _formBuilder.group({
            'ShiftName': ['', Validators.compose([Validators.required])],
            'StartTime': ['', Validators.required],
            'EndTime': ['', Validators.required]
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.ShiftValidator.dirty;
        else
            return this.ShiftValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.ShiftValidator.valid){return true;}else{return false;}} 
    public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.ShiftValidator.valid;
        }
        else
            return !(this.ShiftValidator.hasError(validator, fieldName));
    }
}