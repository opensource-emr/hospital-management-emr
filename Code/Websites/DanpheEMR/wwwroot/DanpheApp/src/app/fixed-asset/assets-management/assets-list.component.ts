import { Component } from "@angular/core";
import { SecurityService } from "../../security/shared/security.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import GridColumnSettings from "../../shared/danphe-grid/grid-column-settings.constant";
import { Router, Data } from "@angular/router";
import { FixedAssetStockModel } from "../shared/fixed-asset-stock.model";
import * as moment from "moment";
import { NepaliDateInGridParams } from "../../shared/danphe-grid/NepaliColGridSettingsModel";
import { SettingsBLService } from "../../settings-new/shared/settings.bl.service";
import { FixedAssetBLService } from "../shared/fixed-asset.bl.service";

@Component({
  templateUrl: "./assets-list.html",
})

export class AssetsManagementListComponent {
  public assetsmanagementGridColumns: Array<any> = null;
  public fixedAssetsList: Array<FixedAssetStockModel> = new Array<FixedAssetStockModel>(); // list to disply in grid
  public selectedAssetForEdit: any;
  public selectedAsset: FixedAssetStockModel;
  public showNotifyDamage: boolean = false;
  public selectedAssetListStatus: string = "all";
  public allFixedAssetList: Array<FixedAssetStockModel> = new Array<FixedAssetStockModel>();
  public EditAsset: boolean = false;
  public PrintView: boolean = false;
  //public today: any = moment(new Date(),'YYYY-MM-DD');
  public today: Date = new Date();
  showContract: boolean = false;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public showInsuranceDetails: boolean = false;
  selectedSubstore: number = null;
  substoreList: any[] = [];
  showOnlyColdStorageItems = false;
  showOnlyAssetsMaintainedByUser = false;

  constructor(
    public msgBoxServ: MessageboxService, private _securityService: SecurityService,
    public fixedAssetBLService: FixedAssetBLService, public settingsBLService: SettingsBLService,
    public router: Router
  ) {
    var gridColumnSettings = new GridColumnSettings(_securityService);
    this.assetsmanagementGridColumns = gridColumnSettings.AssestGRlist;
    this.GetGoodsReceiptList();
    this.GetSubstoreList();
    // this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('', false));
  }

