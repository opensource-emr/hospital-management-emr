import { Component, Input, EventEmitter, Output } from "@angular/core";
import { FixedAssetStockModel } from "../../shared/fixed-asset-stock.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { FixedAssetBLService } from "../../shared/fixed-asset.bl.service";


@Component({
  selector: "notify-damage",
  templateUrl: "./notify-damage.html",
})

export class NotifyDamagedComponent {

  public selectedAsset: FixedAssetStockModel = new FixedAssetStockModel();
  //public showPopWindow: boolean = true;
  @Output("notify-damage-callback")
  public damageEmitter: EventEmitter<Object> = new EventEmitter<Object>();
  public loading: boolean = false;
  public MarkDamage: boolean = true;

  constructor(public messageBoxService: MessageboxService,
    public fixedAssetBLService: FixedAssetBLService) {

  }
  ngOnInit() {

  }

  @Input("selectedAsset")
  public set value(val) {
    if (val) {
      this.selectedAsset = val;
      if (this.selectedAsset && this.selectedAsset.IsAssetDamaged) {
        this.MarkDamage = false;
      }
    }
  }

  UpdateAssetDamageStatus() {
    this.loading = true;
    var isValid = true;
    if (this.selectedAsset) {
      isValid = this.CheckValidation();
    } else {
      isValid = false;
    }
    if (isValid) {
      if (this.MarkDamage) {
        this.selectedAsset.IsAssetDamaged = true; // mark damage
      } else {
        this.selectedAsset.IsAssetDamaged = false; // unmark damage
        this.selectedAsset.UndamagedRemarks = this.selectedAsset.DamagedRemarks; // unmark damage remarks
      }
      this.PutAssetDamage();
    } else {
      this.messageBoxService.showMessage("Failed", ["Please fill valid data !!"]);

    }
  }

  public PutAssetDamage() {
    this.fixedAssetBLService.UpdateAssetDamageStatus(this.selectedAsset).subscribe(res => {
      if (res.Status == "OK") {
        var message: string;
        if (this.MarkDamage) {
          message = "Asset Marked Damage Successfully!";
        } else {
          message = "Asset Damage Canceled Successfully!";

        }
        this.messageBoxService.showMessage("Sucess", [message]);
        //this.showPopWindow = false;
        this.damageEmitter.emit({ Status: "Ok", Data: res.Results });

      } else {
        this.messageBoxService.showMessage("Failed", ["Task Failed!"]);
        //this.showPopWindow = false;
        this.damageEmitter.emit({ Status: "Error", Data: null });

      }
    });
  }
  public CheckValidation(): boolean {
    var isValid: boolean = true;
    this.selectedAsset.FAStockValidators.get('ScrapRemarks').clearValidators();
    this.selectedAsset.FAStockValidators.get('ScrapAmount').clearValidators();
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
    this.damageEmitter.emit({ Status: "Close", Data: null });
  }
}
