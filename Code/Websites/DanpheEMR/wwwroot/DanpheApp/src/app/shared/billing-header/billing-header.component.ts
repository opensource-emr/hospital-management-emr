
import { Component } from "@angular/core"
import { Input } from "@angular/core"
import { CoreService } from "../../core/shared/core.service"

import { MessageboxService } from '../../shared/messagebox/messagebox.service';
@Component({
  selector: "billing-header",
  templateUrl: "./billing-header.html"
})

export class BillingHeaderComponent {

  // public showLogo: boolean = true;
  // public showQRcode: boolean = true;
  public InvoiceDisplaySettings: any = { "ShowHeader": true, "ShowQR": true, "ShowHospLogo": true };

  constructor(public coreService: CoreService, public msgBoxServ: MessageboxService) {
    this.GetBillingHeaderParameter();
    this.InvoiceDisplaySettings = this.coreService.GetInvoiceDisplaySettings();
  }



  public headerDetail: { CustomerName, Address, Email, CustomerRegLabel, CustomerRegNo, Tel };

  //Get customer Header Parameter from Core Service (Database) assign to local variable
  GetBillingHeaderParameter() {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'BillingHeader').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    else
      this.msgBoxServ.showMessage("error", ["Please enter parameter values for BillingHeader"]);
  }
}
