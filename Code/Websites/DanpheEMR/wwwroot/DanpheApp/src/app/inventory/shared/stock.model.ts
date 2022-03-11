export class StockModel {

    public StockId: number = 0;
    public GoodsReceiptItemId: number = 0;
    public ItemId: number = 0;
    public BatchNO: string = "";
    public ExpiryDate: string = null;
    public ReceivedQuantity: number = 0;
    public AvailableQuantity: number = 0;
    public AvailQuantity:number= 0;
    public ReceiptDate: Date = null;
    public CreatedBy: number = 0;
    public CreatedOn: Date = null;
    public MRP: number;
    public Price: number;

    //view purpose
    public ReceivedQty: number = 0;
    public curQuantity: number = 0;
    public ModQuantity: number = 0;
    public BatchNo: string = "";
    public canUserManageStock: boolean;
    public IsColdStorageApplicable: boolean;
}