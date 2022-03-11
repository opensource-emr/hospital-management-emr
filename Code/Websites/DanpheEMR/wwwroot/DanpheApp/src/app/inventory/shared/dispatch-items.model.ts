import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from "@angular/forms"
import * as moment from "moment";

export class DispatchItems {
  public DispatchItemsId: number = 0;
  public DepartmentId: number = 0;
  public SourceStoreId: number = 0;
  public TargetStoreId: number = 0;
  public RequisitionId: number = 0;
  public RequisitionItemId: number = 0;
  public DispatchedDate: string = moment().format("YYYY-MM-DD");
  public DispatchedQuantity: number = 0;
  public CreatedBy: number = 0;
  public CreatedOn: Date = null;
  public ReceivedBy: string = "";
  public Remarks: string = "";
  public ItemRemarks: string = "";
  public DepartmentName: string = "";
  public ItemId: number = 0;
  public DispatchId: number = 0;
  public AvailableQuantity: number = 0;
  public ItemName: string = "";
  public RequiredQuantity: number = 0;
  public IsDisQtyValid: boolean = true;
  public isActive: boolean = true;
  public MatIssueTo: string = null;
  public MatIssueDate: Date = null;
  public DispatchItemValidator: FormGroup = null;
  StandardRate: number;
  selectedItem: any = null;
  ItemCode: string;
  ItemUOM: string;
  IssueNo: number;
  BatchNo: string = null;
  ReqDisGroupId: number;
  constructor() {
    var _formBuilder = new FormBuilder();
    this.DispatchItemValidator = _formBuilder.group({
      'DispatchedQuantity': [0, Validators.compose([Validators.required])],
      'AvailableQty': [{ value: 0, disabled: true }, Validators.compose([Validators.required])],
    }, { validators: [stockAvailabilityValidator('AvailableQty', 'DispatchedQuantity')] });

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

// Custom Validators
function stockAvailabilityValidator(availableQty: string, dispatchQty: string) {
  return (formGroup: FormGroup) => {
    const availQty = formGroup.controls[availableQty];
    const dispatchingQty = formGroup.controls[dispatchQty];

    if (availQty.value < dispatchingQty.value || dispatchingQty.value < 0) {
      dispatchingQty.setErrors({ invalidQty: true });
    } else {
      dispatchingQty.setErrors(null);
    }
  };
}
