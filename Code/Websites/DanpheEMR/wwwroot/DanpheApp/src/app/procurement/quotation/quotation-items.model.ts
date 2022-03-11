import { FormGroup, Validators, FormBuilder, } from '@angular/forms'
import { ItemMaster } from '../../inventory/shared/item-master.model';
import { VendorMaster } from '../../inventory/shared/vendor-master.model';

export class QuotationItemsModel {
  public QuotationItemId: number = 0;
  public QuotationId: number = 0;
  public VendorId: number = null;
  public ItemId: number = 0;
  public ItemName: string = "";
  public Description: string = "";
  public Price: number = 0;
  public Quantity: number = 0;
  public IsDeleted: boolean = null;
  public IsAdded: boolean = null;
  public UpLoadedon: string = "";
  public UpLoadedBy: number = null;
  public CreatedBy: number = 0;
  public item: ItemMaster = null;
  public vendorItm: VendorMaster = null;
  public SelectedItem: QuotationItemsModel = null;
  public QuotationItemsValidator: FormGroup = null;

  constructor() {

    var _formBuilder = new FormBuilder();
    this.QuotationItemsValidator = _formBuilder.group({
      'ItemId': ['', Validators.compose([Validators.required])],
      'Price': ['', Validators.compose([Validators.required])],


    });
  }
  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.QuotationItemsValidator.dirty;
    else
      return this.QuotationItemsValidator.controls[fieldName].dirty;
  }


  public IsValid(): boolean { if (this.QuotationItemsValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.QuotationItemsValidator.valid;
    }
    else
      return !(this.QuotationItemsValidator.hasError(validator, fieldName));
  }



}
