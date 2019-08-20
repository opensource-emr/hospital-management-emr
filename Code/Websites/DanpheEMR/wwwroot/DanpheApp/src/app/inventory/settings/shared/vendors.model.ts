import { FormGroup, Validators, FormBuilder } from '@angular/forms'
import { CurrencyMasterModel } from '../../shared/currency-master.model';

export class VendorsModel {
  public VendorId: number = 0;
  public VendorName: string = null;
  public VendorCode: string = null;
  public ContactPersion: string = null;
  public ContactAddress: string = null;
  public ContactNo: string = null;
  public Email: string = null;
  public CurrencyMaster: Array<CurrencyMasterModel> = new Array<CurrencyMasterModel>();
  public CreatedBy: number = null;
  public CreatedOn: string = null;
  public IsActive: boolean = true;
  public DefaultCurrencyId: number = null;
  public VendorsValidator: FormGroup = null;
  public GovtRegDate: string = null;
  public Tds: number = 0;
  public PanNo: string = null;
  public CreditPeriod: number = 0;
  public IsTDSApplicable: boolean;

  constructor() {
    var _formBuilder = new FormBuilder();
    this.VendorsValidator = _formBuilder.group({
      'ContactAddress': ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
      'VendorName': ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
      'Email': ['', Validators.compose([Validators.pattern('^[a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,15})$')])],
      'CreditPeriod': ['', Validators.compose([Validators.pattern('^[0-9]*')])],
      'ContactNo': ['', Validators.compose([Validators.required, Validators.pattern('^[0-9]{1,10}$')])],
      'DefaultCurrencyId': ['', Validators.compose([Validators.required])]
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.VendorsValidator.dirty;
    else
      return this.VendorsValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean { if (this.VendorsValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.VendorsValidator.valid;
      //if (this.IsValidTime())
      ////return this.EmployeeValidator.valid;
      //  return this.EmployeeValidator.valid;
      //else
      //   return false;
    }
    else
      return !(this.VendorsValidator.hasError(validator, fieldName));
  }
}
