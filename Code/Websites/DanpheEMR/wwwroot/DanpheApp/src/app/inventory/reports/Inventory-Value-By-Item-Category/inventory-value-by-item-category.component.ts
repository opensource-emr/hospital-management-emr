import { Component } from "@angular/core";
import * as moment from "moment";
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { InventoryBLService } from "../../shared/inventory.bl.service";
import { ApprovedMaterialStockRegisterReportModel } from "../shared/approved-material-stock-register-report.model";
import { InventoryReportsBLService } from "../shared/inventory-reports.bl.service";
import { InventoryReportsDLService } from "../shared/inventory-reports.dl.service";




@Component({

  templateUrl: "./InventoryValueByItemCategory.html"

})
export class InventoryValueByItemCategoryComponent {


  constructor() {





  }











  // GetItemSubCategoryList() {
  //   this.invSettingBL.GetItemSubCategory()
  //     .subscribe(res => {
  //       if (res.Status == 'OK') {
  //         this.ItemSubCategoryList = res.Results.filter(a => a.IsActive);
  //       } else {
  //         this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
  //       }
  //     });
  // }



}