import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';
import * as moment from 'moment/moment';
export class InvoiceDetailsModel {
  public Fiscal_Year: string = null;
  public Bill_No: number = 0;
  public Customer_name: string = null;
  public PANNumber: string = null;
  public BillDate: string = null;
  public BillType: string = null;  //now we don't show billType
  public Amount: number = 0;
  public DiscountAmount: number = 0;
  public Taxable_Amount: number = 0;
  public Tax_Amount: number = 0;
  public Total_Amount: number = 0;
  public SyncedWithIRD: string = null;
  public Is_Printed: string = null;
  public Printed_Time: string = null;
  public Entered_by: string = null;
  public Printed_by: string = null;
  public Print_Count: number = null;
  public fromDate: string = "";
  public toDate: string = "";
  public Bill_No_Str: string = "";
  public NonTaxable_Amount: number = 0;
  public Payment_Method: string = null;
  public TransactionId: number = 0;

}
