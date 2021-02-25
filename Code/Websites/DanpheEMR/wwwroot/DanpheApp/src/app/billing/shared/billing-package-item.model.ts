import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'
import { BillItemPriceModel } from "../../settings-new/shared/bill-item-price.model";
export class BillingPackageItem {
  public ServiceDeptId: number = null;
  public ItemId: number = null;
  public Quantity: number = 0;
  public Price: number = 0;
  public TaxPercent: number = 0;
  public Tax: number = 0;
  public Total: number = 0;
  public FilteredItemList: Array<BillItemPriceModel> = new Array<BillItemPriceModel>();
  public BillingPackageItemValidator: FormGroup = null;

  //Below variable only for check duplicate item or not
  public IsDuplicateItem: boolean = false; //yub--27th Sept 2018
  public IsValidSelDepartment: boolean = true; //yub--27th Sept 2018
  public IsValidSelItemName: boolean = true; //yub--27th Sept 2018

  constructor() {
    var _formBuilder = new FormBuilder();
    this.BillingPackageItemValidator = _formBuilder.group({
      'ServiceDeptId': ['', Validators.compose([Validators.required])],
      'ItemId': ['', Validators.compose([Validators.required])],
      'Quantity': [1, Validators.compose([this.quantityValidator])]
    });
  }
  quantityValidator(control: FormControl): { [key: string]: boolean } {
    if (control.value < 1 || !control.value) {
      return { 'minValue': true };
    }
  }
  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.BillingPackageItemValidator.dirty;
    else
      return this.BillingPackageItemValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean { if (this.BillingPackageItemValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined)
      return this.BillingPackageItemValidator.valid;
    else
      return !(this.BillingPackageItemValidator.hasError(validator, fieldName));
  }
}
