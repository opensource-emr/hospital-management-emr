export class Patient_DTO {
  public PatientId: number = 0;
  public PatientCode: string = "";
  public ShortName: string = "";
  public FirstName: string = "";
  public LastName: string = "";
  public MiddleName: string = "";
  public Age: string = "";
  public CountryName: string = "";
  public Gender: string = "";
  public PhoneNumber: string = "";
  public DateOfBirth: string = "";
  public Address: string = "";
  public IsOutdoorPat: boolean = false;
  public CreatedOn: string = "";
  public CountryId: number = 0;
  public CountrySubDivisionId: number = 0;
  public CountrySubDivisionName: string = "";
  public MembershipTypeId: number = 0;
  public SchemeName: string = "";
  public PANNumber: string = "";
  public BloodGroup: string = "";
  public DialysisCode: number = 0;
  public IsAdmitted: boolean = false;
  public WardName: string = "";
  public BedCode: string = "";
  public BedNumber: string = "";
  public VisitCode: string = "";
  public VisitType: string = '';
  public PatientVisitId: number = 0;
  public Insurance: number = 0;
  public MedicareMemberNo: string = "";
  public PolicyNo: string = "";
  public MedicareEmployeeName: string = "";
  public Designation: string = "";
  public Relation: string = "";

  //*Krishna, 8thMay'23, Below Property are added due to their need in SchemeRefund
  public SchemeId: number = null;
}
