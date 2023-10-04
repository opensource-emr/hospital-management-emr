export class ICDEmergencyReportingGroup {
    public EMER_ReportingGroupId: number;
    public SerialNumber: number;
    public EMER_ReportingGroupName: string = null;
    public CreatedBy: number;
    public IsActive: boolean;
    public GroupCode: string;
    public IcdVersion: string;
}
export class ICDEmergencyDiseaseGroup {
    public EMER_DiseaseGroupId: number;
    public EMER_ReportingGroupId: number;
    public SerialNumber: number;
    public EMER_DiseaseGroupName: string = null;
    public CreatedBy: number;
    public IsActive: boolean;
    public IcdVersion: string;
    public ICDCode: string;
    public IsPatientReferred: boolean;
    public ReferredBy: string;
    public ReferredTo: string;

}