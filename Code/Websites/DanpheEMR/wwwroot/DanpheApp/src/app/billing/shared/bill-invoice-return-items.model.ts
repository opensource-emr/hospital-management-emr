import * as moment from "moment";

export class BillInvoiceReturnItemsModel {
    public BillReturnItemId: number = 0;
    public BillReturnId: number = 0; //this is FK, so can't have null value
    public BillingTransactionItemId: number = 0; //this is FK, so can't have null value
    public BillingTransactionId: number = 0; //this is FK, so can't have null value
    public PatientId: number = 0; //this is FK, so can't have null value
    public ServiceDepartmentId: number = 0; //this is FK, so can't have null value
    public ServiceItemId: number = 0; //this is FK, so can't have null value
    public ItemName: string = "";
    public Price: number = 0;
    public RetQuantity: number = 0;
    public RetSubTotal: number = 0;
    public RetDiscountAmount: number = 0;
    public RetTaxAmount: number = 0;
    public RetTotalAmount: number = 0;
    public RetDiscountPercent: number = 0;
    public PrescriberId: number = null;
    public PerformerId: number = null;
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
    public PriceCategoryId: number = 0;//sud:16Apr'23--New billing Structure
    public PatientInsurancePackageId: number = null;
    public IsInsurance: boolean = false;
    public DiscountSchemeId: number = null;
    public IsCashBillSyncToAcc: boolean = false;
    public IsCreditBillSyncToAcc: boolean = false;
    public LabTypeName: string = null;
    constructor() {
        this.CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");
    }

    //below properties are used only in client side.
}

