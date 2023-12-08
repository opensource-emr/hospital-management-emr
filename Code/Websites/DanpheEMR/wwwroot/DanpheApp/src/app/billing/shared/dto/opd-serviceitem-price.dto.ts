export class OpdServiceItemPrice_DTO {
    public DepartmentId: number = 0;
    public DepartmentName: string = null;
    public PerformerId: number = 0;
    public PerformerName: string = null;
    public ServiceDepartmentId: number = 0;
    public ServiceDepartmentName
    public ServiceItemId: number = 0;
    public ItemCode: string = null;
    public ItemName: string = null;
    public PriceCategoryId: number = 0;
    public Price: number = 0;
    public IsTaxApplicable: boolean = false;
    public IsZeroPriceAllowed: boolean = false;
    public IsPriceChangeAllowed: boolean = false;
    public IsDiscountApplicable: boolean = false;
}