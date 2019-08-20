import { Component, ChangeDetectorRef } from "@angular/core";
import { Router } from '@angular/router';
import { SecurityService } from '../../security/shared/security.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';

import { PharmacyBLService } from "../shared/pharmacy.bl.service"
import { PatientService } from "../../patients/shared/patient.service";
import { PharmacyService } from "../shared/pharmacy.service"
import { CommonFunctions } from "../../shared/common.functions";
import { PHRMInvoiceItemsModel } from "../shared/phrm-invoice-items.model";
//import { PHRMInvoiceItemsModel } "../shared/phrm-invoice-items.model";
@Component({
    templateUrl: "../../view/pharmacy-view/Sale/PHRMSaleCredit.html" //  "/PharmacyView/PHRMSaleCredit"
})
export class PHRMSaleCreditComponent {

    public creditBillInvItems: Array<PHRMInvoiceItemsModel> = new Array<PHRMInvoiceItemsModel>();
    public loading: boolean = false;

    //constructor of class
    constructor(
        public pharmacyBLService: PharmacyBLService, public pharmacyService: PharmacyService,
        public changeDetectorRef: ChangeDetectorRef,
        public router: Router,
        public patientService: PatientService,
        public securityService: SecurityService,
        public messageboxService: MessageboxService
    ) {
        this.Load(this.pharmacyService.Id);
    }
    //NBB-Get only those items which BillItemStatus!=paid    
    Load(InvoiceId) {
        if (InvoiceId != null) {
            this.pharmacyBLService.GetSaleInvoiceItemsByInvoiceId(InvoiceId)
                .subscribe(res => {
                    if (res.Status == 'OK') {
                        this.creditBillInvItems = res.Results;
                        this.creditBillInvItems.forEach(itm => {
                            itm.CreatedOn = moment(itm.CreatedOn).format('YYYY-MM-DD');
                        }
                        )
                    }
                    else {
                        this.logError(res.ErrorMessage);
                    }
                },
                err => {
                    this.logError("failed to get invoice items")
                });
        } else {
            //if there is no invoice id then  return to list page
            this.messageboxService.showMessage("notice", ["Please select invoice!"]);
            this.router.navigate(['/Pharmacy/Sale/List']);
        }
    }
    //pay credit  bill items and update status of InvoiceItems and Invoice also
    PayCreditBill(index) {
        try {
            if (index != undefined && index != NaN) {
                this.loading = true;
                let itemsCount = this.creditBillInvItems.length;
                if (itemsCount) {
                    let selectedItems: Array<PHRMInvoiceItemsModel> = new Array<PHRMInvoiceItemsModel>();//use array
                    if (index == "All") {//payment for all items
                        this.creditBillInvItems.forEach(itm => {
                            itm.BilItemStatus = "paid";
                            selectedItems.push(itm);
                        });
                    } else {//payment only for one clicked item      
                        this.creditBillInvItems[index].BilItemStatus = "paid";
                        selectedItems.push(this.creditBillInvItems[index]);
                    }
                    //put data to db
                    this.pharmacyBLService.putPayInvoiceItemsCredit(selectedItems)
                        .subscribe(res => {
                            if (res.Status == "OK" && res.Results == 1) {
                                this.CallBackCreditPay(res)
                                this.messageboxService.showMessage("success", ["Paid sucessfully. Thank You!"]);
                            }
                            else if (res.Status == "Failed") {
                                this.loading = false;
                                this.messageboxService.showMessage("error", ['There is problem, please try again']);
                            }
                        },
                        err => {
                            this.loading = false;
                            this.messageboxService.showMessage("error", [err.ErrorMessage]);
                        });

                } else {
                    this.messageboxService.showMessage("error", ["No item for pay"]);
                }
            }
        } catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
    //after successfully credit payment completed call to this one
    CallBackCreditPay(res) {
        try {
            //navigate to sale list page        
            this.router.navigate(['/Pharmacy/Sale/List']);
            this.creditBillInvItems = new Array<PHRMInvoiceItemsModel>();
            this.pharmacyService.Id = null;
            this.loading = false;
        } catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
    //Remove Items from credit bill item lists    
    RemoveItem(index) {
        try {
            if (index != undefined && index != NaN) {
                this.loading = true;
                this.creditBillInvItems.splice(index, 1);   //remove indexed item form list
                this.loading = false;
            }
        } catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
    logError(err: any) {
        this.messageboxService.showMessage("error", [err]);
        console.log(err);
    }

    //This function only for show catch messages
    ShowCatchErrMessage(exception) {
        if (exception) {
            let ex: Error = exception;
            this.messageboxService.showMessage("error", ["Check error in Console log !"]);
            console.log("Error Messsage =>  " + ex.message);
            console.log("Stack Details =>   " + ex.stack);
            //this.messageboxService.showMessage("error", [ex.message + "     " + ex.stack]);
        }
    }

}