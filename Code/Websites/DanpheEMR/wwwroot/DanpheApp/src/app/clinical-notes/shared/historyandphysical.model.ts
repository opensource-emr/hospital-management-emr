import { NotesModel } from "./notes.model";
import { SubjectiveNotesModel } from "./subjective-note.model";
import { ObjectiveNotesModel } from "./objective-notes.model";
import { AssessmentAndPlanModel } from "./assessment-and-plan.model";
import { IcdWithOrdersViewModel } from "../../clinical/shared/all-icd-with-orders.viewmodel";


export class HistoryAndPhysicalNote extends NotesModel {
  public NoteType = 'History & Physical ';
  public ReferredBy: string = null;
  public VisitDate: string = null;
  public VisitCode: string = null;
  public SubjectiveNote: SubjectiveNotesModel = new SubjectiveNotesModel();
  public ObjectiveNote: ObjectiveNotesModel = new ObjectiveNotesModel();
  public ClinicalDiagnosis: AssessmentAndPlanModel = new AssessmentAndPlanModel();
  public AllIcdAndOrders: Array<IcdWithOrdersViewModel> = [];
}
