import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from '../../../../core/shared/core.service';
import { PharmacyReceiptModel } from '../../../../pharmacy/shared/pharmacy-receipt.model';
import { PharmacyBLService } from '../../../../pharmacy/shared/pharmacy.bl.service';
import { PharmacyService } from '../../../../pharmacy/shared/pharmacy.service';
import { SecurityService } from '../../../../security/shared/security.service';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../../../shared/routefrom.service';

@Component({
  selector: 'app-print-receipt',
  templateUrl: './print-receipt.component.html',
  styles: [],
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class PrintReceiptComponent implements OnInit {

  public numberofbill: { pharmacy, billing, inventory };
  public noOfBillGenerate: number = 0;
  currentReceiptNo: number = 1;
  pharmacyReceipt: PharmacyReceiptModel = new PharmacyReceiptModel();
  popUp:boolean=false;

  constructor(public coreService: CoreService,
    public pharmacyBLService: PharmacyBLService, public securityService: SecurityService,
    public pharmacyService: PharmacyService, public msgbox: MessageboxService,
    public router: Router, public routeFromSrv: RouteFromService
  ) {
    ////this.showReceiptNavigation = (routeFromSrv.RouteFrom == "sales");
    routeFromSrv.RouteFrom = "";//reset value to empty once checked.
    this.pharmacyReceipt = this.pharmacyService.globalPharmacyReceipt;
    if (this.pharmacyService.globalPharmacyReceipt.PrintCount == 0 && this.pharmacyService.globalPharmacyReceipt.ReceiptNo != 0) {
      this.GetBillPrintParameter();
    }
    this.currentReceiptNo = this.pharmacyReceipt.ReceiptNo;
  }
  ngOnInit() {
    this.openPopUp();
  }


  GetBillPrintParameter() {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Bill Print Parameter').ParameterValue;
    if (paramValue) {
      this.numberofbill = JSON.parse(paramValue);
      this.noOfBillGenerate = parseInt(this.numberofbill.pharmacy);
    }
    else {
      this.msgbox.showMessage("error", ["Please enter parameter values for BillingHeader"]);
    }
  }

  openPopUp(){
    this.popUp=true;

  }
  Close(){
    this.popUp=false;
    window.history.back();
  }
  public hotkeys(event) {
    //For ESC key => close the pop up
    if (event.keyCode == 27) {
      this.Close();
    }
  }
}
