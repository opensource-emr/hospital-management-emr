import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter } from "@angular/core";
import { LabsBLService } from "../shared/labs.bl.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { Patient } from "../../patients/shared/patient.model";
import { BillingTransaction } from "../../billing/shared/billing-transaction.model";
import { BillingTransactionItem } from "../../billing/shared/billing-transaction-item.model";
import { CommonFunctions } from '../../shared/common.functions';
import * as moment from 'moment/moment';
import { SecurityService } from "../../security/shared/security.service";
import { BillingBLService } from "../../billing/shared/billing.bl.service";
import { BillingService } from "../../billing/shared/billing.service";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { PatientBillingContextVM } from "../../billing/shared/patient-billing-context-vm";
import { InPatientLabTest } from "../shared/InpatientLabTest";
import { DanpheCache,MasterType } from "../../shared/danphe-cache-service-utility/cache-services";
@Component({
    selector: 'lab-requests-list',
  templateUrl: './lab-request-list.html',
  styles: [` .tbl-text{flex: 1;}
  .tbl-header .tbl-text{font-weight: 600;padding: 2px 10px;}
  .tbl-header {background: #e1e2e4;padding: 4px 0px;}
  .tbl-body {padding: 4px 0px;}
   .tbl-body .tbl-text{padding: 2px 15px;}
  .flex-table-body-holder{max-height: 200px; overflow-y: auto;}
  .tbl-body:not(:last-child) {border-bottom: 1px solid #dadbdc;}
  .large-txt{font-size: 24px;}
  .flex-table-body-holder {background: #f0f0f1;}`]
})
export class LabRequestsListComponent {

    @Input("selecteditems")
    public selectedPatient;

    @Output("callback-wardlist")
    public callBackRequestLabItem: EventEmitter<Object> = new EventEmitter<Object>();

    public labBillItems: Array<any>;
    public showOrderRequest: boolean = false;

    labTestList: Array<InPatientLabTest> = new Array<InPatientLabTest>();
    public labCounterId: number = 0;
    public loading: boolean = false;

    constructor(public labBLService: LabsBLService,
        public msgBoxServ: MessageboxService,
        public changeDetector: ChangeDetectorRef,
        public billingBLService: BillingBLService) {
        this.GetBillingCounterForLab();
        this.GetLabItems();
    }

    ngOnInit() {
        this.GetAllTestOfSelectedInpatient();
    }

    public GetAllTestOfSelectedInpatient() {
        this.labBLService.GetTestListOfSelectedInPatient(this.selectedPatient.PatientId, this.selectedPatient.PatientVisitId)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.labTestList = res.Results;
                }
            });
    }

    RouteToLabRequisition() {
        this.CloseLabRequestsPage();
    }

    GetBillingCounterForLab() {
        let allBilCntrs: Array<any>;
        allBilCntrs=DanpheCache.GetData(MasterType.BillingCounter,null);
        let counter = allBilCntrs.filter(cnt => cnt.CounterType == "LAB");
        if (counter) {
            this.labCounterId = counter.find(cntr => cntr.CounterId).CounterId;
        }
        // this.billingBLService.GetAllBillingCounters()
        //     .subscribe((res: DanpheHTTPResponse) => {
        //         if (res.Status == "OK") {
        //             let allBilCntrs: Array<any> = res.Results;
        //             let labCntr = allBilCntrs.find(cnt => cnt.CounterType == "LAB");
        //             if (labCntr) {
        //                 this.labCounterId = labCntr.CounterId;
        //             }
        //         }

        //     },
        //         err => {
        //             this.msgBoxServ.showMessage("error", ["Some error occured, please try again later."]);
        //             console.log(err.ErrorMessage);
        //         });


    }


    GetLabItems() {
        this.labBLService.GetLabBillingItems()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.labBillItems = res.Results;
                    this.showOrderRequest = true;
                }
                else {
                    this.msgBoxServ.showMessage("failed", ["Unable to get lab items."]);
                }
            });
    }

    public cancelThisTest(currentInpatientLabTest: InPatientLabTest, indx: number) {       

        if (this.loading) {
            if (currentInpatientLabTest.CancelRemarks && currentInpatientLabTest.CancelRemarks.trim() != '' && currentInpatientLabTest.CancelRemarks.length) {
                var cancelLabTestOfCurrentPatient = window.confirm("Are You Sure You want to cancel this LabTest for this Patient?");
                if (cancelLabTestOfCurrentPatient) {
                    this.labBLService.CancelInpatientCurrentLabTest(currentInpatientLabTest)
                        .subscribe(res => {
                            if (res.Status == "OK") {
                                this.labTestList.splice(indx, 1);
                                this.labTestList.slice();
                                this.changeDetector.detectChanges();
                                this.msgBoxServ.showMessage("success", [currentInpatientLabTest.LabTestName + ' Test is Cancelled']);
                                this.loading = false;
                            } else {
                                this.msgBoxServ.showMessage("failed", ['Please Try later']);
                                this.loading = false;
                            }
                        });

                }
                else {
                    this.loading = false;
                    return;                    
                }
            }
            else {
                this.msgBoxServ.showMessage("failed", ['Please Enter the Cancel Remarks To Cancel']);
                this.loading = false;
            }

        }
      
    }

    CloseLabRequestsPage() {
        this.callBackRequestLabItem.emit({state: 0});
    }
    
}
