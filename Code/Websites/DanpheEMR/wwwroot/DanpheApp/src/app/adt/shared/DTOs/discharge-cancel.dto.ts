
export class DischargeCancel_DTO {
  public PatientVisitId: number = null;
  public PatientAdmissionId: number = null;
  public DischargedDate: string = "";
  public CreatedOn: string = "";
  public DischargedBy: number = null;
  public DischargeCancelledBy: number = null;
  public BillingTransactionId: number = null;
  public DischargeCancelNote: string = "";
  public CounterId: number = null;
  public NewBedId: number = null;
  //public DischargeCancel = new DischargeCancel();
}
