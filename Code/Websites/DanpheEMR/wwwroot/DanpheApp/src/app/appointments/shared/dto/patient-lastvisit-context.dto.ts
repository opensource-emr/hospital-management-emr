//sud:8Sept'21--common class to get patient's latest visit context.

export class PatientLatestVisitContext_DTO {
    public PatientId: number = null;
    public PatientVisitId: number = null;
    public VisitCode: string = null;
    public SchemeId: number = null;
    public PriceCategoryId: number = null;
    public VisitDate: string = null;
    public VisitType: string = null;
    public DepartmentId: number = null;
    public PerformerId: number = null;
    public IsCurrentlyAdmitted: boolean = false;
    public DischargeDate: string = null;
}