import { Component, Input } from "@angular/core"
import { CoreService } from "../../core/shared/core.service";
import { MessageboxService } from "../messagebox/messagebox.service";

@Component({
    selector: "print-header",
    templateUrl: "./print-header.html",

})


export class PrintHeaderComponent {
  public headerDetail: any;

  @Input("unit-name")
  public unitname: string = "PHARMACY UNIT";

  constructor(public coreService: CoreService,
    public msgBoxServ: MessageboxService) {
    this.GetHeaderParameter();
  }
  //Get customer Header Parameter from Core Service (Database) assign to local variable
  GetHeaderParameter() {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterGroupName == "Pharmacy" && a.ParameterName == "Pharmacy BillingHeader").ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    else
      this.msgBoxServ.showMessage("error", ["Please enter parameter values for BillingHeader"]);
  }


}
