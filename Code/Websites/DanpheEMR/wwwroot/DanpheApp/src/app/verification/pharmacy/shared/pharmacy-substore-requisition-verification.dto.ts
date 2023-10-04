import { PharmacySubStoreRequisitionItemVerification_DTO } from "./pharmacy-substore-requisition-item-verification.dto";
import { PharmacyVerificationActor } from "./pharmacy-verification-actor.dto";

export class PharmacySubStoreRequisitionVerification_DTO {
    public RequisitionId: number;
    public RequisitionNo: number;
    public StoreId: number;
    public RequisitionDate: string;
    public RequisitionStatus: string;
    public CreatedBy: number;
    public CreatedOn: string;
    public RequisitionItems: PharmacySubStoreRequisitionItemVerification_DTO[];
    public CancelledBy?: number;
    public CancelledOn?: Date;
    public CancelRemarks: string;
    public CurrentVerificationLevel: number;
    public MaxVerificationLevel: number;
    public CurrentVerificationLevelCount: number;
    public VerificationStatus: string;
    public IsVerificationAllowed: boolean;
    public RequestedStoreName: string;
    public RequestedBy: string;
    public VerificationRemarks: string;
    public VerifierList: PharmacyVerificationActor[] = [];
    public TransactionType: string;

}