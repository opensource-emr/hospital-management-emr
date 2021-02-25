export class PHRMStockSummaryReportModel {
    ItemId: number;
    ItemName: string;
    UOMName: string;
    GRItemID: number;
    Purchase: number;
    StartingQuantity: number;
    StartingAmount: number;
    BatchNo: string;
    ExpiryDate: string;
    GRItemPrice: number;
    MRP: number;
    GRIReceivedQuantity: number;
    GRIFreeQuantity: number;
    GRITotalAmount: number;
    RTSQuantity: number;
    RTSFreeAmount: number;
    RTSTotalAmount: number;
    SalesQuantity: number;
    SalesTotalAmount: number;
    ProvisionalQuantity: number;
    ProvisionalTotalAmount: number;
    ReturnQuantity: number;
    ReturnTotalAmount: number;
    StockManageQuantityIn: number;
    StockManageAmountIn: number;
    StockManageQuantityOut: number;
    StockManageAmountOut: number;
    EndingQuantity: number;
    EndingAmount: number;
}
export class PHRMGrandStockTotalModel {
    public OpeningQuantity: number = 0;
    public OpeningAmount: number = 0;
    public Purchase: number = 0;
    public PurchaseAmount: number = 0;
    public PurchaseReturn: number = 0;
    public PurchaseReturnAmount: number = 0;
    public StockManageIn: number = 0;
    public StockManageInAmount: number = 0;
    public StockManageOut: number = 0;
    public StockManageOutAmount: number = 0;
    public Sale: number = 0;
    public SaleAmount: number = 0;
    public SaleReturn: number = 0;
    public SaleReturnAmount: number = 0;
    public ClosingQuantity: number = 0;
    public ClosingAmount: number = 0;
}
