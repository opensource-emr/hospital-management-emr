
import { Component } from "@angular/core";
import { Router } from '@angular/router';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { VisitService } from '../../appointments/shared/visit.service';
import { BillingService } from '../shared/billing.service';
import { BillingBLService } from '../shared/billing.bl.service';
import { PatientService } from '../../patients/shared/patient.service';
import { RouteFromService } from '../../shared/routefrom.service';
import { BillingTransactionItem } from "../shared/billing-transaction-item.model";
import { BillItemRequisition } from "../shared/bill-item-requisition.model";
import { SecurityService } from '../../security/shared/security.service';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { CallbackService } from '../../shared/callback.service';
import * as moment from 'moment/moment';

@Component({
  templateUrl: "./bill-cancellation-request.html" //"/BillingView/BillCancellationRequest"
})
export class BillCancellationRequestComponent {

    public creditlist: any;
    public patCreditDetails: Array<BillingTransactionItem> = new Array<BillingTransactionItem>();
    public currCounterId: number = 0;
    public index: number = 0;
    public showAllPatient: boolean = true;
    public CreditGridColumns: Array<any> = null;
    constructor(public BillingBLService: BillingBLService,
        public visitService: VisitService,
        public billingService: BillingService,
        public securityService: SecurityService,
        public routeFromService: RouteFromService,
        public patientService: PatientService,
        public callbackservice: CallbackService,
        public router: Router,
        public msgBoxServ: MessageboxService) {

        this.currCounterId = this.securityService.getLoggedInCounter().CounterId;
        //go back to counter activation page if none of the counter is activated.
        if (this.currCounterId < 1) {
            this.callbackservice.CallbackRoute = '/Billing/BillCancellationRequest'
            this.router.navigate(['/Billing/CounterActivate']);
        }
        else {
            this.CreditGridColumns = GridColumnSettings.CreditCancelSearch;
            this.LoadCreditBills();
        }

    }

    // -----------------------------------to cancel the credit bills----------------------------------------
    LoadCreditBills(): void {
        this.BillingBLService.GetUnpaidTotalBills()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.creditlist = res.Results
                }
                else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                    console.log(res.ErrorMessage);
                }

            });
    }


    ShowPatientCreditDetails(row): void {
        this.showAllPatient = false;//this hides the grid of all patients.
        var selPatient = this.patientService.CreateNewGlobal();
        selPatient.ShortName = row.ShortName;
        selPatient.PatientCode = row.PatientCode;
        selPatient.DateOfBirth = row.DateOfBirth;
        selPatient.PatientId = row.PatientId;
        selPatient.Gender = row.Gender;
        selPatient.Address = row.Address;
        selPatient.PhoneNumber = row.PhoneNumber;
        selPatient.PANNumber = row.PANNumber;
        this.BillingBLService.GetCreditForCancellationbyPatientIdonBillTxnItems(selPatient.PatientId)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.patCreditDetails = res.Results;
                    //changed: sudarshan: 29Jul--formatting the date..
                    if (this.patCreditDetails && this.patCreditDetails.length > 0) {
                        this.patCreditDetails.forEach(currRow => {
                            currRow.RequisitionDate = moment(currRow.RequisitionDate).format("YYYY-MM-DD HH:mm");
                        });
                    }
                    else {
                        this.patCreditDetails = new Array<BillingTransactionItem>();
                        this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
                    }
                }

            }, err => {

            });
    }




    CallBackCancelCreditRequestedBills(srvResponse, cancelledItem: BillingTransactionItem) {
        if (srvResponse.Status == "OK") {

            this.msgBoxServ.showMessage("success", ["Item cancelled successfully."]);
            //let deptsDistinct = new Array<string>();
            let srvDeptName = cancelledItem.ServiceDepartmentName;
            this.BillingBLService.PutBillStatusForDepartmentRequisition([cancelledItem], srvDeptName, "cancel")
                .subscribe(res => {
                    //do your logic here if something has to be done.. 
                });
        }
        else {
            this.msgBoxServ.showMessage("failed", ["Failed to cancel this item. Please check log for details."], srvResponse.ErrorMessaage);
        }
    }
    CancelRequestedCreditBills(currCreditTxnItm: BillingTransactionItem, index: number) {
        if (currCreditTxnItm.CancelRemarks) {
            var a = window.confirm("are you sure you want to cancel?")
            if (!a) {
                this.router.navigate(['/Billing/BillCancellationRequest'])
            }
            else {

                currCreditTxnItm.CancelledBy = this.securityService.GetLoggedInUser().EmployeeId;
                //remove current item from the patient's credit list
                this.patCreditDetails.splice(index, 1);

                this.BillingBLService.PutBillStatusOnBillTxnItemCancellation(currCreditTxnItm)
                    .subscribe((res) => {
                        this.CallBackCancelCreditRequestedBills(res, currCreditTxnItm);
                    });
                this.LoadCreditBills();
            }
        }
        else {
            this.msgBoxServ.showMessage("failed", ["Remarks is mandatory."]);
        }
    }


    CreditBillGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "showCreditDetails":
                {
                    var data = $event.Data;
                    this.ShowPatientCreditDetails(data);
                }
                break;
            default:
                break;
        }
    }

    BackToGrid() {
        this.showAllPatient = true;
        //reset current patient value on back button.. 
        this.patientService.CreateNewGlobal();
    }

    // to cancel the credit bills


}
