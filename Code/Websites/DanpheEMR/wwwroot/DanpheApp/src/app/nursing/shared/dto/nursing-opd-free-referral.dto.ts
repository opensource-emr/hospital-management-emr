
import { FinalDiagnosis_DTO } from "./final-diagnosis.dto";

export class NursingOPDFreeReferral_DTO {
    public PatientVisitId: number = 0;
    public PatientId: number = 0;
    public ReferredDoctorId: number = 0;
    public ReferredDepartmentId: number = 0;
    public ReferredDepartment: string = '';
    public ReferredDoctor: string = '';
    public ReferRemarks: string = '';
    public VisitType: string = '';
    public VisitStatus: string = 'initiated';
    public BillingStatus: string = '';
    public AppointmentType: string = '';
    // public TicketCharge: number = 0;

    public DiagnosisList: Array<FinalDiagnosis_DTO> = [];

}