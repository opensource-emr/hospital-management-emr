import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { InventoryBLService } from '../../../../inventory/shared/inventory.bl.service';
import { CoreService } from '../../../../core/shared/core.service';
import { InventoryService } from '../../../../inventory/shared/inventory.service';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { ProcurementBLService } from '../../../shared/procurement.bl.service';
import { GoodsReceipt } from '../../goods-receipt.model';
import { InventoryFieldCustomizationService } from '../../../../shared/inventory-field-customization.service';

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
  showSpecification: boolean = false;
  constructor(public procBLService: ProcurementBLService, public inventoryService: InventoryService, public inventoryBLService: InventoryBLService, public msgBox: MessageboxService, public router: Router, public coreservice: CoreService, public inventoryFieldCustomizationService: InventoryFieldCustomizationService) {
    this.header = JSON.parse(this.coreservice.Parameters[1].ParameterValue);
    this.GetInventoryBillingHeaderParameter();
    this.GetInventoryFieldCustomization();


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
  GetInventoryFieldCustomization(): void {
    let parameter = this.inventoryFieldCustomizationService.GetInventoryFieldCustomization();
    this.showSpecification = parameter.showSpecification;
  }
}
