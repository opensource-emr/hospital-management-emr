import { Component, Input, Output, EventEmitter } from "@angular/core";
import { BillingBLService } from "../../shared/billing.bl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { InsuranceVM } from '../../shared/patient-billing-context-vm';
import { BillingService } from "../../shared/billing.service";

import { NumericDictionary } from "lodash";
import { CoreService } from "../../../core/shared/core.service";

@Component({
  selector: 'insurance-update-balance',
  templateUrl: './update-insurance-balance.html'
})

export class UpdateInsuranceBalanceComponent {

  //public currencyUnit: string;
  public updatedBalance: number = 0;

  @Input("insurance-detail")
  public insuraceDetail: InsuranceVM = new InsuranceVM();

  @Output("callback-update-balance")
  callBackUpdateBalance: EventEmitter<Object> = new EventEmitter<Object>();

  constructor(
    public msgBoxServ: MessageboxService,
    public billingBLService: BillingBLService,
    public billingService: BillingService,
    public coreService: CoreService) {
    //this.currencyUnit = this.billingService.currencyUnit;
  }


  SubmitUpdateInsuranceBalance() {
    if (this.updatedBalance >= 0) {
      //calling BLServices with three parameters 
      this.billingBLService.UpdateInsBalance(this.insuraceDetail.PatientId, this.insuraceDetail.InsuranceProviderId, this.updatedBalance)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.callBackUpdateBalance.emit({ action: "balance-updated", UpdatedBalance: this.updatedBalance, PatientId: this.insuraceDetail.PatientId});
            this.msgBoxServ.showMessage("success", ["Insurance Balance of " + this.coreService.currencyUnit + this.updatedBalance + " Updated successfully."]);
           // this.showInsBalanceUpdate = false;
          }
          else {
            this.msgBoxServ.showMessage("failed", ["Cannot complete the transaction."]);
          }
        });
    }
    else {
      this.msgBoxServ.showMessage("failed", [" Amount must be equal or greater than 0"]);
    }
  }


  ClosePopup() {

    this.callBackUpdateBalance.emit({action:"close", currentBalance: this.updatedBalance });

  }


}
