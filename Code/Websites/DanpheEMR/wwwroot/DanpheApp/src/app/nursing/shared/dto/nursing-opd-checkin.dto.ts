
import { ChiefComplaints_DTO } from "./chief-complaints.dto";
import { FinalDiagnosis_DTO } from "./final-diagnosis.dto";

export class NursingOpdCheckIn_DTO {
    public PatientVisitId: number = 0;
    public PatientId: number = 0;
    public PerformerId: number = null;
    public PerformerName: string = null;
    public DiagnosisList: Array<FinalDiagnosis_DTO> = [];
    public ChiefComplaints: Array<ChiefComplaints_DTO> = [];

}