import { FormBuilder, FormGroup, Validators } from "@angular/forms";

export class MedicareDependentModel {
    public FullName: string = '';
    public ParentName: string = '';
    public MedicareInstCode: string = '';
    public MemberNo: string = "";
    public MedicareMemberId: number = 0;
    public HospitalNo: string = '';
    public PatientId: number = 0;
    public IsDependent: boolean = true;
    public Relation: string = '';
    public MedicareDate: Date;
    public ParentMedicareMemberId: number;
    public InsuranceNumber: string = '';
    public Remarks: string = '';
    public DesignationId: number = 0;
    public DepartmentId: number;
    public Age: number;
    public DOB: string = '';
    public Gender: string = '';
    public InActiveDate: Date = null;
    public IsActive: boolean = true;
    public MedicareTypeId: number = 0;
    public MedicareInstituteCode: string = '';
    public MedicareStartDate: string = '';
    public SchemeId: number;
    public LedgerId: number;
    public InsurancePolicyNo: string = '';
    public MedicareTypeName: string = '';
    public InsuranceProviderId: number;
    public DateOfBirth: Date;

    // MedicareDependentValidator: FormGroup = null;
    MedicareDependentValidator: FormGroup = null;

    constructor() {
        var _formBuilder = new FormBuilder();
        this.MedicareDependentValidator = _formBuilder.group({
            'PatientId': ['', Validators.compose([Validators.required])],
            'FullName': ['', Validators.compose([Validators.required])],
            'HospitalNo': ['', Validators.compose([Validators.required])],
            'MedicareInstituteCode': ['', Validators.compose([Validators.required])],
            'Remarks': ['', Validators.compose([Validators.required])],
            'InsuranceProviderId': ['', Validators.compose([Validators.required])],
            'Relation': ['', Validators.compose([Validators.required])],
            'MedicareStartDate': ['', Validators.compose([Validators.required])],
        });
    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.MedicareDependentValidator.dirty;
        else
            return this.MedicareDependentValidator.controls[fieldName].dirty;
    }

    public IsValid(): boolean {
        if (this.MedicareDependentValidator.valid) { return true; } else { return false; }
    }

    public IsValidCheck(fieldName, validator): boolean {
        if (this.MedicareDependentValidator.valid) {
            return true;
        }
        if (fieldName == undefined)
            return this.MedicareDependentValidator.valid;
        else
            return !(this.MedicareDependentValidator.hasError(validator, fieldName));
    }
}