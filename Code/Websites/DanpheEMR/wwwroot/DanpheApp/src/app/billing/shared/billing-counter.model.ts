import {
    NgForm,
    FormGroup,
    FormControl,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'


export class BillingCounter
{
    public CounterId: number = null;
    public CounterName: string = null;
    public CounterType: string = null;
    public BeginningDate: string = null;
    public ClosingDate: string = null;
    public BranchId: number = 0;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;



}
