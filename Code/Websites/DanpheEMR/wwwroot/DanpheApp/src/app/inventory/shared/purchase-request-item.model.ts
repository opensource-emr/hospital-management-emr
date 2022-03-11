import { StockModel } from "./stock.model"
import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';
import { ItemModel } from "../settings/shared/item.model";
import * as moment from "moment";

export class PurchaseRequestItemModel {
  public PurchaseRequestItemId: number = 0;
  public PurchaseRequestId: number = 0;
  public ItemId: number = 0;
  public VendorId: number;
  public RequestedQuantity: number = 0;
  public RequestItemStatus: string;
  public Remarks: string;
  public CancelledBy: number = null;
  public CancelledOn: string = null;
  public CancelRemarks: string = null;
  public CreatedBy: number = 0;
  public CreatedOn: string = moment().format("YYYY-MM-DD");
  public ModifiedBy: number = null;
  public ModifiedOn: string = null;
  public IsActive: boolean = true;
  public IsEdited: boolean = true;
  public PurchaseRequestItemValidator: FormGroup = null;

  ////to make the instance ItemMaster with new row
  public SelectedItem: ItemModel = null;

  //ItemName only for display purpose
  public ItemName: string = "";
  public Code: string = ""
  public Item: ItemModel = null;
  public MSSNO: string = null; ///Rajib: 11/25/2020 Tilagnga Hospital
  public SupplyRequiredBefore: string = null; ///Rajib: 11/25/2020 Tilagnga Hospital
  public QuantityVerifiedOn: string = moment().format("YYYY-MM-DD"); ///Rajib: 11/25/2020 Tilagnga Hospital
  public ItemCategory: string = '';//rohit/ramesh:23Sep'21--For Capital/Consumable Combined..
  public filteredItemList: any[] = [];//rohit/ramesh:23Sep'21--For Capital/Consumable Combined..
  public UOMName: string; // for UI change ie View Page;
  HSNCODE: string = "";

  constructor() {

    var _formBuilder = new FormBuilder();
    this.PurchaseRequestItemValidator = _formBuilder.group({
      'ItemId': ['', Validators.compose([Validators.required])],
      'Quantity': ['', Validators.compose([Validators.required])],

    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.PurchaseRequestItemValidator.dirty;
    else
      return this.PurchaseRequestItemValidator.controls[fieldName].dirty;
  }


  public IsValid(): boolean { if (this.PurchaseRequestItemValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.PurchaseRequestItemValidator.valid;
    }
    else
      return !(this.PurchaseRequestItemValidator.hasError(validator, fieldName));
  }


}
