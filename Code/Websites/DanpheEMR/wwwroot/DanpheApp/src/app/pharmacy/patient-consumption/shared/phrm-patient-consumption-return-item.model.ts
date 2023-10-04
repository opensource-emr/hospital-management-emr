import * as moment from "moment";

export class PHRMPatientConsumptionReturnItem {
    public PatientConsumptionReturnItemId: number = 0;
    public PatientConsumptionItemId: number = 0;
    public PatientConsumptionId: number = 0;
    public PatientId: number = null;
    public PatientVisitId: number = null;
    public VisitType: string = "";
    public ItemId: number = null;
    public ItemName: string = "";
    public GenericId: number = null;
    public GenericName: string = "";
    public BatchNo: string = "";
    public ExpiryDate: string = "";
    public Quantity: number = null;
    public SalesPrice: number = null;
    public FreeQuantity: number = null;
    public SubTotal: number = 0;
    public DiscountPercentage: number = 0;
    public DiscountAmount: number = 0;
    public VatPercentage: number = 0;
    public VatAmount: number = 0;
    public Remarks: string = "";
    public CounterId: number = null;
    public StoreId: number = null;
    public PrescriberId: number = null;
    public PriceCategoryId: number = 1;
    public SchemeId: number = 1;
    public CreatedBy: number = 0;
    public CreatedOn: string = moment().format('YYYY-MM-DD');
    public IsActive: boolean = null;
}