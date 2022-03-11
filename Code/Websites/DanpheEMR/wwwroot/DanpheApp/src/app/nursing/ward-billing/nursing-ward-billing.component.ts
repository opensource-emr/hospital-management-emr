import { Component, ChangeDetectorRef, Input } from "@angular/core";
import { BillingBLService } from "../../billing/shared/billing.bl.service";
import { BillingTransactionItem } from "../../billing/shared/billing-transaction-item.model";
import { PatientService } from "../../patients/shared/patient.service";
import { Patient } from "../../patients/shared/patient.model";
import { VisitService } from "../../appointments/shared/visit.service";
import { Visit } from "../../appointments/shared/visit.model";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { NursingBLService } from "../shared/nursing.bl.service";
import { InPatientLabTest } from "../../labs/shared/InpatientLabTest";
import { LabsBLService } from "../../labs/shared/labs.bl.service";
import * as moment from "moment/moment";
import { DanpheHTTPResponse, CancelStatusHoldingModel } from "../../shared/common-models";
import { CurrentVisitContextVM } from "../../appointments/shared/current-visit-context.model";
import {
  DanpheCache,
  MasterType,
} from "../../shared/danphe-cache-service-utility/cache-services";
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import {
  NepaliDateInGridParams,
  NepaliDateInGridColumnDetail,
} from "../../shared/danphe-grid/NepaliColGridSettingsModel";
import { log } from "util";
import { CoreService } from "../../core/shared/core.service";
import { ENUM_OrderStatusNumber } from "../../shared/shared-enums";

@Component({
  selector: "nursing-ward-billing",
  templateUrl: "./nursing-ward-billing.html",
  styles: [
    `
      .mar-btm-25 {
        margin-bottom: 25px;
      }
    `,
  ],
})
export class NursingWardBillingComponent {
  @Input("isPopUp") public isPopUp: boolean = false;
  public provisionalItemsDetails: Array<any> = [];

  public currentPatient: Patient = new Patient();
  public currentVisit: Visit = new Visit();
  public allBillItems: Array<any>;
  public inPatientId: number = null;
  public inPatientVisitId: number = null;
  public showNewIpRequestPopup: boolean = false;
  public showPatientSearch: boolean = true;
  public loading = false;

  public nursingCounterId: number = null;
  public currPatVisitContext: CurrentVisitContextVM = null;
  public nursingWardBillingColumns: any;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  showConfirmationBox: boolean = false;
  public selectedBillForCancel: any;
  public cancelRemarks: string = null;
  public selIndexForCancel: number;
  //public billType: string = 'inpatient';
  public overallCancellationRule: any;
  public nursingCancellationRule: CancelStatusHoldingModel = new CancelStatusHoldingModel();
  public isCancelRuleEnabled: boolean;


  public nursingCancellationNumber: number = 0;
  public HidePriceCol:boolean = true;

  constructor(
    public billingBLService: BillingBLService,
    public patientService: PatientService,
    public visitService: VisitService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public nursingBLService: NursingBLService,
    public labBLService: LabsBLService,
    public coreService: CoreService
  ) {

    this.overallCancellationRule = this.coreService.GetIpBillCancellationRule();

    if (this.overallCancellationRule && this.overallCancellationRule.Enable) {
      this.isCancelRuleEnabled = this.overallCancellationRule.Enable;
      this.nursingCancellationRule.labStatus = this.overallCancellationRule.LabItemsInNursing;
      this.nursingCancellationRule.radiologyStatus = this.overallCancellationRule.ImagingItemsInNursing;
    } 

    //this.overallCancellationRule.Nursing.forEach(c => {
    //  if (ENUM_OrderStatusNumber[c] && (+ENUM_OrderStatusNumber[c] > this.nursingCancellationNumber)) {
    //    this.nursingCancellationNumber = +ENUM_OrderStatusNumber[c];
    //  }
    //});
    this.GridColumnSettings();
    // this.nursingWardBillingColumns = [
    //   {
    //     headerName: "Requested Date",
    //     field: "RequisitionDate",
    //     width: 80,
    //   },
    //   {
    //     headerName: "Department",
    //     field: "ServiceDepartmentName",
    //     width: 100,
    //   },
    //   {
    //     headerName: "Item Name",
    //     width: 100,
    //     field: "ItemName"
    //   },
    //   {
    //     headerName: "Assigned To Dr.",
    //     width: 100,
    //     field: "ProviderName",
    //   },
    //   { headerName: "Qty", field: "Quantity", width: 30 },
    //   { headerName: "Sub Total", field: "SubTotal", width: 30  },
    //   { headerName: "Added By", field: "RequestingUserName", width: 80 },
    //   { headerName: "Status", field: "OrderStatus", width: 80 },
    //   { headerName: "Action", cellRenderer: this.GetActionList, width: 80 },
    // ];

    this.currentPatient = this.patientService.globalPatient;
    this.currentVisit = this.visitService.globalVisit;

    if (this.currentPatient.PatientId && this.currentVisit.PatientVisitId) {
      this.GetPatientProvisionalItems(
        this.currentPatient.PatientId,
        this.currentVisit.PatientVisitId
      );
      this.GetCurrentVisitContext();
    } else {
    }

    this.GetBillingItems();
    this.GetBillingCounterForNursing();
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(
      new NepaliDateInGridColumnDetail("RequisitionDate", true)
    );
  }

