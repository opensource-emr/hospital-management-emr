import { Component, EventEmitter, Output, Input } from "@angular/core";
import { FixedAssetStockModel } from "../../shared/fixed-asset-stock.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { Router } from "@angular/router";
import * as moment from "moment";
import { FixedAssetBLService } from "../../shared/fixed-asset.bl.service";



@Component({
  selector: "asset-maintenance-edit",
  templateUrl: "./asset-maintenance-edit.html",
})


export class AssetsMaintenaceEditComponent {
  public FixedAssetStockId: number = 0;
  public EditFixedAssetStocList: boolean = false;
  public fixedassetstoclist: Array<FixedAssetStockModel> = new Array<FixedAssetStockModel>();
  public loading: boolean = false;
  public showAssetForm: boolean = false;
  public EditMode: boolean = false;
  //public changeDetectorRef: ChangeDetectorRef;



  public selectedAssetForEdit: FixedAssetStockModel = new FixedAssetStockModel();

  @Output('edit-callback')
  public editEmitter: EventEmitter<Object> = new EventEmitter<Object>();

  constructor(
    public msgBoxServ: MessageboxService,
    public fixedAssetBLService: FixedAssetBLService,
    public router: Router
  ) {
  }



  @Input('selectedAssetForEdit')
  public set Value(val) {
    if (val) {
      this.selectedAssetForEdit.ItemName = val.ItemName;
      this.selectedAssetForEdit.ItemCode = val.ItemCode;
      this.selectedAssetForEdit.VendorName = val.VendorName;
      this.selectedAssetForEdit.BarCodeNumber = val.BarCodeNumber;
      this.selectedAssetForEdit.TotalLife = val.TotalLife;
      this.selectedAssetForEdit.YearOfUse = val.YearOfUse;
      this.selectedAssetForEdit.WarrantyExpiryDate = val.WarrantyExpiryDate;
      this.selectedAssetForEdit.Performance = val.Performance;
      this.selectedAssetForEdit.VendorId = val.VendorId;
      this.selectedAssetForEdit.FixedAssetStockId = val.FixedAssetStockId;
      this.selectedAssetForEdit.PhoneNumber = val.PhoneNumber;
      this.selectedAssetForEdit.PhoneNumber2 = val.PhoneNumber2;
      this.selectedAssetForEdit.Name = val.Name;
      this.selectedAssetForEdit.Name2 = val.Name2;
      this.selectedAssetForEdit.CompanyPosition = val.CompanyPosition;
      this.selectedAssetForEdit.CompanyPosition2 = val.CompanyPosition2;
      this.selectedAssetForEdit.PeriodicServiceDays = val.PeriodicServiceDays;

      if (this.selectedAssetForEdit.InstallationDate) {
        // this.selectedAssetForEdit.InstallationDate = moment(val.InstallationDate).format("YYYY-MM-DD");
        this.selectedAssetForEdit.InstallationDate = val.InstallationDate;
      } else {
        this.selectedAssetForEdit.InstallationDate = moment().format("YYYY-MM-DD");
      }

      if (this.selectedAssetForEdit.ManufactureDate) {
        this.selectedAssetForEdit.ManufactureDate = val.ManufactureDate;
      } else {
        this.selectedAssetForEdit.ManufactureDate = moment().format("YYYY-MM-DD");
      }

      this.showAssetForm = true;
    }
  }



  Save() {
    let validationObj = { isValid: true, messageArr: [] as string[] };
    for (var a in this.selectedAssetForEdit.FAEditAssetMainteanceValidators.controls) {
      this.selectedAssetForEdit.FAEditAssetMainteanceValidators.controls[a].markAsDirty();
      this.selectedAssetForEdit.FAEditAssetMainteanceValidators.controls[a].updateValueAndValidity();
    }
    if (this.selectedAssetForEdit.IsEditAssetmaintenanceValidCheck(undefined, undefined) == false) {
      validationObj.isValid = false;
      validationObj.messageArr.push("Please check all the required fields.");
      this.msgBoxServ.showMessage("Waring", validationObj.messageArr);
    }
    else {


      let check = true;
      this.fixedAssetBLService.UpdateAssetMaintenanceFixedAssetStocList(this.selectedAssetForEdit)
        .subscribe(res => {
          if (res.Status == "OK") {

            this.msgBoxServ.showMessage("success", ["Assets Maintenance has been Update."]);
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




}







