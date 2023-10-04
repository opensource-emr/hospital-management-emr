
export class AdmissionStickerViewModel {
    public PatientCode: string = null;
    public PatientName: string = null;
    public DateOfBirth: string = null;
    public Gender: string = null;
    public Address: string = null;
    public WardNumber: number = null;
    public MunicipalityName: string = null;
    public CountrySubDivisionName: string = null;
    public CountryName: string = null;
    public PhoneNumber: string = null;
    public User: string = null;
    public MembershipTypeName: string = null;
    public SSFPolicyNo: string = null;
    public PolicyNo: string = null;
    public PriceCategoryName: string = null;
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


