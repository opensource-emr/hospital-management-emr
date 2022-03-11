import { FormGroup, FormBuilder, Validators } from '@angular/forms';

export class IncentiveFractionItemsModel {
  public InctvTxnItemId: number = 0;
  public InvoiceNoFormatted: string = null;
  public TransactionDate: string = null;
  public PriceCategory: string = null;
  public BillingTransactionId: number = null;
  public BillingTransactionItemId: number = null
  public PatientId: number = null;
  public BillItemPriceId: number = null;
  public ItemName: string = null;
  public Quantity: number = null;
  public TotalBillAmount: number = null;
  public IncentiveType: string = 'assigned';
  public IncentiveReceiverId: number = null;
  public IncentiveReceiverName: string = null;
  public IncentivePercent: number = 0;//need to set to zero by default
  public IncentiveAmount: number = 0;//need to set to zero by default
  public IsPaymentProcessed: boolean = false;
  public PaymentInfoId: number = null;
  public CreatedBy: number = null;
  public CreatedOn: string = null;
  public ModifiedBy: number = null;
  public ModifiedOn: string = null;
  public IsActive: boolean = true;
  public IsMainDoctor: boolean = false;

  public TDSPercentage: number = 0;
  public TDSAmount: number = 0;

  public IsEditMode: boolean = false;//only for client side.
  public IsRemoved: boolean = false;//only for client side.
  public DocObj: any = { EmployeeId: null, FullName: '' };//only for client side.

  public IsTransferToAcc: boolean = false;
}
