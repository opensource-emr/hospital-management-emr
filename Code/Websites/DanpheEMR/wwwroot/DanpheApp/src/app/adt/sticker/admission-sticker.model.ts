
export class AdmissionStickerViewModel {
    public PatientCode: string = null;
    public District: string = null;
    public PatientName: string = null;
    public DateOfBirth: string = null;
    public Gender: string = null;
    public Address: string = null;
    public PhoneNumber: string = null;
    public User: string = null;
    //public DateOfBrith: string = null;

    public AdmittingDoctor: string = null;
    public AdmissionDate: string = null;
    public InPatientNo: string = null;
    public Ward: string = null;
    public BedCode: string = null;
    //added below 3 fields to match with Response data from server : sud-6thJan'19
    public CareOfPersonName: string = null;
    public CareOfPersonPhoneNo: string = null;
    public CareOfPersonRelation: string = null;
    public DeptRoomNumber: string = null;
    public Ins_HasInsurance: boolean = false;
    public ClaimCode: number = null;//sud:1-oct'21: Changed datatype from String to Number in all places
    public Ins_NshiNumber: string = null;
    public RequestingDepartmentName: string = null;
}


