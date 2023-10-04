import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'


export class LeaveRuleList {
    public LeaveRuleId: number = 0;
    public LeaveCategoryId: number = null;
    public Year: number = null;
    public CreatedBy: number = 0;
    //public CreatedOn: string = "";
    public IsActive: boolean = null;
    public IsApproved: boolean = null;
    public ApprovedBy: number = 0;
   // public ModifiedBy: number = 0;
   // public ModifiedOn: number = 0;
    public PayPercent: number = null;
    public Days: number = null;
    public LeaveCategoryName: string = "";
    public Description: string = "";
    public CategoryCode: string = "";
    public SelectedItem: any = null;
    public LeaveRuleValidator: FormGroup = null;
    constructor() {

        var _formBuilder = new FormBuilder();
        this.LeaveRuleValidator = _formBuilder.group({
            'LeaveCategoryId': ['', Validators.compose([Validators.required])],
            'Days': ['', Validators.compose([Validators.required])],
            'PayPercent': ['', Validators.compose([Validators.required])],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.LeaveRuleValidator.dirty;
        else
            return this.LeaveRuleValidator.controls[fieldName].dirty;
    }

    public IsValid(): boolean { if (this.LeaveRuleValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.LeaveRuleValidator.valid;

        }

        else
            return !(this.LeaveRuleValidator.hasError(validator, fieldName));
    }

}
