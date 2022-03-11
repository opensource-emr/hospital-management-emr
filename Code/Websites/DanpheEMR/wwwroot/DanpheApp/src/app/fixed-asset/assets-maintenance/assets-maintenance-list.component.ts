import { Component } from "@angular/core";
import { FixedAssetStockModel } from "../shared/fixed-asset-stock.model";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { Router } from "@angular/router";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from "../../shared/danphe-grid/NepaliColGridSettingsModel";
import GridColumnSettings from "../../shared/danphe-grid/grid-column-settings.constant";
import { VendorsModel } from "../../inventory/settings/shared/vendors.model";
import * as moment from "moment";
import { FixedAssetBLService } from "../shared/fixed-asset.bl.service";



@Component({
  templateUrl: "./assets-maintenance-list.html",
})



export class AssetsMaintenaceListComponent {
  public assetsmaintenaceGridColumns: Array<any> = null;
  public allFixedAssetList: Array<FixedAssetStockModel> = new Array<FixedAssetStockModel>();
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public selectedAssetForEdit: FixedAssetStockModel = new FixedAssetStockModel();
  public vendorList: Array<VendorsModel> = new Array<VendorsModel>();
  public selectedItemVendorDetail: VendorsModel = new VendorsModel();
  public EditAsset: boolean = false;
  public showContract: boolean = false;
  public ShowCheckList: boolean = false;
  public ShowMaintenanceList: boolean = false;
  public showFaultUpdate: boolean = false;

  public filterAllAsset: boolean = true;
  public filterUnderMaintenanceAsset: boolean = false;
  public filterFaultyAsset: boolean = false;
  public filterServiceAsset: boolean = false;
  public fixedAssetList: Array<FixedAssetStockModel> = new Array<FixedAssetStockModel>();
  showEmitter: any;
  public vendorId: any;
  public showServiceHistory: boolean = false;
  public showOnlyAssetsMaintainedByUser: boolean = false;
  public temp_fixAssetList: FixedAssetStockModel[] = []; //created temporarily to handle maintenanceowner issue. must be removed later.

