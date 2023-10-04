import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from '../../../../core/shared/core.service';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { PurchaseOrder } from '../../purchase-order.model';

@Component({
  selector: 'app-purchase-order-np-view',
  templateUrl: './purchase-order-np-view.component.html',
  styleUrls: ['./purchase-order-view-np.component.css']
})
export class PurchaseOrderNpViewComponent {
  @Input('purchase-order') public purchaseorderDetails: PurchaseOrder = new PurchaseOrder();
  public headerDetail: { header1, header2, header3, header4, hospitalName, address, email, PANno, tel, DDA };
  constructor(
    public coreService: CoreService,
    public messageBoxService: MessageboxService,
    public router: Router,) {
    this.GetInventoryBillingHeaderParameter();
  }

  //Get Pharmacy Billing Header Parameter from Core Service (Database) assign to local variable
  GetInventoryBillingHeaderParameter() {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Inventory Receipt Header').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    else
      this.messageBoxService.showMessage("error", ["Please enter parameter values for BillingHeader"]);
  }

}
