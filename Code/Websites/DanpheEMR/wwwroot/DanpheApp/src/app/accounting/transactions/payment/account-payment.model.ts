import { FormGroup, Validators, FormBuilder } from '@angular/forms'
export class Payment {
  public LedgerId: number = 0;
  public LedgerName: string = '';
  public GrNo: Number = 0;
  public GrDate: string = '';
  public TotalAmount: number = 0;
  public PaidAmount: number = 0;
  public DueAmount: number = 0;
  public RemainingAmount: number = 0;
  public VoucherAmount: number;
  public PaymentMode: string = "";
  public ChequeNo: number;
  public PayeeName: string = '';
  public PaymentFrom: string = '';
  public Narration: string = '';
  public IsPaymentDone: boolean = false;
  public GoodReceiptID: number = 0;
  public ReceiverLedgerId: number = 0;
  public Remarks: string = '';
  public SectionId: number = 0;
  public InvoiceNo: Number = 0;
  public PaymentValidator: FormGroup = null;
  constructor() {
    var _formBuilder = new FormBuilder();
    this.PaymentValidator = _formBuilder.group({
      'VoucherAmount': ['', Validators.required],
      'Narration': ['', Validators.required],
      'PaymentFrom': ['', Validators.required],
      'PaymentMode': ['', Validators.required],
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.PaymentValidator.dirty;
    else
      return this.PaymentValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean {
    if (this.PaymentValidator.valid) {
      return true;
    } else {
      return false;
    }
  }
  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.PaymentValidator.valid;
    }
    else
      return !(this.PaymentValidator.hasError(validator, fieldName));
    ``
  }
}