import { Component, Input, EventEmitter, Output } from "@angular/core";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { FixedAssetStockModel } from "../../shared/fixed-asset-stock.model";
import { FixedAssetBLService } from "../../shared/fixed-asset.bl.service";


@Component({
  selector: "asset-scrap",
  templateUrl: "./asset-scrap.html",
})

export class AssetScrapComponent {

  public selectedAsset: FixedAssetStockModel = new FixedAssetStockModel();
  //public showPopWindow: boolean = true;
  @Output("callback")
  public emitter: EventEmitter<Object> = new EventEmitter<Object>();
  public loading: boolean = false;
  public UnScrapAsset: boolean = false;

  constructor(public messageBoxService: MessageboxService,
    public fixedAssetBLService: FixedAssetBLService) {

  }
  ngOnInit() {

  }

  @Input("selectedAsset")
  public set value(val) {
    var asset: FixedAssetStockModel;
    if (val) {
      asset = val;
      this.selectedAsset = new FixedAssetStockModel();
      this.selectedAsset.FixedAssetStockId = asset.FixedAssetStockId;
      this.selectedAsset.BarCodeNumber = asset.BarCodeNumber;
      this.selectedAsset.ItemName = asset.ItemName;
      this.selectedAsset.ItemCode = asset.ItemCode;
      this.selectedAsset.IsAssetScraped = asset.IsAssetScraped;

      if (this.selectedAsset.IsAssetScraped == true) {
        this.selectedAsset.ScrapAmount = 0;
        this.UnScrapAsset = true;
      }
    }
  }

  UpdateAssetScrapDetails() {
    this.loading = true;
    var isValid = true;
    if (this.selectedAsset) {
      isValid = this.CheckValidation();
    } else {
      isValid = false;
    }
    if (isValid) {
      if (this.UnScrapAsset) {
        this.selectedAsset.IsAssetScraped = false;
        this.selectedAsset.ScrapCancelRemarks = this.selectedAsset.ScrapRemarks;
      } else {
        this.selectedAsset.IsAssetScraped = true;
      }
      this.PutScrapDetails();

    } else {
      this.messageBoxService.showMessage("Failed", ["Please fill valid data !!"]);

    }

  }
  public PutScrapDetails() {
    this.fixedAssetBLService.UpdateAssetScrapDetails(this.selectedAsset).subscribe(res => {
      if (res.Status == "OK") {
        var message: string;
        if (this.UnScrapAsset) {
          message = "Asset Scraping Canceled Successfully!";
        } else {
          message = "Asset Scraped Successfully!";

        }
        this.messageBoxService.showMessage("Sucess", [message]);
        //this.showPopWindow = false;
        this.emitter.emit({ Status: "Ok", Data: res.Results });

      } else {
        this.messageBoxService.showMessage("Failed", ["Task Failed !"]);
        //this.showPopWindow = false;
        this.emitter.emit({ Status: "Error", Data: null });
      }
    });
  }

  public CheckValidation(): boolean {
    var isValid: boolean = true;
    this.selectedAsset.FAStockValidators.get('DamagedRemarks').clearValidators();
    for (var i in this.selectedAsset.FAStockValidators.controls) {
      this.selectedAsset.FAStockValidators.controls[i].markAsDirty();
      this.selectedAsset.FAStockValidators.controls[i].updateValueAndValidity();
    }
    if (this.selectedAsset.IsValidCheck(undefined, undefined)) {
      isValid = true
    }
    else {
      isValid = false;
      this.loading = false;
    }
    return isValid;
  }

  Close() {
    this.emitter.emit({ Status: "Close", Data: null });
  }
}
