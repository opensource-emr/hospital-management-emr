import { SubStoreRequisitionItems_DTO } from "./substore-requisition-item.dto";

export class SubStoreRequisition_DTO {
    CreatedOn: string = null;
    RequisitionNo: number = null;
    IssueNo: number = null;
    DispatchNo: number = null;
    CreatedByName: string = null;
    ReceivedBy: string = null;
    Remarks: string = null;
    RequisitionStatus: string = null;
    IsDirectDispatched: boolean = false;
    verificationId: number = null;
    RequisitionItems: SubStoreRequisitionItems_DTO[];
}