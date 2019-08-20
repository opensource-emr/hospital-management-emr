import { Component, ChangeDetectorRef } from '@angular/core';
import { BillingBLService } from '../../billing/shared/billing.bl.service';
import { BillingTransactionItem } from '../../billing/shared/billing-transaction-item.model';
import { PatientService } from '../../patients/shared/patient.service';
import { Patient } from '../../patients/shared/patient.model';
import { VisitService } from '../../appointments/shared/visit.service';
import { Visit } from '../../appointments/shared/visit.model';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { NursingBLService } from '../shared/nursing.bl.service';
import { InPatientLabTest } from '../../labs/shared/InpatientLabTest';
import { LabsBLService } from '../../labs/shared/labs.bl.service';
import * as moment from 'moment/moment';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { CurrentVisitContextVM } from '../../appointments/shared/current-visit-context.model';
import { DanpheCache,MasterType } from '../../shared/danphe-cache-service-utility/cache-services';


@Component({
    templateUrl: "./nursing-ward-billing.html"
})
export class NursingWardBillingComponent {
    public provisionalItemsDetails: Array<BillingTransactionItem> = [];

    public currentPatient: Patient = new Patient();
    public currentVisit: Visit = new Visit();
    public allBillItems: Array<any>;
    public inPatientId: number = null;
    public inPatientVisitId: number = null;
    public showDischargeBill: boolean = false;
    public showNewIpRequestPopup: boolean = false;
    public showPatientSearch: boolean = true;
    public loading = false;


    public nursingCounterId: number = null;
    public currPatVisitContext: CurrentVisitContextVM = null;

    constructor(public billingBLService: BillingBLService
        , public patientService: PatientService,
        public visitService: VisitService, public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService, public nursingBLService: NursingBLService, public labBLService: LabsBLService)
    {
        this.currentPatient = this.patientService.globalPatient; 
        this.currentVisit = this.visitService.globalVisit;
        if (this.currentPatient.PatientId && this.currentVisit.PatientVisitId) {
            this.GetPatientProvisionalItems(this.currentPatient.PatientId, this.currentVisit.PatientVisitId);
            this.GetCurrentVisitContext();
        }
        else {
           
        }

        this.GetBillingItems();
        this.GetBillingCounterForNursing();
     
    }

   
    public showsummary() {
        this.showDischargeBill = true;
        this.inPatientId = this.currentPatient.PatientId;
        this.inPatientVisitId = this.currentVisit.PatientVisitId;

    }


    public GetCurrentVisitContext() {
        this.labBLService.GetDataOfInPatient(this.currentPatient.PatientId, this.currentVisit.PatientVisitId)
            .subscribe(res => {
                if (res.Status == "OK" && res.Results.Current_WardBed) {
                    this.currPatVisitContext = res.Results;
                } else {
                    this.msgBoxServ.showMessage("failed", ["Problem! Cannot get the Current Visit Context ! "])
                }
            },
                err => { console.log(err.ErrorMessage); });
    }

    GetBillingCounterForNursing() {
        let allBilCntrs: Array<any> ;
        allBilCntrs=DanpheCache.GetData(MasterType.BillingCounter,null);
        let nursingCounter = allBilCntrs.filter(cnt => cnt.CounterType == "NURSING");
        if (nursingCounter) {
            this.nursingCounterId = nursingCounter.find(cntr => cntr.CounterId).CounterId;
        }
        // this.billingBLService.GetAllBillingCounters()
        //     .subscribe((res: DanpheHTTPResponse) => {
        //         if (res.Status == "OK") {
        //             let allBilCntrs: Array<any> = res.Results;
        //             let nursingCounter = allBilCntrs.find(cnt => cnt.CounterType == "NURSING");
        //             if (nursingCounter) {
        //                 this.nursingCounterId = nursingCounter.CounterId;                       
        //             }
        //         }

        //     },
        //         err => {
        //             this.msgBoxServ.showMessage("error", ["Some error occured, please try again later."]);
        //             console.log(err.ErrorMessage);
        //         });


    }


