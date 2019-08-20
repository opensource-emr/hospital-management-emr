import { StockModel } from "./stock.model"
import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';
import { Requisition } from "./requisition.model";
import { ItemMaster } from "./item-master.model"

export class RequisitionItems {
  public RequisitionItemId: number = 0;
  public ItemId: number = null;
  public Quantity: number = null;
  public ReceivedQuantity: number = 0;
  public PendingQuantity: number = 0;
  public RequisitionId: number = null;
  public RequisitionItemStatus: string = null
  public Remark: string = null;
  public AuthorizedBy: number = null;
  public AuthorizedOn: string = null;
  public AuthorizedRemark: string = null;
  public CreatedBy: number = null;
  public CreatedOn: string = null;
  public ReceivedBy: string = "";
  public RequisitionItemValidator: FormGroup = null;

  ////to make the instance ItemMaster with new row
  public SelectedItem: ItemMaster = null;

  //ItemName only for display purpose
  public ItemName: string = "";
  public Code: string=""
  public Item: ItemMaster = null;
  public Requisition: Requisition = null;
  public CreatedByName: string = null;
  public DispatchedByName: string = null;

  constructor() {

    var _formBuilder = new FormBuilder();
    this.RequisitionItemValidator = _formBuilder.group({
      'ItemId': ['', Validators.compose([Validators.required])],
      'Quantity': ['', Validators.compose([Validators.required])],
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.RequisitionItemValidator.dirty;
    else
      return this.RequisitionItemValidator.controls[fieldName].dirty;
  }


  public IsValid(): boolean { if (this.RequisitionItemValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.RequisitionItemValidator.valid;
    }
    else
      return !(this.RequisitionItemValidator.hasError(validator, fieldName));
  }


}
