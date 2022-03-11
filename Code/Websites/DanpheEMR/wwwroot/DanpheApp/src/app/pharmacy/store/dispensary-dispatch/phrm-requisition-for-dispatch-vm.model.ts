export class RequisitionForDispatchModel {
    RequisitionId: number;
    RequisitionNo: number;
    RequestingDispensaryId: number;
    RequestingDispensaryName: string;
    RequisitionItems: RequisitionItemDto[];
}
class RequisitionItemDto {
    RequisitionItemId: number;
    ItemId: number;
    ItemName: string;
    RequestedQuantity: number | null;
    PendingQuantity: number | null;
    AllocatedStoreRackName: string;
    AvailableStockList: AvailableStockDto[];
    DispatchedItems: DispatchItemDto[];
    IsDispatchingNow: boolean;
    IsDispatchForbidden: boolean;
}
class UniqueStockIdentifier {
    BatchNo: string;
    ExpiryDate: string;
    MRP: number;
    CostPrice : number;
    AvailableQuantity: number;
}
class AvailableStockDto extends UniqueStockIdentifier {
}

export class DispatchItemDto extends UniqueStockIdentifier {
    DispatchedQuantity: number;
}
export class DispatchItemModel {
    DispatchItemsId: number = 0;
    DispatchId: number = 0;
    DispensaryId: number;
    ItemId: number;
    RequisitionId: number;
    RequisitionItemId: number;
    DispatchedQuantity: number;
    ReceivedBy: string;
    Remarks: string;
    BatchNo: string;
    ExpiryDate: string;
    MRP: number;
    CostPrice: number;
}