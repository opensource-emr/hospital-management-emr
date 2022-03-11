export class ItemMaster {
  public ItemId: number = 0;
  public ItemCategoryId: number = 0;
  public SubCategoryId: number = 0;
  public ItemUsageId: number = 0;
  public PackagingTypeId: number = 0;
  public ItemName: string = "";
  public ItemType: string = null;
  public Description: string = null;
  public ReOrderQuantity: number = null;
  public UnitOfMeasurementId: number = 0;
  public MinStockQuantity: number = 0;
  public BudgetedQuantity: number = 0;
  public StandardRate: number = 0;
  public VAT: number = 0;
  public CreatedBy: number = null;
  public CreatedOn: string = null;
  public IsActive: boolean = false;
  public UnitQuantity: string = null;
  public Code:string=null;
  public UOMName: string = null;
  public MSSNO: string = null;
  public HSNCODE: string = null;
  public AvailableQuantity: number;
}
