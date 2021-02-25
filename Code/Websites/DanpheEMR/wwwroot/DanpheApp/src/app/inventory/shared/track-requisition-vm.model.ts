import { VerificationVM } from "../../shared/verification-vm.model";
import { VerificationActor } from "../../verification/inventory/requisition-details/inventory-requisition-details.component";

export class TrackRequisitionVM {
  public RequisitionId: number;
  public CreatedBy: string = "";
  public RequisitionDate: Date = new Date();
  public MaxVerificationLevel: number = 0;
  public Status: string = "";
  public StoreId: number = 0;
  public StoreName: string = "";
  public Verifiers: Array<VerificationVM>;
  public Dispatchers: Array<DispatchVerificationActor>;
}

export class DispatchVerificationActor extends VerificationActor{
  public DispatchId: number;
  public isReceived: boolean;
}
