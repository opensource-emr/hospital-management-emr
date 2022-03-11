import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { InventoryBLService } from '../../../../inventory/shared/inventory.bl.service';
import { CoreService } from '../../../../core/shared/core.service';
import { InventoryService } from '../../../../inventory/shared/inventory.service';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { ProcurementBLService } from '../../../shared/procurement.bl.service';
import { GoodsReceipt } from '../../goods-receipt.model';

@Component({
  selector: 'app-goods-receipt-np-view',
  templateUrl: './goods-receipt-np-view.component.html',
  styleUrls: ['./goods-receipt-np-view.component.css']
})
export class GoodsReceiptNpViewComponent {
  @Input('good-receipt') public goodsReceipt: GoodsReceipt = new GoodsReceipt();
  @Input("note") public noteActivate: boolean;
  receivedRemarks: any;
  goodsreceiptID: number = null;
  header: any = null;
  headerDetail: { header1, header2, header3, header4, hospitalName, address, email, PANno, tel, DDA };
  constructor(public procBLService: ProcurementBLService, public inventoryService: InventoryService, public inventoryBLService: InventoryBLService, public msgBox: MessageboxService, public router: Router, public coreservice: CoreService) {
    this.header = JSON.parse(this.coreservice.Parameters[1].ParameterValue);
    this.GetInventoryBillingHeaderParameter();


  }
  //route to goods receipt list page
  goodsreceiptList() {
    this.router.navigate(['/ProcurementMain/GoodsReceipt/GoodsReceiptList']);
  }

  //Get Pharmacy Billing Header Parameter from Core Service (Database) assign to local variable
  GetInventoryBillingHeaderParameter() {
    var paramValue = this.coreservice.Parameters.find(a => a.ParameterName == 'Inventory Receipt Header').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    else
      this.msgBox.showMessage("error", ["Please enter parameter values for BillingHeader"]);
  }
}
