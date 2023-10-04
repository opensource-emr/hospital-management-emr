
export class ProgressNotesModel {
  public ProgressNoteId: number = 0;
  public NoteId: number = 0;
  public PatientId: number = 0;
  public PatientVisitId: number = 0;
  public SubjectiveNotes: string = null;
  public ObjectiveNotes: string = null;
  public AssessmentPlan: string = null;
  public Instructions: string = null;
  public CreatedBy: number = null;
  public CreatedOn: string = null;
  public ModifiedBy: number = null;
  public IsActive: boolean = true;
  public ModifiedOn: string = null;

  //public ModifiedBy: number = null;
  //public ModifiedOn: string = null;
}
