import { LabTestRequisition } from "../../labs/shared/lab-requisition.model";
import { ImagingItemRequisition } from "../../radiology/shared/imaging-item-requisition.model";
import { PHRMPrescriptionItem } from "../../pharmacy/shared/phrm-prescription-item.model";
import { AssessmentAndPlanModel } from "../../clinical-notes/shared/assessment-and-plan.model";

export class IcdWithOrdersViewModel {
    public DiagnosisId: number = 0;
    public NotesId: number = null;
    public PatientId: number = null;
    public PatientVisitId: number = null;

    public ICD10ID: number = null;
    public ICD10Code: string = null;
    public ICD10Description: string = null;


    public AllIcdLabOrders: Array<LabTestRequisition> = [];
    public AllIcdImagingOrders: Array<ImagingItemRequisition> = [];
    public AllIcdPrescriptionOrders: Array<PHRMPrescriptionItem> = [];

    public CreatedBy: number = null;
    public ModifiedBy: number = null;
    public CreatedOn: string = null;
    public ModifiedOn: string = null;
    public IsActive: boolean = true;
    
}
