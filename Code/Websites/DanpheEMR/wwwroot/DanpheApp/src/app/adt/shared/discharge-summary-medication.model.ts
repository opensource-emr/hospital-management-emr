import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'

export class DischargeSummaryMedication {
    public DischargeSummaryMedicationId: number = 0;
    public DischargeSummaryId: number = 0;
    public OldNewMedicineType: number = 0;
    public Medicine: string = null;
    public FrequencyId: number = 0;
    public Notes: string = null;
    public DischargeSummaryMedicationValidator: FormGroup = null;
    public IsActive: boolean = null;
    public Type: string = null;

    constructor() {

        var _formBuilder = new FormBuilder();
        this.DischargeSummaryMedicationValidator = _formBuilder.group({
            // 'FrequencyId': ['', Validators.compose([Validators.required])],
            // 'Medicine': ['', Validators.compose([Validators.maxLength(100), Validators.required ])],
        });
    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.DischargeSummaryMedicationValidator.dirty;
        else
            return this.DischargeSummaryMedicationValidator.controls[fieldName].dirty;
    }

    public IsValid(): boolean { if (this.DischargeSummaryMedicationValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined)
            return this.DischargeSummaryMedicationValidator.valid;
        else
            return !(this.DischargeSummaryMedicationValidator.hasError(validator, fieldName));
    }

}
