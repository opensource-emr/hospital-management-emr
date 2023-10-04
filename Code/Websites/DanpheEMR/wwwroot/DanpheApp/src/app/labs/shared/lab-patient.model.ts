export class LabPatientModel {
    public PatientId: number = 0;
    public PatientNo: number = 0;//added: sud-24May'18
    public Salutation: string = null;
    public FirstName: string = "";
    public MiddleName: string = null;
    public LastName: string = "";
    public DateOfBirth: string = null;
    public Gender: string = null;
    public PreviousLastName: string = null;
    public WardName: string = "";
    public BedNo: number = 0;
    //try to hide the audit trail properties from client models..sudarshan:15July
    public CreatedOn: string = null;
    public CreatedBy: number = null;
    public ModifiedOn: string = null;
    public ModifiedBy: number = null;
    public MaritalStatus: string = null;
    public EMPI: string = null;
    //this shortname =  FirstName+' '+LastName. created for common usage purpose. 
    public ShortName: string = null;
    public Race: string = null;
    public PhoneNumber: string = "";
    public PhoneAcceptsText: boolean = false;
    public IDCardNumber: string = null;
    public EmployerInfo: string = null;
    public Occupation: string = null;
    public EthnicGroup: string = null;
    public BloodGroup: string = null;
    public Email: string = null;
    public CountryId: number = 0;
    public CountrySubDivisionId: number = null;
    public Age: string = null;
    public AgeUnit: string = 'Y'; //used only in client side
    public IsDobVerified: boolean = false;//seetting it to false for nepal where mostly they use Age..
    public PatientCode: string = null;
    public IsActive: boolean = true;
    public IsOutdoorPat: boolean = null;
    public PatientNameLocal: string = "";
    public Address: string = null;

    //display purpose only
    public CountrySubDivisionName: string = null;
}