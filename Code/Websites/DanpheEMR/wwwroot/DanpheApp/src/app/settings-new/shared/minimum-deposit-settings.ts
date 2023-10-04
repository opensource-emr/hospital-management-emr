import { FormBuilder, FormGroup, Validators } from "@angular/forms";

export class MinimumDepositSettingsModel {
    public AdtDepositSettingId: number = 0;
    public BedFeatureId: number = null;
    public BedFeatureName: string = null;
    public SchemeId: number = null;
    public SchemeName: string = null;
    public DepositHeadId: number = null;
    public DepositHeadName: string = null;
    public MinimumDepositAmount: number = null;
    public IsOnlyMinimumDeposit: boolean = false;
    public IsActive: boolean = false;

    MinimumDepositSettingsValidator: FormGroup = null;
    constructor() {
        var _formBuilder = new FormBuilder();
        this.MinimumDepositSettingsValidator = _formBuilder.group(
            {
                'BedFeatureName': ['', Validators.required],
                'SchemeName': ['', Validators.required],
                'DepositHeadName': ['', Validators.required],
                'MinimumDepositAmount': [0, Validators.compose([Validators.required, Validators.min(0)])]

            }
        )
    }

    public IsValid(): boolean {
        if (this.MinimumDepositSettingsValidator.valid) { return true; }
        else { return false; }
    } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.MinimumDepositSettingsValidator.valid;
        }
        else
            return !(this.MinimumDepositSettingsValidator.hasError(validator, fieldName));
    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.MinimumDepositSettingsValidator.dirty;
        else
            return this.MinimumDepositSettingsValidator.controls[fieldName].dirty;
    }


}