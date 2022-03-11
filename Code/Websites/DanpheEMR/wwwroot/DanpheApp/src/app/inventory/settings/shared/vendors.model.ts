import { FormGroup, Validators, FormBuilder } from '@angular/forms'
import { CurrencyMasterModel } from '../../shared/currency-master.model';

export class VendorsModel {
  public VendorId: number = 0;
  public VendorName: string = '';
  public VendorCode: string = '';
  public ContactPersion: string = '';
  public ContactAddress: string = '';
  public ContactNo: string = '';
  public Email: string = '';
  public CurrencyMaster: Array<CurrencyMasterModel> = new Array<CurrencyMasterModel>();
  public CreatedBy: number = null;
  public CreatedOn: string = null;
  public IsActive: boolean = true;
  public DefaultCurrencyId: number = 1;
  public VendorsValidator: FormGroup = null;
  public GovtRegDate: string = null;
  public Tds: number = 0;
  public PanNo: string = null;
  public CreditPeriod: number = 0;
  public IsTDSApplicable: boolean;
  public DefaultItem: Array<number> = new Array<number>();
  public DefaultItemJSON: string;
  public CountryId: number = 0;

  public CompanyPosition: string;
  public Name: string;
  public PhoneNumber: string;
  public CompanyPosition2: string;
  public Name2: string;
  public PhoneNumber2: string;
  public SARFNo: string;


  public BankDetails: string;// Rajib 12/02/2020 Tilaganga Hospital
  public CompanyName: string;
  constructor() {
    var _formBuilder = new FormBuilder();
    this.VendorsValidator = _formBuilder.group({
      'ContactAddress': ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
      'VendorName': ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
      'Email': ['', Validators.compose([Validators.pattern('^[a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,15})$')])],
      'CreditPeriod': ['', Validators.compose([Validators.pattern('^[0-9]*')])],
      'ContactNo': ['', Validators.compose([Validators.required])],
      'DefaultCurrencyId': ['', Validators.compose([Validators.required])],
      'PanNo': ['', Validators.required],
      'CountryId': ['', Validators.compose([Validators.required])],
      'VendorCode': ['', Validators.compose([Validators.required])],
      'BankDetails': [''],
      'SARFNo': [''],
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
