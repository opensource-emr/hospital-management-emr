import { FormControl, FormGroup, FormBuilder, Validators } from "@angular/forms";
import * as moment from "moment";

export class MaternityANCModel {
  public PatientPaymentId: number = 0;
  public FiscalYearId: number = 0;
  public ReceiptNo: number;
  public TransactionType: string;
  public PatientId: number;
  public InAmount:number = 0;
  public OutAmount:number = 0;
  public Remarks: string;
  public CreatedBy: number = 0;
  public CreatedOn: string = moment().format();
  public IsActive: boolean = true;
}
