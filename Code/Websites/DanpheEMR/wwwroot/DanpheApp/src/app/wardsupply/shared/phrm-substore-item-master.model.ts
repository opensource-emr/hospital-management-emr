import { FormGroup } from '@angular/forms';

export class PHRMSubStoreItemMasterModel {
    public ItemId: number = 0;
    public ItemName: string = null;
    public ItemCode: string = null;
    public CompanyId: number = 0;
    public SupplierId: number = null;
    public ItemTypeId: number = 0;
    public UOMId: number = null;
    public ReOrderQuantity: number = 0;
    public MinStockQuantity: number = 0;
    public BudgetedQuantity: number = 0;
    public PurchaseVATPercentage: number = 0;
    public SalesVATPercentage: number = 0;
    public IsVATApplicable: boolean = false;
    public PackingTypeId: number = null;
    public CreatedBy: number = null;
    public CreatedOn: string = null;
    public ModifiedBy: number = null;
    public ModifiedOn: string = null;
    public IsActive: boolean = true;
    public IsInternationalBrand: boolean = false;
    public GenericId: number = 0;
    public ABCCategory: string;
    public Dosage: string;
    public StoreRackId: number = null;
    public VED: string;
    public SalesCategoryId: number = null;
    public CCCharge: number = 0;
    public ItemValidator: FormGroup = null;
    public IsNarcotic: boolean = false;
    public IsInsuranceApplicable: boolean = false;
    public GovtInsurancePrice: number;
    public GenericName: string;
    public UOMName: string;
    public AvailableQuantity: number = 0;
}