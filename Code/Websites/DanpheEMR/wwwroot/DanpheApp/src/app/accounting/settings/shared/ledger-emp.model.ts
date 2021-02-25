import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'

export class LedgerEmployeeModel {
  public LedgerId: number = null;
  public EmployeeId: number = null;
  public LedgerName: string = null;
  public LedgerCode: string = null;
  public LedgerGroupName: number = null;

}
