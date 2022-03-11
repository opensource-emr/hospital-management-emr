
export class SSU_InformationModel {
    public SSU_InfoId: number = 0;
    public PatientId: number;
    public TargetGroupId: number = 0;
    public TargetGroup: string;
    public TG_CertificateType: string;
    public TG_CertificateNo: string;
    public IncomeSource: string = '';
    public PatFamilyFinancialStatus: string = '';
    public CreatedOn: string;
    public CreatedBy: number;
    public ModifiedOn: string;
    public ModifiedBy: number;
}
