export class UploadedFile {
    public FileId: number = 0;
    public SystemFeatureName: string = "";
    public PatientId: number = 0;
    public PatientVisitId: number = 0;
    public ClaimCode: number = 0;
    public ReferenceNumber: number = 0;
    public ReferenceEntityType: string = "";
    public FileName: string = "";
    public FileDisplayName: string = "";
    public DisplayName: string = "";
    public FileExtension: string = "";
    public FileLocationFullPath: string = "";
    public FileDescription: string = "";
    public UploadedBy: number = 0;
    public UploadedOn: string = "";
    public IsActive: boolean = true;
    public Size: number = 0;
    public BinaryData: string = "";
}