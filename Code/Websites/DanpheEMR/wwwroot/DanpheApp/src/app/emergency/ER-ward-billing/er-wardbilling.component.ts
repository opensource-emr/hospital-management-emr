import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Visit } from '../../appointments/shared/visit.model';
import { VisitService } from '../../appointments/shared/visit.service';
import { BillingMasterBlService } from '../../billing/shared/billing-master.bl.service';
import { BillingTransactionItem } from '../../billing/shared/billing-transaction-item.model';
import { BillingBLService } from '../../billing/shared/billing.bl.service';
import { CoreService } from '../../core/shared/core.service';
import { InPatientLabTest } from '../../labs/shared/InpatientLabTest';
import { Patient } from '../../patients/shared/patient.model';
import { PatientService } from '../../patients/shared/patient.service';
import { PHRMDrugsOrderListModel } from '../../pharmacy/shared/pharmacy-drug-order-list.model';
import { PharmacyBLService } from '../../pharmacy/shared/pharmacy.bl.service';
import { CancelStatusHoldingModel, DanpheHTTPResponse } from '../../shared/common-models';
import { DanpheCache, MasterType } from '../../shared/danphe-cache-service-utility/cache-services';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../shared/danphe-grid/NepaliColGridSettingsModel';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status, ENUM_ServiceBillingContext } from '../../shared/shared-enums';
import { EmergencyPatientModel } from '../shared/emergency-patient.model';
import { EmergencyBLService } from '../shared/emergency.bl.service';

@Component({
  selector: 'er-ward-billing',
  templateUrl: './er-wardbilling.html',
  host: { '(window:keyup)': 'hotkeys($event)' }
})

// App Component class
export class ERWardBillingComponent {
  public loading: boolean = false;
  public ProvisionalItemsDetails: Array<BillingTransactionItem> = [];
  public AllBillItems: Array<any>;
  public ShowOrderRequest: boolean = false;
  public ShowDrugRequest: boolean = false;
  public EmergencyCounterId: number = null;
  public PHRMProvisionalItemsList: any;
  public CurrentPatient = new Patient();
  public CurrentVisit = new Visit();
  public PHRMOrdersList: Array<PHRMDrugsOrderListModel> = [];
  public OverallCancellationRule: any;
  public ERCancellationRule = new CancelStatusHoldingModel();
  public IsCancelRuleEnabled: boolean;
  @Input("selectedPatient") selectedERPatient: EmergencyPatientModel = null;
  @Output("sendBackERPatientOrderData") sendERPatientData: EventEmitter<object> = new EventEmitter<object>();
  @Input("isPopUp") isPopUp: boolean = false;
  public ShowAddNewItem: boolean = false;
  public ShowAddNewDrug: boolean = false;
  public SelectedPatient = new EmergencyPatientModel();
  public ERPatientWardBillGridCol: any;
  public CancelRemarks: string = null;
  public SelectedBillForCancel: any;
  public SelIndexForCancel: number;
  public showConfirmationBox: boolean = false;
  public NepaliDateInGridSettings = new NepaliDateInGridParams();
  public SelectedSchemePriceCategory = { SchemeId: 0, PriceCategoryId: 0 }
  public showSchemePriceCategory: boolean = true;

