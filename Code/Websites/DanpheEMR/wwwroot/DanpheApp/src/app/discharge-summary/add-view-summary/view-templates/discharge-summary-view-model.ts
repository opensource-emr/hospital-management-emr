import { DischargeSummary } from "../../../../../src/app/adt/shared/discharge-summary.model";

export class DischargeSummaryViewModel {
    public VisitCode : string;
    public DischargeType : string;
    public DeathType: string;
    public BabyBirthDetails: string;    
    public DeliveryType: string;

    public patDischargeSummary: DischargeSummary;

    public NewPendingTests: Array<any> = new Array<any>();  
    public labRequests: Array<any> = Array<any>();
    public selectedDiagnosisList: Array<any> = new Array<any>();
    public selectedProviDiagnosisList: Array<any> = new Array<any>();
    public newMedicines: Array<any> = Array<any>();
    public imagingResults: Array<any> = Array<any>();
    

    public DrInchargeLongSignature: string;    
    public DrInchargeNMC: string;
    public DrInchargeSignImgPath: string;

    public ConsultantLongSignature: string;    
    public ConsultantNMC: string;
    public ConsultantSignImgPath: string;

    public ResidenceDrLongSignature: string;    
    public ResidenceDrNMC: string;
    public ResidenceDrSignImgPath: string;

    public AnaesthetistLongSignature: string;  
    public AnaesthetistNMC: string;    
    public AnaesthetistSignImgPath: string;    

    public selectedADT: any;
    public Address: string;
    public DepartmentName: string;
}