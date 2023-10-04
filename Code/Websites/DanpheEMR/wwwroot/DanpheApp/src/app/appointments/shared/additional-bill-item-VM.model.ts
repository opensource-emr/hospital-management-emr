class AdditionalBillItemVMModel {
    public ServiceDeptId: number = 0;
    public ServiceDepartmentName: string = '';
    public ServiceItemId: number = 0;
    public ItemId: number = 0;
    public ItemName: string = '';
    public Price: number = 0;
    public DiscountAmount: number = 0;
    public TotalAmount: number = 0;
    //public SubTotal: number = 0;
    public DiscountApplicable: boolean = false;
    public PriceChangeEnabled: boolean = true;
    public TaxApplicable: boolean = false;
    public DefaultForNewPatient: boolean = false;
    public ShowProviderName: boolean = false;

    public ItmObj = { ItemId: 0, ItemName: null };
    public IsCoPayment: boolean = false;
    public CoPaymentCashPercent: number = 0;
    public CoPaymentCreditPercent: number = 0;
    public CoPaymentCashAmount: number = 0;
    public CoPaymentCreditAmount: number = 0;

}