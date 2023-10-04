import { Component, ChangeDetectorRef, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CoreService } from '../../core/shared/core.service';
import { CommonFunctions } from '../../shared/common.functions';
import { DanpheHTTPResponse, CancelStatusHoldingModel } from '../../shared/common-models';
import * as moment from 'moment/moment';
import { BillingTransactionItem } from '../../billing/shared/billing-transaction-item.model';
import { InPatientLabTest } from '../../labs/shared/InpatientLabTest';
import { Patient } from '../../patients/shared/patient.model';
import { ImagingBLService } from '../shared/imaging.bl.service';
import { WardPatientVM } from './ward-patient-view-model';
import { BillingBLService } from '../../billing/shared/billing.bl.service';
import { DanpheCache, MasterType } from '../../shared/danphe-cache-service-utility/cache-services';
import { ENUM_OrderStatusNumber } from "../../shared/shared-enums";
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'rad-ward-billing',
  templateUrl: './rad-wardbilling.html'
}) 

// App Component class
export class RadiologyWardBillingComponent {
  public loading: boolean = false;
  public provisionalItemsDetails: Array<BillingTransactionItem> = [];

  public allBillItems: Array<any>;//this brings all billing items
  //public radBillItems: Array<any>;//filter out only radiology items and push to this list.
  public showOrderRequest: boolean = false;

  public radiologyBillingCounterId: number = null;

  @Input("selectedPatient")
  selectedWardPatient: WardPatientVM = null;
  @Output("onPoupuClosed")
  onPoupuClosed: EventEmitter<object> = new EventEmitter<object>();

  public selectedPatient: WardPatientVM = new WardPatientVM();
  public overallCancellationRule: any;
  public radCancellationRule: CancelStatusHoldingModel = new CancelStatusHoldingModel();
  public isCancelRuleEnabled: boolean;

  public radCancellationNumber: number = 0;
  public IsLocalDate = true;

  constructor(public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService, public imagingBlService: ImagingBLService, public billingBLService: BillingBLService,
    public emergencyBLService: ImagingBLService, public coreService: CoreService) {
    //this.GetBillingItems();
    this.GetBillingCounterForRadiology();
    this.overallCancellationRule = this.coreService.GetIpBillCancellationRule();

    if (this.overallCancellationRule && this.overallCancellationRule.Enable) {
      this.isCancelRuleEnabled = this.overallCancellationRule.Enable;
      this.radCancellationRule.radiologyStatus = this.overallCancellationRule.ImagingItemsInRadiology;
    }

    //this.overallCancellationRule.Radiology.forEach(c => {
    //  if (ENUM_OrderStatusNumber[c] && (+ENUM_OrderStatusNumber[c] > this.radCancellationNumber)) {
    //    this.radCancellationNumber = +ENUM_OrderStatusNumber[c];
    //  }
    //});
  }

  ngOnInit() {
    this.selectedPatient = this.selectedWardPatient;
    forkJoin(
      this.billingBLService.GetInPatientProvisionalItemList(this.selectedPatient.PatientId, this.selectedPatient.PatientVisitId, 'radiology'),
      this.imagingBlService.GetRadiologyBillingItems()
    ).subscribe(([provItems, allBillingItems]) => {
      if(this.isCancelRuleEnabled){
        provItems.Results.BillItems.forEach(val => {
          if (val.IntegrationName && val.IntegrationName.toLowerCase() == 'radiology') {
            if (!val.RequisitionId || (val.OrderStatus && this.radCancellationRule.radiologyStatus.includes(val.OrderStatus))) {
              val.AllowCancellation = true;
            }
          }
        })
      }      
      this.provisionalItemsDetails = provItems.Results.BillItems;
      //this.provisionalItemsDetails = this.provisionalItemsDetails.filter(itm => itm.ServiceDepartment.IntegrationName == "Radiology");
      //console.log(this.provisionalItemsDetails);
      this.provisionalItemsDetails.forEach(function (val) {
        val.Patient = provItems.Results.Patient;
        val.IsSelected = false;
      });
      
      if (allBillingItems.Results.length) {
        this.allBillItems = allBillingItems.Results;
        this.changeDetector.detectChanges();
        this.showOrderRequest = true;
      }
      else {
        this.msgBoxServ.showMessage('Failed', ["unable to get items for searchbox.. check logs for more details."]);
        console.log(allBillingItems.ErrorMessage);
      }

      });
  }

 
  
  public GetBillingItems() {
    this.imagingBlService.GetRadiologyBillingItems()
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
    let module = 'radiology';
    this.billingBLService.GetInPatientProvisionalItemList(patientId, patientVisitId,module)
      .subscribe(res => {
        
        if(this.isCancelRuleEnabled){
          res.Results.BillItems.forEach(val => {
            if (val.IntegrationName && val.IntegrationName.toLowerCase() == 'radiology') {
              if (!val.RequisitionId || (val.OrderStatus && this.radCancellationRule.radiologyStatus.includes(val.OrderStatus))) {
                val.AllowCancellation = true;
              }
            }
          })
        }
        
        this.provisionalItemsDetails = res.Results.BillItems;
        //this.provisionalItemsDetails = this.provisionalItemsDetails.filter(itm => itm.ServiceDepartment.IntegrationName == "Radiology");
        //console.log(this.provisionalItemsDetails);
        this.provisionalItemsDetails.forEach(function (val) {
          val.Patient = res.Results.Patient;
          val.IsSelected = false;
        });
      });
  }

  GetBillingCounterForRadiology() {

    let allBilCntrs: Array<any>;
    allBilCntrs = DanpheCache.GetData(MasterType.BillingCounter, null);
    let counter = allBilCntrs.filter(cnt => cnt.CounterType == "RADIOLOGY");
    if (counter) {
      this.radiologyBillingCounterId = counter.find(cntr => cntr.CounterId).CounterId;
    }

    // this.billingBLService.GetAllBillingCounters()
    //     .subscribe((res: DanpheHTTPResponse) => {
    //         if (res.Status == "OK") {
    //             let allBilCntrs: Array<any> = res.Results;
    //             let counter = allBilCntrs.find(cnt => cnt.CounterType == "RADIOLOGY");
    //             if (counter) {
    //                 this.radiologyBillingCounterId = counter.CounterId;
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

  Close() {
    this.onPoupuClosed.emit({ submit: false });
  }

  cancelRequest(billTransactionItem, index: number) {
    //console.log(billTransactionItem);
    let ERLabItem: InPatientLabTest = new InPatientLabTest();

    if (billTransactionItem.CancelRemarks && billTransactionItem.CancelRemarks.length) {


      if (billTransactionItem) {

        var cancelLabTestOfCurrentPatient = window.confirm("Are You Sure You want to cancel this item for this Patient?");

        if (cancelLabTestOfCurrentPatient) {
          billTransactionItem.CounterId = this.radiologyBillingCounterId;
          billTransactionItem.ItemIntegrationName = billTransactionItem.IntegrationName;
          if (billTransactionItem.ItemIntegrationName.toLowerCase() == 'radiology') {
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

  //Anjana: 9/11/2020: To change Ordered Date format
  ChangeDateFormat() {
    this.IsLocalDate = !this.IsLocalDate;
  }


}
