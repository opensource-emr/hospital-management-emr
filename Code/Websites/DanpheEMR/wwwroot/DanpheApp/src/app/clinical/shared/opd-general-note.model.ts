import { Notes } from './notes.model';
import { SubjectiveNote } from './subjective-note.model';
import { ObjectiveNote } from './objective-notes.model';
import { IcdWithOrdersViewModel } from './all-icd-with-orders.viewmodel';
import { AssessmentAndPlanModel } from './assessment-and-plan.model';

export class OPDGeneralNote extends Notes {
    public NoteType = 'OPDGeneralNote';
    public ReferredBy: string = null;
    public VisitDate: string = null;
    public VisitCode: string = null;
    public SubjectiveNote: SubjectiveNote = new SubjectiveNote();
    public ObjectiveNote: ObjectiveNote = new ObjectiveNote();

    public ClinicalDiagnosis: AssessmentAndPlanModel = new AssessmentAndPlanModel();
    public AllIcdAndOrders: Array<IcdWithOrdersViewModel> = [];
}
   