  ngOnInit() { }

  GridColumnSettings(){
    let moduleName = "Nursing";
    let param = this.coreService.Parameters.find(
      (p) =>
        p.ParameterGroupName == "Common" &&
        p.ParameterName == "WardBillingColumnSettings"
    );
    if (param) {
      let paramValue = JSON.parse(param.ParameterValue);
      let data = paramValue.find(
        (a) => a.Module.toLowerCase() == moduleName.toLowerCase()
      );
      if(data.ShowPrice == true){
        this.HidePriceCol = false;
      }else{
        this.HidePriceCol = true;
      }
      
    }

    this.nursingWardBillingColumns = [
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
      { headerName: "Sub Total", field: "SubTotal", width: 30,  hide: this.HidePriceCol  },
      { headerName: "Added By", field: "RequestingUserName", width: 80 },
      { headerName: "Status", field: "OrderStatus", width: 80 },
      { headerName: "Action", cellRenderer: this.GetActionList, width: 80 },
    ];
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

  public GetCurrentVisitContext() {
    this.labBLService
      .GetDataOfInPatient(
        this.currentPatient.PatientId,
        this.currentVisit.PatientVisitId
      )
      .subscribe(
        (res) => {
          if (res.Status == "OK" && res.Results.Current_WardBed) {
            this.currPatVisitContext = res.Results;
          } else {
            this.msgBoxServ.showMessage("failed", [
              "Problem! Cannot get the Current Visit Context ! ",
            ]);
          }
        },
        (err) => {
          console.log(err.ErrorMessage);
        }
      );
  }

  GetBillingCounterForNursing() {
    let allBilCntrs: Array<any>;
    allBilCntrs = DanpheCache.GetData(MasterType.BillingCounter, null);
    let nursingCounter = allBilCntrs.filter(
      (cnt) => cnt.CounterType == "NURSING"
    );
    if (nursingCounter) {
      this.nursingCounterId = nursingCounter.find(
        (cntr) => cntr.CounterId
      ).CounterId;
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
    let module = 'nursing';
    this.billingBLService.GetInPatientProvisionalItemList(patientId, patientVisitId, module)
      .subscribe((res) => {

        if (this.isCancelRuleEnabled) {
          res.Results.BillItems.forEach(val => {
            if (val.IntegrationName && (val.IntegrationName.toLowerCase() == 'lab' || val.IntegrationName.toLowerCase() == 'radiology')) {
              if (!val.RequisitionId || (val.IntegrationName.toLowerCase() == 'lab' && this.nursingCancellationRule.labStatus.includes(val.OrderStatus))
                || (val.IntegrationName.toLowerCase() == 'radiology' && this.nursingCancellationRule.radiologyStatus.includes(val.OrderStatus)) ) {
                val.AllowCancellation = true;
              }
            }
          });
        }

        //DO NT REMOVE this code as Logically this is the correct way for Allowing Cancellation
        //if (this.isCancelRuleEnabled) {
        //  res.Results.BillItems.forEach(val => {
        // if (val.IntegrationName.toLowerCase() == 'lab' || val.IntegrationName.toLowerCase() == 'radiology') {
        //    if ((val.OrderStatus && ((+ENUM_OrderStatusNumber[val.OrderStatus]) <= this.nursingCancellationNumber)) || (val.RequisitionId == 0)) {
        //      val.AllowCancellation = true;
        //    }
        // }
          //  });
          //}

          this.provisionalItemsDetails = res.Results.BillItems;

          this.patientService.globalPatient.DateOfBirth = res.Results.Patient.DateOfBirth;
          this.patientService.globalPatient.BloodGroup = res.Results.Patient.BloodGroup;
          this.patientService.globalPatient.CountryId = res.Results.Patient.CountryId;
          this.patientService.globalPatient.CountrySubDivisionId =
            res.Results.Patient.CountrySubDivisionId;
          this.patientService.globalPatient.CountrySubDivisionName =
            res.Results.Patient.CountrySubDivisionName;
          this.patientService.globalPatient.PhoneNumber = res.Results.Patient.PhoneNumber;

        })
  }

  public CloseOrderView() {
    this.showNewIpRequestPopup = false;
  }
  public GetBillingItems() {
    this.billingBLService.GetBillItemList().subscribe(
      (res) => {
        if (res.Status == "OK") {
          if (res.Results.length) {
            this.allBillItems = res.Results;
            this.allBillItems = this.allBillItems.filter(
              (val) => val.ServiceDepartmentName != "EMERGENCY"
            );
          } else {
            this.msgBoxServ.showMessage("Failed", [
              "unable to get items for searchbox.. check logs for more details.",
            ]);
            console.log(res.ErrorMessage);
          }
        }
      },
      (err) => {
        console.log(err.ErrorMessage);
      }
    );
  }

  AddNewIpRequest() {
    if (this.nursingCounterId) {
      this.showNewIpRequestPopup = false;
      this.showPatientSearch = true;
      this.changeDetector.detectChanges();
      this.showNewIpRequestPopup = true;
      this.showPatientSearch = false;
    } else {
      this.msgBoxServ.showMessage("Failed", [
        "Please Try again Later as Nursing Counter not found.",
      ]);
    }
  }

  OnNewIpRequestClosed() {
    this.GetPatientProvisionalItems(
      this.currentPatient.PatientId,
      this.currentVisit.PatientVisitId
    );
    this.showNewIpRequestPopup = false;
  }

  cancelRequest(billTransactionItem, index: number) {
    let labItem: InPatientLabTest = new InPatientLabTest();

    billTransactionItem.CancelRemarks = this.cancelRemarks.trim();
    console.log(billTransactionItem);
    if (
      billTransactionItem.CancelRemarks &&
      billTransactionItem.CancelRemarks.length
    ) {
      if (billTransactionItem) {
        var cancelLabTestOfCurrentPatient = window.confirm(
          "Are You Sure You want to cancel this item for this Patient?"
        );

        if (cancelLabTestOfCurrentPatient) {
          billTransactionItem.CounterId = this.nursingCounterId;
          billTransactionItem.ItemIntegrationName = billTransactionItem.IntegrationName;
          if (
            billTransactionItem.ItemIntegrationName &&
            billTransactionItem.ItemIntegrationName == "radiology"
          ) {
            this.nursingBLService
              .CancelItemRequest(billTransactionItem)
              .subscribe((res) => {
                if (res.Status == "OK") {
                  this.provisionalItemsDetails.splice(index, 1);
                  this.provisionalItemsDetails.slice();
                  this.changeDetector.detectChanges();
                  this.msgBoxServ.showMessage("success", [
                    "This item is Cancelled",
                  ]);
                  this.showConfirmationBox = false;
                  this.GetPatientProvisionalItems(
                    this.currentPatient.PatientId,
                    this.currentVisit.PatientVisitId
                  );
                  this.loading = false;
                } else {
                  this.msgBoxServ.showMessage("failed", ["Please Try later"]);
                  this.loading = false;
                }
              });
          } else if (
            billTransactionItem.ItemIntegrationName &&
            billTransactionItem.ItemIntegrationName.toLowerCase() ==
            "lab"
          ) {
            // labItem.RequisitionId = billTransactionItem.RequisitionId;
            // labItem.PatientId = billTransactionItem.PatientId;
            // labItem.PatientVisitId = billTransactionItem.PatientVisitId;
            // labItem.LabTestName = billTransactionItem.ItemName;
            // labItem.LabTestId = billTransactionItem.ItemId;
            // labItem.BillingTransactionItemId =
            //   billTransactionItem.BillingTransactionItemId;
            // labItem.OrderDateTime = billTransactionItem.RequisitionDate;
            // labItem.CancelledOn = moment().format("YYYY-MM-DD HH:mm");

            this.nursingBLService
              .CancelItemRequest(billTransactionItem)
              .subscribe((res) => {
                if (res.Status == "OK") {
                  this.provisionalItemsDetails.splice(index, 1);
                  this.provisionalItemsDetails.slice();
                  this.changeDetector.detectChanges();
                  this.msgBoxServ.showMessage("success", [
                    "This item is Cancelled",
                  ]);
                  this.showConfirmationBox = false;
                  this.GetPatientProvisionalItems(
                    this.currentPatient.PatientId,
                    this.currentVisit.PatientVisitId
                  );
                  this.loading = false;
                } else {
                  this.msgBoxServ.showMessage("failed", ["Please Try later"]);
                  this.loading = false;
                }
              });
          } else {
            this.nursingBLService
              .CancelBillRequest(billTransactionItem)
              .subscribe((res) => {
                if (res.Status == "OK") {
                  this.provisionalItemsDetails.splice(index, 1);
                  this.provisionalItemsDetails.slice();
                  this.changeDetector.detectChanges();
                  this.msgBoxServ.showMessage("success", [
                    "This item is Cancelled",
                  ]);
                  this.showConfirmationBox = false;
                  this.GetPatientProvisionalItems(
                    this.currentPatient.PatientId,
                    this.currentVisit.PatientVisitId
                  );
                  this.loading = false;
                } else {
                  this.msgBoxServ.showMessage("failed", ["Please Try later"]);
                  this.loading = false;
                }
              });
          }
        }
      }
    } else {
      this.msgBoxServ.showMessage("failed", [
        "Please Write Cancellation Remarks",
      ]);
    }
  }

  NursingWardBillingGridActions($event: GridEmitModel) {
    this.selectedBillForCancel = null;
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
