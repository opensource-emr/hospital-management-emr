import { FormBuilder, FormGroup, Validators } from "@angular/forms";


export class PriceCategory {

  public PriceCategoryId: number = 0;
  public PriceCategoryCode: string = null;
  public PriceCategoryName: string = null;
  public Description: string = null;
  public ShowInRegistration: boolean = false;
  public ShowInAdmission: boolean = false;
  public IsDefault: boolean = false;
  public IsRateDifferent: boolean = false;

  public CreatedBy: number = 0;
  public CreatedOn: string = '';
  public IsActive: boolean = true;
  public PharmacyDefaultCreditOrganizationId: number = null;
  public IsPharmacyRateDifferent: boolean = false;
  public DisplaySequence: number = 0;


  /*Manipal-RevisionNeeded*/
  //Start: Sud:22Mar'23--Below Fields should be removed as per NewBillingStructure
  public IsCoPayment: boolean = false;
  public DefaultCreditOrganizationId: number = null;
  public Copayment_CashPercent: number = null;
  public Copayment_CreditPercent: number = null;
  //End: Sud:22Mar'23--Below Fields should be removed as per NewBillingStructure

  public PriceValidator: FormGroup;


  constructor() {
    var _formBuilder = new FormBuilder();
    this.PriceValidator = _formBuilder.group({
      'PriceCategoryName': ['', Validators.compose([Validators.required])],

    });
  }
  public IsDirty(fieldName): boolean {
    if (fieldName == undefined) {
      return this.PriceValidator.dirty;
    }

    else
      return this.PriceValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean {
    if (this.PriceValidator.valid) {
      return true;
    }
    else {
      return false;
    }
  }

  public IsValidCheck(fieldName, validator): boolean {

    if (fieldName == undefined) {
      return this.PriceValidator.valid;
    }
    else {
      return !(this.PriceValidator.hasError(validator, fieldName));
    }

  }



}
