export class AccBillingLedgerMapping_DTO {
    public LedgerId: number = 0;
    public LedgerGroupId: number = 0;
    public BillLedgerMappingId: number = 0;
    public LedgerName: string = "";
    public Name: string = ""; //this is different than LedgerName
    public LedgerType: string = "";
    public LedgerCode: string = "";
    public ServiceDepartmentId: number = 0;
    public ServiceDepartmentName: string = "";
    public IsMapped: boolean = false;
    public ItemId: number = 0;
    public ItemName: string = "";
    public ItemCode: string = "";
    public SubLedgerId: number = 0;
    public SubLedgerName: string = "";
    public IsActive: boolean = true;
    public BillingType: string = "";
}