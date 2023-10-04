import {
  FormBuilder, FormControl, FormGroup, Validators
} from '@angular/forms';

export class BillServiceItemModel {
  public ServiceDepartmentId: number = null;
  public ItemName: string = null;
  public ServiceItemId: number = 0;
  public ItemCode: string = null;
  public Price: number = 0;
  public IntegrationItemId: number = null;
  public IntegrationName: string = null;
  public IsTaxApplicable: boolean = false;
  public Description: string = null;
  public DisplaySeq: number = 100;
  public IsDoctorMandatory: boolean = false;
  public IsOT: boolean = false;
  public IsProc: boolean = false;
  public ServiceCategoryId: number;
  public AllowMultipleQty: boolean = true;
  public DefaultDoctorList: string = null;
  public IsValidForReporting: boolean = false;
  public ModifiedBy: number = null;
  public IsErLabApplicable: boolean = false;
  public CreatedBy: number = null;
  public CreatedOn: string = null;
  public ModifiedOn: string = null;
  public IsActive: boolean = true;
  public ItemId: number = 0;
  public BillingItemValidator: FormGroup = null;
  public ServiceDepartmentName: string = null;
  public ServiceCategoryName: string = null;
  public DiscountApplicable: boolean = true;
  public BilCfgItemsVsPriceCategoryMap: Array<BillServiceItemsPriceCategoryMap> = new Array<BillServiceItemsPriceCategoryMap>();

  constructor() {

    const _formBuilder = new FormBuilder();
    this.BillingItemValidator = _formBuilder.group({
      'ServiceDepartmentId': ['', Validators.compose([Validators.required])],
      'ServiceCategoryId': ['', Validators.compose([Validators.required])],
      'ItemCode': ['', Validators.compose([Validators.maxLength(10)])],
      'ItemName': ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      'IntegrationName': ['', Validators.compose([Validators.required])],
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.BillingItemValidator.dirty;
    else
      return this.BillingItemValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean { if (this.BillingItemValidator.valid) { return true; } else { return false; } }
  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.BillingItemValidator.valid;
    }

    else
      return !(this.BillingItemValidator.hasError(validator, fieldName));
  }


  public UpdateValidator(onOff: string, formControlName: string) {
    if (formControlName == "GovtInsurancePrice" && onOff == "on") {
      this.BillingItemValidator.controls['GovtInsurancePrice'].validator = Validators.compose([Validators.required]);
    }
    else {
      this.BillingItemValidator.controls['GovtInsurancePrice'].validator = Validators.compose([]);
    }
    this.BillingItemValidator.controls[formControlName].updateValueAndValidity();
  }


  public EnableControl(formControlName: string, enabled: boolean) {
    let currCtrol = this.BillingItemValidator.controls[formControlName];
    if (currCtrol) {
      if (enabled) {
        currCtrol.enable();
      }
      else {
        currCtrol.disable();
      }
    }
  }

  positiveNumberValdiator(control: FormControl): { [key: string]: boolean } {
    if (control) {
      if (control.value < 0)
        return { 'invalidNumber': true };
    }
  }

}
export class BillServiceItemsPriceCategoryMap {
  public PriceCategoryServiceItemMapId: number = 0;
  public PriceCategoryId: number = null;
  public Price: number = 0;
  public IsDiscountApplicable: boolean = false;
  public ItemLegalCode: string = "";
  public ItemLegalName: string = "";
  public IsSelected: boolean = false;
  public PriceCategoryName: string = "";
  public IsZeroPriceAllowed: boolean = false;
  public IsIncentiveApplicable: boolean = false;
  public HasAdditionalBillingItems: boolean = false;
  public IsPriceChangeAllowed: boolean = false;
  public ServiceItemId: number = 0;
  public ServiceDepartmentId: number = 0;
  public IsActive: boolean = false;
}

export class ServiceCategories {
  public ServiceCategoryId: number = 0;
  public ServiceCategoryName: string = null;
}


