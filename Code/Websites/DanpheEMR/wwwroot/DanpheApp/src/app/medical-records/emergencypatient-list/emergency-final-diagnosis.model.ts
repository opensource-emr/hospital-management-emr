import * as moment from "moment";

export class EmergencyFinalDiagnosisModel {
    public FinalDiagnosisId: number = 0;
    public PatientId: number = 0;
    public PatientVisitId: number = 0;
    public EMER_DiseaseGroupId: number = 0;
    // public CreatedBy: number = 1;
    // public CreatedOn: string = moment().format("YYYY-MM-DD");
    public IsActive: boolean = true;
    public IsPatientReferred: boolean;
    public ReferredBy: string = "";
    public ReferredTo: string = "";
}