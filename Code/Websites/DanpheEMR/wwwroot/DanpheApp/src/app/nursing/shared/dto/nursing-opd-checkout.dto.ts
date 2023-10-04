import { Visit } from "../../../appointments/shared/visit.model";
import { FinalDiagnosis_DTO } from "./final-diagnosis.dto";

export class NursingOpdCheckOut_DTO {
    public PatientVisitId: number = 0;
    public PatientId: number = 0;
    public PerformerId: number = 0;
    public DepartmentId: number = 0;
    public PerformerName: string = '';
    public DepartmentName: string = '';
    public FollowUpDay: number = 0;
    public ConcludedNote: string = '';
    public DiagnosisList: Array<FinalDiagnosis_DTO> = [];
    public Visit: Visit = new Visit;


}