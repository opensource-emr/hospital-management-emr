export class PharmacyItem_DTO {
    public ItemId: number;
    public ItemName: string;
    public GenericId: number;
    public GenericName: string;
    public PackingTypeId: number;
    public PurchaseRate: number;
    public SalesRate: number;
    public CCCharge: number;
    public PurchaseDiscount: number;
    public IsVATApplicable: boolean;
    public PurchaseVATPercentage: number;
    public SalesVATPercentage: number;
    public ABCCategory: string
    public VED: string;
    public IsActive: boolean;
    public RackNoDetails: string[];
}