  constructor(
    public msgBoxServ: MessageboxService,
    public fixedAssetBLService: FixedAssetBLService,
    public router: Router
  ) {
    this.assetsmaintenaceGridColumns = GridColumnSettings.AssetsFixedStockList;
    this.GetGoodsReceiptList();
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('WarrantyExpiryDate', false));
  }



  GetGoodsReceiptList() {
    this.fixedAssetBLService.GetAssetsMaintenanceList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.allFixedAssetList = res.Results;
          this.OnStatusChange(1);
        }
        else {
          this.msgBoxServ.showMessage("error", ["Failed to get Asset Maintenance List. " + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["Failed to get Asset Maintenance List. " + err.ErrorMessage]);
        });
  }


  FixesAssetsGridAction($event) {
    switch ($event.Action) {
      case "edit": {
        this.selectedAssetForEdit = $event.Data;
        this.EditAsset = true;
        break;
      } case "contract": {
        this.showContract = false;
        this.selectedAssetForEdit = $event.Data;
        this.showContract = true;
        break;
      } case "checkilst-view": {
        this.selectedAssetForEdit = $event.Data;
        this.ShowCheckList = true;
        break;
      } case "vendor-details": {
        var temp = $event.Data;
        this.ShowMaintenanceList = true;
        this.GetVendorList(temp.VendorId, temp.CompanyName);
        break;
      } case "fault-update": {
        this.selectedAssetForEdit = $event.Data;
        this.showFaultUpdate = true;
        break;
      }
      case "service": {
        this.selectedAssetForEdit = $event.Data;
        this.showServiceHistory = true;
        break;
      }
      default:
        break;
    }
  }



  AssetEditCallBack(data) {
    if (data.data == "Ok") {
      this.GetGoodsReceiptList();
    }
    this.EditAsset = false;
  }

  AssetCheckCallBack(data) {
    this.ShowCheckList = false;
  }
  CallBackFromContract(data) {
    this.showContract = false;
  }

  AssetFaultUpdateBack(data) {
    this.showFaultUpdate = false;
    this.GetGoodsReceiptList();

  }

  AssetServiceCallBack(data) {
    this.showServiceHistory = false;
  }

  public OnStatusChange(status: number) {

    if (this.filterUnderMaintenanceAsset && status == 1) {
      // filtering assets which are in under maintenance
      this.fixedAssetList = this.allFixedAssetList.filter(af => af.IsUnderMaintenance == true);
      this.filterAllAsset = false;
      this.filterServiceAsset = false;
      this.filterFaultyAsset = false;

    } else if (this.filterFaultyAsset && status == 2) {
      // filtering faulty list
      this.fixedAssetList = this.allFixedAssetList.filter(af => {
        if (af.Performance && af.Performance == "Not Working") {
          return af;
        }
      });
      this.filterAllAsset = false;
      this.filterServiceAsset = false;
      this.filterUnderMaintenanceAsset = false;
    } else if (this.filterServiceAsset && status == 3) {
      // filtering Assets which service time is nearby and expired
      this.FilterAssetByService();
      this.filterAllAsset = false;
      this.filterUnderMaintenanceAsset = false;
      this.filterFaultyAsset = false;
    }
    else {
      this.fixedAssetList = this.allFixedAssetList;
      this.filterAllAsset = true;
      this.filterFaultyAsset = false;
      this.filterUnderMaintenanceAsset = false;
      this.filterServiceAsset = false;
    }
    this.temp_fixAssetList = this.fixedAssetList;
  }
  showOnlyAssetMaintainedByCurrentUser() {
    if (this.showOnlyAssetsMaintainedByUser) {
      this.temp_fixAssetList = this.fixedAssetList;
      this.fixedAssetList = this.fixedAssetList.filter(a => a.IsCurrentUserMaintenanceOwner == true);
    }
    else {
      this.fixedAssetList = this.temp_fixAssetList;
    }
  }

  public FilterAssetByService() {
    this.fixedAssetList = this.allFixedAssetList.filter(a => {
      let CommingServiceDate: any;
      let LastServiceDate: any;
      let InstallationDate: any;
      let RemainingDaysForService: any;

      let today = (new Date()).setHours(0, 0, 0, 0);

      if (a.InstallationDate) {

        InstallationDate = new Date(a.InstallationDate);

      } else {
        InstallationDate = null;
      }
      if (a.ServiceDate) {

        LastServiceDate = new Date(a.ServiceDate);
      } else {
        LastServiceDate = null;
      }

      if (a.PeriodicServiceDays) {

        if (LastServiceDate) { //case: when service has been done earlier

          CommingServiceDate = LastServiceDate.setDate(LastServiceDate.getDate() + a.PeriodicServiceDays);

        } else if (a.InstallationDate) { // case: when no any service been done till date
          // refer Installation date for calcuating comming service date 
          CommingServiceDate = InstallationDate.setDate(InstallationDate.getDate() + a.PeriodicServiceDays);
        }

        if (CommingServiceDate) {
          let diffTime = Math.abs(CommingServiceDate - today); // we get difference of two dates
          RemainingDaysForService = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // converting difference in Days
          if (today > CommingServiceDate) { // knowing, if difference day is negative or positive
            RemainingDaysForService = RemainingDaysForService * (-1);
          }
        }

        if (RemainingDaysForService && (RemainingDaysForService <= 31)) {
          return a;
        }
      }
    });
  }
  Close() {
    this.ShowMaintenanceList = false;
    this.router.navigate(['/FixedAssets/AssetsMaintenance']);

  }

  GetVendorList(vendorId, companyName) {
    this.fixedAssetBLService.GetMaintenanceVendorDetails(vendorId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.selectedItemVendorDetail = res.Results;
          this.selectedItemVendorDetail.CompanyName = companyName;
        }
        else {
          this.msgBoxServ.showMessage("error", ["Failed to get Vendor Detsils. " + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["Failed to get Vendor Detsils. " + err.ErrorMessage]);
        });
  }

  GetGridExportOptions() {
    let gridExportOptions = {
      fileName: 'Fixed-Asstes-Stock-List-' + moment().format('YYYY-MM-DD') + '.xls',
      // displayColumns: ["ItemCode", "BarCodeNumber", "ItemName", "TotalLife", "YearOfUse", "Performance", "ManufactureDate", "WarrantyExpiryDate", "RemainingDaysForService"]
    };
    return gridExportOptions;
  }
}
