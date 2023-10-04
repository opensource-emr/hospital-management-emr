export class RankMembershipwiseAdmittedPatientVM {
  public AdmissionDate: Date;
  public PatientCode: string;
  public VisitCode: string;
  public Rank: string;
  public MembershipName: string;
  public PatientName: string;
  public "Age/Sex": string;
  public Address: string;
  public PhoneNumber: string;
  public DepartmentName: string;
  public BedFeature: string;
  public BedCode: string;

}

export class MembershipModel {
  public MembershipId: number;
  public MembershipName: string;
}

export class RankModel {
  public RankId: number;
  public RankName: string;
}
