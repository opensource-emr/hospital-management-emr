export class ConsultationRequestModel {
    public ConsultationRequestId: number = 0;
    public PatientId: number = 0;
    public PatientVisitId: number = 0;
    public WardId: number = 0;
    public BedId: number = 0;
    public RequestedOn: string = null;
    public RequestingConsultantId: number = 0;
    public RequestingDepartmentId: number = 0;
    public PurposeOfConsultation: string = null;
    public ConsultingDoctorId: number = 0;
    public ConsultingDepartmentId: number = 0;
    public ConsultantResponse: string = null;
    public ConsultedOn: string = null;
    public Status: string = null;
    public IsActive: boolean = false;
}
