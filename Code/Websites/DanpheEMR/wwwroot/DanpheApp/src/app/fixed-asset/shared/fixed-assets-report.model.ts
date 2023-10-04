import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'

export class FixedAssetsReportModel {

  public FromDate: string = null;
  public ToDate: string = null;
  public Status: string = null;
  public ItemId: number = null;
  public DepartmentId: number = null;
  public EmployeeId: number = null;
  public ReferenceNumber: string = "";

  /// public CompanyValidator: FormGroup = null;

  constructor() {

  }

}
