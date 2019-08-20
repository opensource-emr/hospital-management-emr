import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'

export class TransactionLink {
    public AccountingTxnLinkId: number = 0;
    public TransactionId: number = 0;
    public ReferenceId: string = null;
    public TransferStatus: number = 0;//this for is cash, credit or credit return status i.e. NOT-0,Cash-1,Credit-2
}