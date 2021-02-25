
import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { BillItemPriceModel } from '../../../settings-new/shared/bill-item-price.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import GridColumnSettings from "../../../shared/danphe-grid/grid-column-settings.constant";
import { FractionCalculationService } from "../../shared/fraction-calculation.service";
import { BillingTransactionItem } from "../../../billing/shared/billing-transaction-item.model";
import { Router } from "@angular/router";

@Component({
  selector: 'fraction-applicable-list',
  templateUrl: './fraction-applicable-list.component.html',
})
export class FractionApplicableListComponent {
  public billingTxnItemList: Array<BillingTransactionItem> = new Array<BillingTransactionItem>();
  public showGrid: boolean = false;
  public billingItemGridColumns: Array<any> = null;
  public showBillItemPriceHistoryPage: boolean = false;
  public billItemPriceChangeHistoryList: any;

  public showAddPage: boolean = false;
  public selectedItem: BillItemPriceModel;
  public index: number;
  public itemId: number = null;

  constructor(public fractionCalculationService: FractionCalculationService,
    public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService,
    public router: Router
  ) {
    this.billingItemGridColumns = GridColumnSettings.TxnItemList;

    this.getBillingItemList();
    this.showBillItemPriceHistoryPage = false;
  }
  public getBillingItemList() {
    this.fractionCalculationService.GetFractionApplicableTxnItemList()
      .subscribe(res => {
        this.billingTxnItemList = res;
      });
  }
  BillingItemGridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "add": {
        this.fractionCalculationService.BillTxnId = $event.Data.BillTransactionItemId;
        this.fractionCalculationService.BillItemPriceId = $event.Data.BillItemPriceId;
        this.fractionCalculationService.BillTransactionItem = $event.Data;
        this.router.navigate(['/Fraction/Calculation/Calculate']);
        break;
      }
      case "view": {
        if ($event.Data != null) {
          this.fractionCalculationService.BillTxnId = $event.Data.BillTransactionItemId;
          this.fractionCalculationService.BillItemPriceId = $event.Data.BillItemPriceId;
          this.fractionCalculationService.BillTransactionItem = $event.Data;
          this.router.navigate(['/Fraction/Calculation/CalculateDetails']);
        }
        break;
      }
      default:
        break;
    }
  }
  AddBillingItem() {
    this.showAddPage = false;
    this.changeDetector.detectChanges();
    this.showAddPage = true;
  }


  logError(err: any) {
    console.log(err);
    this.msgBoxServ.showMessage("error", [err]);
  }


}
