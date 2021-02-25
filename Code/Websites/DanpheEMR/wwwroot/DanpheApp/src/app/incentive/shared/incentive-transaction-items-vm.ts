import { FormGroup, FormBuilder, Validators } from '@angular/forms';

export class IncentiveTransactionItemsVM {

  public TransactionDate: string = null;
  public FiscalYearId: number;
  public InvoiceNo: string = null;
  public PriceCategory: string = null;
  public BillItemPriceId: number = null;
  public BillingTransactionId: number = null;
  public BillingTransactionItemId: number = null;
  public PatientId: number = null;
  public PatientName: string = null;
  public PatientCode: string = null;
  public ItemName: string = null;
  public TotalAmount: number = null;
  public ReferredByEmpId: number = null;
  public ReferredByEmpName: string = null;
  public ReferredByPercent: number = null;
  public ReferralAmount: number = null;
  public AssignedToEmpId: number = null;
  public AssignedToEmpName: string = null;
  public AssignedToPercent: number = null;
  public AssignedToAmount: number = null;
  public IsSelected: boolean = false;//only for client side.
}
