//sud:8Sept'21--common class to get patient's latest visit context.

export class PatientLatestVisitContext {
    public PatientId: number = null;
    public PatientVisitId: number = null;
    public VisitCode: string = null;
    public VisitDate: string = null;
    public VisitType: string = null;
    public DepartmentId: number = null;
    public ProviderId: number = null;
    public IsCurrentlyAdmitted: boolean = false;
    public DischargeDate: string = null;
}