import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'

export class MapTxnItemCostCenterItem {
    public TxnItemCostCenterItemId: number = 0;
    public TransactionItemId: number = 0;
    public CostCenterItemId: number = 0;
    public Amount: number = 0;
    public CreatedOn: string = null;
    public CreatedBy: number = null;    
}
