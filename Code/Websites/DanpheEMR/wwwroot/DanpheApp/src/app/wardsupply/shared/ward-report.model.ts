import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'

export class WARDReportsModel {

  public FromDate: string = null;
  public ToDate: string = null;
  public StoreId: number = 0;
  public Status: string = null;

  /// public CompanyValidator: FormGroup = null;

  constructor() {

  }

}
