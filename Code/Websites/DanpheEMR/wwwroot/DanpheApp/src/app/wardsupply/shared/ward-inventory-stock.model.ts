export class WARDInventoryStockModel {
    StockId: number;
    StoreId: number;
    SubstoreId: number;
    GoodsReceiptItemId: number;
    ItemId: number;
    AvailableQuantity: number;
    MRP: number;
    Price: number | null;
    BatchNo: string;
    ExpiryDate: string | null;
    DepartmentId: number | null;
    CreatedBy: number;
    CreatedOn: string;
    DispachedQuantity: number | null;
    ItemName: string;
    Remarks: string;
    UnConfirmedQty: number;
}