export class StockTransaction {
    public StockTxnId: number = 0;
    public StockId: number = 0;
    public StoreId: number = 0;
    public Quantity: number = 0;
    public InOut: string = "";
    public ReferenceNo: number = 0;
    public TransactionType: string = "";
    public CreatedBy: number = 0;
    public CreatedOn: Date = null;
    public requisitionItemId: number = 0;
    public MRP: number;
    public Price: number;
    public ItemId: number;
}
