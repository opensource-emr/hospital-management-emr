import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from "@angular/forms"
import * as moment from "moment";

export class PHRMStoreDispatchItems {
  public DispatchItemsId: number = 0;
  public SourceStoreId: number;
  public TargetStoreId: number;
  public RequisitionId: number = 0;
  public RequisitionItemId: number = 0;
  public DispatchedQuantity: number = 0;
  public CreatedBy: number = 0;
  public CreatedOn: Date = null;
  public ReceivedBy: string = "";
  //ony for Display
  public DispatchedDate: string = moment().format();
  public ItemId: number = 0;
  public DispatchId: number = 0;
  public Code: string;
  public UOMName: string;
  public BatchNo: string;
  public ExpiryDate: string;
  public AvailableQuantity: number = 0;
  public ItemName: string = "";
  public RequiredQuantity: number = 0;
  public IsDisQtyValid: boolean = true;
  public StoreRackName: string;
  public MRP: number;
  public CostPrice: number;
  public StandardRate: number;
  public ItemRemarks: string;
  public Remarks: string;
  public ReceivedRemarks: string;
  public SelectedItem: any;

  public DispatchItemValidator: FormGroup = null;
  constructor() {
    var _formBuilder = new FormBuilder();
    this.DispatchItemValidator = _formBuilder.group({
      'DispensaryId': ['', Validators.required],
      'DispatchedQuantity': ['', Validators.compose([Validators.required])],
      'ItemName': ['', Validators.compose([Validators.required])],
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
