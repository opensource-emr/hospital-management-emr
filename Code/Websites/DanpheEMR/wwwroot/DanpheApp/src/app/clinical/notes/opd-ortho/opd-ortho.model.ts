export class OPD_OrthoModel {

    public OrthoNoteId: number = 0;
    public PatientId: number = null;
    public VisitId: number = null;
    public ProviderId: number = null;
    public CreatedOn: string = null;

    public Site_UpperExtrimity: string = null;
    public Site_LowerExtrimity: string = null;
    public Site_Spine: string = null;

    public MainPathology: string = null;
    public History_Onset: string = null;
    public History_Pain: string = null;
    public History_Duration: string = null;
    public History_Past: string = null;
    public History_Family: string = null;
    public History_Treatment: string = null;

    public LocalEx_LocalTemperature: string = null;
    public LocalEx_Tenderness: string = null;
    public LocalEx_Swelling: string = null;
    public LocalEx_Sinuses: string = null;
    public LocalEx_NeighJoints: string = null;
    public LocalEx_MuscularWasting: string = null;
    public LocalEx_ShortnOrLengthnBone: string = null;
    public LocalEx_LymphNode: string = null;
    public LocalEx_WoundCondition: string = null;
    public LocalEx_RangeOfMotion: string = null;
    public LocalEx_SpecialTest: string = null;

    //neurology
    //-> Motors.
    public Neuro_Motor_Rt: string = null;
    public Neuro_Motor_Lt: string = null;
    //-> Sensory.
    public Neuro_Sensory_Rt: string = null;
    public Neuro_Sensory_Lt: string = null;

    public Neuro_Reflexes: string = null;
    public Neuro_AnalSensation: string = null;
    public Neuro_AnalTone: string = null;
    public Neuro_BowelBladder: string = null;

    public Neuro_SLRT_Rt: string = null;
    public Neuro_SLRT_Left: string = null;

    //risk factors
    public RiskFactors: string = null;

    //Investigations
    public Invst_XRay: string = null;
    public Invst_CT: string = null;
    public Invst_MRI: string = null;
    public Invst_Blood: string = null;
    public Invst_Urine: string = null;
    public Invst_Biopsy: string = null;
    public Invst_Others: string = null;

    //scores:
    public Scores_COMI: string = null;
    public Scores_SF36MCS: string = null;
    public Scores_SF36PCS: string = null;
    public Scores_SRS22: string = null;
    public Scores_ODI: string = null;
    public Scores_VAS: string = null;

    //diagnosis -> ICDs
    public Diagnosis: string = null;

    //Treatments
    public Treat_Medication: string = null;
    public Treat_Physio: string = null;

    public Suture_RemovalDate: string = null;
    public OrthoticSupport: string = null;

    public Plan_Conservative: string = null;
    public Plan_Surgery: string = null;

    public FollowupDate: string = null;



    //Site_UpperExtrimity = "Clavicle|Scapula|Shoulder|Arm";


}

