import { PHRMSubStoreDispatchDetail_DTO } from "./phrm-substore-dispatch-detail.dto";
import { PHRMSubStoreRequisitionDetail_DTO } from "./phrm-substore-requisition-detail.dto";

export class PHRMSubStoreRequisitionDispatchToReceive_DTO {
    Requisition: PHRMSubStoreRequisitionDetail_DTO;
    Dispatch: PHRMSubStoreDispatchDetail_DTO[];
}