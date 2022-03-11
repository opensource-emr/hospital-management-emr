import { Component, Input, EventEmitter, Output, ChangeDetectorRef } from "@angular/core";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { Router } from "@angular/router";
import { FixedAssetStockModel } from "../../shared/fixed-asset-stock.model";
import { FixedAssetLocations } from "../fixed-asset-locations.model";
import * as moment from "moment";
import { SettingsBLService } from "../../../settings-new/shared/settings.bl.service";
import { FixedAssetBLService } from "../../shared/fixed-asset.bl.service";

@Component({
  selector: "asset-edit",
  templateUrl: "./asset-edit.html",
})

export class AssetEditComponent {
  public FixedAssetStockId: number = 0;
  public EditFixedAssetStocList: boolean = false;
  public fixedassetstoclist: Array<FixedAssetStockModel> = new Array<FixedAssetStockModel>();
  public fixedassetlocations: Array<FixedAssetLocations> = new Array<FixedAssetLocations>();
  public loading: boolean = false;
  public showAssetForm: boolean = false;
  //public changeDetectorRef: ChangeDetectorRef;
  public selectedAssetLocation: any;
  @Input('selectedAssetForEdit') assetForEdit: FixedAssetStockModel = new FixedAssetStockModel();

  public selAssetForEdit: FixedAssetStockModel = new FixedAssetStockModel();

  @Output('edit-callback')
  public editEmitter: EventEmitter<Object> = new EventEmitter<Object>();

  substoreList: any[] = [];
  selectedSubstore: any;

  employeeList: any[] = [];
  selectedAssetHolder: any;
  constructor(
    public msgBoxServ: MessageboxService,
    public fixedAssetBLService: FixedAssetBLService,
    public settingsBLService: SettingsBLService,
    public changeDetector: ChangeDetectorRef,
    public router: Router
  ) {
  }

  private GetEmployeeList() {
    this.settingsBLService.GetEmployeeList().subscribe(res => {
      if (res.Status == "OK") {
        this.employeeList = res.Results;
        if (this.assetForEdit.AssetHolderId) {
          this.selectedAssetHolder = this.employeeList.find(l => l.EmployeeId == this.assetForEdit.AssetHolderId).FullName;
        }
      }
      else {
        this.msgBoxServ.showMessage("Notice-Message", ["Failed to load employee list."]);
      }
    }, err => {
      console.log(err);
      this.msgBoxServ.showMessage("Failed", ["Failed to load employee list."]);
    });
  }

  private GetSubstoreList() {
    this.settingsBLService.GetStoreList().subscribe(res => {
      if (res.Status == "OK") {
        this.substoreList = res.Results;
        if (this.assetForEdit.StoreId) {
          const assetSubstore = this.substoreList.find(l => l.StoreId == this.assetForEdit.SubStoreId);
          this.selectedSubstore = assetSubstore ? assetSubstore.Name : null;
        }
      }
      else {
        this.msgBoxServ.showMessage("Notice-Message", ["Failed to load substore list."]);
      }
    }, err => {
      console.log(err);
      this.msgBoxServ.showMessage("Failed", ["Failed to load substore list."]);
    });
  }

  ngOnInit() {
    // assetForEdit
    if (this.assetForEdit) {
      this.selAssetForEdit.ItemName = this.assetForEdit.ItemName;
      this.selAssetForEdit.ItemCode = this.assetForEdit.ItemCode;
      this.selAssetForEdit.VendorName = this.assetForEdit.VendorName;
      this.selAssetForEdit.BarCodeNumber = this.assetForEdit.BarCodeNumber;
      this.selAssetForEdit.AssetCode = this.assetForEdit.AssetCode;
      this.selAssetForEdit.CreatedByName = this.assetForEdit.CreatedByName;
      this.selAssetForEdit.SerialNo = this.assetForEdit.SerialNo;
      this.selAssetForEdit.ModelNo = this.assetForEdit.ModelNo;
      this.selAssetForEdit.AssetsLocation = this.assetForEdit.AssetsLocation;
      this.selAssetForEdit.BuildingBlockNumber = this.assetForEdit.BuildingBlockNumber;
      this.selAssetForEdit.Floors = this.assetForEdit.Floors;
      this.selAssetForEdit.RoomNumber = this.assetForEdit.RoomNumber;
      this.selAssetForEdit.RoomPosition = this.assetForEdit.RoomPosition;
      this.selAssetForEdit.FixedAssetStockId = this.assetForEdit.FixedAssetStockId;
      this.selAssetForEdit.StoreId = this.assetForEdit.StoreId;
      this.selAssetForEdit.AssetHolderId = this.assetForEdit.AssetHolderId;
      this.selAssetForEdit.SubStoreId = this.assetForEdit.SubStoreId;

      if (this.assetForEdit.WarrantyExpiryDate) {
        this.selAssetForEdit.WarrantyExpiryDate = moment(this.assetForEdit.WarrantyExpiryDate).format("YYYY-MM-DD");
      } else {
        this.selAssetForEdit.WarrantyExpiryDate = moment().format("YYYY-MM-DD");
      }
      // this.selAssetForEdit.WarrantyExpiryDate = moment(this.assetForEdit.WarrantyExpiryDate).format("YYYY-MM-DD");
      this.changeDetector.detectChanges();
      this.showAssetForm = true;
      this.Getfixedassetlocation();
      this.GetSubstoreList();
      this.GetEmployeeList();
    }
  }

