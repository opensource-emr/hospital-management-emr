import * as moment from "moment";
import { ENUM_DateTimeFormat } from "../../shared/shared-enums";

export class LabTestRequisition {
  public RequisitionId: number = 0;
  public PatientId: number = 0;
  public PatientVisitId: number = 0;
  //Ashim: 4Jan2018
  //ProviderId is RequestedBy Dr. from billing/ doctor who gives lab order in Doctors
  // public ProviderId: number = 0;
  public PrescriberId: number = null; // Krishna, 15th,jun'22 , changed ProviderId to PrescriberId.
  public LabTestId: number = 0;
  public ProcedureCode: string = null;
  public LOINC: string = null;
  public LabTestName: string = null;
  public LabTestSpecimen: string = null;
  public LabTestSpecimenSource: string = null;
  public PatientName: string = null;
  public Diagnosis: string = null;
  public Urgency: string = "Normal";//setting it as a default
  public OrderDateTime: string = null;
  // public ProviderName: string = null;
  public PrescriberName: string = null; // Krishna, 15th,jun'22 , changed ProviderName to PrescriberName.
  public BillingStatus: string = null;
  public OrderStatus: string = null;
  public SampleCode: string = null;
  public RequisitionRemarks: string = null;
  public CreatedBy: number = 0;
  public CreatedOn: string = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);
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
  public IsActive: boolean = true;

  public IsVerified: boolean = false;
  public VerifiedBy: number = null;
  public VerifiedOn: string = null;

  public ResultingVendorId: number = 0;
  public HasInsurance: boolean = false;
  public IsSmsSend: boolean = false;

  public IsSelected: boolean = false;
  public ServiceItemId: number = 0;
}

