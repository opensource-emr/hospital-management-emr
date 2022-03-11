import { PastMedical } from './past-medical.model';
import { SurgicalHistory } from './surgical-history.model';
import { SocialHistory } from './social-history.model';
import { FamilyHistory } from './family-history.model';
import { Allergy } from './allergy.model';
import { HomeMedication } from './home-medication.model';


export class PatientClinicalDetail {
    public PatientId: number = null;
    public PatientVisitId: number = null;
    public NotesId: number = null;
    public PastMedicals: Array<PastMedical>=[];
    public SurgicalHistory: Array<SurgicalHistory> = [];
    public SocialHistory: Array<SocialHistory> = [];
    public FamilyHistory: Array<FamilyHistory> = [];
    public Allergies: Array<Allergy> = [];
    public Medications:Array<HomeMedication>=[];
}