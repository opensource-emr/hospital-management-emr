import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from '../../../core/shared/core.service';
import { InventoryService } from '../../../inventory/shared/inventory.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../../shared/routefrom.service';
import { ReturnToVendorItem } from '../return-to-vendor-items.model';
import { InventoryBLService } from '../../shared/inventory.bl.service';

@Component({
  selector: 'app-return-to-vendor-view',
  templateUrl: './return-to-vendor-view.component.html',
  styles: []
})
export class ReturnToVendorViewComponent implements OnInit {
  ngOnInit() {
    document.getElementById("printBtn").focus();
  }


  public returnItemDetails: Array<ReturnToVendorItem> = new Array<ReturnToVendorItem>();
  public returnDate: string = null;
  public createdOn: string = null;
  public vendorId: number = 0;
  public header: any = null;
  public returnBy: string = null;
  public vendorName: string = null;
  public SubTotal: number = 0;
  public VATTotal: number = 0;
  public AllTotalAmount: number = 0;
  public PurchaseReturnNumber: string = "PI000";
  msgBoxServ: any;

  constructor(
    public inventoryBLService: InventoryBLService,
    public messageBoxService: MessageboxService,
    public inventoryService: InventoryService,
    public routeFrom: RouteFromService,
    public router: Router,
    public coreService: CoreService) {
    this.LoadReturnItems(this.inventoryService.CreatedOn, this.inventoryService.VendorId);
    this.GetInventoryBillingHeaderParameter();
  }

  LoadReturnItems(CreatedOn: string, VendorId: number) {
    if (CreatedOn != null && VendorId != 0) {
      this.createdOn = CreatedOn;
      this.vendorId = VendorId;
      this.inventoryBLService.GetReturnItemList(CreatedOn, VendorId)
        .subscribe(res => this.ShowReturnItemDetails(res));
    } else {
      this.messageBoxService.showMessage("notice-message", ['Invalid Data to list itmes.']);
    }
  }

  ShowReturnItemDetails(res) {
    if (res.Status == "OK") {
      this.returnItemDetails = res.Results;
      this.returnDate = this.returnItemDetails[0].CreatedOn;
      this.returnBy = this.returnItemDetails[0].CreatedByName;
      this.vendorName = this.returnItemDetails[0].VendorName;
      this.PurchaseReturnNumber = this.PurchaseReturnNumber + this.returnItemDetails[0].ReturnToVendorItemId;
      this.returnItemDetails.forEach(
        r => {
          this.SubTotal += r.TotalAmount;
          this.VATTotal += r.VAT = !isNaN ? r.VAT : 0;
          this.AllTotalAmount += r.TotalAmount + r.VAT;

        });
    }
    else {
      this.messageBoxService.showMessage("notice-message", ["No data for the return items."]);
      this.returnToVendorList();
    }
  }

  //route back
  returnToVendorList() {
    this.router.navigate(['/Inventory/ReturnToVendor/ReturnToVendorList']);
  }

  //this is used to print the receipt
  print() {
    let popupWinindow;
    var printContents = document.getElementById("printpage").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    popupWinindow.document.write('<html><head><style>.img-responsive{ position: relative;left: -65px;top: 10px;}.qr-code{position:relative;left: 93px;top: 5px;}</style><link rel="stylesheet" type="text/css" href="../../themes/theme-default/ReceiptList.css" /></head><style>.printStyle {border: dotted 1px;margin: 10px 100px;}.print-border-top {border-top: dotted 1px;}.print-border-bottom {border-bottom: dotted 1px;}.print-border {border: dotted 1px;}.center-style {text-align: center;}.border-up-down {border-top: dotted 1px;border-bottom: dotted 1px;}</style><body onload="window.print()">' + printContents + '</html>');
    popupWinindow.document.close();
  }

  public headerDetail: { header1, header2, header3, header4, hospitalName, address, email, PANno, tel, DDA };

  //Get Pharmacy Billing Header Parameter from Core Service (Database) assign to local variable
  GetInventoryBillingHeaderParameter() {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Inventory Receipt Header').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    else
      this.msgBoxServ.showMessage("error", ["Please enter parameter values for BillingHeader"]);
  }

}
