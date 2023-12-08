import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
export class InputOutput {
    public InputOutputId: number = 0;
    public PatientVisitId: number = 0;
    public InputOutputParameterMainId: number = 0;
    public InputOutputParameterChildId: number = null;
    public IntakeOutputValue: number = null;
    public Balance: number = 0;
    public Unit: string = "ml";
    // public IntakeType: string = null;
    // public OutputType: string = null;
    public IntakeOutputType: string = null;
    public CreatedBy: number = null;
    public ModifiedBy: number = null;
    public CreatedOn: string = null;
    public ModifiedOn: string = null;
    public Color: string = null;
    public Quality: string = null;
    public Remarks: string = null;
    public Contents: string = null;

    public InputOutputValidator: FormGroup = null;

    constructor() {
        var _formBuilder = new FormBuilder();
        this.InputOutputValidator = _formBuilder.group({
            // 'IntakeType': ['', Validators.compose([Validators.required])],
            // 'OutputType': ['', Validators.compose([Validators.required])],
            // 'TotalIntake': ['', Validators.compose([Validators.required])],
            // 'TotalOutput': ['', Validators.compose([Validators.required])],
            'IntakeOutputValue': ['', Validators.compose([Validators.required])],
            'IntakeOutputType': ['', Validators.compose([Validators.required])],
            'Remarks': [''],
            'Color': [''],
            'Quality': ['']
        });
    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.InputOutputValidator.dirty;
        else
            return this.InputOutputValidator.controls[fieldName].dirty;
    }

    public IsValid(): boolean { if (this.InputOutputValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined)
            return this.InputOutputValidator.valid;
        else
            return !(this.InputOutputValidator.hasError(validator, fieldName));
    }
}