    GetPatientProvisionalItems(patientId: number, patientVisitId: number) {
        this.billingBLService.GetProvItemsByPatIdAndVisitId(patientId, patientVisitId)
            .subscribe(res => {

                this.provisionalItemsDetails = res.Results.CreditItems;
                this.patientService.globalPatient = res.Results.Patient;
                this.provisionalItemsDetails.forEach(function (val) {
                    val.Patient = res.Results.Patient;                   
                    val.IsSelected = false;
                });

            }); 
    }
    public CloseRecieptView() {
        this.showDischargeBill = false;
    }
    public CloseOrderView() {
        this.showNewIpRequestPopup = false;
    }
    public GetBillingItems() {
        this.billingBLService.GetBillItemList()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    if (res.Results.length) {
                        this.allBillItems = res.Results;
                        this.allBillItems = this.allBillItems.filter(val => val.ServiceDepartmentName != "EMERGENCY");
                    }
                    else {
                        this.msgBoxServ.showMessage('Failed', ["unable to get items for searchbox.. check logs for more details."]);
                        console.log(res.ErrorMessage);
                    }
                }
            },
            err => {
                console.log(err.ErrorMessage);

            });
    }

    AddNewIpRequest() {
        if (this.nursingCounterId) {
            this.showNewIpRequestPopup = false;
            this.showPatientSearch = true;
            this.changeDetector.detectChanges();
            this.showNewIpRequestPopup = true;
            this.showPatientSearch = false;
        } else {
            this.msgBoxServ.showMessage('Failed', ["Please Try again Later as Nursing Counter not found."]);
        }
        
    }

    OnNewIpRequestClosed() {
        this.GetPatientProvisionalItems(this.currentPatient.PatientId, this.currentVisit.PatientVisitId);
        this.showNewIpRequestPopup = false;
    }

    cancelRequest(billTransactionItem: BillingTransactionItem, index: number) {
        console.log(billTransactionItem);
        let labItem: InPatientLabTest = new InPatientLabTest();

        if (billTransactionItem.CancelRemarks && billTransactionItem.CancelRemarks.length) {


            if (billTransactionItem.ServiceDepartment) {

                var cancelLabTestOfCurrentPatient = window.confirm("Are You Sure You want to cancel this item for this Patient?");

                if (cancelLabTestOfCurrentPatient) {
                    billTransactionItem.CounterId = this.nursingCounterId;

                    if (billTransactionItem.ServiceDepartment.IntegrationName == 'radiology') {                      
                        this.nursingBLService.CancelRadRequest(billTransactionItem)
                            .subscribe(res => {
                                if (res.Status == "OK") {
                                    this.provisionalItemsDetails.splice(index, 1);
                                    this.provisionalItemsDetails.slice();
                                    this.changeDetector.detectChanges();
                                    this.msgBoxServ.showMessage("success", ['This item is Cancelled']);
                                    this.GetPatientProvisionalItems(this.currentPatient.PatientId, this.currentVisit.PatientVisitId);
                                    this.loading = false;
                                } else {
                                    this.msgBoxServ.showMessage("failed", ['Please Try later']);
                                    this.loading = false;                                }
                            });
                        
                    } else if (billTransactionItem.ServiceDepartment.IntegrationName.toLowerCase() == 'lab') {
                        labItem.RequisitionId = billTransactionItem.RequisitionId;
                        labItem.PatientId = billTransactionItem.PatientId;
                        labItem.PatientVisitId = billTransactionItem.PatientVisitId;
                        labItem.LabTestName = billTransactionItem.ItemName;
                        labItem.LabTestId = billTransactionItem.ItemId;
                        labItem.BillingTransactionItemId = billTransactionItem.BillingTransactionItemId;
                        labItem.OrderDateTime = billTransactionItem.RequisitionDate;
                        labItem.CancelledOn = moment().format('YYYY-MM-DD HH:mm');

                        this.labBLService.CancelInpatientCurrentLabTest(labItem)
                            .subscribe(res => {
                                if (res.Status == "OK") {
                                    this.provisionalItemsDetails.splice(index, 1);
                                    this.provisionalItemsDetails.slice();
                                    this.changeDetector.detectChanges();
                                    this.msgBoxServ.showMessage("success", ['This item is Cancelled']);
                                    this.GetPatientProvisionalItems(this.currentPatient.PatientId, this.currentVisit.PatientVisitId);
                                    this.loading = false;
                                } else {
                                    this.msgBoxServ.showMessage("failed", ['Please Try later']);
                                    this.loading = false;
                                }
                            });
                    }
                    else
                    {
                        this.nursingBLService.CancelBillRequest(billTransactionItem)
                            .subscribe(res => {
                                if (res.Status == "OK") {
                                    this.provisionalItemsDetails.splice(index, 1);
                                    this.provisionalItemsDetails.slice();
                                    this.changeDetector.detectChanges();
                                    this.msgBoxServ.showMessage("success", ['This item is Cancelled']);
                                    this.GetPatientProvisionalItems(this.currentPatient.PatientId, this.currentVisit.PatientVisitId);
                                    this.loading = false;
                                } else {
                                    this.msgBoxServ.showMessage("failed", ['Please Try later']);
                                    this.loading = false;
                                }
                            });
                    }
                }
                
            }

        } else {
            this.msgBoxServ.showMessage("failed", ['Please Write Cancellation Remarks']);
        }
    }

}