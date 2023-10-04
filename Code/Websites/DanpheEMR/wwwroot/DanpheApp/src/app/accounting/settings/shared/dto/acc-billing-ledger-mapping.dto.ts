export class AccBillingLedgerMapping_DTO {
    public LedgerId: number = null;
    public LedgerGroupId: number = null;
    public BillLedgerMappingId: number = null;
    public LedgerName: string = null;
    public Name: string = null; //this is different than LedgerName
    public LedgerType: string = null;
    public LedgerCode: string = null;
    public ServiceDepartmentId: number = null;
    public ServiceDepartmentName: string = null;
    public IsMapped: boolean = false;
    public ItemId: number = null;
    public ItemName: string = null;
    public ItemCode: string = null;
    public SubLedgerId: number = null;
    public SubLedgerName: string = null;
    public IsActive: boolean = true;
    public BillingType: string = "";
}