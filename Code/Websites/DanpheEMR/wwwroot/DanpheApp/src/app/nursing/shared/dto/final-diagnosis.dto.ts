export class FinalDiagnosis_DTO {
    public FinalDiagnosisId: number = 0;
    public PatientId: number = 0;
    public PatientVisitId: number = 0;
    public ICD10ID: number = 0;
    public IsActive: boolean = true;
    public IsPatientReferred: boolean;
    public ReferredBy: string = "";
}