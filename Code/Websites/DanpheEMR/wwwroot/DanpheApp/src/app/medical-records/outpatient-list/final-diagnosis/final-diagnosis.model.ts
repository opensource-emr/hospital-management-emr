import * as moment from "moment";

export class FinalDiagnosisModel {
    public FinalDiagnosisId: number = 0;
    public PatientId: number = 0;
    public PatientVisitId: number = 0;
    public ICD10ID: number = 0;
    // public CreatedBy: number = 1;
    // public CreatedOn: string = moment().format("YYYY-MM-DD");
    public IsActive: boolean = true;
}