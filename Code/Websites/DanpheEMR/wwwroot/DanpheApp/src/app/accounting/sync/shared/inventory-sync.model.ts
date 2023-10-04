import { NgForm } from '@angular/forms';

export class InventorySyncModel {
    public GoodsReceiptDate: string = null;
    public VendorName: string = null;
    public Remarks: string = null;
    public TotalAmount: number = null;
    public GoodsReceiptItems: Array<{
        GoodsReceiptItemId: number,
        BatchNo: string,
        ExpiryDate: string,
        ReceivedQuantity: number,
        FreeQuantity: number,
        RejectedQuantity: number,
        ItemRate: number,
        VATAmount: number,
        TotalAmount: number,
        ItemId: number,
        ItemName:string
    }>;
    public IsSelected: boolean = true;
}
