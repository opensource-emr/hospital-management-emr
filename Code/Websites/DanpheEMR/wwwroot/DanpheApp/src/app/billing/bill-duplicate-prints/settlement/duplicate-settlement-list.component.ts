import { Component } from '@angular/core';
import { BillingBLService } from '../../shared/billing.bl.service';
import { BillingDeposit } from "../../shared/billing-deposit.model";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { BillSettlementModel } from "../../shared/bill-settlement.model";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({
  templateUrl: './duplicate-settlement-list.html'
})
 
// App Component class
export class BIL_DuplicatePrint_SettlementListComponent {
  public settlementInfo: BillSettlementModel;
  public showReceipt: boolean = false;
  public settlMntList: Array<BillSettlementModel> = [];
  public settlmntGridCols: any;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public SettlementId:number = 0;

  constructor(
    public billingBLService: BillingBLService,
    public msgBoxServ: MessageboxService) {
    this.settlmntGridCols = GridColumnSettings.SettlementDuplicateColumns;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('CreatedOn', true));
    this.GetSettlementsList();
  }

  GetSettlementsList() {
    this.billingBLService.GetAllSettlements()
      .subscribe(res => {
        this.settlMntList = res.Results;
      });
  }


  DuplicateReceiptGridActions($event) {
    switch ($event.Action) {
      case "showDetails":
        {
          this.SettlementId = $event.Data.SettlementId;
          this.showReceipt = true;
          // let settlmntId = $event.Data.SettlementId;

          // this.billingBLService.GetSettlementInfoBySettlmentId(settlmntId)
          //   .subscribe((res: DanpheHTTPResponse) => {

          //     this.settlementInfo = res.Results;
          //     this.settlementInfo.Patient.CountrySubDivisionName = this.settlementInfo.Patient.CountrySubDivision.CountrySubDivisionName;
          //     this.showReceipt = true;
          //   });

        }
        break;
      default:
        break;
    }
  }
  ShowGridView() {
    this.GetSettlementsList();
    this.showReceipt = false;
    this.settlementInfo = null;
  }

}
