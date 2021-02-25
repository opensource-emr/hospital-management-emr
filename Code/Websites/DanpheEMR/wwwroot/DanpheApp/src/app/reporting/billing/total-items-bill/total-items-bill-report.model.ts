import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';
import * as moment from 'moment/moment';
export class RPT_BIL_TotalItemsBillModel {

    public PatientName: string = "";
    public DoctorName: string = "";
    public Department: string = "";
    public Item: string = "";
    public Price: number = 0;
    public Quantity: number = 0;
    public Discount: number = 0;
    public Tax: number = 0;
    public Total: number = 0;
    public RecieptNo: number = 0;
    public BillDate: Date = null;
    public Status: string = "";

    public fromDate: string = "";
    public toDate: string = "";
    public billstatus: string = "";
    public servicedepartment: string = "";
    public itemname: string = "";


    //public TotalItemBillValidator: FormGroup = null;//sud:7June'20--Validator not required after from-todate selector has arrived.

    constructor() {
    }


}
