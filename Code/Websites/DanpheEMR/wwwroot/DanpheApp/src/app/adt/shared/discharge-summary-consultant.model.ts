import { FormBuilder, FormGroup } from "@angular/forms";

export class DischargeSummaryConsultant {
    public consultantId: number = 0;
    public EmployeeId: number = 0;
    public DischargeSummaryId: number = 0;
    public PatientVisitId: number = 0;
    public PatientId: number = 0;
    public DischargeSummaryConsultantValidator: FormGroup = null;
    public IsActive: boolean = null;
    public Type: string = null;
    public consultantName: string = null;
    public FullName: string = null;

    constructor() {

        var _formBuilder = new FormBuilder();
        this.DischargeSummaryConsultantValidator = _formBuilder.group({
            // 'FrequencyId': ['', Validators.compose([Validators.required])],
            // 'Medicine': ['', Validators.compose([Validators.maxLength(100), Validators.required ])],
        });
    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.DischargeSummaryConsultantValidator.dirty;
        else
            return this.DischargeSummaryConsultantValidator.controls[fieldName].dirty;
    }

    public IsValid(): boolean { if (this.DischargeSummaryConsultantValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined)
            return this.DischargeSummaryConsultantValidator.valid;
        else
            return !(this.DischargeSummaryConsultantValidator.hasError(validator, fieldName));
    }
}