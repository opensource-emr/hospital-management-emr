import { Component, ChangeDetectorRef, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CoreService } from '../../core/shared/core.service';
import { EmergencyPatientModel } from '../shared/emergency-patient.model';
import { CommonFunctions } from '../../shared/common.functions';
import { EmergencyBLService } from '../shared/emergency.bl.service';
import { EmergencyDLService } from '../shared/emergency.dl.service';
import { DanpheHTTPResponse, CancelStatusHoldingModel } from '../../shared/common-models';
import * as moment from 'moment/moment';
import { BillingBLService } from '../../billing/shared/billing.bl.service';
import { BillingTransactionItem } from '../../billing/shared/billing-transaction-item.model';
import { InPatientLabTest } from '../../labs/shared/InpatientLabTest';
import { Patient } from '../../patients/shared/patient.model';
import { Visit } from '../../appointments/shared/visit.model';
import { PharmacyBLService } from '../../pharmacy/shared/pharmacy.bl.service';
import { PHRMDrugsOrderListModel } from '../../pharmacy/shared/pharmacy-drug-order-list.model';
import { DanpheCache, MasterType } from '../../shared/danphe-cache-service-utility/cache-services';
import { ENUM_OrderStatusNumber } from "../../shared/shared-enums";
import EmergencyGridColumnSettings from '../shared/emergency-gridcol-settings';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../shared/danphe-grid/NepaliColGridSettingsModel';
import { PatientService } from '../../patients/shared/patient.service';
import { VisitService } from '../../appointments/shared/visit.service';

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
  public overallCancellationRule: any;
  public erCancellationRule: CancelStatusHoldingModel = new CancelStatusHoldingModel();
  public isCancelRuleEnabled: boolean;


  public erCancellationNumber: number = 0;


  @Input("selectedPatient") selectedERPatient: EmergencyPatientModel = null;
  @Output("sendBackERPatientOrderData") sendERPatientData: EventEmitter<object> = new EventEmitter<object>();
  @Input("isPopUp") public isPopUp: boolean = false;

  public showAddNewItem: boolean = false;
  public showAddNewDrug: boolean = false;

  public selectedPatient: EmergencyPatientModel = new EmergencyPatientModel();
  public ERPatientWardBillGridCol: any;
  public cancelRemarks: string = null;
  public selectedBillForCancel: any;
  public selIndexForCancel: number;
  public showConfirmationBox: boolean;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  constructor(public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService, public billingBLService: BillingBLService, public pharmacyBLService: PharmacyBLService,
    public emergencyBLService: EmergencyBLService, public coreService: CoreService,
    public patientService: PatientService, public visitService: VisitService)
  {
    this.GetBillingItems();
    this.GetBillingCounterForEmergency();
    this.overallCancellationRule = this.coreService.GetIpBillCancellationRule();
    if (this.overallCancellationRule && this.overallCancellationRule.Enable) {
      this.isCancelRuleEnabled = this.overallCancellationRule.Enable;
      this.erCancellationRule.labStatus = this.overallCancellationRule.LabItemsInEmergency;
      this.erCancellationRule.radiologyStatus = this.overallCancellationRule.ImagingItemsInEmergency;
    }
   
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(
      new NepaliDateInGridColumnDetail("RequisitionDate", true)
    );

    //this.overallCancellationRule.Emergency.forEach(c => {
    //  if (ENUM_OrderStatusNumber[c] && (+ENUM_OrderStatusNumber[c] > this.erCancellationNumber)) {
    //    this.erCancellationNumber = +ENUM_OrderStatusNumber[c];
    //  }
    //});



    this.ERPatientWardBillGridCol = [
      {
        headerName: "Requested Date",
        field: "RequisitionDate",
        width: 80,
      },
      {
        headerName: "Department",
        field: "ServiceDepartmentName",
        width: 100,
      },
      {
        headerName: "Item Name",
        width: 100,
        field: "ItemName"
      },
      {
        headerName: "Assigned To Dr.",
        width: 100,
        field: "ProviderName",
      },
      { headerName: "Qty", field: "Quantity", width: 30 },
      { headerName: "Added By", field: "RequestingUserName", width: 80 },
      { headerName: "Status", field: "OrderStatus", width: 80 },
      { headerName: "Action", cellRenderer: this.GetActionList, width: 80 },
    ];


  }

  ngOnInit() {
    if (this.isPopUp) {
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
    } else {
      let pat = this.patientService.getGlobal();
      let visit = this.visitService.getGlobal();
      this.currentPat.PatientId = this.selectedPatient.PatientId = pat.PatientId;
      this.selectedPatient.PatientVisitId = visit.PatientVisitId;
      this.currentPat.ShortName = this.selectedPatient.FullName = pat.FullName;
      this.currentPat.Age = this.selectedPatient.Age = pat.Age;
      this.currentPat.Gender = this.selectedPatient.Gender = pat.Gender;
      this.currentPat.PatientCode = this.selectedPatient.PatientCode = pat.PatientCode;
      this.currentPat.DateOfBirth = this.selectedPatient.DateOfBirth = pat.DateOfBirth;
      this.selectedPatient.VisitDateTime = visit.VisitDate + 'T' + visit.VisitTime;
    }


    this.GetPatientProvisionalItems(this.selectedPatient.PatientId, this.selectedPatient.PatientVisitId);
    this.LoadPHRMOrdersOfERPatient(this.selectedPatient.PatientId, this.selectedPatient.PatientVisitId);
  }


  GetActionList(params) {
    if (params.data.AllowCancellation) {
      return `<a danphe-grid-action="cancel" class="grid-action btn btn-danger">
              Cancel
           </a>`;
    } else {
      return `<span title="Can't Cancel">Cannot cancel</span>`;
    }
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
    let module = 'emergency';
    this.billingBLService.GetInPatientProvisionalItemList(patientId, patientVisitId, module)
      .subscribe(res => {
        //  this.provisionalItemsDetails = res.Results.CreditItems;
        //  this.showAddNewItem = false;
        //  this.showOrderRequest = false;
        //  this.provisionalItemsDetails.forEach(function (val) {
        //    val.Patient = res.Results.Patient;
        //    val.IsSelected = false;
        //  });

        //  this.provisionalItemsDetails.sort(function (b, a) { return a.BillingTransactionItemId - b.BillingTransactionItemId });
        //});
        
        if (res.Status == 'OK') {
          if (res.Results) {
            if (this.isCancelRuleEnabled) {
              res.Results.BillItems.forEach(val => {
                if (val.IntegrationName && (val.IntegrationName.toLowerCase() == 'lab' || val.IntegrationName.toLowerCase() == 'radiology')) {
                  if (!val.RequisitionId || (val.IntegrationName.toLowerCase() == 'lab' && this.erCancellationRule.labStatus.includes(val.OrderStatus))
                    || (val.IntegrationName.toLowerCase() == 'radiology' && this.erCancellationRule.radiologyStatus.includes(val.OrderStatus)) ) {
                    val.AllowCancellation = true;
                  }
                }
              });
            }
            
            this.provisionalItemsDetails = res.Results.BillItems;
              this.showAddNewItem = false;
              //this.showOrderRequest = false;
              this.provisionalItemsDetails.forEach(function (val) {
                val.Patient = res.Results.Patient;
                val.IsSelected = false;
              });

              this.provisionalItemsDetails.sort(function (b, a) { return a.BillingTransactionItemId - b.BillingTransactionItemId });
          }
          else {
            this.msgBoxServ.showMessage('Failed', ["Failed to get Patient Provisional Items" + res.ErrorMessage]);
            console.log(res.ErrorMessage);
          }
        }
      },
        err => {
          console.log(err.ErrorMessage);

        });
  }

  GetBillingCounterForEmergency() {
    //client side caching.
    let allBilCntrs: Array<any>;
    allBilCntrs = DanpheCache.GetData(MasterType.BillingCounter, null);
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

  cancelRequest(billTransactionItem, index) {
    let ERLabItem: InPatientLabTest = new InPatientLabTest();

    if (this.cancelRemarks && this.cancelRemarks.length > 0) {     
      billTransactionItem.CancelRemarks = this.cancelRemarks;

      if (billTransactionItem) {

        var cancelLabTestOfCurrentPatient = window.confirm("Are You Sure You want to cancel this item for this Patient?");

        if (cancelLabTestOfCurrentPatient) {
          billTransactionItem.CounterId = this.emergencyCounterId;
          billTransactionItem.ItemIntegrationName = billTransactionItem.IntegrationName;
          if (billTransactionItem.IntegrationName.toLowerCase() == 'radiology') {
            this.emergencyBLService.CancelRadRequest(billTransactionItem)
              .subscribe(res => {
                if (res.Status == "OK") {                  
                  this.provisionalItemsDetails.splice(index, 1);
                  this.provisionalItemsDetails.slice();
                  this.changeDetector.detectChanges();
                  this.msgBoxServ.showMessage("success", ['This item is Cancelled']);
                  this.GetPatientProvisionalItems(this.selectedPatient.PatientId, this.selectedPatient.PatientVisitId);
                  this.showConfirmationBox = false;
                  this.loading = false;
                } else {
                  this.msgBoxServ.showMessage("failed", ['Please Try later']);
                  this.loading = false;
                }
              });

          } else if (billTransactionItem.IntegrationName.toLowerCase() == 'lab') {
            // ERLabItem.RequisitionId = billTransactionItem.RequisitionId;
            // ERLabItem.PatientId = billTransactionItem.PatientId;
            // ERLabItem.PatientVisitId = billTransactionItem.PatientVisitId;
            // ERLabItem.LabTestName = billTransactionItem.ItemName;
            // ERLabItem.LabTestId = billTransactionItem.ItemId;
            // ERLabItem.BillingTransactionItemId = billTransactionItem.BillingTransactionItemId;
            // ERLabItem.OrderDateTime = billTransactionItem.RequisitionDate;
            // ERLabItem.CancelledOn = moment().format('YYYY-MM-DD HH:mm');

            this.emergencyBLService.CancelItemRequest(billTransactionItem)
              .subscribe(res => {
                if (res.Status == "OK") {
                  this.provisionalItemsDetails.splice(index, 1);
                  this.provisionalItemsDetails.slice();
                  this.changeDetector.detectChanges();
                  this.msgBoxServ.showMessage("success", ['This item is Cancelled']);
                  this.GetPatientProvisionalItems(this.selectedPatient.PatientId, this.selectedPatient.PatientVisitId);
                  this.showConfirmationBox = false;
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
                  this.showConfirmationBox = false;
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

  ERWardItemListAction($event) {
    switch ($event.Action) {
      case "cancel":
        {
          this.cancelRemarks = "";
          this.selectedBillForCancel = $event.Data;
          this.selIndexForCancel = this.provisionalItemsDetails.findIndex(
            (p) =>
              p.BillingTransactionItemId ==
              this.selectedBillForCancel.BillingTransactionItemId
          );
          if (this.selectedBillForCancel && this.selIndexForCancel > -1) {
            this.showConfirmationBox = true;
          }
        }
        break;
      default:
        break;
    }
  }

}
