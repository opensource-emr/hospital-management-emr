import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from "@angular/forms"

export class DispatchItems {
  public DispatchItemsId: number = 0;
  public DepartmentId: number = 0;
  public RequisitionItemId: number = 0;
  public DispatchedQuantity: number = 0;
  public CreatedBy: number = 0;
  public CreatedOn: Date = null;
  public ReceivedBy: string = "";
  //ony for Display
  public DepartmentName: string = "";
  public ItemId: number = 0;
  public AvailableQuantity: number = 0;
  public ItemName: string = "";
  public RequiredQuantity: number = 0;
  public IsDisQtyValid: boolean = true;


  public DispatchItemValidator: FormGroup = null;
  constructor() {
    var _formBuilder = new FormBuilder();
    this.DispatchItemValidator = _formBuilder.group({
      'DispatchedQuantity': ['', Validators.compose([Validators.required])],
    });

  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.DispatchItemValidator.dirty;
    else
      return this.DispatchItemValidator.controls[fieldName].dirty;
  }


  public IsValid(): boolean { if (this.DispatchItemValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.DispatchItemValidator.valid;
    }
    else
      return !(this.DispatchItemValidator.hasError(validator, fieldName));
  }

}