  constructor(
    private _changeDetector: ChangeDetectorRef,
    private _messageBoxService: MessageboxService,
    private _billingMasterBLService: BillingMasterBlService,
    private _billingBLService: BillingBLService,
    private _pharmacyBLService: PharmacyBLService,
    private _emergencyBLService: EmergencyBLService,
    private _coreService: CoreService,
    private _patientService: PatientService,
    private _visitService: VisitService,
    private _routeActivate: ActivatedRoute
  ) {
    this.GetBillingCounterForEmergency();
    this.OverallCancellationRule = this._coreService.GetIpBillCancellationRule();
    if (this.OverallCancellationRule && this.OverallCancellationRule.Enable) {
      this.IsCancelRuleEnabled = this.OverallCancellationRule.Enable;
      this.ERCancellationRule.labStatus = this.OverallCancellationRule.LabItemsInEmergency;
      this.ERCancellationRule.radiologyStatus = this.OverallCancellationRule.ImagingItemsInEmergency;
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
        headerName: "Performer",
        width: 100,
        field: "PerformerName",
      },
      { headerName: "Qty", field: "Quantity", width: 30 },
      { headerName: "Added By", field: "RequestingUserName", width: 80 },
      { headerName: "Status", field: "OrderStatus", width: 80 },
      { headerName: "Action", cellRenderer: this.GetActionList, width: 80 },
    ];
    if (_routeActivate.snapshot.routeConfig.path === "WardBilling") {
      this.showSchemePriceCategory = false;
    }

  }

  ngOnInit() {
    if (this.isPopUp) {
      this.SelectedPatient = this.selectedERPatient;
      this.SelectedSchemePriceCategory.SchemeId = this.selectedERPatient.SchemeId;
      this.SelectedSchemePriceCategory.PriceCategoryId = this.selectedERPatient.PriceCategoryId;
      this.GetServiceItems(ENUM_ServiceBillingContext.OpBilling, this.SelectedSchemePriceCategory.SchemeId, this.SelectedSchemePriceCategory.PriceCategoryId);
      this.CurrentPatient.PatientId = this.selectedERPatient.PatientId;
      this.CurrentPatient.PatientCode = this.selectedERPatient.PatientCode;
      this.CurrentPatient.ShortName = this.selectedERPatient.FullName;
      this.CurrentPatient.DateOfBirth = this.selectedERPatient.DateOfBirth;
      this.CurrentPatient.Gender = this.selectedERPatient.Gender;
      this.CurrentPatient.Age = this.selectedERPatient.Age;
      this.CurrentVisit.PatientVisitId = this.selectedERPatient.PatientVisitId;
      this.CurrentVisit.PatientId = this.selectedERPatient.PatientId;
      this.CurrentVisit.PerformerId = this.selectedERPatient.PerformerId;
    } else {
      let pat = this._patientService.getGlobal();
      let visit = this._visitService.getGlobal();
      this.CurrentPatient.PatientId = this.SelectedPatient.PatientId = pat.PatientId;
      this.SelectedPatient.PatientVisitId = visit.PatientVisitId;
      this.CurrentPatient.ShortName = this.SelectedPatient.FullName = pat.FullName;
      this.CurrentPatient.Age = this.SelectedPatient.Age = pat.Age;
      this.CurrentPatient.Gender = this.SelectedPatient.Gender = pat.Gender;
      this.CurrentPatient.PatientCode = this.SelectedPatient.PatientCode = pat.PatientCode;
      this.CurrentPatient.DateOfBirth = this.SelectedPatient.DateOfBirth = pat.DateOfBirth;
      this.SelectedPatient.VisitDateTime = visit.VisitDate + 'T' + visit.VisitTime;
    }
    this.GetPatientProvisionalItems(this.SelectedPatient.PatientId, this.SelectedPatient.PatientVisitId);
    this.LoadPHRMOrdersOfERPatient(this.SelectedPatient.PatientId, this.SelectedPatient.PatientVisitId);
  }

  GetActionList(params): string {
    if (params.data.AllowCancellation) {
      return `<a danphe-grid-action="cancel" class="grid-action btn btn-danger">
              Cancel
           </a>`;
    } else {
      return `<span title="Can't Cancel">Cannot cancel</span>`;
    }
  }

  LoadPHRMOrdersOfERPatient(patientId: number, visitId: number): void {
    this._pharmacyBLService.GetAllDrugOrderOfERPatient(patientId, visitId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.PHRMOrdersList = res.Results;
          this.PHRMOrdersList = this.PHRMOrdersList.slice();
        } else {
          this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to get OrderList.' + res.ErrorMessage]);
        }
      },
        err => {
          this._messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['Failed to get OrderList.' + err.ErrorMessage]);
        }
      );
  }


  GetServiceItems(serviceBillingContext: string, schemeId: number, priceCategoryId: number): void {
    this._billingMasterBLService.GetServiceItems(serviceBillingContext, schemeId, priceCategoryId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          if (res.Results.length) {
            this.AllBillItems = res.Results;
            this._changeDetector.detectChanges();
            this.ShowOrderRequest = true;
          }
          else {
            this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Unable to get items. Check logs for more details."]);
            console.log(res.ErrorMessage);
          }
        }
      },
        err => {
          console.log(err.ErrorMessage);

        });
  }

  GetPatientProvisionalItems(patientId: number, patientVisitId: number): void {
    let module = 'emergency';
    this._billingBLService.GetInPatientProvisionalItemList(patientId, patientVisitId, module)
      .subscribe((res: DanpheHTTPResponse) => {
        //  this.provisionalItemsDetails = res.Results.CreditItems;
        //  this.showAddNewItem = false;
        //  this.showOrderRequest = false;
        //  this.provisionalItemsDetails.forEach(function (val) {
        //    val.Patient = res.Results.Patient;
        //    val.IsSelected = false;
        //  });

        //  this.provisionalItemsDetails.sort(function (b, a) { return a.BillingTransactionItemId - b.BillingTransactionItemId });
        //});

        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          if (res.Results) {
            if (this.IsCancelRuleEnabled) {
              res.Results.BillItems.forEach(val => {
                if (val.IntegrationName && (val.IntegrationName.toLowerCase() === 'lab' || val.IntegrationName.toLowerCase() === 'radiology')) {
                  if (val.IntegrationName.toLowerCase() === 'lab' && this.ERCancellationRule.labStatus.includes(val.OrderStatus)
                    || (val.IntegrationName.toLowerCase() === 'radiology' && this.ERCancellationRule.radiologyStatus.includes(val.OrderStatus))) {
                    val.AllowCancellation = true;
                  }
                }
              });
            }
            this.ProvisionalItemsDetails = res.Results.BillItems;
            this.ShowAddNewItem = false;
            //this.showOrderRequest = false;
            this.ProvisionalItemsDetails.forEach(function (val) {
              val.Patient = res.Results.Patient;
              val.IsSelected = false;
            });
            this.ProvisionalItemsDetails.sort(function (b, a) { return a.BillingTransactionItemId - b.BillingTransactionItemId });
          }
          else {
            this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to get Patient Provisional Items" + res.ErrorMessage]);
            console.log(res.ErrorMessage);
          }
        }
      },
        err => {
          console.log(err.ErrorMessage);

        });
  }

  GetBillingCounterForEmergency(): void {
    //client side caching.
    let allBillingCounters: Array<any>;
    allBillingCounters = DanpheCache.GetData(MasterType.BillingCounter, null);
    let erCounter = allBillingCounters.filter(cnt => cnt.CounterType === "EMERGENCY");
    if (erCounter) {
      this.EmergencyCounterId = erCounter.find(counter => counter.CounterId).CounterId;   //As of now, we haven't implemented counter activation in Emergency Module. So taking CounterId from the Database. 'Sanjeev'
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

  OrderRequested(): void {
    this.GetPatientProvisionalItems(this.SelectedPatient.PatientId, this.SelectedPatient.PatientVisitId);
  }

  ShowPharmacyOrder(): void {
    this.ShowDrugRequest = true;
  }

  CloseWardBillingRequestPopUp(): void {
    this.sendERPatientData.emit({ submit: false });
  }

  CancelRequest(billTransactionItem, index): void {
    let ERLabItem: InPatientLabTest = new InPatientLabTest();
    if (this.CancelRemarks && this.CancelRemarks.length > 0) {
      billTransactionItem.CancelRemarks = this.CancelRemarks;
      if (billTransactionItem) {
        var cancelLabTestOfCurrentPatient = window.confirm("Are You Sure You want to cancel this item for this Patient?");
        if (cancelLabTestOfCurrentPatient) {
          billTransactionItem.CounterId = this.EmergencyCounterId;
          billTransactionItem.ItemIntegrationName = billTransactionItem.IntegrationName;
          if (billTransactionItem.IntegrationName.toLowerCase() === 'radiology') {
            this._emergencyBLService.CancelRadRequest(billTransactionItem)
              .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                  this.ProvisionalItemsDetails.splice(index, 1);
                  this.ProvisionalItemsDetails.slice();
                  this._changeDetector.detectChanges();
                  this._messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ['This item is Cancelled']);
                  this.GetPatientProvisionalItems(this.SelectedPatient.PatientId, this.SelectedPatient.PatientVisitId);
                  this.showConfirmationBox = false;
                  this.loading = false;
                } else {
                  this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Please Try later']);
                  this.loading = false;
                }
              });

          } else if (billTransactionItem.IntegrationName.toLowerCase() === 'lab') {
            // ERLabItem.RequisitionId = billTransactionItem.RequisitionId;
            // ERLabItem.PatientId = billTransactionItem.PatientId;
            // ERLabItem.PatientVisitId = billTransactionItem.PatientVisitId;
            // ERLabItem.LabTestName = billTransactionItem.ItemName;
            // ERLabItem.LabTestId = billTransactionItem.ItemId;
            // ERLabItem.BillingTransactionItemId = billTransactionItem.BillingTransactionItemId;
            // ERLabItem.OrderDateTime = billTransactionItem.RequisitionDate;
            // ERLabItem.CancelledOn = moment().format('YYYY-MM-DD HH:mm');

            this._emergencyBLService.CancelItemRequest(billTransactionItem)
              .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                  this.ProvisionalItemsDetails.splice(index, 1);
                  this.ProvisionalItemsDetails.slice();
                  this._changeDetector.detectChanges();
                  this._messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ['This item is Cancelled']);
                  this.GetPatientProvisionalItems(this.SelectedPatient.PatientId, this.SelectedPatient.PatientVisitId);
                  this.showConfirmationBox = false;
                  this.loading = false;
                } else {
                  this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Please Try later']);
                  this.loading = false;
                }
              });
          }
          else {
            this._emergencyBLService.CancelBillRequest(billTransactionItem)
              .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                  this.ProvisionalItemsDetails.splice(index, 1);
                  this.ProvisionalItemsDetails.slice();
                  this._changeDetector.detectChanges();
                  this._messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ['This item is Cancelled']);
                  this.GetPatientProvisionalItems(this.SelectedPatient.PatientId, this.SelectedPatient.PatientVisitId);
                  this.showConfirmationBox = false;
                  this.loading = false;
                } else {
                  this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Please Try later']);
                  this.loading = false;
                }
              });
          }
        }

      }
    } else {
      this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Please Write Cancellation Remarks']);
    }
  }

  AddSuccessFullDataEntered($event): void {
    if ($event && $event.submit) {
      this.LoadPHRMOrdersOfERPatient(this.SelectedPatient.PatientId, this.SelectedPatient.PatientVisitId);
    }
  }

  ERWardItemListAction($event): void {
    switch ($event.Action) {
      case "cancel":
        {
          this.CancelRemarks = "";
          this.SelectedBillForCancel = $event.Data;
          this.SelIndexForCancel = this.ProvisionalItemsDetails.findIndex((p) => p.BillingTransactionItemId === this.SelectedBillForCancel.BillingTransactionItemId
          );
          if (this.SelectedBillForCancel && this.SelIndexForCancel > -1) {
            this.showConfirmationBox = true;
          }
        }
        break;
      default:
        break;
    }
  }

  hotkeys(event) {
    if (event) {
      if (event.keyCode == 27) {
        this.CloseWardBillingRequestPopUp();
      }
    }
  }

}
