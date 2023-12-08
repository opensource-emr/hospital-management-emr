import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import { PatientInfoDTO } from './patient-info.dto';
export class BloodSugarMonitoring {
    public BloodSugarMonitoringId: number = 0;
    public PatientId: number = 0;
    public PatientVisitId: number = 0;
    public EntryDateTime: string = null;
    public IsActive: boolean = false;
    public RbsValue: number = null;
    public Insulin: number = null;
    public EnteredBy: string = null;
    public Remarks: string = null;
    public CreatedBy: number = null;
    public CreatedOn: string = null;
    public ModifiedOn: string = null;
    public ModifiedBy: number = null;

    public PatientInfo: PatientInfoDTO = new PatientInfoDTO();
    public BloodSugarValidator: FormGroup = null;

    constructor() {
        const _formBuilder = new FormBuilder();
        this.BloodSugarValidator = _formBuilder.group({
            'RbsValue': ['', Validators.compose([Validators.required])],
            'Insulin': ['', Validators.compose([Validators.required])],
            'Remarks': ['']
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.BloodSugarValidator.dirty;
        else
            return this.BloodSugarValidator.controls[fieldName].dirty;
    }

    public IsValid(): boolean { if (this.BloodSugarValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined)
            return this.BloodSugarValidator.valid;
        else
            return !(this.BloodSugarValidator.hasError(validator, fieldName));
    }
}
