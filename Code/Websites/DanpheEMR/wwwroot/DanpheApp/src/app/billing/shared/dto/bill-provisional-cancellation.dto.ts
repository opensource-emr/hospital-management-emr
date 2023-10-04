export class BillingProvisionalCancellation_DTO {
    public BillingTransactionItemId: number = 0;
    public ReferenceProvisionalReceiptNo: number = 0;
    public CancellationReceiptNo: number = 0;
    public CancellationFiscalYearId: number = 0;
    public PatientId: number = 0;
    public PatientVisitId: number = 0;
    public BillingType: string = '';
    public VisitType: string = '';
    public ServiceItemId: number = 0;
    public ServiceDepartmentId: number = 0;
    public ItemName: string = '';
    public ItemCode: string = '';
    public IntegrationItemId: number = 0;
    public Price: number = 0;
    public CancelledQty: number = 0;
    public CancelledSubtotal: number = 0;
    public CancelledDiscountPercent: number = 0;
    public CancelledDiscountAmount: number = 0;
    public CancelledTotalAmount: number = 0;
    public PerformerId: number = 0;
    public PrescriberId: number = 0;
    public CancelledCounterId: number = 0;
    public CancellationRemarks: string = '';
    public SchemeId: number = 0;
    public PriceCategoryId: number = 0;
    public CreatedBy: number = 0;

    public IsActive: boolean = true;
    public ModifiedBy: number = 0;

}