import { ICD10 } from "../../clinical/shared/icd10.model";

export class LabTestRequisition {
  public RequisitionId: number = 0;
  public PatientId: number = 0;
  public PatientVisitId: number = 0;
  //Ashim: 4Jan2018
  //ProviderId is RequestedBy Dr. from billing/ doctor who gives lab order in Doctors
  public ProviderId: number = 0;
  public LabTestId: number = null;
  public ProcedureCode: string = null;
  public LOINC: string = null;
  public LabTestName: string = null;
  public LabTestSpecimen: string = null;
  public LabTestSpecimenSource: string = null;
  public PatientName: string = null;
  public Diagnosis: string = null;
  public Urgency: string = "Normal";//setting it as a default
  public OrderDateTime: string = null;
  public ProviderName: string = null;
  public BillingStatus: string = null;
  public OrderStatus: string = null;
  public SampleCode: string = null;
  public RequisitionRemarks: string = null;
  public CreatedBy: number = null;
  public CreatedOn: string = null;
  public SampleCreatedBy: number = null;
  public SampleCreatedOn: string = null;
  public SampleCollectedOnDateTime: string = null;
  public Comments: string = "";
  public ReportTemplateId: number = 0;
  public RunNumberType: string = null;
  public BillCancelledBy: number = null;
  public BillCancelledOn: string = null;
  public LabTypeName: string = null;

  //Added by Anish While making Diagnosis
  public DiagnosisId: number = 0;
  //added: ashim: 18Sep2018
  public VisitType: string = null;
  public LabReportId: number = null;
  public WardName: string = null;
  public IsActive: boolean = null;

  public IsVerified: boolean = null;
  public VerifiedBy: number = null;
  public VerifiedOn: string = null;

  public ResultingVendorId: number = 0;
  public HasInsurance: boolean = false;
  public IsSmsSend: boolean = false;

  public IsSelected: boolean = false;
}