  Save() {

    let validationObj = { isValid: true, messageArr: [] as string[] };
    for (var a in this.selAssetForEdit.FAEditAssetValidators.controls) {
      this.selAssetForEdit.FAEditAssetValidators.controls[a].markAsDirty();
      this.selAssetForEdit.FAEditAssetValidators.controls[a].updateValueAndValidity();
    }
    if (this.selAssetForEdit.IsEditAssetValidCheck(undefined, undefined) == false) {
      validationObj.isValid = false;
      validationObj.messageArr.push("Please check all the required fields.");
      this.msgBoxServ.showMessage("Warning", validationObj.messageArr);
    }
    else {

      if (typeof this.selectedAssetLocation == 'string') {
        this.selAssetForEdit.AssetsLocation = this.selectedAssetLocation;
      } else {
        this.selAssetForEdit.AssetsLocation = this.selectedAssetLocation.LocationName;
      }
      // this.selAssetForEdit.IsActive = true;
      this.fixedAssetBLService.UpdateFixedAssetStocList(this.selAssetForEdit)
        .subscribe(res => {
          if (res.Status == "OK") {

            this.msgBoxServ.showMessage("success", ["AssetsStockList has been Update."]);
            this.editEmitter.emit({ data: "Ok" });

          }
          else {
            this.msgBoxServ.showMessage("Failed", [res.ErrorMessage]);
          }
        });
    }

  }
  Close() {
    this.editEmitter.emit({ data: "Close" });
    this.showAssetForm = false;

  }

  myListFormatter(data: any): string {
    let html = data["LocationName"];
    return html;
  }
  StoreListFormatter(data: any): string {
    let html = data["Name"];
    return html;
  }
  EmployeeListFormatter(data: any): string {
    let html = data["FullName"];
    return html;
  }

  Getfixedassetlocation() {
    this.fixedAssetBLService.GetFixedAssetLocationList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.fixedassetlocations = res.Results;

          if (this.assetForEdit.AssetsLocation) {
            this.selectedAssetLocation = this.fixedassetlocations.find(l => l.LocationName == this.assetForEdit.AssetsLocation).LocationName;
          }

        }
        else {
          this.msgBoxServ.showMessage("error", ["Failed to get FixedAsset Locations. " + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["Failed to get FixedAsset Locations. " + err.ErrorMessage]);
        });
  }

  SelectStoreFromSearchBox() {
    let selSubstoreObj = null;
    if (typeof (this.selectedSubstore) == 'string' && this.substoreList.length) {
      selSubstoreObj = this.substoreList.find(v => v.Name.toLowerCase() == this.selectedSubstore.toLowerCase());
    }
    else if (typeof (this.selectedSubstore) == 'object') {
      selSubstoreObj = this.selectedSubstore;
    }
    if (selSubstoreObj) {
      this.selAssetForEdit.SubStoreId = selSubstoreObj.StoreId;
    }
  }
  SelectEmployeeFromSearchBox() {
    let selEmployeeObj = null;
    if (typeof (this.selectedAssetHolder) == 'string' && this.substoreList.length) {
      selEmployeeObj = this.employeeList.find(v => v.FullName.toLowerCase() == this.selectedAssetHolder.toLowerCase());
    }
    else if (typeof (this.selectedAssetHolder) == 'object') {
      selEmployeeObj = this.selectedAssetHolder;
    }
    if (selEmployeeObj) {
      this.selAssetForEdit.AssetHolderId = selEmployeeObj.EmployeeId;
    }
  }


}
