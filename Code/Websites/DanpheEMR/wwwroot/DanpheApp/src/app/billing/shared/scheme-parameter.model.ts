
export class SchemeParameters {
  public SchemeParameterId: number = null;
  public SchemeParameterName: string = null;
  public ShowMemberNo: boolean = false;
  public MemberNoLabelName: string = null;
  public EnterMemberNumber: boolean = false;
  public ShowMembershipLoadButton: boolean = false;
  public MembershipLoadButtonDisplayName: string = "Load Policy Details";
  public ShowOpIpBalance: boolean = false;
  public ShowGeneralBalance: boolean = false;
  public SelectEmployer: boolean = false;
  public EnterClaimCode: boolean = false;
  public UseLastClaimCode: boolean = false;
  public ShowClaimCodeInInvoice: boolean = false;
  public ShowPolicyHolderName: boolean = false;
  public PolicyHolderLabelName: string = null;
  public ShowPatientRelationToPolicyHolder: boolean = false;
  public ShowPolicyHolderDesignation: boolean = false;
  public PolicyHolderDesignationLabelName: string = null;
  public ShowDependents: boolean = false;
  public static GetSchemeParamSettings(settingName: string) {
    let retValue: SchemeParameters = new SchemeParameters();

    // settingName = "Medicare";//hardcoded for now..

    if (settingName === "SSF") {
      retValue.SchemeParameterName = "SSF";
      retValue.ShowMemberNo = true;
      retValue.EnterMemberNumber = true;
      retValue.MemberNoLabelName = "Policy No.";
      retValue.ShowMembershipLoadButton = true;
      retValue.MembershipLoadButtonDisplayName = "Load SSF Details";
      retValue.SelectEmployer = true;
      retValue.ShowOpIpBalance = true;
      retValue.ShowGeneralBalance = true;

    }
    else if (settingName === "ECHS") {
      retValue.SchemeParameterName = "ECHS";
      retValue.ShowMemberNo = true;
      retValue.EnterMemberNumber = true;
      retValue.MemberNoLabelName = "ECHS No.";
      retValue.EnterClaimCode = true;
    }
    else if (settingName === "NGHIS") {
      retValue.SchemeParameterName = "NGHIS";
      retValue.ShowMemberNo = true;
      retValue.EnterMemberNumber = true;
      retValue.MemberNoLabelName = "NSHI No.";
      retValue.EnterClaimCode = true;
      retValue.ShowGeneralBalance = true;
    }
    else if (settingName === "Medicare") {
      retValue.SchemeParameterName = "Medicare";
      retValue.ShowMemberNo = true;
      retValue.MemberNoLabelName = "Member No.";
      retValue.ShowOpIpBalance = true;
    }
    else {
      //return default values
    }
    return retValue;
  }

}
