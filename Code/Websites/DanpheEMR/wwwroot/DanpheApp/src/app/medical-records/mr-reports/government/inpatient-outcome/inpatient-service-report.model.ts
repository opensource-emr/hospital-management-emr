export class InpatientServiceReportModel{
    public InpatientOutcome : Array<InpatientOutcome> = Array<InpatientOutcome>();
    public GestationalWeek_Gravda : Array<GestationalWeekAndGravida> = Array<GestationalWeekAndGravida>();
    public GestationalWeek_MaternalAge : Array<GestationalWeekAndMaternalAge> = Array<GestationalWeekAndMaternalAge>();
    public FreeHealthServiceSummary : Array<FreeHealthServiceSummary> = Array<FreeHealthServiceSummary>();
    public FreeHealthServiceSummary_SSP : Array<FreeServiceAndSocialServiceProgrammeSummary> = Array<FreeServiceAndSocialServiceProgrammeSummary>();
    public DeathSummary : Array<DeathSummary> = Array<DeathSummary>();
    public SurgerySummary : Array<SurgerySummary> = Array<SurgerySummary>();

}

export class InpatientOutcome {
    public AgeRange: string = null;
    // public AdmittedMaleCount: number = null;
    // public AdmittedFemaleCount: number = null;
    public Recovered_Male: number = null;
    public Recovered_Female: number = null;
    public Not_Improved_Male: number = null;
    public Not_Improved_Female: number = null;
    public Referred_Male: number = null;
    public Referred_Female: number = null;
    public LAMA_Male: number = null;
    public LAMA_Female: number = null;
    public Absconded_Male: number = null;
    public Absconded_Female: number = null;
    public Death_Lt48_Male: number = null;
    public Death_Lt48_Female: number = null;
    public Death_Gt48_Male: number = null;
    public Death_Gt48_Female: number = null;
}

//         [22-27]= GestWeek1
//         [28-36]=  GestWeek2
//         [37-41]=  GestWeek3
//         [> 41] = GestWeek4

export class GestationalWeekAndGravida {
    public GravidaName: string = null;
    public GestWeek1: number = null;
    public GestWeek2: number = null;
    public GestWeek3: number = null;
    public GestWeek4: number = null;
}


//         [22-27]= GestWeek1
//         [28-36]=  GestWeek2
//         [37-41]=  GestWeek3
//         [> 41] = GestWeek4

export class GestationalWeekAndMaternalAge {
    public AgeRange: string = null;
    public GestWeek1: number = null;
    public GestWeek2: number = null;
    public GestWeek3: number = null;
    public GestWeek4: number = null;
}


export class FreeHealthServiceSummary {
    public CostExemption: string = null;
    public NoOfPatient: number = null;
    public ExemptedAmount: number = null;
}


export class FreeServiceAndSocialServiceProgrammeSummary {
    public MembershipTypeName: string = null;
    public OutpatientsCount: number = null;
    public InpatientsCount: number = null;
    public ErPatientsCount: number = null;
}

export class DeathSummary {
    public Condition: string = null;
    public MaleCount: number = null;
    public FemaleCount: number = null;
}


export class SurgerySummary {
    public SurgeryDisplayName: string = null;
    public MaleCount: number = null;
    public FemaleCount: number = null;
}