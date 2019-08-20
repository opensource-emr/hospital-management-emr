
import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'

export class BillReturnRequest {
    public BillingTransactionItemId: number = 0;
    public BillingTransactionId: number = 0;

    public CounterId: number = 0;
    public PatientId: number = 0;
    public ItemName: string = null;
    public ItemId: number = 0;
    public ServiceDepartmentName: string = null;
    public ServiceDepartmentId: number = 0;
    public SubTotal: number = 0;
    public Price: number = 0;
    public DiscountAmount: number = 0;
    public Quantity: number = 0;
    public Tax: number = 0;
    public TotalAmount: number = 0;
    public ReturnDate: string = null;
    public PaidDate: string = null;
    public CreatedOn: string = null;
    public ReturnRemarks: string = null;
    public RequisitionId: number = 0;
    public CreatedBy: number = 0;
    public ProviderId: number = 0;

}