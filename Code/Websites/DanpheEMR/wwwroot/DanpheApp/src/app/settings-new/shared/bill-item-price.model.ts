
import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';

export class BillItemPriceModel {
  public BillItemPriceId: number = 0;
  public BillingItemId: number = 0;
  public ServiceDepartmentId: number = null;
  public ServiceDepartmentName: string = null;
  public ItemName: string = null;
  public ProcedureCode: string = null;
  public Price: number = 0;
  public IsActive: boolean = true;
  public ItemId: number = 0;  //yubraj-- 1st Oct '18
  public CreatedBy: number = null;
  public ModifiedBy: number = null;

  public CreatedOn: string = null;
  public ModifiedOn: string = null;
  public TaxApplicable: boolean = false;//this should come from parameter later on <sud: 21Aug'18>
  public Description: string = null;
  public BillingItemValidator: FormGroup = null;
  public DiscountApplicable: boolean = true;

  public IsDoctorMandatory: boolean = false; //added yub 24th Sept 2018
  public ItemCode: string = null; //added yub 24th Sept 2018

  public AllowMultipleQty: boolean = true;//added pratik 22th oct 2019

  public ItemNamePrice: string = null;

  public DisplaySeq: number = 100;//default sequence.
  public IsValidSelDepartment: boolean = true;

  public IsFractionApplicable: boolean = false;

  public hasFractionAdded: boolean = false;

  public GovtInsurancePrice: number = null;
  public IsInsurancePackage: boolean = false;
  public InsuranceApplicable: boolean = false;

  public NormalPrice: number = 0;//sud:19Apr'19 -- for normal billing.
  public EHSPrice: number = 0;
  public SAARCCitizenPrice: number = 0;
  public ForeignerPrice: number = 0;
  public InsForeignerPrice: number = 0;

  public IsNormalPriceApplicable: boolean = true;
  public IsEHSPriceApplicable: boolean = false;
  public IsForeignerPriceApplicable: boolean = false;
  public IsInsForeignerPriceApplicable: boolean = false;
  public IsSAARCPriceApplicable: boolean = false;

  public IsZeroPriceAllowed: boolean = false;//pratik:28Jan'21 -as per LPH requirement
  public IsErLabApplicable: boolean = false;//pratik:09Feb'21 -as per LPH requirement

  public IsOT: boolean = false;
  public IsProc: boolean = false;
  public Category: string = null;
  public DefaultDoctorList: string = null;//pratik:13jan'20

  constructor() {

    var _formBuilder = new FormBuilder();
    this.BillingItemValidator = _formBuilder.group({
      'ServiceDepartmentId': ['', Validators.required],
      'ItemCode': ['', Validators.compose([Validators.maxLength(10)])],
      'ItemName': ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      'Description': ['', Validators.compose([Validators.maxLength(100)])],
      'ProcedureCode': ['', Validators.compose([Validators.maxLength(30)])],
      'Price': ['', Validators.required],
      'GovtInsurancePrice': ['', Validators.compose([])],
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

  //Conditional Validation for Insurance Applicable and government insurance price 
  public UpdateValidator(onOff: string, formControlName: string) {
    if (formControlName == "GovtInsurancePrice" && onOff == "on") {
      this.BillingItemValidator.controls['GovtInsurancePrice'].validator = Validators.compose([Validators.required]);
    }
    else {
      this.BillingItemValidator.controls['GovtInsurancePrice'].validator = Validators.compose([]);
    }
    this.BillingItemValidator.controls[formControlName].updateValueAndValidity();
  }

  //this is used to enable/disable form control.
  //disabled attribute didn't work in form-control so we need this.
  //set enabled=false/true from calling function for enabling/disabling a specific corm control.
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
}





