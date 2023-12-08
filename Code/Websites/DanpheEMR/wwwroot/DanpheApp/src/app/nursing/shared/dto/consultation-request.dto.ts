export class ConsultationRequestDTO {
    public ConsultationRequestId: number = null;
    public PatientId: number = null;
    public PatientVisitId: number = null;
    public WardId: number = null;
    public BedId: number = null;
    public RequestedOn: string = null;
    public RequestingConsultantId: number = null;
    public RequestingDepartmentId: number = null;
    public PurposeOfConsultation: string = null;
    public ConsultingDoctorId: number = null;
    public ConsultingDepartmentId: number = null;
    public ConsultantResponse: string = null;
    public ConsultedOn: string = null;
    public Status: string = null;
    public CreatedBy: number = null;
    public CreatedOn: string = null;
    public ModifiedBy: number = null;
    public ModifiedOn: string = null;
    public IsActive: boolean = false;
}
