export class BillServiceItem_DTO {
    public ServiceItemId: number = 0;
    public ServiceDepartmentId: number = 0;
    public IntegrationItemId: number = 0;
    public IntegrationName: string = null;
    public ItemCode: string = null;
    public ItemName: string = null;
    public IsTaxApplicable: boolean = false;
    public Description: string = null;
    public DisplaySeq: number = 0;
    public IsDoctorMandatory: boolean = false;
    public IsOT: boolean = false;
    public IsProc: boolean = false;
    public ServiceCategoryId: number = 0;
    public AllowMultipleQty: boolean = false;
    public DefaultDoctorList: string = null;
    public IsValidForReporting: boolean = false;
    public IsErLabApplicable: boolean = false;
    public IsIncentiveApplicable: boolean = false;

    public IsActive: boolean = false;
}