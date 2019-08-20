export class LabReport {

    public LabReportId: number = 0;
    public PatientId: number;
    public PatientCode: string;
    public TemplateId: number;
    public ReceivingDate: string;
    public ReportingDate: string;
    public IsPrinted: boolean = false;
    public Signatories: string;
    public CreatedOn: string;
    public CreatedBy: number;
    public IsActive: boolean = true;
    public ReferredByDr: string = null;
    public Comments: string = null;
    //not mapped 
    public ComponentIdList: Array<number> = new Array<number>();

    public VerificationEnabled: boolean = null;
}
