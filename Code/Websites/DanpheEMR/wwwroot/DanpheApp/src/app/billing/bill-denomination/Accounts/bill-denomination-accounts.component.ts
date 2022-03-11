import { Component, ChangeDetectorRef } from "@angular/core";
import { NepaliDateInGridColumnDetail } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { NepaliDateInGridParams } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { CoreService } from "../../../core/shared/core.service";
import { DLService } from "../../../shared/dl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { BillingGridColumnSettings } from "../../shared/billing-grid-columns";
import { BillingBLService } from "../../shared/billing.bl.service";
import { HandOverTransactionModel } from "../../shared/hand-over-transaction.model";


@Component({
  selector: 'billing-denomination-account',
  templateUrl: './bill-denomination-accounts.html',
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class BillingDenominationAccountsComponent {

  public HandOverTransactionListGridColumns: Array<any> = new Array<any>();
  public HandOverTransactionList: Array<any> = new Array<any>();
  public ShowReceivePopup: boolean = false;

  public selectedHandOverTransaction: HandOverTransactionModel = new HandOverTransactionModel();

  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  constructor(
    public billingBLService: BillingBLService,
    public dLService: DLService,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService) {
    this.GetHandoverTransaction();
    this.HandOverTransactionListGridColumns = BillingGridColumnSettings.HandOverTransactionList;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('VoucherDate', false));
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('CreatedOn', false));
  }

  ngOnInit() {

  }

  GetHandoverTransaction() {
    this.billingBLService.GetHandoverTransactionDetails()
      .subscribe(
        res => {
          if (res.Status == "OK") {
            var allHandOverTransactionList = res.Results;
            this.HandOverTransactionList = allHandOverTransactionList.filter(a => a.ReceivedById == null);
          }
          else {
            this.msgBoxServ.showMessage("failed", ["Something Wrong."]);
            console.log(res.ErrorMessage);
          }
        });
  }


  HandOverTransactionListGridActions($event) {
    switch ($event.Action) {
      case "handover-receive":
        {
          this.ShowReceivePopup = true;
          this.selectedHandOverTransaction = $event.Data;
          console.log($event);
        }
        break;

      default:
        break;
    }
  }

  ClosePopup() {
    this.ShowReceivePopup = false;
    this.selectedHandOverTransaction = new HandOverTransactionModel();
  }

  ReciveHandoverAmount() {
    if (!this.selectedHandOverTransaction.ReceiveRemarks) {
      this.msgBoxServ.showMessage("failed", ["Enter Receive Remarks."]);
      return;
    }
    this.billingBLService.UpdateHandoverTransactionDetails(this.selectedHandOverTransaction)
      .subscribe(
        res => {
          if (res.Status == "OK") {
            this.selectedHandOverTransaction = new HandOverTransactionModel();
            this.ShowReceivePopup = false;
            this.GetHandoverTransaction();
            this.msgBoxServ.showMessage("success", ["Handover Amount Recived."]);

          }
          else {
            this.msgBoxServ.showMessage("failed", ["Something Wrong."]);
            console.log(res.ErrorMessage);
          }
        });
  }

  public hotkeys(event) {
    if (event.keyCode == 27) {//key->ESC
      this.ClosePopup();
    }
  }
}
