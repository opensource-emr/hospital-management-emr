///sud: 19Jun'18
//To get current Billing context for the patient.
//need to see if this fits for all type of billing requests or not.

export class PatientBillingContextVM {
    public PatientId: number = 0;
    public PatientVisitId: number = null; //added: ashim : 08Aug2018 : to update PatientVisitId in Depoist.
    public BillingType: string = null;//inpatient/outpatient
    public RequestingDeptId: number = null; 
    public Insurance: InsuranceVM = new InsuranceVM();
}

export class InsuranceVM {
    public PatientId: number = null;
    public InsuranceProviderId: number = null;
    public CurrentBalance: number = 0;
    public InsuranceProvisionalAmount: number = 0;
    public InsuranceNumber: number = null;
    public InsuranceProviderName: string = null;
    public IMISCode: string= null;
    public PatientInsurancePkgTxn: PatientInsurancePkgTxnVM = null;
    public Ins_InsuranceBalance:number=0;
    public Remark:string=null;
}
export class PatientInsurancePkgTxnVM {
    public PatientInsurancePackageId: number = null;
    public PackageId: number = null;
    public PackageName: string = null;
    public StartDate: string = null;
}
