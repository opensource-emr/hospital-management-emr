import { Time } from "@angular/common";

export class EmergencyNotesModel {
  public EmergencyNoteId: number = 0;
  public NoteId: number = null;
  public PatientId: number = null;
  public PatientVisitId: number = null;
  public BroughtIn: string = null; // Stretcher/ Wheel Chair / Walking
  public BroughtBy: string = null;
  public Relationship: string = null;
  public PhoneNumber: string = null;
  public ModeOfArrival: string = null;
  public ReferralDoctorOrHospital: string = null;
  public TriageTime: Time = null;
  public TriagedBy: string = null; // done by HA or Nurse
  public Trauma: boolean = false;
  public Disposition: string = null;
  public DispositionDepartmentId: number = null;
  public ErCourseDescription: string = null;
  public CreatedBy: number = null;
  public CreatedOn: string = null;
  public ModifiedBy: number = null;
  public ModifiedOn: string = null;
  public IsActive: boolean = true;
  //public SubjectiveNote: SubjectiveNotesModel = new SubjectiveNotesModel();
  //public ObjectiveNote: ObjectiveNotesModel = new ObjectiveNotesModel();
  //public ClinicalDiagnosis: AssessmentAndPlanModel = new AssessmentAndPlanModel();
  //public AllIcdAndOrders: Array<IcdWithOrdersViewModel> = [];
  //public ErCourse: string = null;
}

