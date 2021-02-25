import { SubjectiveNotesModel } from "./subjective-note.model";
import { AssessmentAndPlanModel } from "./assessment-and-plan.model";
import { ICD10 } from "../../clinical/shared/icd10.model";
import { OrderItemsVM } from "../../orders/shared/orders-vms";

export class ClinicalPrescriptionNotesModel {
  public PrescriptionNoteId: number = 0;
  public NotesId: number = 0;
  public PatientId: number = null;
  public PatientVisitId: number = null;
  public FollowUpTime: number = 0;
  public PrescriptionNoteText: string = null;
  public OldMedicationStopped: string = null;
  public NewMedicationStarted: string = null;
  public ICDSelected: string = null;
  public OrdersSelected: string = null;
  public FollowUpUnit: string = null;
  public ICDRemarks: string = null;
  public Remarks: string = null;
  public CreatedBy: number = null;
  public CreatedOn: string = null;  
  public ModifiedBy: number = null;
  public ModifiedOn: string = null;
  public IsActive: boolean = true;

  public ChiefComplaint: string = null;
  public HistoryOfPresentingIllness: string = null;
  public ReviewOfSystems: string = null;

  public SubjectiveNote: SubjectiveNotesModel = new SubjectiveNotesModel();

  public ICDList: Array<ICD10> = [];
  public SelectedOrderItems: Array<OrderItemsVM> = [];

}

