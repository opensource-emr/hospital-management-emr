import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import * as moment from "moment";

export class FixedAssetInsuranceModel {
  public AssetInsurannceId: number = 0;
  public FixedAssetStockId: number = 0;
  public PolicyNumber: string;
  public Insurer: string;
  public InsuredValue: string;
  public InsuranceStartDate: string = moment().format("YYYY-MM-DD");
  public InsuranceEndDate: string = moment().format("YYYY-MM-DD");
  // public InsuranceEndDate: string = moment(new Date).format("dd/MM/yyyy");
  public ComprehensiveInsurance: string;
  public CreatedBy: number;
  public CreatedOn: string;
  public ModefiedBy: number;
  public ModefiedOn: string;

  public InsuranceValidators: FormGroup = null;

  constructor() {
    var _formBuilder = new FormBuilder();
    this.InsuranceValidators = _formBuilder.group({
      'PolicyNumber': ['', Validators.compose([Validators.required])],
      'Insurer': ['', Validators.compose([Validators.required])],
      'InsuredValue': ['', Validators.compose([Validators.required])],
      'InsuranceStartDate': ['', Validators.compose([Validators.required])],
      'InsuranceEndDate': ['', Validators.compose([Validators.required])],
      'ComprehensiveInsurance': ['', Validators.compose([Validators.required])],

    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.InsuranceValidators.dirty;
    else
      return this.InsuranceValidators.controls[fieldName].dirty;
  }

  public IsValid(): boolean {
    if (this.InsuranceValidators.valid) { return true; } else { return false; }
  }
  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.InsuranceValidators.valid;
    }
    else {
      return !(this.InsuranceValidators.hasError(validator, fieldName));
    }
  }

}
