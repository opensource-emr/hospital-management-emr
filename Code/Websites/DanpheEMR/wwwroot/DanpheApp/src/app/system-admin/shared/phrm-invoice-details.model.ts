import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';
import * as moment from 'moment/moment';
export class PhrmInvoiceDetailsModel {
    public Bill_No: number = 0;
    public BillDate: string = null;
    public Customer_name: string = null;
    public PANNumber: string = null;
    public Amount: number = 0;
    public DiscountAmount: number = 0;
    public Tax_Amount: number = 0;
    public Total_Amount: number = 0;
    public Taxable_Amount: number = 0;
    public SyncedWithIRD: string = null;
    public Is_RealTime: string = null;
    public Is_Bill_Active: string = null;
    public Entered_by: string = null;
    public Printed_by: string = null;
    public fromDate: string = "";
    public toDate: string = "";
    public NonTaxable_Amount: number = 0;
    public Bill_No_Str: string = "";
}