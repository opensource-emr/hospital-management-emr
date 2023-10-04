import { NepaliDate } from "../../shared/calendar/np/nepali-dates";
//Yubaraj : 19th Nov 2018-- Admission cancel view model

//Yubaraj: 19th NOv 2018== Admission Information View Model
export class AdmissionInfoVM {
    //Patient Model
    public PatientName: string = null;
    public PatientCode: string = null;
    public PhoneNumber: string = null;
    public Address: string = null;
    public DateOfBirth: string = null;
    public Gender: string = null;
    //PatientVisit Model
    public VisitCode: string = null;
    //Admission Model
    public AdmissionDate: string = null;
    //Deposit Model
    public DepositId: number = null;
    public DepositBalance: number;
    //PatientBedInfo
    public BedCode: string = null;
    public WardName: string = null;

}

export class AdmissionCancelVM {
    public PatientId: number = null;
    public PatientVisitId: number = null;
    public CancelledOn: string = null;
    public CancelledRemark: string = null;

    public cancelDateNepali: NepaliDate = null; //only used in client side.
    //public BillItemSummary: Array<BillItemSummary> = new Array<BillItemSummary>();
    //public TotalAmount: number = 0;
}

export class PatientBedInfoVM {
    public WardName: string = null;
    public BedNumber: number = null;
    public BedCode: string= null;
    public PatientBedInfoId: number = null;
    public PatientVisitId: number = null;
    public StartedOn: string = null;
    public EndedOn: string = null;
    public Action: string = null;
}

export class AdmittingDocInfoVM {
    public PatientVisitId: number = null;
    public AdmittingDoctorId: number = null;
    public AdmittingDoctorName: string = null;
    public Department: string = null;
    public DepartmentId: number = null;
    public EmployeeId: number = null;
    public Name:string="";
    public PatientCode:string="";
}