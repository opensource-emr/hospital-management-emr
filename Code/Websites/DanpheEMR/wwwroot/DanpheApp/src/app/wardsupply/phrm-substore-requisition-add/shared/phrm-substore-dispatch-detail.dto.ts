import { PHRMSUbStoreDispatchItemDetail_DTO } from "./phrm-substore-dispatch-item-detail.dto";

export class PHRMSubStoreDispatchDetail_DTO {
    DispatchId: number;
    ReceivedBy: string;
    ReceivedOn: string;
    ReceivedRemarks: string;
    DispatchedRemarks: string;
    DispatchItems: PHRMSUbStoreDispatchItemDetail_DTO[];
}