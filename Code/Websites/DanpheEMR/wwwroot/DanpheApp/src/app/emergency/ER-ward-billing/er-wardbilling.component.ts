import { Component, ChangeDetectorRef, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CoreService } from '../../core/shared/core.service';
import { EmergencyPatientModel } from '../shared/emergency-patient.model';
import { CommonFunctions } from '../../shared/common.functions';
import { EmergencyBLService } from '../shared/emergency.bl.service';
import { EmergencyDLService } from '../shared/emergency.dl.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import * as moment from 'moment/moment';
import { BillingBLService } from '../../billing/shared/billing.bl.service';
import { BillingTransactionItem } from '../../billing/shared/billing-transaction-item.model';
import { InPatientLabTest } from '../../labs/shared/InpatientLabTest';
import { Patient } from '../../patients/shared/patient.model';
import { Visit } from '../../appointments/shared/visit.model';
import { PharmacyBLService } from '../../pharmacy/shared/pharmacy.bl.service';
import { PHRMDrugsOrderListModel } from '../../pharmacy/shared/pharmacy-drug-order-list.model';
import { DanpheCache,MasterType } from '../../shared/danphe-cache-service-utility/cache-services';

@Component({
    selector: 'er-ward-billing',
    templateUrl: './er-wardbilling.html'
})

// App Component class
export class ERWardBillingComponent {
    public loading: boolean = false;
    public provisionalItemsDetails: Array<BillingTransactionItem> = [];
    public allBillItems: Array<any>;
    public showOrderRequest: boolean = false;
    public showDrugRequest: boolean = false;

    public emergencyCounterId: number = null;
    public PHRMProvisionalItemsList: any;

    public currentPat: Patient = new Patient();
    public currentVisit: Visit = new Visit(); 

    public PHRMOrdersList: Array<PHRMDrugsOrderListModel> = [];

    @Input("selectedPatient") selectedERPatient: EmergencyPatientModel = null;
    @Output("sendBackERPatientOrderData") sendERPatientData: EventEmitter<object> = new EventEmitter<object>();

    public selectedPatient: EmergencyPatientModel = new EmergencyPatientModel();

    constructor(public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService, public billingBLService: BillingBLService, public pharmacyBLService: PharmacyBLService,
        public emergencyBLService: EmergencyBLService, public coreService: CoreService) {
        this.GetBillingItems();
        this.GetBillingCounterForEmergency();
    }

    ngOnInit() {
        this.selectedPatient = this.selectedERPatient;
        this.currentPat.PatientId = this.selectedERPatient.PatientId;
        this.currentPat.PatientCode = this.selectedERPatient.PatientCode;
        this.currentPat.ShortName = this.selectedERPatient.FullName;
        this.currentPat.DateOfBirth = this.selectedERPatient.DateOfBirth;
        this.currentPat.Gender = this.selectedERPatient.Gender;
        this.currentPat.Age = this.selectedERPatient.Age;

        this.currentVisit.PatientVisitId = this.selectedERPatient.PatientVisitId;
        this.currentVisit.PatientId = this.selectedERPatient.PatientId;
        this.currentVisit.ProviderId = this.selectedERPatient.ProviderId;
        this.GetPatientProvisionalItems(this.selectedPatient.PatientId, this.selectedPatient.PatientVisitId);
        this.LoadPHRMOrdersOfERPatient(this.selectedPatient.PatientId, this.selectedPatient.PatientVisitId);
    }

