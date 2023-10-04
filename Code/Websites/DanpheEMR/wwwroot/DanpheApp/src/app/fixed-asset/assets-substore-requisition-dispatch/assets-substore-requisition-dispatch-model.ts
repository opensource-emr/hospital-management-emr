//swapnil-2-april-2021
export class RequisitionForDispatchModel {
    RequisitionId: number=0;
    RequisitionNo: number=0;
    RequisitionStoreId: number=0;
    RequisitionStoreName: string=null;
    RequisitionSubStoreId: number=0;
    RequisitionSubStoreName: string=null;
    RequestedbyName: string=null;
    RequestedOn: string=null;
    RequisitionStatus: string=null;
    RequisitionItems:Array<RequisitionItemDto>= new Array<RequisitionItemDto>();    
}
export class RequisitionItemDto {
    RequisitionItemId: number=0;
    ItemId: number=0;
    ItemName: string=null;
    RequestedQuantity: number =0;
    PendingQuantity: number =0;
    ReceivedQuantity: number =0;
    CancelQuantity: number=0;
    ReuisitionItemStatus: string=null;
    AvailableQuantity: number =0;
    AllocatedStoreRackName: string=null;
    AvailableStockList:Array<AvailableStockDto>= new Array<AvailableStockDto>();
    DispatchedItems:Array<DispatchItemDto>= new Array<DispatchItemDto>();
    IsDispatchingNow: boolean=false;
    IsDispatchForbidden: boolean=false;
    DispatchedQuantity: number =0;
    BarCodeNumber: string =null;
}
export class AvailableStockDto  {
    FixedAssetStockId: number=0;
    BatchNo: string=null;
    BarCodeNumber: string=null;
    VATAmount: number=0;
}
export class DispatchItemDto  {
    BarCodeNumberList:Array<AvailableStockDto>= new Array<AvailableStockDto>();
    SelectedBarCode:any;
    FixedAssetStockId: number=0;
    BatchNo: string=null;
    BarCodeNumber: string=null;
    VATAmount: number=0;
}

