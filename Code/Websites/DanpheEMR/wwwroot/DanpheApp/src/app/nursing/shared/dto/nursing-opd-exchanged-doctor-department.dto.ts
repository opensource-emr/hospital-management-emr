
import { FinalDiagnosis_DTO } from "./final-diagnosis.dto";

export class NursingOPDExchangedDoctorDepartment_DTO {
    public PatientVisitId: number = 0;
    public ExchangedDoctorId: number = 0;
    public ExchangedDepartmentId: number = 0;
    public ExchangedDoctorName: string = '';
    public ExchangedRemarks: string = '';
    public DiagnosisList: Array<FinalDiagnosis_DTO> = [];
}