    public LoadPHRMOrdersOfERPatient(patientId: number, visitId: number) {
        this.pharmacyBLService.GetAllDrugOrderOfERPatient(patientId, visitId)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.PHRMOrdersList = res.Results;
                    this.PHRMOrdersList = this.PHRMOrdersList.slice();
                } else {
                    this.msgBoxServ.showMessage("failed", ['Failed to get OrderList.' + res.ErrorMessage]);
                }
            },
                err => {
                    this.msgBoxServ.showMessage("error", ['Failed to get OrderList.' + err.ErrorMessage]);
                }
            );
    }


    public GetBillingItems() {
        this.billingBLService.GetBillItemList()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    if (res.Results.length) {
                        this.allBillItems = res.Results;
                        this.changeDetector.detectChanges();
                        this.showOrderRequest = true;
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

    GetPatientProvisionalItems(patientId: number, patientVisitId: number) {
        this.billingBLService.GetProvItemsByPatIdAndVisitId(patientId, patientVisitId)
            .subscribe(res => {
                this.provisionalItemsDetails = res.Results.CreditItems;
                this.provisionalItemsDetails.forEach(function (val) {
                    val.Patient = res.Results.Patient;
                    val.IsSelected = false;
                });
            });
    }

    GetBillingCounterForEmergency() {
        //client side caching.
        let allBilCntrs: Array<any>;
        allBilCntrs=DanpheCache.GetData(MasterType.BillingCounter,null);
        let counter = allBilCntrs.filter(cnt => cnt.CounterType == "EMERGENCY");
        if (counter) {
            this.emergencyCounterId = counter.find(cntr => cntr.CounterId).CounterId;
        }

        // this.billingBLService.GetAllBillingCounters()
        //     .subscribe((res: DanpheHTTPResponse) => {
        //         if (res.Status == "OK") {
        //             let allBilCntrs: Array<any> = res.Results;
        //             let counter = allBilCntrs.find(cnt => cnt.CounterType == "EMERGENCY");
        //             if (counter) {
        //                 this.emergencyCounterId = counter.CounterId;
        //             }
        //         }

        //     },
        //         err => {
        //             this.msgBoxServ.showMessage("error", ["Some error occured, please try again later."]);
        //             console.log(err.ErrorMessage);
        //         });


    }

    public OrderRequested() {
        this.GetPatientProvisionalItems(this.selectedPatient.PatientId, this.selectedPatient.PatientVisitId);
    }

    public showPharmacyOrder() {
        this.showDrugRequest = true;
    }

    Close() {
        this.sendERPatientData.emit({ submit: false });
    }

    cancelRequest(billTransactionItem: BillingTransactionItem, index: number) {
        console.log(billTransactionItem);
        let ERLabItem: InPatientLabTest = new InPatientLabTest();

        if (billTransactionItem.CancelRemarks && billTransactionItem.CancelRemarks.length) {


            if (billTransactionItem.ServiceDepartment) {

                var cancelLabTestOfCurrentPatient = window.confirm("Are You Sure You want to cancel this item for this Patient?");

                if (cancelLabTestOfCurrentPatient) {
                    billTransactionItem.CounterId = this.emergencyCounterId;

                    if (billTransactionItem.ServiceDepartment.IntegrationName.toLowerCase() == 'radiology') {
                        this.emergencyBLService.CancelRadRequest(billTransactionItem)
                            .subscribe(res => {
                                if (res.Status == "OK") {
                                    this.provisionalItemsDetails.splice(index, 1);
                                    this.provisionalItemsDetails.slice();
                                    this.changeDetector.detectChanges();
                                    this.msgBoxServ.showMessage("success", ['This item is Cancelled']);
                                    this.GetPatientProvisionalItems(this.selectedPatient.PatientId, this.selectedPatient.PatientVisitId);
                                    this.loading = false;
                                } else {
                                    this.msgBoxServ.showMessage("failed", ['Please Try later']);
                                    this.loading = false;
                                }
                            });

                    } else if (billTransactionItem.ServiceDepartment.IntegrationName.toLowerCase() == 'lab') {
                        ERLabItem.RequisitionId = billTransactionItem.RequisitionId;
                        ERLabItem.PatientId = billTransactionItem.PatientId;
                        ERLabItem.PatientVisitId = billTransactionItem.PatientVisitId;
                        ERLabItem.LabTestName = billTransactionItem.ItemName;
                        ERLabItem.LabTestId = billTransactionItem.ItemId;
                        ERLabItem.BillingTransactionItemId = billTransactionItem.BillingTransactionItemId;
                        ERLabItem.OrderDateTime = billTransactionItem.RequisitionDate;
                        ERLabItem.CancelledOn = moment().format('YYYY-MM-DD HH:mm');

                        this.emergencyBLService.CancelInpatientCurrentLabTest(ERLabItem)
                            .subscribe(res => {
                                if (res.Status == "OK") {
                                    this.provisionalItemsDetails.splice(index, 1);
                                    this.provisionalItemsDetails.slice();
                                    this.changeDetector.detectChanges();
                                    this.msgBoxServ.showMessage("success", ['This item is Cancelled']);
                                    this.GetPatientProvisionalItems(this.selectedPatient.PatientId, this.selectedPatient.PatientVisitId);
                                    this.loading = false;
                                } else {
                                    this.msgBoxServ.showMessage("failed", ['Please Try later']);
                                    this.loading = false;
                                }
                            });
                    }
                    else {
                        this.emergencyBLService.CancelBillRequest(billTransactionItem)
                            .subscribe(res => {
                                if (res.Status == "OK") {
                                    this.provisionalItemsDetails.splice(index, 1);
                                    this.provisionalItemsDetails.slice();
                                    this.changeDetector.detectChanges();
                                    this.msgBoxServ.showMessage("success", ['This item is Cancelled']);
                                    this.GetPatientProvisionalItems(this.selectedPatient.PatientId, this.selectedPatient.PatientVisitId);
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

    public AddSuccessFullDataEntered($event) {
        if ($event && $event.submit) {
            this.LoadPHRMOrdersOfERPatient(this.selectedPatient.PatientId, this.selectedPatient.PatientVisitId);            
        }
    }
    
}