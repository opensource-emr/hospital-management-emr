import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import * as moment from "moment";

export class AssetServiceModel {
  // pk  
  public AssetServiceId: number = 0;
  public FixedAssetStockId: number = 0;

  public ServiceDate: string = moment().format("YYYY-MM-DD");;
  public ServiceRemarks: string;

  public ServiceCompleteDate: string = moment().format("YYYY-MM-DD");;
  public ServiceCompleteRemarks: string;

  public CreatedBy: number;
  public CreatedOn: string;
  public ModefiedBy: number;
  public ModefiedOn: string;
  public CreatedByName: string;


  public AssetServiceValidators: FormGroup = null;

  constructor() {
    var _formBuilder = new FormBuilder();
    this.AssetServiceValidators = _formBuilder.group({
      'ServiceDate': ['', Validators.compose([Validators.required])],
      'ServiceRemarks': ['', Validators.compose([Validators.required])],
      'ServiceCompleteDate': ['', Validators.compose([Validators.required])],
      'ServiceCompleteRemarks': ['', Validators.compose([Validators.required])],
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.AssetServiceValidators.dirty;
    else
      return this.AssetServiceValidators.controls[fieldName].dirty;
  }

  public IsValid(): boolean {
    if (this.AssetServiceValidators.valid) { return true; } else { return false; }
  }
  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.AssetServiceValidators.valid;
    }
    else {
      return !(this.AssetServiceValidators.hasError(validator, fieldName));
    }
  }

}