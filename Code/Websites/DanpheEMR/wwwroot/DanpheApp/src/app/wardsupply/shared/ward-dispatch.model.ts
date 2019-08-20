import { WardDispatchItemsModel } from './ward-dispatch-items.model'

export class WardispatchModel {
    public DispatchId: number = 0;
    public RequisitionId: number = 0;
    public SubTotal: number = 0;
    public Remark: string = '';
    public CreatedBy: number = 0;
    public CreatedOn: string = '';

    public WardDispatchedItemsList: Array<WardDispatchItemsModel> = new Array<WardDispatchItemsModel>();
}