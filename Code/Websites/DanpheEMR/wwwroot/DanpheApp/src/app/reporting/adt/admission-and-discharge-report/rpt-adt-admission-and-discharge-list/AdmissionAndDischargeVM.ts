export class AdmissionAndDischargeVM{
    public SN :number;
    public  PatientName:string;
    public PatientCode:string;
    public VisitCode:string;
    public AdmissionDate:Date;
    public DepartmentName:string;
    public AdmittingDoctorName:string;
    public WardName:string;
    public BedFeature:string;
    public AdmissionStatus:string;
    public DischargeDate:Date;
    public Number_of_Days:number;
    public BedCode:string;
    public Age_Gender:string;
    public Address:string;
    public Diagnosis:string;
    public DiagnosisList:any[];

}
export class WardModel{
    public WardId : number;
    public WardName : string;
}

export class DepartmentModel{
    public DepartmentId : number;
    public DepartmentName : string;
}

export class BedFeatureModel{
    public BedFeatureId : number;
    public BedFeatureName : string;
}
export class BedOccupancySummaryModel{
    public DepartmentName :string;
    public PreviousDayOccupancy : number;
    public Admission: number;
    public Discharge: number;
    public BedOccupancy:number;
}