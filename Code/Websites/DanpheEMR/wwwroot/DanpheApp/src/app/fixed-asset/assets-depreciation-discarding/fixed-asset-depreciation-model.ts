import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NumberSequence } from "ag-grid-community";
import * as moment from "moment";

export class FixedAssetDepreciationModel {
  public AssetDepreciationId: number = 0;
  public FixedAssetStockId: number = 0;
  public AssetDeprnMethodId: number;
  public FiscalYearId: number;
  public StartDate: string = moment().format("YYYY-MM-DD");
  public EndDate: string = moment().format("YYYY-MM-DD");
  public Rate: number;
  public DepreciationAmount: number;
  public CreatedBy: number;
  public CreatedOn: string;
  public ModefiedBy: number;
  public ModefiedOn: string;
  public AccumulatedAmount: number = 0;

  public FiscalYearName: string;
  public Method: string;

  public DepreciationValidators: FormGroup = null;

  constructor() {
    var _formBuilder = new FormBuilder();
    this.DepreciationValidators = _formBuilder.group({
      'AssetDeprnMethodId': ['', Validators.compose([Validators.required])],
      'FiscalYearId': ['', Validators.compose([Validators.required])],
      'StartDate': ['', Validators.compose([Validators.required])],
      'EndDate': ['', Validators.compose([Validators.required])],
      'DepreciationAmount': ['', Validators.compose([Validators.required])],

    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.DepreciationValidators.dirty;
    else
      return this.DepreciationValidators.controls[fieldName].dirty;
  }

  public IsValid(): boolean {
    if (this.DepreciationValidators.valid) { return true; } else { return false; }
  }
  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.DepreciationValidators.valid;
    }
    else {
      return !(this.DepreciationValidators.hasError(validator, fieldName));
    }
  }

}
