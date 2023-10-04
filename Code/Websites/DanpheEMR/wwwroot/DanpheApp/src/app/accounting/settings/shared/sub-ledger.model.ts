import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import * as moment from "moment";
import { ENUM_DateFormats } from "../../../shared/shared-enums";

export class SubLedgerTransactionModel {
  public SubLedgerTransactionId: number = 0;
  public VoucherNo: string = "";
  public VoucherType: number = 0;
  public LedgerId: number = 0;
  public SubLedgerId: number = 0;
  public TransactionItemId: number = 0;
  public DrAmount: number = 0;
  public CrAmount: number = 0;
  public IsActive: boolean = true;
  public Description: string = "";
  public VoucherDate: string = moment().format(ENUM_DateFormats.Year_Month_Day);
  public CreatedOn: string = moment().format(ENUM_DateFormats.Year_Month_Day);
  public CreatedBy: number = 0;
  public HospitalId: number = 0;
  public FiscalYearId: number = 0;
  public CostCenterId: number = 0;
}


export class SubLedgerModel {
  public SubLedgerId: number = 0;
  public LedgerId: number = 0;
  public SubLedgerName: string = "";
  public SubLedgerCode: string = "";
  public Description: string = "";
  public IsActive: boolean = true;
  public CreatedBy: number = 0;
  public CreatedOn: string = moment().format(ENUM_DateFormats.Year_Month_Day);
  public OpeningBalance: number = 0;
  public DrCr: boolean = true;
  public Dr: boolean = true;
  public Cr: boolean = false;
  public HospitalId: number = 0;
  public subLedgerValidator: FormGroup = null;
  public IsDefault: boolean = false;
  constructor() {
    this.CreatedOn = moment().format(ENUM_DateFormats.Year_Month_Day);
    var _formBuilder = new FormBuilder();
    this.subLedgerValidator = _formBuilder.group({
      'LedgerName': ['', Validators.compose([Validators.required])],
      'SubLedgerName': ['', Validators.compose([Validators.required])],
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.subLedgerValidator.dirty;
    else
      return this.subLedgerValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean {
    if (this.subLedgerValidator.valid) {
      return true;
    }
    else {
      return false;
    }
  }
  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.subLedgerValidator.valid;
    }
    else
      return !(this.subLedgerValidator.hasError(validator, fieldName));
  }
}

export class SubLedgerVM {
  public SubLedgerId: number = 0;
  public LedgerId: number = 0;
  public SubLedgerName: string = "";
  public LedgerName: string = "";
  public SubLedgerCode: string = "";
  public Description: string = "";
  public IsActive: boolean = true;
  public CreatedBy: number = 0;
  public CreatedOn: string = "";
}