import { Component } from "@angular/core";
import { FixedAssetStockModel } from "../shared/fixed-asset-stock.model";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import GridColumnSettings from "../../shared/danphe-grid/grid-column-settings.constant";
import { FixedAssetDepreciationModel } from "./fixed-asset-depreciation-model";
import * as moment from "moment";
import { FixedAssetBLService } from "../shared/fixed-asset.bl.service";



@Component({
  templateUrl: "./asset-depreciation-list.html",
})


export class AssetDepreciationListComponent {
  public depreciationGridColumns: Array<any> = [];
  public allFixedAssetList: Array<FixedAssetStockModel> = new Array<FixedAssetStockModel>();
  // public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public selectedAsset: FixedAssetStockModel = new FixedAssetStockModel();
  public showEditAsset: boolean = false;
  public showAssetScrap: boolean = false;
  public selectedDepreciation: FixedAssetDepreciationModel = new FixedAssetDepreciationModel();

  constructor(
    public msgBoxServ: MessageboxService,
    public fixedAssetBLService: FixedAssetBLService
  ) {
    this.depreciationGridColumns = GridColumnSettings.AssetDepreciationColumns;
    this.GetAssetList();
    // this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('WarrantyExpiryDate', false));
  }



  public GetAssetList() {
    this.fixedAssetBLService.GetAssetsDepreciationList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.allFixedAssetList = res.Results;
          // if(res.Results.depreciation[0]){
          //   this.selectedDepreciation = res.Results.depreciation[0];
          // }
        }
        else {
          console.log("Failed to get List of Assets. " + res.ErrorMessage);
        }
      },
        err => {
          console.log("error", ["Failed to get List of Assets. " + err.ErrorMessage]);
        });
  }


  public AssetDepreciationGridAction($event) {
    switch ($event.Action) {
      case "view-deprn": {
        this.showEditAsset = false;
        this.selectedAsset = $event.Data;
        this.showEditAsset = true;
        break;
      }
      case "scrap-asset": {
        this.showAssetScrap = false;
        this.selectedAsset = $event.Data;
        this.showAssetScrap = true;
        break;
      }
      default:
        break;
    }
  }


  DepreciationCallBack(data) {
    this.showEditAsset = false;
  }

  ScrapCallBack(data) {
    if (data.Status == "Ok") {
      this.GetAssetList();
    }
    this.showAssetScrap = false;
  }

  GetGridExportOptions() {
    let gridExportOptions = {
      fileName: 'Fixed-Asstes-Stock-List-' + moment().format('YYYY-MM-DD') + '.xls',
      // displayColumns: ["ItemCode", "BarCodeNumber", "ItemName"]
    };
    return gridExportOptions;
  }

}
