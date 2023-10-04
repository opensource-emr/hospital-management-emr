import { UploadedFile } from "../../../shared/DTOs/uploaded-files-DTO";
import { InsurancePendingClaim } from "./ClaimManagement_PendingClaims_DTO";

export class SubmittedClaimDTO {
    public claim: InsurancePendingClaim = new InsurancePendingClaim();
    public files: Array<UploadedFile> = new Array<UploadedFile>();
}