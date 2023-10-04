export class MedicareMembers {
    MedicareMemberId: number = 0;
    MedicareTypeId: number = 0;
    FullName: string = "";
    MedicareInstituteCode: string = "";
    MemberNo: string = "";
    HospitalNo: string = "";
    PatientId: number = 0;
    IsDependent: boolean = false;
    ParentMedicareMemberId: number | null;
    Relation: string = "";
    MedicareStartDate: string = "";
    InsuranceProviderId: number = 0;
    InsurancePolicyNo: string = "";
    DesignationId: number = 0;
    DepartmentId: number = 0;
    DateOfBirth: string = "";
    InActiveDate: string | null;
    IsOpLimitExceeded: boolean = false;
    IsIpLimitExceeded: boolean = false;
    IsActive: boolean = false;
}

export class MedicareMemberBalance {
    MedicareMemberBalanceId: number = 0;
    MedicareMemberId: number = 0;
    OpBalance: number = 0;
    IpBalance: number = 0;
    OpUsedAmount: number = 0;
    IpUsedAmount: number = 0;
    HospitalNo: string = "";
    PatientId: number = 0;
}

export class MedicareTypes {
    MedicareTypeId: number = 0;
    MedicareTypeName: string = "";
    OpCreditAmount: number = 0;
    IpCreditAmount: number = 0;
    IsActive: boolean = false;
}

export class MedicareInstitutes {
    MedicareInstituteId: number = 0;
    MedicareInstituteCode: string = "";
    InstituteName: string = "";
    IsActive: boolean = false;
}

export class MedicareMemberVsMedicareBalanceVM{
    MedicareMemberId: number = 0;
    MedicareTypeId: number = 0;
    FullName: string = "";
    MedicareInstituteCode: string = "";
    MemberNo: string = "";
    HospitalNo: string = ""; 
    PatientId: number = 0;
    IsDependent: boolean = false;
    ParentMedicareMemberId: number = 0;
    Relation: string = "";
    MedicareStartDate: string = "";
    InsuranceProviderId: number = 0;
    InsurancePolicyNo: string = "";
    DesignationId: number = 0; 
    DepartmentId: number = 0; 
    DateOfBirth: string = ""; 
    InActiveDate: string = "";
    IsOpLimitExceeded: boolean = false;
    IsIpLimitExceeded: boolean = false;
    IsActive: boolean = false;
    MedicareBalanceId: number = 0;
    OpBalance: number = 0;
    IpBalance: number = 0;
    OpUsedAmount: number = 0;
    IpUsedAmount: number = 0;
}