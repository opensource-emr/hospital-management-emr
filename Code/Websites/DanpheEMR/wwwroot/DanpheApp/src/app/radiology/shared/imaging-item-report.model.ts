import { Patient } from '../../patients/shared/patient.model';

export class ImagingItemReport {
  public ImagingReportId: number = 0;
  public ImagingRequisitionId: number = 0;
  public PatientVisitId: number = 0;
  public PatientId: number = 0;
  public ProviderName: string = null;
  public ProviderId: number = null;
  public ImagingItemId: number = 0;
  public ImagingItemName: string = null;
  public ImagingTypeId: number = 0;
  public ImagingTypeName: string = null;
  public ImageFullPath: string = "";
  public ImageName: string = "";
  public ReportText: string = "";
  public CreatedOn: string = null;
  public Signatories: string;
  public OrderStatus: string = "";
  public ReportingDoctorId: number = null;
  public ReportTemplateId: number = null;
  public TemplateName: string = "Not Set";//default value for template.
  public CreatedBy: number = null;
  public ModifiedBy: number = null;
  public ModifiedOn: number = null;
  public PatientStudyId: string = "";
  public Patient: Patient = new Patient();

  //only for client side use
  public IsShowButton: boolean = false;
  public ReportingDoctorName: string = null;

  public Indication: string = null;

  public ReportingDoctorNamesFromSignatories: string = null;
  public FooterText: string = null;
  public HasInsurance: boolean = null;
  public WardName: string = null;
  public IsActive: boolean = true;
  public IsScanned: boolean = true;
  public ScannedBy: number = null;
  public ScannedOn: string = null;

  public ProviderIdInBilling: string = null;
  public ProviderNameInBilling: string = null;

}

export class ImagingReportViewModel {
  public PatientId: number = null;//sud:14Jan'19--for Edit Report
  public PatientCode: string = null;//sud:16Jul'19--needed for edit report.
  public ReportTemplateId: number = null;
  public TemplateName: string = "Not Set";//default value for template.
  public Muncipality : string = null;
  public CountrySubDivision : string = null;
  public PatientNameLocal: string = null;
  public BillingDate:string = null;
  public ImagingReportId: number = null;
  public ImagingItemName: string = null;
  public ImagingTypeName: string = null;
  public CreatedOn: string = null;
  public ReportText: any = null;
  public ImageName: string = null;
  public DoctorSignatureJSON: string = null;
  public Signatories: string = null;
  public PatientName: string = null;
  public PhoneNumber: string = null;
  public DateOfBirth: string = null;
  public Gender: string = null;
  public Address: string = null;
  public PatientStudyId: string = "";
  public Indication: string = null;
  public RadiologyNo: string = null;

  public ProviderName: string = null;
  public ProviderId: number = null;

  public SignatoryImageBase64: string = null;
  public FooterText: string = null;
  public currentLoggedInUserSignature: string = null;
}

export class RadiologyScanDoneDetail {
  public ImagingRequisitionId: number = 0;  
  public ScannedOn: string = "";
  public Remarks: string = "";
  public PatientCode: string = "";
  public ShortName: string = "";
  public FilmTypeId:number = null;
  public FilmQuantity:number = null;
}
