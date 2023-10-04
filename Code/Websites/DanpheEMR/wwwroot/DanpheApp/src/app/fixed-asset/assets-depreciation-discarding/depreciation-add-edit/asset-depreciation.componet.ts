import { Component, EventEmitter, Output, Input } from "@angular/core";
import { FixedAssetStockModel } from "../../shared/fixed-asset-stock.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { Router } from "@angular/router";
import { FixedAssetDepreciationModel } from "../fixed-asset-depreciation-model";
import { AssetDepreciationMethodModel } from "./fixed-asset-depreciation-method-model";
import { FixedAssetBLService } from "../../shared/fixed-asset.bl.service";
import { FixedAssetService } from "../../shared/fixed-asset.service";


@Component({
  selector: "asset-depreciation",
  templateUrl: "./asset-depreciation.html",
})


export class AssetDepreciationComponent {
  public FixedAssetStockId: number = 0;
  public EditFixedAssetStocList: boolean = false;
  public fixedassetstoclist: Array<FixedAssetStockModel> = new Array<FixedAssetStockModel>();
  public loading: boolean = false;
  public fiscalYearList: Array<any>;
  public selectedFiscalYearId: number;
  public EditMode: boolean = false;


  public selectedAsset: FixedAssetStockModel = new FixedAssetStockModel();
  public depreciation: FixedAssetDepreciationModel = new FixedAssetDepreciationModel();
  public depreciationList: Array<FixedAssetDepreciationModel> = new Array<FixedAssetDepreciationModel>();

  public currentFiscalYearId: number = 0; // let suppose 2077/2078
  public isCurrentYearDeprenRecorded: boolean = false; // current year depreciation recorded or not

  @Output('edit-callback')
  public editEmitter: EventEmitter<Object> = new EventEmitter<Object>();
  public methodList: Array<AssetDepreciationMethodModel> = new Array<AssetDepreciationMethodModel>();
  public selectedMethodId: number;
  public showAddForm: boolean = false;

  constructor(
    public msgBoxServ: MessageboxService,
    public fixedAssetBLService: FixedAssetBLService,
    public fixedAssetService: FixedAssetService,
    public router: Router
  ) {
    this.fiscalYearList = this.fixedAssetService.allFiscalYearList;
    var len: number = this.fiscalYearList.length;
    if (len > 0) {
      this.currentFiscalYearId = this.fiscalYearList[len - 1].FiscalYearId;
    }
    this.GetDepreciationMethods();
  }



  @Input('selectedAsset')
  public set Value(val) {
    if (val) {
      this.selectedAsset = val;
      this.depreciation.FixedAssetStockId = this.selectedAsset.FixedAssetStockId;
      this.GetDepreciationDetails();
    }
  }
  public GetDepreciationDetails() {
    this.fixedAssetBLService.GetAssetDepreciationDetails(this.selectedAsset.FixedAssetStockId)
      .subscribe(res => {
        if (res.Status == "OK" && res.Results.length > 0) {
          this.depreciationList = res.Results;
          this.depreciationList.forEach(d => {
            if (d.FiscalYearId == this.currentFiscalYearId) {
              this.isCurrentYearDeprenRecorded = true;
            }
          })
        }
      });
  }
  public GetDepreciationMethods() {
    this.fixedAssetBLService.GetAssetDepreciationMethods()
      .subscribe(res => {
        if (res.Status == "OK" && res.Results.length > 0) {
          this.methodList = res.Results;
        }
      });
  }

  Submit() {
    this.depreciation.FixedAssetStockId = this.selectedAsset.FixedAssetStockId;
    let isValid = true;
    // validation
    if (this.depreciation) {
      isValid = this.CheckValidation();
    }
    if (isValid) {
      if (!this.EditMode) {
        this.PostDepreciationDetails();
      } else {
        this.PutDepreciationDetails();
      }
    } else {
      this.loading = false;
      this.msgBoxServ.showMessage("Warning", ["Enter all required fields!"])
    }

  }

  public PostDepreciationDetails() {
    this.fixedAssetBLService.PostAssetDepreciationDetails(this.depreciation)
      .subscribe(res => {
        if (res.Status == "OK") {

          this.msgBoxServ.showMessage("success", ["Assets Depreciation has been Update."]);
          this.GetDepreciationDetails();
          this.showAddForm = false;
        }
        else {
          this.msgBoxServ.showMessage("Failed", [res.ErrorMessage]);

        }
      });
  }

  public PutDepreciationDetails() {
    this.fixedAssetBLService.PutAssetDepreciationDetails(this.depreciation)
      .subscribe(res => {
        if (res.Status == "OK") {

          this.msgBoxServ.showMessage("success", ["Assets Depreciation has been Update."]);
          this.GetDepreciationDetails();
          this.showAddForm = false;
        }
        else {
          this.msgBoxServ.showMessage("Failed", [res.ErrorMessage]);

        }
      });
  }

  public Close() {
    this.EditMode = false;
    this.showAddForm = false;
    this.editEmitter.emit({ data: "Close" });
  }
  public FiscalYearChange(event: any) {
    // this.depreciation.FiscalYearId = parseInt(event.target.value);

    let value = parseInt(event.target.value);
    if (value) {
      // this.selectedFiscalYearId = value;      
      this.depreciation.FiscalYearId = value;
    } else {
      this.depreciation.FiscalYearId = undefined;
    }
  }

  public DeprnMethodChange(event) {
    // this.depreciation.AssetDeprnMethodId = parseInt(event.target.value); // parseInt(undefined) returns NaN
    let value = parseInt(event.target.value);
    if (value) {
      // this.selectedMethodId = value;      
      this.depreciation.AssetDeprnMethodId = value;
    } else {
      this.depreciation.AssetDeprnMethodId = undefined;

    }
  }

  public AddDepreciationBtnClick() {
    this.EditMode = false;
    this.depreciation = new FixedAssetDepreciationModel();
    this.showAddForm = true;
  }
  public EditCurrentYearDepreciation(index: number) {
    this.depreciationList.forEach((d, i) => {
      if (i == index) {
        this.depreciation.AssetDepreciationId = d.AssetDepreciationId;
        this.depreciation.FiscalYearId = d.FiscalYearId;
        this.depreciation.AssetDeprnMethodId = d.AssetDeprnMethodId;
        this.depreciation.Rate = d.Rate;
        this.depreciation.StartDate = d.StartDate;
        this.depreciation.EndDate = d.EndDate;
        this.depreciation.DepreciationAmount = d.DepreciationAmount;
        this.depreciation.CreatedBy = d.CreatedBy;
        this.depreciation.CreatedOn = d.CreatedOn;
        this.EditMode = true;
        this.showAddForm = true;
      }
    });
  }

  public CheckValidation(): boolean {
    var isValid: boolean = true;

    for (var i in this.depreciation.DepreciationValidators.controls) {
      this.depreciation.DepreciationValidators.controls[i].markAsDirty();
      this.depreciation.DepreciationValidators.controls[i].updateValueAndValidity();
    }
    if (this.depreciation.IsValidCheck(undefined, undefined)) {
      isValid = true
    }
    else {
      isValid = false;
    }
    return isValid;
  }

}







