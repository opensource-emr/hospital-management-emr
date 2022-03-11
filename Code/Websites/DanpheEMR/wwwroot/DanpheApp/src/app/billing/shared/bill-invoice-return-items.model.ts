export class BillInvoiceReturnItemsModel {
    public BillReturnItemId: number = 0;
    public BillReturnId: number = 0; //this is FK, so can't have null value
    public BillingTransactionItemId: number = 0; //this is FK, so can't have null value
    public BillingTransactionId: number = 0; //this is FK, so can't have null value
    public PatientId: number = 0; //this is FK, so can't have null value
    public ServiceDepartmentId: number = 0; //this is FK, so can't have null value
    public ItemId: number = 0; //this is FK, so can't have null value
    public ItemName:string = "";
    public Price: number = null;
    public RetQuantity: number = null;
    public RetSubTotal: number = null;
    public RetDiscountAmount: number = null;
    public RetTaxAmount: number = null;
    public RetTotalAmount: number = null;
    public RetDiscountPercent: number = null;
    public ProviderId: number = null;
    public BillStatus: string = null;
    public RequisitionId: number = null;
    public RequisitionDate: string = null;
    public RetCounterId: number = null;
    public RetRemarks: string = null;
    public RequestedBy: number = null;
    public PatientVisitId: number = null;
    public BillingPackageId: number = null;
    public CreatedBy: number = 0;//this is FK, so can't have null value
    public CreatedOn: string = null;
    public BillingType: string = null;
    public RequestingDeptId: number = null;
    public VisitType: string = null;
    public PriceCategory: string = null;
    public PatientInsurancePackageId: number = null;
    public IsInsurance: boolean = null;
    public DiscountSchemeId: number = null;
    public IsCashBillSyncToAcc: boolean = null;
    public IsCreditBillSyncToAcc: boolean = null;
    public LabTypeName: string = null;

    //below properties are used only in client side.
}

