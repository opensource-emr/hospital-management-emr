import { DischargeSummary } from "../../../../../src/app/adt/shared/discharge-summary.model";
import { DischargeSummaryConsultantViewModel } from "../../../adt/shared/consultant-view-model";

export class DischargeSummaryViewModel {
    public VisitCode: string;
    public DischargeType: string;
    public DeathType: string;
    public BabyBirthDetails: string;
    public DeliveryType: string;

    public patDischargeSummary: DischargeSummary;

    public NewPendingTests: Array<any> = new Array<any>();
    public labRequests: Array<any> = Array<any>();
    public LabTests: Array<any> = Array<any>();
    public selectedDiagnosisList: Array<any> = new Array<any>();
    public selectedProviDiagnosisList: Array<any> = new Array<any>();
    public newMedicines: Array<any> = Array<any>();
    public imagingResults: Array<any> = Array<any>();


    public DrInchargeLongSignature: string;
    public DrInchargeNMC: string;
    public DrInchargeSignImgPath: string;
    public DoctorInchargeName: string;

    public Consultants: Array<DischargeSummaryConsultantViewModel> = new Array<DischargeSummaryConsultantViewModel>();


    public ResidenceDrLongSignature: string;
    public ResidenceDrNMC: string;
    public ResidenceDrSignImgPath: string;

    public AnaesthetistLongSignature: string;
    public AnaesthetistNMC: string;
    public AnaesthetistSignImgPath: string;

    public selectedADT: any;
    public Address: string;
    public DepartmentName: string;
    public CreatedBy: string;
    public ConsultantName: string = null;
    public ConsultantNMC: string = null;

    public DischargeConditionType: string; //Bikesh: 26-jul'23 for dynamic discharge summary
    public DischargeConditionId: string;
    public BabyWeight: string;
    public ResidenceDrName: string;
    public Anaesthetists: string;

}