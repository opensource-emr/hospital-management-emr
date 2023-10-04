export class PharmacySubStoreRequisitionItemVerification_DTO {
    public RequisitionItemId: number;
    public ItemId: number;
    public ItemName: string;
    public Quantity: number;
    public PendingQuantity: number;
    public RequisitionId: number;
    public RequisitionItemStatus: string;
    public Remark: string;
    public CancelQuantity: number;
    public CancelledBy: number;
    public CancelledOn: string;
    public CancelRemarks: string;
    public Unit: string;
    public IsActive: boolean = false;
    public IsEdited: boolean = false;
}
