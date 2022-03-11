import {FormBuilder,FormControl,FormGroup,Validators} from "@angular/forms"
import { ItemMaster } from "../../inventory/shared/item-master.model";

  //swapnil-2-april-2021
export class WardSupplyAssetReturnItemsModel {   
  public Id:number=0;
  public ReturnItemId:number=0;
  public ItemId: number = 0;
  public ReturnId:number=0;
  public FixedAssetStockId:number=0;
  public SerialNo:number=0;
  public CreatedBy: number = 0;
  public CreatedOn: string = '';
  public BatchNo:number=0;
  public BarCodeNumber:number=0;
  public VendorName : string = '';
  public Remark = '';
  public ModifiedOn = '';
  public ModifiedBy = 0;
  public ReturnItemValidator:any=""
  public IsEditApplicable: boolean = true;
  public IsEdit: boolean = true;
  public SelectedItem:any  = "";
  public BarCodeNumberList:Array<any>=[];

   //ItemName only for display purpose
public ItemName: string = "";
public Code: string = ""
public UOMName: string = "";
public Remarks: string = ""; //this is the main remark against requisition.

constructor() {

  var _formBuilder = new FormBuilder();
  this.ReturnItemValidator = _formBuilder.group({
    'ItemId': ['', Validators.compose([Validators.required])],
    // 'Quantity': ['', Validators.compose([this.positiveNumberValidator])],
    'BarCodeNumber': ['', Validators.compose([Validators.required])]
  });
}

public IsDirty(fieldName): boolean {
  if (fieldName == undefined)
    return this.ReturnItemValidator.dirty;
  else
    return this.ReturnItemValidator.controls[fieldName].dirty;
}


public IsValid(): boolean { if (this.ReturnItemValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
  if (fieldName == undefined) {
    return this.ReturnItemValidator.valid;
  }
  else
    return !(this.ReturnItemValidator.hasError(validator, fieldName));
}

positiveNumberValidator(control: FormControl): { [key: string]: boolean } {
  if (control) {
    if (control.value <= 0)
      return { 'invalidNumber': true };
  }

}}
