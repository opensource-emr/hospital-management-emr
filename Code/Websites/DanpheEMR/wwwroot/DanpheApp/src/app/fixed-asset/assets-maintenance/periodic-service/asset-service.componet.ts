import { Component, EventEmitter, Output, Input } from "@angular/core";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { Router } from "@angular/router";
import { FixedAssetStockModel } from "../../shared/fixed-asset-stock.model";
import { AssetServiceModel } from "./fixed-asset-service.model";
import { FixedAssetBLService } from "../../shared/fixed-asset.bl.service";


@Component({
  selector: "asset-service",
  templateUrl: "./asset-service.html",
})

export class AssetServiceComponent {
  public assetService: AssetServiceModel = new AssetServiceModel();
  public allServiceList: Array<AssetServiceModel> = new Array<AssetServiceModel>()
  public fixedAssetStockId: any;
  public addMode: boolean = false;
  public editMode: boolean = false;

  @Output('callback')
  public emitter: EventEmitter<Object> = new EventEmitter<Object>();

  public selectedAsset: FixedAssetStockModel = new FixedAssetStockModel();
  public showNotifyDamage: boolean = false;
  // showResolvedDescription: boolean;
  constructor(
    public msgBoxServ: MessageboxService,
    public fixedAssetBLService: FixedAssetBLService,
    public router: Router
  ) {


  }

  @Input('selectedAsset')
  public set Value(val) {
    if (val) {
      this.selectedAsset = val;
      this.fixedAssetStockId = this.selectedAsset.FixedAssetStockId;
      this.assetService = new AssetServiceModel();
      this.assetService.FixedAssetStockId = this.fixedAssetStockId;
      this.GetAssetServiceHistory();
    }
  }

  Submit() {
    this.assetService.FixedAssetStockId = this.fixedAssetStockId;

    let isValid = true;
    // validation
    if (this.assetService) {
      isValid = this.CheckValidation();
    }
    if (isValid) {
      this.fixedAssetBLService.PostAssetServiceDetails(this.assetService)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.addMode = false;
            this.msgBoxServ.showMessage("success", ["Assets Fault  has been Update."]);
            this.GetAssetServiceHistory();

          }
          else {
            this.msgBoxServ.showMessage("Failed", [res.ErrorMessage]);

          }
        });
    } else {
      // this.loading = false;
      this.msgBoxServ.showMessage("Warning", ["Enter all required fields!"])
    }

  }

  GetAssetServiceHistory() {
    this.fixedAssetBLService.GetAssetServiceHistory(this.fixedAssetStockId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.allServiceList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("error", ["Failed to get Service Details. " + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["Failed to get Service Details. " + err.ErrorMessage]);
        });
  }

  Close() {
    // this.showResolvedDescription = false;
    this.addMode = false;
    this.editMode = false;
    this.emitter.emit({ data: "Close" });
  }

  OnEditButtonClick(index: number) {
    this.addMode = false;
    this.editMode = false;
    var temp: any = this.allServiceList.filter((a, i) => i == index);
    this.assetService = new AssetServiceModel();
    this.assetService.AssetServiceId = temp[0].AssetServiceId;
    this.assetService.FixedAssetStockId = temp[0].FixedAssetStockId;
    this.assetService.ServiceDate = temp[0].ServiceDate;
    this.assetService.ServiceRemarks = temp[0].ServiceRemarks;
    this.assetService.ServiceCompleteDate = temp[0].ServiceCompleteDate;
    this.assetService.ServiceCompleteRemarks = temp[0].ServiceCompleteRemarks;
    this.editMode = true;

  }

  OnAddButtonClick() {
    this.assetService = new AssetServiceModel();
    // this.showResolvedDescription = false;
    this.editMode = false;
    this.addMode = true;

  }

  Update() {
    var isValid = true;
    if (this.assetService) {
      isValid = this.CheckValidation();
    }
    if (isValid) {
      this.fixedAssetBLService.PutAssetServiceDetails(this.assetService)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.editMode = false;
            this.msgBoxServ.showMessage("success", ["Assets Service Details has been Edit."]);
            this.GetAssetServiceHistory();

          }
          else {
            this.msgBoxServ.showMessage("Failed", [res.ErrorMessage]);

          }
        });

    } else {
      // this.loading = false;
      this.msgBoxServ.showMessage("Warning", ["Enter all required fields!"])
    }

  }

  public CheckValidation(): boolean {
    var isValid: boolean = true;
    if (this.addMode) {
      this.assetService.AssetServiceValidators.get('ServiceCompleteDate').clearValidators();
      this.assetService.AssetServiceValidators.get('ServiceCompleteRemarks').clearValidators();
    }
    for (var i in this.assetService.AssetServiceValidators.controls) {
      this.assetService.AssetServiceValidators.controls[i].markAsDirty();
      this.assetService.AssetServiceValidators.controls[i].updateValueAndValidity();
    }
    if (this.assetService.IsValidCheck(undefined, undefined)) {
      isValid = true
    }
    else {
      isValid = false;
    }
    return isValid;
  }

  // public ResolveFault(index: number) {
  //   this.editMode = false;
  //   this.addMode = false;

  //   var temp: any = this.allServiceList.filter((a, i) => i == index);
  //   this.assetService = new AssetServiceModel();
  //   this.assetService.FixedAssetStockId = temp[0].FixedAssetStockId;
  //   this.assetService.AssetServiceId = temp[0].AssetServiceId;

  //   this.showResolvedDescription = true;
  // }

  // public SubmitResolvedDetails() {
  //   this.assetService.IsFaultResolved = true;
  //   this.fixedAssetBLService.PutAssetFaultResolvedDetails(this.assetService).
  //     subscribe(res => {
  //       if (res.Status == "OK") {
  //         this.showResolvedDescription = false;
  //         this.GetFaultHistoryDetsils();
  //         this.msgBoxServ.showMessage("Success", ["Resolved Details Updated Succesfully !"]);
  //       } else {
  //         this.msgBoxServ.showMessage("Error", ["Failed to Update Resolved Details !"]);
  //       }
  //     });
  // }

  // public MarkAsUnderRepair() {
  //   this.selectedAsset.IsUnderMaintenance = true;
  //   this.PutRepairStatus();

  // }
  // public MarkAsRepaired(){
  //   this.selectedAsset.IsUnderMaintenance = false;
  //   this.PutRepairStatus();
  // }

  // public PutRepairStatus(){
  //   this.fixedAssetBLService.PutRepairStatus(this.selectedAsset).
  //         subscribe(res => {
  //           if (res.Status == "OK") {
  //             this.msgBoxServ.showMessage("Success", ["Maintenance Status Updated Succesfully !"]);

  //           } else {
  //             this.msgBoxServ.showMessage("Error", ["Failed to Update Under Maintenance Status !"]);
  //           }
  //         });
  // }
}


