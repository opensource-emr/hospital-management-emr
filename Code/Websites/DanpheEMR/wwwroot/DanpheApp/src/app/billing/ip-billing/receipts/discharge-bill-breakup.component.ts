import { Component, Input, OnInit } from "@angular/core";
import { DischargeBillVM } from "../shared/discharge-bill.view.models";
import { CoreService } from "../../../core/shared/core.service";

@Component({
    selector: "discharge-bill-breakup",
    templateUrl: "./discharge-bill-breakup.html"
})
export class DischargeBillBreakupComponent {

    @Input("discharge-bill")
    public dischargeBill: DischargeBillVM;
 
    @Input("billType")
  public billType: string;
  public ShowProviderName: boolean;

  constructor(public coreService: CoreService) {
    this.ShowProviderName = this.coreService.SetShowProviderNameFlag();
  }

}
