
import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms'

export class HemodialysisModel {
    
    public HemodialysisRecordId: number = 0;

    public PatientId: number = 0;
    public PatientVisitId: number = 0;
    public Diagnosis: string = "";
    public Schedule: string = "";
    public NextHD: Date = new Date();
    public CurrentHdDate: Date = new Date();
    public IdNo: string = "";
    public HdNo: string = "";

    public TreatmentOrder_DryWeight: string = "";
    public TreatmentOrder_DialysisFlow: string = "";
    public TreatmentOrder_Blood: string = "";
    public TreatmentOrder_TimeInMin: string = "";
    public TreatmentOrder_UsedNo: string = "";
    public TreatmentOrder_BloodTransfusion: string = "";
    public TreatmentOrder_HeparineSaline_Circulation: string = "";
    public TreatmentOrder_HeparineSaline_Bolus: string = "";
    public TreatmentOrder_HeparineSaline_Continuous: string = "";

    public VascularAccess_AVF: boolean = false;
    public VascularAccess_Subclavian: boolean = false;
    public VascularAccess_Jugular: boolean = false;
    public VascularAccess_FemoralCatheter: boolean = false;
    public VascularAccess_PermCath: boolean = false;

    public BloodTrans_BloodGroup: string = "";
    public BloodTrans_Today: string = "";
    public BloodTrans_BagNo: string = "";
    public BloodTrans_NextBT: boolean = false;
    public BloodTrans_CollectionDate: Date = new Date();
    public BloodTrans_ExpDate: Date = new Date();

    public TreatmentData_PreWeight: string = "";
    public TreatmentData_PostWeight: string = "";
    public TreatmentData_PreTemperature: string = "";
    public TreatmentData_PostTemperature: string = "";
    public TreatmentData_PrePulse: string = "";
    public TreatmentData_PostPulse: string = "";
    public TreatmentData_PreStandBp: string = "";
    public TreatmentData_PostStandBp: string = "";
    public TreatmentData_PreSitBp: string = "";
    public TreatmentData_PostSitBp: string = "";
    public TreatmentData_UfGoal: string = "";
    public TreatmentData_MachineNo: string = "";
    public TreatmentData_Machine_Conductivity: string = "";
    public TreatmentData_Machine_Temperature: string = "";
    public TreatmentData_Machine_MachineCheck: string = "";
    public TreatmentData_Initials: string = "";
    public TreatmentData_PreLab: string = "";
    public TreatmentData_PostLab: string = "";
    public TreatmentData_Hb_PcV: string = "";
    public TreatmentData_BloodSugar: string = "";
    public TreatmentData_TimeOn: string = "";
    public TreatmentData_TimeOn_By: string = "";
    public TreatmentData_TimeOff: string = "";
    public TreatmentData_TimeOff_By: string = "";

    public OnExamination_Pallor: string = "";
    public OnExamination_Ictercus: string = "";
    public OnExamination_JVP: string = "";
    public OnExamination_Rash: string = "";
    public OnExamination_Lymphnode: string = "";
    public OnExamination_Chest: string = "";
    public OnExamination_CVS: string = "";
    public OnExamination_PA: string = "";
    public OnExamination_SPo2: string = "";
    public OnExamination_Others: string = "";

    public ChiefComplaint: string = "";
    public Comments_Drugs: string = "";
    public PostDialysisAssesment: string = "";

    public TotalBloodVolume: string = "";
    public TotalHeparin_Saline: string = "";
    public TotalFluidRemoved: string = "";
    public WeightDifference: string = "";
    public PtSentToHospital: string = "";
    public PtSentToHome: string = "";
    public IsDialyzerDiscard: boolean = false;

    public IsSubmitted: boolean = false;
    public IsSubmittedOn: Date = new Date();

    public CheckedByName: string = "";
    public VerifiedByName: string = "";

    public SignatoryName_1: string = "";
    public SignatoryName_2: string = "";

    public CreatedOn: Date = new Date();
    public CreatedBy: number = 0;

    public ModifiedOn: Date = new Date();
    public ModifiedBy: number = 0;

    public IsActive: boolean = false;

    constructor() {
    }
    
}