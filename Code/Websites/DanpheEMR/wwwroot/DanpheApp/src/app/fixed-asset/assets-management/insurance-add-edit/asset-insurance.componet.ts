import { Component, EventEmitter, Output, Input } from "@angular/core";
import { FixedAssetStockModel } from "../../shared/fixed-asset-stock.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { FixedAssetInsuranceModel } from "./fixed-asset-insurance.model";
import { FixedAssetBLService } from "../../shared/fixed-asset.bl.service";


@Component({
  selector: "asset-insurance",
  templateUrl: "./asset-insurance.html",
})


export class AssetInsuranceComponent {
  public EditMode: boolean = false;
  public assetInsurance: FixedAssetInsuranceModel = new FixedAssetInsuranceModel();
  public loading: boolean = false;

  public selectedAsset: FixedAssetStockModel = new FixedAssetStockModel();

  @Output('callback')
  public emitter: EventEmitter<Object> = new EventEmitter<Object>();

  constructor(
    public msgBoxServ: MessageboxService,
    public fixedAssetBLService: FixedAssetBLService,
  ) { }



  @Input('selectedAsset')
  public set Value(val) {
    if (val) {

      this.selectedAsset = val;
      this.assetInsurance = new FixedAssetInsuranceModel();
      this.assetInsurance.FixedAssetStockId = this.selectedAsset.FixedAssetStockId;
      this.GetAssetInsurance();
    }
  }

  Submit() {
    let isValid = true;
    // validation
    if (this.assetInsurance) {
      isValid = this.CheckValidation();
    }

    if (isValid) {


      if (!this.EditMode) {
        this.PostInsuranceDetails();
      } else {
        this.PutInsuranceDetails();
      }

    } else {
      this.loading = false;
      this.msgBoxServ.showMessage("Warning", ["Enter all required fields!"])
    }

  }

  public PostInsuranceDetails() {
    this.fixedAssetBLService.PostAssetInsurance(this.assetInsurance)
      .subscribe(res => {
        if (res.Status == "OK") {

          this.msgBoxServ.showMessage("success", ["Assets Maintenance has been Added!"]);
          this.emitter.emit({ data: "Ok" });

        }
        else {
          this.msgBoxServ.showMessage("Failed", [res.ErrorMessage]);

        }
      });
  }
  public PutInsuranceDetails() {
    this.fixedAssetBLService.PutAssetInsurance(this.assetInsurance)
      .subscribe(res => {
        if (res.Status == "OK") {

          this.msgBoxServ.showMessage("success", ["Assets Maintenance has been Update."]);
          this.emitter.emit({ data: "Ok" });

        }
        else {
          this.msgBoxServ.showMessage("Failed", [res.ErrorMessage]);

        }
      });
  }

  Close() {
    this.EditMode = false;
    this.emitter.emit({ data: "Close" });
  }

  public GetAssetInsurance() {
    this.fixedAssetBLService.GetAssetInsurance(this.selectedAsset.FixedAssetStockId)
      .subscribe(res => {
        if (res.Status == "OK" && res.Results) {

          var tempInsuranceDetails: FixedAssetInsuranceModel = res.Results;

          this.assetInsurance.AssetInsurannceId = tempInsuranceDetails.AssetInsurannceId;
          this.assetInsurance.PolicyNumber = tempInsuranceDetails.PolicyNumber;
          this.assetInsurance.Insurer = tempInsuranceDetails.Insurer;
          this.assetInsurance.InsuredValue = tempInsuranceDetails.InsuredValue;
          this.assetInsurance.InsuranceStartDate = tempInsuranceDetails.InsuranceStartDate;
          this.assetInsurance.InsuranceEndDate = tempInsuranceDetails.InsuranceEndDate;
          this.assetInsurance.ComprehensiveInsurance = tempInsuranceDetails.ComprehensiveInsurance;
          this.assetInsurance.CreatedBy = tempInsuranceDetails.CreatedBy;
          this.assetInsurance.CreatedOn = tempInsuranceDetails.CreatedOn;

          this.EditMode = true;
        }
      });
  }

  public CheckValidation(): boolean {
    var isValid: boolean = true;

    for (var i in this.assetInsurance.InsuranceValidators.controls) {
      this.assetInsurance.InsuranceValidators.controls[i].markAsDirty();
      this.assetInsurance.InsuranceValidators.controls[i].updateValueAndValidity();
    }
    if (this.assetInsurance.IsValidCheck(undefined, undefined)) {
      isValid = true
    }
    else {
      isValid = false;
    }
    return isValid;
  }
}







