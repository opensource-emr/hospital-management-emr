import { Patient } from '../../patients/shared/patient.model';
import { ICD10 } from '../../clinical/shared/icd10.model';
export class ImagingItemRequisition {

  public ImagingRequisitionId: number = 0;
  public PatientVisitId: number = 0;
  public PatientId: number = 0;
  public ProviderName: string = null;
  public ImagingTypeId: number = 0;
  public ImagingTypeName: string = null;
  public ImagingItemId: number = 0;
  public ImagingItemName: string = null;
  public ProcedureCode: string = null;
  public ImagingDate: string = null;
  public RequisitionRemarks: string = null;
  public OrderStatus: string = null;
  public Urgency: string = "Normal";//setting it as a default
  public ProviderId: number = null;
  public BillingStatus: string = "";

  //Added by Anish While making Diagnosis
  public DiagnosisId: number = 0;

  public HasInsurance: boolean = false;//sud:21Jul'19--For Govt Insurance.
  public WardName: string = null;
}
