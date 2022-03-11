import { Component, EventEmitter, Output, Input } from "@angular/core";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { Router } from "@angular/router";
import { FixedAssetFaultHistoryModel } from "./fixed-asset-fault-history.model";
import { FixedAssetStockModel } from "../../shared/fixed-asset-stock.model";
import { FixedAssetBLService } from "../../shared/fixed-asset.bl.service";


@Component({
  selector: "asset-fault-update",
  templateUrl: "./asset-fault-update.html",
})

export class AssetFaultUpdateComponent {
  public assetFaultUpdate: FixedAssetFaultHistoryModel = new FixedAssetFaultHistoryModel();
  public allFaultUpdateList: Array<FixedAssetFaultHistoryModel> = new Array<FixedAssetFaultHistoryModel>()
  public fixedAssetStockId: any;
  public showAddFaultDescription: boolean = false;
  public faultedit: boolean = false;

  @Output('edit-callback')
  public editEmitter: EventEmitter<Object> = new EventEmitter<Object>();

  public selectedAsset: FixedAssetStockModel = new FixedAssetStockModel();
  public showNotifyDamage: boolean = false;
  showResolvedDescription: boolean;
  alsoEditResolvedInfo: boolean;
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
      this.assetFaultUpdate = new FixedAssetFaultHistoryModel();
      this.assetFaultUpdate.FixedAssetStockId = this.fixedAssetStockId;
      this.GetFaultHistoryDetsils();
    }
  }

  Confirm() {
    this.showAddFaultDescription = false;
    this.assetFaultUpdate.FixedAssetStockId = this.fixedAssetStockId;
    this.fixedAssetBLService.ConfirmFaultUpdate(this.assetFaultUpdate)
      .subscribe(res => {
        if (res.Status == "OK") {

          this.msgBoxServ.showMessage("success", ["Assets Fault  has been Update."]);
          this.GetFaultHistoryDetsils();

        }
        else {
          this.msgBoxServ.showMessage("Failed", [res.ErrorMessage]);

        }
      });


  }

  GetFaultHistoryDetsils() {
    this.fixedAssetBLService.GetFaultHistoryDetsils(this.fixedAssetStockId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.allFaultUpdateList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("error", ["Failed to get FaultHistory Detsils. " + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["Failed to get FaultHistory Detsils. " + err.ErrorMessage]);
        });
  }

  Close() {
    this.showResolvedDescription = false;
    this.showAddFaultDescription = false;
    this.faultedit = false;
    this.editEmitter.emit({ data: "Close" });
  }

  Edit(index: number) {
    this.showAddFaultDescription = false;
    this.showResolvedDescription = false;

    var temp: any = this.allFaultUpdateList.filter((a, i) => i == index);
    this.assetFaultUpdate = new FixedAssetFaultHistoryModel();
    this.assetFaultUpdate = temp[0];
    if (this.assetFaultUpdate.IsFaultResolved) {
      this.alsoEditResolvedInfo = true;
    }
    this.faultedit = true;

  }

  Add() {
    this.assetFaultUpdate = new FixedAssetFaultHistoryModel();
    this.showResolvedDescription = false;
    this.faultedit = false;
    this.alsoEditResolvedInfo = false;
    this.showAddFaultDescription = true;

  }
  Update() {
    this.faultedit = false;
    this.fixedAssetBLService.EditFaultUpdate(this.assetFaultUpdate)
      .subscribe(res => {
        if (res.Status == "OK") {

          this.msgBoxServ.showMessage("success", ["Assets Fault  has been Edit."]);
          this.GetFaultHistoryDetsils();

        }
        else {
          this.msgBoxServ.showMessage("Failed", [res.ErrorMessage]);

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
    this.showNotifyDamage = false;
  }
  public ResolveFault(index: number) {
    this.faultedit = false;
    this.showAddFaultDescription = false;

    var temp: any = this.allFaultUpdateList.filter((a, i) => i == index);
    this.assetFaultUpdate = new FixedAssetFaultHistoryModel();
    this.assetFaultUpdate.FixedAssetStockId = temp[0].FixedAssetStockId;
    this.assetFaultUpdate.FaultHistoryId = temp[0].FaultHistoryId;
    this.showResolvedDescription = true;
  }

  public SubmitResolvedDetails() {
    this.assetFaultUpdate.IsFaultResolved = true;
    this.fixedAssetBLService.PutAssetFaultResolvedDetails(this.assetFaultUpdate).
      subscribe(res => {
        if (res.Status == "OK") {
          this.showResolvedDescription = false;
          this.GetFaultHistoryDetsils();
          this.msgBoxServ.showMessage("Success", ["Resolved Details Updated Succesfully !"]);
        } else {
          this.msgBoxServ.showMessage("Error", ["Failed to Update Resolved Details !"]);
        }
      });
  }
  public MarkAsUnderRepair() {
    this.selectedAsset.IsUnderMaintenance = true;
    this.PutRepairStatus();

  }
  public MarkAsRepaired() {
    this.selectedAsset.IsUnderMaintenance = false;
    this.PutRepairStatus();
  }
  public PutRepairStatus() {
    this.fixedAssetBLService.PutRepairStatus(this.selectedAsset).
      subscribe(res => {
        if (res.Status == "OK") {
          this.msgBoxServ.showMessage("Success", ["Maintenance Status Updated Succesfully !"]);

        } else {
          this.msgBoxServ.showMessage("Error", ["Failed to Update Under Maintenance Status !"]);
        }
      });
  }
}