  private GetSubstoreList() {
    this.settingsBLService.GetStoreList().subscribe(res => {
      if (res.Status == "OK") {
        this.substoreList = res.Results;
      }
      else {
        this.msgBoxServ.showMessage("Notice-Message", ["Failed to load substore list."]);
      }
    }, err => {
      console.log(err);
      this.msgBoxServ.showMessage("Failed", ["Failed to load substore list."]);
    });
  }
  GetGoodsReceiptList() {
    this.fixedAssetBLService.GetAssetsGoodsReceiptList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.allFixedAssetList = res.Results;
          this.OnAssetStatusChange();
        }
        else {
          console.log(res.ErrorMessage);
          this.msgBoxServ.showMessage("error", ["Failed to get AssetsGoodsReceiptList. Check console. "]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["Failed to get AssetsGoodsReceiptList. " + err.ErrorMessage]);
        });
  }

  GoodsReceiptGridAction($event) {
    switch ($event.Action) {
      case "edit": {
        this.selectedAssetForEdit = Object.assign({}, $event.Data);
        this.EditAsset = true;
        break;
      }
      // <a danphe-grid-action="notify-damage" class="grid-action" style="background-color: #696969!important;"> Notify Damage </a>

      // case "notify-damage": {
      //     this.NotifyDamage($event.Data);
      //     break;
      //   }
      case "confirm-damage": {
        this.selectedAsset = $event.Data
        this.ConfirmDamage();
        break;
      }
      case "undo-damage": {
        this.NotifyDamage($event.Data);
        break;
      }
      case "print-barcode": {
        this.selectedAsset = $event.Data;
        this.PrintView = true;
        break;
      } case "insurance-view": {
        this.showInsuranceDetails = false;
        this.selectedAsset = $event.Data;
        this.showInsuranceDetails = true;
        break;
      } case "send-to-maintenance": {
        this.selectedAsset = $event.Data;
        this.selectedAsset.IsMaintenanceRequired = true;
        this.PutAssetRequiredMaintenance();
        break;
      }
      case "remove-from-maintenance": {
        this.selectedAsset = $event.Data;
        this.selectedAsset.IsMaintenanceRequired = false;
        this.PutAssetRequiredMaintenance();
        break;
      }
      default:
        break;
    }
  }

  public PutAssetRequiredMaintenance() {
    this.fixedAssetBLService.PutAssetRequiredMaintenance(this.selectedAsset)
      .subscribe(res => {
        if (res.Status == "OK") {
          if (this.selectedAsset.IsMaintenanceRequired) {
            this.msgBoxServ.showMessage("Success", ["Asset send to Maintenance Section!"]);
          } else {
            this.msgBoxServ.showMessage("Success", ["Asset Removed from Maintenance Section!"]);
          }

          this.GetGoodsReceiptList();
        } else {
          this.msgBoxServ.showMessage("Error", ["Asset Couldn't be send to Maintenance Section!"]);
        }
      });
  }

  public NotifyDamage(data: FixedAssetStockModel) {
    this.selectedAsset = new FixedAssetStockModel();
    this.selectedAsset.FixedAssetStockId = data.FixedAssetStockId;
    this.selectedAsset.BarCodeNumber = data.BarCodeNumber;
    this.selectedAsset.ItemName = data.ItemName;
    this.selectedAsset.ItemCode = data.ItemCode;
    this.selectedAsset.IsAssetDamaged = data.IsAssetDamaged;
    this.showNotifyDamage = true;
  }


  public NotifyDamageCallBack(data) {
    if (data.Status == "Ok") {
      if (data.Data) {
        // var data: any = data.Data;

        // this.allFixedAssetList.forEach((a, i) => {
        //   if (a.FixedAssetStockId == data.FixedAssetStockId) {
        //     this.allFixedAssetList[i].IsAssetDamaged = data.IsAssetDamaged; // for updating the damage status of updated asset
        //   }
        // });
        this.GetGoodsReceiptList();
        this.OnAssetStatusChange();
        this.showNotifyDamage = false;
      }
    } else {
      this.showNotifyDamage = false;
    }
  }
  AssetEditCallBack(data) {
    if (data.data == "Ok") {
      this.GetGoodsReceiptList();
    }
    this.EditAsset = false;
  }


  public OnAssetStatusChange() {
    switch (this.selectedAssetListStatus) {
      case "all": {
        this.fixedAssetsList = this.allFixedAssetList.filter(a => a.IsAssetDamaged != true);
        break;
      }
      case "damaged": {
        this.fixedAssetsList = this.allFixedAssetList.filter(a => a.IsAssetDamaged == true);
        break;
      }
      case "warrantyExpired": {
        this.fixedAssetsList = this.allFixedAssetList.filter(a => a.WarrantyExpiryDate >= moment().format('YYYY-MM-DD') ? null : a.WarrantyExpiryDate);
      }
      default: {
        break;
      }
    }
    if (this.selectedSubstore != null) {
      this.fixedAssetsList = this.fixedAssetsList.filter(a => a.SubStoreId == this.selectedSubstore);
    }
    if (this.showOnlyColdStorageItems == true) {
      this.fixedAssetsList = this.fixedAssetsList.filter(a => a.IsColdStorageApplicable == true);
    }
    if (this.showOnlyAssetsMaintainedByUser == true) {
      this.fixedAssetsList = this.fixedAssetsList.filter(a => a.IsCurrentUserMaintenanceOwner == true);
    }
  }
  GetGridExportOptions() {
    let gridExportOptions = {
      fileName: 'Fixed-Asstes-Stock-List-' + moment().format('YYYY-MM-DD') + '.xls',
      // displayColumns: ["ItemCode", "BarCodeNumber", "ItemName", "VendorName", "AssetsLocation", "Donation", "InstallationOfDate", "SerialNo", "ModelNo", "BuildingBlockNumber", "Floors", "RoomNumber", "RoomPosition", "AssetsLocation", "WarrantyExpiryDate", "CreatedByName", "StoreName", "AssetHolderName"]
    };
    return gridExportOptions;
  }


  Close() {
    this.PrintView = false;
    // this.router.navigate(['/Inventory/FixedAssets/AssetsManagement']);
  }


  Print() {
    let popupWinindow;
    var printContents = document.getElementById("printpage").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=800,heigth=600,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    popupWinindow.document.write('<html><head><style>.img-responsive{ position: relative;left: -65px;top: 10px;}.qr-code{position:relative;left: 87px;}</style><link rel="stylesheet" type="text/css" href="../../../themes/theme-default/ReceiptList.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
    popupWinindow.document.close();
  }
  InsuranceCallBack(data) {
    this.showInsuranceDetails = false;
  }

  public ConfirmDamage() {
    var confir = confirm("Do you want to Confirm Asset Damage?");
    if (confir) {
      this.selectedAsset.IsAssetDamageConfirmed = true;
      this.fixedAssetBLService.PutAssetDamageConfirmation(this.selectedAsset).
        subscribe(res => {
          if (res.Status == "OK") {
            this.GetGoodsReceiptList();
            this.msgBoxServ.showMessage("Success", ["Asset Damage Confirmed Succesfully"]);
          } else {
            this.msgBoxServ.showMessage("Error", ["Failed to Confirm Asset Damage !"]);
          }
        });
    }

  }

}
