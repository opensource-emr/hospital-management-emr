import { FormBuilder, FormGroup, Validators } from "@angular/forms";

export class MedicareMemberModel {
    public MedicareMemberId: number = 0;
    public ParentMedicareMemberId: number;
    public MedicareTypeId: number = 0;
    public FullName: string = '';
    public ParentName: string = '';
    public Gender: string = '';
    public MedicareInstituteCode: string = '';
    public MedicareTypeName: string = '';
    public MemberNo: number = 0;
    public HospitalNo: string = '';
    public PatientId: number = 0;
    public IsDependent: boolean = false;
    public Relation: string = '';
    public MedicareStartDate: string = '';
    public SchemeId: number;
    public InsurancePolicyNo: string = '';
    public InsuranceProviderId: number;
    public Remarks: string = '';
    public DesignationId: number = 0;
    public LedgerId: number = 0;
    public DepartmentId: number;
    public Age: number;
    public DateOfBirth: string;
    public InActiveDate: string = null;
    public IsIpLimitExceeded: boolean = false;
    public IsOpLimitExceeded: boolean = false;
    public IsActive: boolean = true;
    MedicareMemberValidator: FormGroup = null;


    constructor() {
        let _formBuilder = new FormBuilder();
        this.MedicareMemberValidator = _formBuilder.group({
            'DesignationId': ['', Validators.compose([Validators.required])],
            'Age': ['', Validators.compose([Validators.required])],
            'Gender': ['', Validators.compose([Validators.required])],
            'MedicareStartDate': ['', Validators.compose([Validators.required])],
            'PatientId': ['', Validators.compose([Validators.required])],
            'MedicareInstituteCode': ['', Validators.compose([Validators.required])],
            'MemberNo': ['', Validators.compose([Validators.required])], //* Krishna, 26thJan'23 Need to add more validation for this field max length and min length, allowed characters, etc...
            'MedicareTypeId': ['', Validators.compose([Validators.required])],
            'FullName': ['', Validators.compose([Validators.required])],
            'HospitalNo': ['', Validators.compose([Validators.required])],
            'Remarks': ['', Validators.compose([Validators.required])],
            'DepartmentId': ['', Validators.compose([Validators.required])],
            'InsuranceProviderId': ['', Validators.compose([Validators.required])]
        });
    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.MedicareMemberValidator.dirty;
        else
            return this.MedicareMemberValidator.controls[fieldName].dirty;
    }

    public IsValid(): boolean {
        if (this.MedicareMemberValidator.valid) {
            return true;
        } else {
            return false;
        }
    }

    public IsValidCheck(fieldName, validator): boolean {
        if (this.MedicareMemberValidator.valid) {
            return true;
        }
        if (fieldName == undefined)
            return this.MedicareMemberValidator.valid;
        else
            return !(this.MedicareMemberValidator.hasError(validator, fieldName));
    }
}



export class MedicareInstitute {

    InstituteName: string;
    IsActive: boolean;
    MedicareInstituteCode: string;
    MedicareInstituteId: number;
}

export class MedicalCareType {

    MedicareTypeId: number = 0;
    MedicareTypeName: string = "";
    OpCreditAmount: number = 0;
    IpCreditAmount: number = 0;
    IsActive: boolean = false;
    LedgerId: number = 0;
    IsSelected: boolean = false;
    IsClearable: boolean = false;
    MappedLedgerId: number = 0;

}

