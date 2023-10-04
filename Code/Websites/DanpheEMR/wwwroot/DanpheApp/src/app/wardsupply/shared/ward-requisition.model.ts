
import { WardRequisitionItemsModel } from './ward-requisition-items.model'
         
export class WardRequisitionModel {
    public RequisitionId: number = 0;
    public WardId: number = 0;
    public StoreId: number = 0;
    public Status: string = '';
    public ReferenceId: string = '';
    public CreatedBy: number = 0;
    public CreatedOn: string = '';
    public WardRequisitionItemsList: Array<WardRequisitionItemsModel> = new Array<WardRequisitionItemsModel>();
    public ItemId: number = 0;
    public Quantity: number = 0;
    public SubTotal: number = 0;
}
