import { Component } from "@angular/core";
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { PharmacyService } from '../shared/pharmacy.service';
import { PharmacyBLService } from '../shared/pharmacy.bl.service';
import { PharmacyReceiptModel } from "../shared/pharmacy-receipt.model";
import { PHRMInvoiceItemsModel } from "../shared/phrm-invoice-items.model";
import { PHRMInvoiceModel } from "../shared/phrm-invoice.model";
import { RouteFromService } from '../../shared/routefrom.service';
import { SecurityService } from '../../security/shared/security.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';

@Component({
    templateUrl: "../../view/pharmacy-view/Sale/PHRMReceiptPrint.html" // "/PharmacyView/PHRMReceiptPrint"
})
export class PHRMReceiptPrintComponent {

    //showReceiptNavigation: boolean = false;
    //disablePreviousBtn: boolean = false;
    //disableNextBtn: boolean = false;
    //showOpdSticker: boolean = false;
    

    currentReceiptNo: number = 1;
    pharmacyReceipt: PharmacyReceiptModel = new PharmacyReceiptModel();
    constructor(
        public pharmacyBLService: PharmacyBLService, public securityService: SecurityService,
        public pharmacyService: PharmacyService, public msgbox: MessageboxService, 
                 public router: Router, public routeFromSrv: RouteFromService
   ) {
       ////this.showReceiptNavigation = (routeFromSrv.RouteFrom == "sales");
        routeFromSrv.RouteFrom = "";//reset value to empty once checked.

        this.pharmacyReceipt = this.pharmacyService.globalPharmacyReceipt;
        this.currentReceiptNo = this.pharmacyReceipt.ReceiptNo;
        
    }


    //PreviousReceipt() {
    //    if (this.currentReceiptNo > 1) {
    //        this.currentReceiptNo -= 1;
    //        this.GetTransactionDetails(this.currentReceiptNo);
    //    }
    //    else {
    //        this.disablePreviousBtn = true;
    //    }
    //}

    //NextReceipt() {
    //    //need to get last receiptno to disable next button when reached to the end.
    //    this.currentReceiptNo += 1;
    //   /// this.showReceiptNavigation = false;
    //    this.GetTransactionDetails(this.currentReceiptNo);
    //   /// this.showReceiptNavigation = true;
    //    this.disablePreviousBtn = false;
    //}

    //GetTransactionDetails(receiptNo: number) {
    //    this.pharmacyBLService.GetPharmacyInvoiceDetailsByInvoiceId(receiptNo)
    //        .subscribe(res => {
    //            if (res.Status == "OK" && res.Results.length>0) {
    //                let dupReceipt = PharmacyReceiptModel.GetReceiptForTransaction(res.Results[0].Invoice);
    //                dupReceipt.IsValid = true;
    //                dupReceipt.ReceiptType = "Sale Receipt";
    //                dupReceipt.BillingUser = this.securityService.GetLoggedInUser().UserName;
    //                dupReceipt.Patient = res.Results[0].selectedPatient;
    //               // this.pharmacyService.globalPharmacyReceipt = dupReceipt;
    //               /// this.router.navigate(['/Pharmacy/Sale/ReceiptPrint']);
                    
    //                this.pharmacyReceipt = dupReceipt;

    //            }
    //            else
    //            {
    //                this.msgbox.showMessage("error", ['Receipt No ' +receiptNo +' is Not Available']);
    //                this.pharmacyReceipt = new PharmacyReceiptModel();
    //            }
    //        });

    //}
 
}