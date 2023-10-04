export class PharmacyRequisitionVerification_DTO {
    RequisitionId: number;
    RequisitionNo: number;
    RequisitionDate: string;
    RequisitionStatus: string;
    RequestedBy: string;
    DispatchedBy: string;
    ReceivedBy: string;
    RequestedStoreName: string;
    public CancelledBy: number = null;
    public CancelledOn: string = "";
    public CancelRemarks: string = "";
    CurrentVerificationLevel: number = 0;
    MaxVerificationLevel: number = 0;
    CurrentVerificationLevelCount: number = 0;
    VerificationStatus: string = null;
    IsVerificationAllowed: boolean = false;
    VerificationId: number = 0;
    VerifierIds: string = null;
    IsVerificationEnabled: boolean = false;
}