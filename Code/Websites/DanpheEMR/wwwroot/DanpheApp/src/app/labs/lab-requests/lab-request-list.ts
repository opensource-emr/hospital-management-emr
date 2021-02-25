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
import { DanpheHTTPResponse, CancelStatusHoldingModel } from "../../shared/common-models";
import { PatientBillingContextVM } from "../../billing/shared/patient-billing-context-vm";
import { InPatientLabTest } from "../shared/InpatientLabTest";
import { DanpheCache, MasterType } from "../../shared/danphe-cache-service-utility/cache-services";
import { CoreService } from "../../core/shared/core.service";
import { ENUM_OrderStatusNumber } from "../../shared/shared-enums";
import { forkJoin } from "rxjs";

@Component({
  selector: 'lab-requests-list',
  templateUrl: './lab-request-list.html',
  styles: [` .tbl-text{flex: 1;}
  .tbl-header .tbl-text{font-weight: 600;padding: 2px 10px;}
  .tbl-header {background: #0773bc;padding: 4px 0px;color: #fff;
    font-size: 12px;}
  .tbl-body {padding: 4px 0px;}
   .tbl-body .tbl-text{padding: 2px 15px; font-size: 12px;}
  .flex-table-body-holder{max-height: 260px; overflow-y: auto;}
  .tbl-body:not(:last-child) {border-bottom: 1px solid #dadbdc;}
  .large-txt{font-size: 24px;}
  .flex-table-body-holder {background: #f0f0f1;}
  .portlet.portlet-fullscreen > .portlet-body {overflow-y: hidden !important;}
  .full-width-flx {display: flex; flex-basis: 100%;}`]
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
  public overallCancellationRule: any;
  public labCancellationRule: CancelStatusHoldingModel = new CancelStatusHoldingModel();
  public isCancelRuleEnabled: boolean;


  public labCancellationNumber: number = 0;
  public IsLocalDate = true;

  constructor(public labBLService: LabsBLService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public billingBLService: BillingBLService,
    public coreService: CoreService) {
    this.GetBillingCounterForLab();
    
    this.overallCancellationRule = this.coreService.GetIpBillCancellationRule();
    if (this.overallCancellationRule && this.overallCancellationRule.Enable) {
      this.isCancelRuleEnabled = this.overallCancellationRule.Enable;
      this.labCancellationRule.labStatus = this.overallCancellationRule.LabItemsInLab;
    }

    //this.overallCancellationRule.Lab.forEach(c => {
    //  if (ENUM_OrderStatusNumber[c] && (+ENUM_OrderStatusNumber[c] > this.labCancellationNumber)) {
    //    this.labCancellationNumber = +ENUM_OrderStatusNumber[c];
    //  }
    //});
  }

  ngOnInit() {
    // this.GetAllTestOfSelectedInpatient();
    // this.GetLabItems();
    forkJoin(
      this.labBLService.GetTestListOfSelectedInPatient(this.selectedPatient.PatientId, this.selectedPatient.PatientVisitId, 'lab'),
      this.labBLService.GetLabBillingItems()
    ).subscribe(([provlabItems, allBillingItems]) => {

      if (this.isCancelRuleEnabled) {
        provlabItems.Results.BillItems.forEach(val => {
          if (val.IntegrationName && val.IntegrationName.toLowerCase() == 'lab') {
            if (!val.RequisitionId || (val.OrderStatus && this.labCancellationRule.labStatus.includes(val.OrderStatus))) {
              val.AllowCancellation = true;
            }
          }
        });
      }
      this.labTestList = provlabItems.Results.BillItems;
      if (allBillingItems.Results.length) {
        this.labBillItems = allBillingItems.Results;
        this.showOrderRequest = true;
      }
      else {
        this.msgBoxServ.showMessage("failed", ["Unable to get lab items."]);
      }
    })
  }

  WardBillingRequestOnClose($event) {
    if ($event && $event.action == "save") {
      this.GetAllTestOfSelectedInpatient();
    }

  }

  public GetAllTestOfSelectedInpatient() {
    let module = 'lab';
    
    this.labBLService.GetTestListOfSelectedInPatient(this.selectedPatient.PatientId, this.selectedPatient.PatientVisitId, module)
      .subscribe(res => {
        if (res.Status == "OK") {
          if (this.isCancelRuleEnabled) {
            res.Results.BillItems.forEach(val => {
              if (val.IntegrationName && val.IntegrationName.toLowerCase() == 'lab') {
                if (!val.RequisitionId || (val.OrderStatus && this.labCancellationRule.labStatus.includes(val.OrderStatus))) {
                  val.AllowCancellation = true;
                }
              }
            });
          }
          this.labTestList = res.Results.BillItems;
        }
      });
  }

  RouteToLabRequisition() {
    this.CloseLabRequestsPage();
  }

  GetBillingCounterForLab() {
    let allBilCntrs: Array<any>;
    allBilCntrs = DanpheCache.GetData(MasterType.BillingCounter, null);
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

  public cancelThisTest(currentInpatientLabTest, indx: number) {

    if (this.loading) {
      if (currentInpatientLabTest.CancelRemarks && currentInpatientLabTest.CancelRemarks.trim() != '' && currentInpatientLabTest.CancelRemarks.length) {
        var cancelLabTestOfCurrentPatient = window.confirm("Are You Sure You want to cancel this LabTest for this Patient?");
        if (cancelLabTestOfCurrentPatient) {
          currentInpatientLabTest.ItemIntegrationName = currentInpatientLabTest.IntegrationName;
          if (
            currentInpatientLabTest.ItemIntegrationName &&
            currentInpatientLabTest.ItemIntegrationName == "lab"
          ) {
            this.labBLService.CancelLabItem(currentInpatientLabTest)
            .subscribe(res => {
              if (res.Status == "OK") {
                this.labTestList.splice(indx, 1);
                this.labTestList.slice();
                this.changeDetector.detectChanges();
                this.msgBoxServ.showMessage("success", ['The selected test is Cancelled']);
                this.loading = false;
              } else {
                this.msgBoxServ.showMessage("failed", ['Please Try later']);
                this.loading = false;
              }
            });
          }        

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
    this.callBackRequestLabItem.emit({ state: 0 });
  }

  //Anjana: 9/11/2020: To change Ordered Date format
  ChangeDateFormat() {
    this.IsLocalDate = !this.IsLocalDate;
  }

}
