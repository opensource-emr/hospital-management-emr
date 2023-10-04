import {
  FormBuilder, FormControl, FormGroup, Validators
} from '@angular/forms';
import { ServiceItemDetails_DTO } from './dto/service-item-details.dto';
export class BillingPackageItem {
  public EmployeeId: number = null;
  public PackageServiceItemId: number = 0;
  public BillingPackageId: number = 0;
  public IsActive: boolean = false;
  public ServiceDeptId: number = null;
  public PriceCategoryId: number = 0;
  public SchemeId: number = 0;

  //public ItemId: number = null; /*Manipal-RevisionNeeded*///Removed this column and added below, so we need to revise this.
  public ServiceItemId: number = null;
  public Quantity: number = 0;
  public Price: number = 0;
  public SubTotal: number = 0;
  public DiscountPercent: number = 0;
  public DiscountAmount: number = 0;
  public TaxPercent: number = 0;
  public Tax: number = 0;
  public Total: number = 0;
  public FilteredItemList: Array<ServiceItemDetails_DTO> = new Array<ServiceItemDetails_DTO>();
  public BillingPackageItemValidator: FormGroup = null;
  public LabTypeName: string = "op-lab";
  public PerformerId: number = null;
  public IsItemLevelDiscount: boolean = false;

  //Below variable only for check duplicate item or not
  public IsDuplicateItem: boolean = false; //yub--27th Sept 2018
  public IsValidSelDepartment: boolean = true; //yub--27th Sept 2018
  public IsValidSelItemName: boolean = true; //yub--27th Sept 2018

  constructor() {
    var _formBuilder = new FormBuilder();
    this.BillingPackageItemValidator = _formBuilder.group({
      // 'ServiceDeptId': ['', Validators.compose([Validators.required])],
      'ServiceItemId': ['', Validators.compose([Validators.required])],
      'Quantity': [1, Validators.compose([this.quantityValidator])],
      'DiscountPercent': [0, Validators.compose([this.discountPercentValidator])]
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

  public IsValid(): boolean {
    if (this.BillingPackageItemValidator.valid) {
      return true;
    }
    else {
      return false;
    }
  }

  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined)
      return this.BillingPackageItemValidator.valid;
    else
      return !(this.BillingPackageItemValidator.hasError(validator, fieldName));
  }

  discountPercentValidator(control: FormControl): { [key: string]: boolean } {
    if (control.value < 0) {
      return { 'minValue': true };
    }
    if (control.value > 100) {
      return { 'maxValue': true };
    }
  }
}
