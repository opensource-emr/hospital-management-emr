import { BillingTransactionItem } from './billing-transaction-item.model';

import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'
import { LabTestRequisition } from '../../labs/shared/lab-requisition.model';
import { ImagingItemRequisition } from '../../radiology/shared/imaging-item-requisition.model';
import { Visit } from '../../appointments/shared/visit.model';

export class BillingTransaction {
  public BillingTransactionId: number = 0;
  public PatientId: number = 0;
  public PatientVisitId: number = 0;
  //added Patient to retrieve patient information in inter-module call. since patient service gets cleared in such situation.
  //it is already there in server model.//sudarshan:14july
  public Patient: any = null;
  public CounterId: number = 0;
  public PaidDate: string = null;
  public TransactionType: string = null;
  public InvoiceType: string = null;// pratik:29April 2020-- needed for partial payment invoice in ipbilling
  public TotalQuantity: number = 0;
  public SubTotal: number = 0;
  public DiscountPercent: number = 0;
  public DiscountAmount: number = 0;
  public TaxTotal: number = 0;
  public TotalAmount: number = 0;
  public PaidAmount: number = 0;
  public DepositAmount: number = 0;
  public DepositAvailable: number = 0;
  public DepositUsed: number = 0;
  public DepositReturnAmount: number = 0;
  public DepositBalance: number = 0;
  public Remarks: string = null;
  public Tender: number = 0;
  public Change: number = 0;
  //this will be employeeid of the requesting user--sudarshan:7May'17
  public CreatedBy: number = null;
  public CreatedOn: string = null;
  public ReturnRemarks: string = null;
  public PrintCount: number = 0;
  public PrintedOn: string = null;
  public PrintedBy: number = 0;
  public CreditBalance: number = 0;
  public CreditNoteNumber: number = 0;
  public ReturnedAmount: number = 0;
  public BillingTransactionItems: Array<BillingTransactionItem> = new Array<BillingTransactionItem>();
  public PaymentMode: string = "cash";
  public PaymentDetails: string = null;
  public BillStatus: string = null;
  public FiscalYearId: number = null;
  public InvoiceNo: number = null;
  public InvoiceNumber: number = null; //used while comparing invoiceNummber from //InvoiveNo is already existed.  
  public FiscalYear: string = null;
  public TaxId: number = null;
  public InvoiceCode: string = null;
  public TaxableAmount: number = 0;//sud: 9May'18
  public ReturnStatus: boolean = false;
  public IsSelected: boolean = false;//sud: 16may'18 -- Only in client side

  public NonTaxableAmount: number = 0;//added: sud: 29May'18
  public PaymentReceivedBy: number = null;//added: sud: 29May'18
  public PaidCounterId: number = null;//added: sud: 29May'18
  public IsCopyReceipt: boolean = false; //added: Hom: 3rd April 19
  //insurance
  public IsInsuranceBilling: boolean = false;
  public IsInsuranceClaimed: boolean = false;

  public InsuranceClaimedDate: string = null;
  public InsuranceProviderId: number = null;

  public PackageId: number = null;//sud: 10Sept'18-- needs revision
  public PackageName: string = null;//sud: 10Sept'18-- needs revision
  public OrganizationId: number = null;//Yubraj --22nd April '19
  public OrganizationName: string = null;
  public ExchangeRate: number = 0; // Sanjit:5-17-19
  public singleReceiptBool: boolean = false;
  public BillingUserName: string = null; //Yubraj 28th June '19

  public InsTransactionDate: string = null;//sud:19Jul'19--For MNK Insurance Transaction Date..
  public AdjustmentTotalAmount: number = 0;
  public ReturnedItems: any;
  public Ins_NshiNumber: string = '';

  public LabTypeName: string = ''; 
  public ClaimCode: number = null;//sud:1-oct'21: Changed datatype from String to Number in all places

  public NetAmount:number = 0;//for bill settlement
  public isSelected:boolean = true; //for bill settlement
  public BillReturnIdsCSV:any[] = [];

  constructor() {
    var _formBuilder = new FormBuilder();
    //this.BillingTransactionValidator = _formBuilder.group({
    //    'Tender': ['', Validators.compose([Validators.required])],
    //});
  }

  //TenderValidator(control: FormControl): { [key: string]: boolean } {
  //    if (Number(control.value) < 1000)
  //        return { 'valid': false };
  //}
  //public IsDirty(fieldName): boolean {
  //    if (fieldName == undefined)
  //        return this.BillingTransactionValidator.dirty;
  //    else
  //        return this.BillingTransactionValidator.controls[fieldName].dirty;
  //}

  //public IsValid():boolean{if(this.BillingTransactionValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
  //    if (fieldName == undefined)
  //        return this.BillingTransactionValidator.valid;
  //    else
  //        return !(this.BillingTransactionValidator.hasError(validator, fieldName));
  //}

}
export class BillingTransactionPost{
  public LabRequisition: Array<LabTestRequisition> = new Array<LabTestRequisition>();
  public ImagingItemRequisition: Array<ImagingItemRequisition> = new Array<ImagingItemRequisition>();
  public VisitItems: Array<Visit> = new Array<Visit>();
  public Txn :BillingTransaction = new BillingTransaction();
}
