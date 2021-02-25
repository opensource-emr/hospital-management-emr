import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms'
import * as moment from 'moment/moment';

export class WardDispatchItemsModel {
    public DispatchItemId: number = 0;
    public DispatchId: number = 0;
    public RequisitionItemId: number = 0;
    public ItemId: number = 0;
    public ItemName: string = '';
    public BatchNo: string = '';
    public ExpiryDate: string = '';
    public Quantity: number = 0;
    public MRP: number = 0;
    public SubTotal: number = 0;
    public Remark: string = '';
    public CreatedBy: number = 0;
    public CreatedOn: string = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');

    public TotalQty: number = null;
    public DispatchedQty: number = null;
    public enableItmSearch: boolean = true;
    public notValid: boolean = false;
    public IsDuplicateItem: boolean = false;

    constructor() {
    }
}
