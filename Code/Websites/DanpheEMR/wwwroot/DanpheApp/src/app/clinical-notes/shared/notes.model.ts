import { EmergencyNotesModel } from "./emergency-note.model";
import { ProcedureNotesModel } from "./procedure-note.model";
import { SubjectiveNotesModel } from "./subjective-note.model";
import { ObjectiveNotesModel } from "./objective-notes.model";
import { FreeTextNotesModel } from "./freetext.model";
import { AssessmentAndPlanModel } from "./assessment-and-plan.model";
import { IcdWithOrdersViewModel } from "../../clinical/shared/all-icd-with-orders.viewmodel";

import * as moment from "moment/moment"
import { DischargeSummary } from "../../adt/shared/discharge-summary.model";
import { ProgressNotesModel } from "./progress-note.model";
import { ClinicalPrescriptionNotesModel } from "./clinical-prescription-note.model";
export class NotesModel {
  public NotesId: number = 0;
  public PatientVisitId: number = null;
  public SecondaryDoctorId: number = null;
  public PatientId: number = null;
  public ProviderId: number = null;
  public TemplateId: number = null;
  public TemplateName: string = null;
  public NoteTypeId: number = null;
  public Remarks: string = null;
  public IsPending: boolean = null;
  public Date: string = moment().format("YYYY-MM-DD");
  public CreatedBy: number = null;
  public ModifiedBy: number = null;
  public CreatedOn: string = null;
  public ModifiedOn: string = null;
  public FollowUp: number = null;
  public FollowUpUnit: string = "day";
  public FreeTextNote: FreeTextNotesModel = new FreeTextNotesModel();
  public EmergencyNote: EmergencyNotesModel = new EmergencyNotesModel();
  public ProcedureNote: ProcedureNotesModel = new ProcedureNotesModel();
  public ProgressNote: ProgressNotesModel = new ProgressNotesModel();
  public DischargeSummaryNote: DischargeSummary = new DischargeSummary();

  //models for history and physical note
  public SubjectiveNote: SubjectiveNotesModel = new SubjectiveNotesModel();
  public ObjectiveNote: ObjectiveNotesModel = new ObjectiveNotesModel();
  public ClinicalDiagnosis: AssessmentAndPlanModel = new AssessmentAndPlanModel();
  public ClinicalPrescriptionNote: ClinicalPrescriptionNotesModel = new ClinicalPrescriptionNotesModel();

  //for assessment and plan - orders preparation
  public AllIcdAndOrders: Array<IcdWithOrdersViewModel> = [];

  public RemovedIcdAndOrders: Array<IcdWithOrdersViewModel> = [];


  //used in receive note
  public ReceivedOn: string = null;

}
