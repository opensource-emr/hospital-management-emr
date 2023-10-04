import {
  FormBuilder,
  FormGroup,
  Validators
} from "@angular/forms";
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
  public DispatchId: number;
  public ItemCode: string;
  public UOMName: string;
  public BatchNo: string;
  public ExpiryDate: string;
  public AvailableQuantity: number = 0;
  public ItemName: string = "";
  public RequiredQuantity: number = 0;
  public IsDisQtyValid: boolean = true;
  public StoreRackName: string;
  public SalePrice: number;
  public CostPrice: number;
  public StandardRate: number;
  public ItemRemarks: string;
  public Remarks: string;
  public ReceivedRemarks: string;
  public SelectedItem: any;
  public selectedGeneneric: any;
  public GenericName: string = null;
  public GenericId: number = null;
  public RackNo: string = null;
  public ToRackNo: string = null;
  public ToRackNo1: string = null;
  public FromRack1: string = null;
  public RequisitionNo: number = null; //Rohit, 30May'23 To show  RequisitionNo in Dispatch Details view
  public SourceStore: string = null;
  public TargetStore: string = null;
  public CreatedByName: string = null;
  public DispatchedByName: string = null;

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
