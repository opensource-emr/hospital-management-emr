import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";

import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { Patient } from "../../patients/shared/patient.model";
import { BillingTransaction } from "../../billing/shared/billing-transaction.model";
import { BillingTransactionItem } from "../../billing/shared/billing-transaction-item.model";
import { CommonFunctions } from "../../shared/common.functions";
import * as moment from "moment/moment";
import { SecurityService } from "../../security/shared/security.service";
import { BillingBLService } from "../../billing/shared/billing.bl.service";
import { BillingService } from "../../billing/shared/billing.service";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { PatientBillingContextVM } from "../../billing/shared/patient-billing-context-vm";
import { LabsBLService } from "../../labs/shared/labs.bl.service";
import { ServiceDepartmentVM } from "../../shared/common-masters.model";
import { CoreService } from "../../core/shared/core.service";
import { CurrentVisitContextVM } from "../../appointments/shared/current-visit-context.model";
import {
  DanpheCache,
  MasterType,
} from "../../shared/danphe-cache-service-utility/cache-services";
import {
  ENUM_BillingStatus,
  ENUM_BillingType,
  ENUM_VisitType,
} from "../../shared/shared-enums";

@Component({
  selector: "nursing-ip-billitem-request",
  templateUrl: "./nursing-ipBillItem-Request.html",
})
export class NursingIpBillItemRequestComponent {
  @Input("showPatientSearch")
  public showPatientSearch: boolean = false;
  @Input("patientId")
  public patientId: number;
  @Input("visitId")
  public visitId: number;
  @Output("emit-billItemReq")
  public emitBillItemReq: EventEmitter<Object> = new EventEmitter<Object>();
  public showIpBillRequest: boolean = true;

  @Input("department")
  public department: string = null;
  //master data
  @Input("billItems")
  public billItems: Array<any> = [];

  public serviceDeptList: Array<ServiceDepartmentVM>;
  public doctorsList: Array<any> = [];

  public billingTransaction: BillingTransaction;

  //seleted items
  public selectedItems = [];
  public selectedServDepts: Array<any> = [];
  public selectedAssignedToDr: Array<any> = [];
  public selectedRequestedByDr: Array<any> = [];

  public inpatientList: Array<Patient>;
  public visitList: Array<any>;

  public billingType = "inpatient";
  public loading = false;
  public taxDetail = { taxPercent: 0, taxId: 0 };
  public currBillingContext: PatientBillingContextVM = null;
  public nursingCounterId: number = null;

  public selectedPatient;
  public currPatVisitContext: CurrentVisitContextVM = null;

  constructor(
    public labBLService: LabsBLService,
    public msgBoxServ: MessageboxService,
    public securityService: SecurityService,
    public changeDetectorRef: ChangeDetectorRef,
    public billingBLService: BillingBLService,
    public billingService: BillingService,
    public coreService: CoreService
  ) {
    this.billingTransaction = new BillingTransaction();
    this.serviceDeptList = this.coreService.Masters.ServiceDepartments;
    this.serviceDeptList = this.serviceDeptList.filter(
      (a) => a.ServiceDepartmentName != "OPD"
    );

    this.GetInpatientlist();

    //instead of Using in OnInit Component is initiated from inside  this function by calling InitiateComponent function
    this.GetDoctorsList();
  }

  ngOnInit() {
    //Asynchronous (incase if user )
    if (this.patientId && this.visitId) {
      this.labBLService
        .GetDataOfInPatient(this.patientId, this.visitId)
        .subscribe((res) => {
          if (res.Status == "OK") {
            this.currPatVisitContext = res.Results;
          } else {
            this.msgBoxServ.showMessage("failed", [
              "Problem! Cannot get the Current Visit Context ! ",
            ]);
          }
        });
    }
    this.billItems = this.billItems.filter(
      (val) => val.ServiceDepartmentName != "EMERGENCY"
    );
    this.GetBillingCounterForNursing();
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

  public InitiateComponent() {
    this.selectedItems = [];
    this.selectedAssignedToDr = [];
    this.selectedServDepts = [];
    this.selectedRequestedByDr = [];
    this.visitList = [];

    this.AddNewBillTxnItemRow();

    this.LoadPatientBillingContext(this.patientId);
    this.GetPatientVisitList(this.patientId);
  }

  public SubmitBillingTransaction(): void {
    //this.loading is set to true from the HTML. to handle double-Click.
    //check if there's other better alternative. till then let it be.. --sud:23Jan'18
    if (this.loading) {
      //set loading=true so that the butotn will be disabled to avoid Double-Click
      ///Its COMPULSORY to disable : DON'T CHANGE THIS -- sud: 21Jan2018
      this.loading = true;
      this.SetBillingTxnDetails();
      if (this.CheckValidations()) {
        this.PostToDepartmentRequisition();
      } else {
        this.loading = false;
      }
    }
  }
  public SetBillingTxnDetails() {
    let currentVisit = this.visitList.find(
      (visit) => visit.PatientVisitId == this.visitId
    );

    this.billingTransaction.BillingTransactionItems.forEach((txnItem) => {
      txnItem.PatientVisitId = this.visitId;
      //txnItem.RequestedBy = currentVisit ? currentVisit.ProviderId : null;
      //txnItem.BillingTransactionItemValidator.controls['RequestedBy'].setValue(txnItem.RequestedBy);
      txnItem.PatientId = this.patientId;
      txnItem.CounterId = this.nursingCounterId;

      txnItem.RequestingDeptId = this.currBillingContext
        ? this.currBillingContext.RequestingDeptId
        : null;

      txnItem.BillingType = ENUM_BillingType.inpatient; // 'inpatient';
      txnItem.VisitType = ENUM_VisitType.inpatient; // 'inpatient'; //If we use this for OutPatient Then We must modify it dynamically
      txnItem.BillStatus = ENUM_BillingStatus.provisional; // "provisional";

      txnItem.CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");
      txnItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      txnItem.CounterDay = moment().format("YYYY-MM-DD");

      txnItem.SubTotal = txnItem.Price * txnItem.Quantity;
      txnItem.DiscountAmount = 0;
      txnItem.DiscountPercent = 0;
      txnItem.DiscountPercentAgg = 0;
      txnItem.TotalAmount = txnItem.SubTotal - txnItem.DiscountAmount;
      txnItem.TaxPercent = 0;

      let taxInfo1 = this.coreService.Parameters.find(
        (a) => a.ParameterName == "TaxInfo"
      );
      if (taxInfo1) {
        let taxInfoStr = taxInfo1.ParameterValue;
        let taxInfo = JSON.parse(taxInfoStr);
        txnItem.TaxPercent = taxInfo.TaxPercent;
        this.taxDetail.taxId = taxInfo.TaxId;

        //this.taxName = taxInfo.TaxName;
        //this.taxLabel = taxInfo.TaxLabel;
        //this.taxPercent = taxInfo.TaxPercent;
      }

      this.billingTransaction.TaxId = this.taxDetail.taxId;

      if (txnItem.IsTaxApplicable) {
        txnItem.TaxableAmount = txnItem.TotalAmount;
        txnItem.NonTaxableAmount = 0;
        txnItem.Tax = txnItem.TotalAmount * (txnItem.TaxPercent / 100);
      } else {
        txnItem.TaxableAmount = 0;
        txnItem.NonTaxableAmount = txnItem.TotalAmount;
      }
    });
  }

  public CheckValidations(): boolean {
    let isFormValid = true;
    if (this.patientId && this.visitId) {
      if (
        this.CheckSelectionFromAutoComplete() &&
        this.billingTransaction.BillingTransactionItems.length
      ) {
        for (
          var i = 0;
          i < this.billingTransaction.BillingTransactionItems.length;
          i++
        ) {
          let currTxnItm = this.billingTransaction.BillingTransactionItems[i];
          for (var valCtrls in currTxnItm.BillingTransactionItemValidator
            .controls) {
            currTxnItm.BillingTransactionItemValidator.controls[
              valCtrls
            ].markAsDirty();
            currTxnItm.BillingTransactionItemValidator.controls[
              valCtrls
            ].updateValueAndValidity();
          }
        }

        for (
          var i = 0;
          i < this.billingTransaction.BillingTransactionItems.length;
          i++
        ) {
          let currTxnItm_1 = this.billingTransaction.BillingTransactionItems[i];
          //break loop if even a single txn item is invalid.
          if (!currTxnItm_1.IsValidCheck(undefined, undefined)) {
            isFormValid = false;
            break;
          }
        }
      } else {
        isFormValid = false;
      }
    } else {
      this.msgBoxServ.showMessage("failed", ["Invalid Patient/Visit Id."]);
      isFormValid = false;
    }

    return isFormValid;
  }

  public CheckSelectionFromAutoComplete(): boolean {
    if (this.billingTransaction.BillingTransactionItems.length) {
      for (let itm of this.billingTransaction.BillingTransactionItems) {
        if (!itm.IsValidSelDepartment) {
          this.msgBoxServ.showMessage("failed", ["Select item from list."]);
          this.loading = false;
          return false;
        }
      }
      return true;
    }
  }

  //posts to Departments Requisition Table
  public PostToDepartmentRequisition() {
    //orderstatus="active" and billingStatus="paid" when sent from billingpage.
    this.billingBLService
      .PostDepartmentOrders(
        this.billingTransaction.BillingTransactionItems,
        "active",
        "provisional",
        false,
        this.currPatVisitContext
      ) //fasle value is making InsuranceApplicableItem =false in lab requition table
      .subscribe((res) => {
        if (res.Status == "OK") {
          this.PostToBillingTransaction();
        } else {
          this.loading = false;
          this.msgBoxServ.showMessage("failed", [
            "Unable to do lab request.Please try again later",
          ]);
          console.log(res.ErrorMessage);
        }
      });
  }

  public PostToBillingTransaction() {
    this.billingBLService
      .PostBillingTransactionItems(
        this.billingTransaction.BillingTransactionItems
      )
      .subscribe((res) => {
        if (res.Status == "OK") {
          this.CloseLabRequestsPage();
          this.loading = false;
          this.emitBillItemReq.emit();
        } else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
          this.loading = false;
        }
      });
  }

  //----------end: post billing transaction-----------------------------------

  //start: get: master and patient data
  public LoadPatientBillingContext(patientId) {
    this.billingBLService
      .GetPatientBillingContext(patientId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.currBillingContext = res.Results;
          this.billingService.BillingType = "inpatient";
          this.billingType = "inpatient";
        }
      });
  }

  public GetInpatientlist() {
    this.labBLService.GetInpatientList().subscribe((res) => {
      if (res.Status == "OK") {
        this.inpatientList = res.Results;
      } else {
        this.msgBoxServ.showMessage("failed", ["Unable to get lab items."]);
      }
    });
  }

  public GetPatientVisitList(patientId: number) {
    this.labBLService.GetPatientVisitsProviderWise(patientId).subscribe(
      (res) => {
        if (res.Status == "OK") {
          if (res.Results.length) {
            this.visitList = res.Results;
            //assign doctor of latest visit as requestedby by default to the first billing item.

            let doc = this.doctorsList.find(
              (a) => a.EmployeeId == this.visitList[0].ProviderId
            );

            if (doc) {
              this.selectedRequestedByDr[0] = doc.FullName;
              this.AssignRequestedByDoctor(0);
            }
          } else {
            console.log(res.ErrorMessage);
          }
        }
      },
      (err) => {
        this.msgBoxServ.showMessage("Failed", [
          "unable to get PatientVisit list.. check log for more details.",
        ]);
        console.log(err.ErrorMessage);
      }
    );
  }
  public GetDoctorsList() {
    this.billingBLService.GetDoctorsList().subscribe(
      (res) => {
        if (res.Status == "OK") {
          if (res.Results.length) {
            this.doctorsList = res.Results;
            let Obj = new Object();
            Obj["EmployeeId"] = null; //change by Yub -- 23rd Aug '18
            Obj["FullName"] = "SELF";
            this.doctorsList.push(Obj);
            this.InitiateComponent();
          } else {
            console.log(res.ErrorMessage);
          }
        }
      },
      (err) => {
        this.msgBoxServ.showMessage("Failed", [
          "unable to get Doctors list.. check log for more details.",
        ]);
        console.log(err.ErrorMessage);
      }
    );
  }

  GetServiceDeptNameById(servDeptId: number): string {
    if (this.serviceDeptList) {
      let srvDept = this.serviceDeptList.find(
        (a) => a.ServiceDepartmentId == servDeptId
      );
      return srvDept ? srvDept.ServiceDepartmentName : null;
    }
  }
  //end: get: master and patient data

  //start: autocomplete assign functions and item filter logic
  public AssignSelectedItem(index) {
    let item = null;
    // check if user has given proper input string for item name
    //or has selected object properly from the dropdown list.
    if (this.selectedItems[index]) {
      if (
        typeof this.selectedItems[index] == "string" &&
        this.billingTransaction.BillingTransactionItems[index].ItemList.length
      ) {
        item = this.billingTransaction.BillingTransactionItems[
          index
        ].ItemList.find(
          (a) =>
            a.ItemName.toLowerCase() == this.selectedItems[index].toLowerCase()
        );
      } else if (typeof this.selectedItems[index] == "object")
        item = this.selectedItems[index];
      if (item) {
        if (this.billingType.toLowerCase() != "inpatient") {
          let extItem = this.billingTransaction.BillingTransactionItems.find(
            (a) =>
              a.ItemId == item.ItemId &&
              a.ServiceDepartmentId == item.ServiceDepartmentId
          );
          let extItemIndex = this.billingTransaction.BillingTransactionItems.findIndex(
            (a) =>
              a.ItemId == item.ItemId &&
              a.ServiceDepartmentId == item.ServiceDepartmentId
          );
          if (extItem && index != extItemIndex) {
            this.msgBoxServ.showMessage("failed", [
              item.ItemName + " is already entered.",
            ]);
            this.changeDetectorRef.detectChanges();
            this.billingTransaction.BillingTransactionItems[
              index
            ].IsDuplicateItem = true;
          } else
            this.billingTransaction.BillingTransactionItems[
              index
            ].IsDuplicateItem = false;
        }
        this.billingTransaction.BillingTransactionItems[index].ItemId =
          item.ItemId;
        this.billingTransaction.BillingTransactionItems[index].ItemName =
          item.ItemName;

        this.billingTransaction.BillingTransactionItems[index].ProcedureCode =
          item.ProcedureCode;
        this.billingTransaction.BillingTransactionItems[index].Price =
          item.Price;
        //add also the servicedepartmentname property of the item; needed since most of the filtering happens on this value

        this.billingTransaction.BillingTransactionItems[
          index
        ].ServiceDepartmentName = this.GetServiceDeptNameById(
          item.ServiceDepartmentId
        );
        this.billingTransaction.BillingTransactionItems[
          index
        ].ServiceDepartmentId = item.ServiceDepartmentId;
        this.selectedServDepts[
          index
        ] = this.billingTransaction.BillingTransactionItems[
          index
        ].ServiceDepartmentName;
        this.billingTransaction.BillingTransactionItems[
          index
        ].IsValidSelDepartment = true;
        this.billingTransaction.BillingTransactionItems[
          index
        ].IsValidSelItemName = true;
        this.FilterBillItems(index);
        this.CheckItemProviderValidation(index);
      } else
        this.billingTransaction.BillingTransactionItems[
          index
        ].IsValidSelItemName = false;
      if (!item && !this.selectedServDepts[index]) {
        this.billingTransaction.BillingTransactionItems[
          index
        ].ItemList = this.billItems;
      }
    }
  }

  public AssignSelectedDoctor(index) {
    let doctor = null;
    // check if user has given proper input string for item name
    //or has selected object properly from the dropdown list.
    if (this.selectedAssignedToDr[index]) {
      if (
        typeof this.selectedAssignedToDr[index] == "string" &&
        this.doctorsList.length
      ) {
        doctor = this.doctorsList.find(
          (a) =>
            a.FullName.toLowerCase() ==
            this.selectedAssignedToDr[index].toLowerCase()
        );
      } else if (typeof this.selectedAssignedToDr[index] == "object")
        doctor = this.selectedAssignedToDr[index];
      if (doctor) {
        this.billingTransaction.BillingTransactionItems[index].ProviderId =
          doctor.EmployeeId;
        this.billingTransaction.BillingTransactionItems[index].ProviderName =
          doctor.FullName;
        this.billingTransaction.BillingTransactionItems[
          index
        ].IsValidSelAssignedToDr = true;
      } else
        this.billingTransaction.BillingTransactionItems[
          index
        ].IsValidSelAssignedToDr = false;
    } else
      this.billingTransaction.BillingTransactionItems[
        index
      ].IsValidSelAssignedToDr = true;
  }

  public AssignRequestedByDoctor(index) {
    let doctor = null;
    // check if user has given proper input string for item name
    //or has selected object properly from the dropdown list.
    if (this.selectedRequestedByDr[index]) {
      if (
        typeof this.selectedRequestedByDr[index] == "string" &&
        this.doctorsList.length
      ) {
        doctor = this.doctorsList.find(
          (a) =>
            a.FullName.toLowerCase() ==
            this.selectedRequestedByDr[index].toLowerCase()
        );
      } else if (typeof this.selectedRequestedByDr[index] == "object")
        doctor = this.selectedRequestedByDr[index];

      if (doctor) {
        this.billingTransaction.BillingTransactionItems[index].RequestedBy =
          doctor.EmployeeId;
        this.billingTransaction.BillingTransactionItems[index].RequestedByName =
          doctor.FullName;
        this.billingTransaction.BillingTransactionItems[
          index
        ].IsValidSelRequestedByDr = true;
      } else
        this.billingTransaction.BillingTransactionItems[
          index
        ].IsValidSelRequestedByDr = false;
    } else
      this.billingTransaction.BillingTransactionItems[
        index
      ].IsValidSelRequestedByDr = true;
  }

  //assigns service department id and filters item list
  ServiceDeptOnChange(index) {
    let srvDeptObj = null;
    // check if user has given proper input string for department name
    //or has selected object properly from the dropdown list.
    if (typeof this.selectedServDepts[index] == "string") {
      if (this.serviceDeptList.length && this.selectedServDepts[index])
        srvDeptObj = this.serviceDeptList.find(
          (a) =>
            a.ServiceDepartmentName.toLowerCase() ==
            this.selectedServDepts[index].toLowerCase()
        );
    } else if (typeof this.selectedServDepts[index] == "object") {
      srvDeptObj = this.selectedServDepts[index];
    }

    //if selection of department from string or selecting object from the list is true
    //then assign proper department name
    if (srvDeptObj) {
      if (
        srvDeptObj.ServiceDepartmentId !=
        this.billingTransaction.BillingTransactionItems[index]
          .ServiceDepartmentId
      ) {
        this.ResetSelectedRow(index);
        this.billingTransaction.BillingTransactionItems[
          index
        ].ServiceDepartmentId = srvDeptObj.ServiceDepartmentId;
      }
      this.FilterBillItems(index);
      this.billingTransaction.BillingTransactionItems[
        index
      ].IsValidSelDepartment = true;
    }
    //else raise an invalid flag
    else {
      this.billingTransaction.BillingTransactionItems[
        index
      ].ItemList = this.billItems;
      this.billingTransaction.BillingTransactionItems[
        index
      ].IsValidSelDepartment = false;
    }
  }
  public FilterBillItems(index) {
    //ramavtar:13may18: at start if no default service department is set .. we need to skip the filtering of item list.
    if (
      this.billingTransaction.BillingTransactionItems[index].ServiceDepartmentId
    ) {
      if (
        this.billingTransaction.BillingTransactionItems.length &&
        this.billItems.length
      ) {
        let srvDeptId = this.billingTransaction.BillingTransactionItems[index]
          .ServiceDepartmentId;
        //initalAssign: FilterBillItems was called after assinging all the values(used in ngModelChange in SelectDepartment)
        // and was assigning ItemId=null.So avoiding assignment null value to ItemId during inital assign.
        if (
          this.billingTransaction.BillingTransactionItems[index].ItemId == null
        )
          this.ResetSelectedRow(index);
        this.billingTransaction.BillingTransactionItems[
          index
        ].ItemList = this.billItems.filter(
          (a) => a.ServiceDepartmentId == srvDeptId
        );

        let servDeptName = this.GetServiceDeptNameById(srvDeptId);
        if (this.IsDoctorMandatory(servDeptName, null)) {
          this.billingTransaction.BillingTransactionItems[
            index
          ].UpdateValidator("on", "ProviderId", "required");
        } else {
          this.billingTransaction.BillingTransactionItems[
            index
          ].UpdateValidator("off", "ProviderId", null);
        }
      }
    } else {
      let billItems = this.billItems.filter(
        (a) => a.ServiceDepartmentName != "OPD"
      );
      this.billingTransaction.BillingTransactionItems[
        index
      ].ItemList = billItems;
    }
  }

  //end: autocomplete assign functions  and item filter logic

  CloseLabRequestsPage() {
    this.showIpBillRequest = false;
  }

  //----start: add/delete rows-----
  ResetSelectedRow(index) {
    this.selectedItems[index] = null;
    this.selectedAssignedToDr[index] = null;
    this.billingTransaction.BillingTransactionItems[
      index
    ] = this.NewBillingTransactionItem();
  }

  AddNewBillTxnItemRow(index = null) {
    //method to add the row
    let billItem = this.NewBillingTransactionItem();
    billItem.EnableControl("Price", false);
    this.billingTransaction.BillingTransactionItems.push(billItem);
    if (index != null) {
      let new_index =
        this.billingTransaction.BillingTransactionItems.length - 1;
      this.selectedRequestedByDr[new_index] = this.selectedRequestedByDr[index];
      this.AssignRequestedByDoctor(new_index);
      window.setTimeout(function () {
        document.getElementById("items-box" + new_index).focus();
      }, 0);
    }
  }

  NewBillingTransactionItem(index = null): BillingTransactionItem {
    let billItem = new BillingTransactionItem();
    billItem.Quantity = 1;
    billItem.ItemList = this.billItems;
    return billItem;
  }

  deleteRow(index: number) {
    this.billingTransaction.BillingTransactionItems.splice(index, 1);
    this.billingTransaction.BillingTransactionItems.slice();
    this.selectedItems.splice(index, 1);
    this.selectedItems.slice();
    if (
      index == 0 &&
      this.billingTransaction.BillingTransactionItems.length == 0
    ) {
      this.AddNewBillTxnItemRow();
      this.changeDetectorRef.detectChanges();
    }
  }
  //----end: add/delete rows-----

  //start: mandatory doctor validations
  ///sudarshan/dinesh: 28June2017-- for Dynamic validation according to current service department and their items
  //Create a Map of service departments with its mandatory/nonmandatory attribute and its exclusion items..
  srvDeptValidationMap = [
    { ServDeptName: "USG", IsMandatory: true, ExcludedItems: [] },
    { ServDeptName: "CT Scan", IsMandatory: true, ExcludedItems: [] },
    {
      ServDeptName: "Dental",
      IsMandatory: false,
      ExcludedItems: [
        "[1] IOPAR (x-Ray)",
        "[2A] Dental extractions (Permanent)",
        "[4A] Scaling and Polishing (Gross)",
        "[4B] Scaling and Polishing (Deep)",
      ],
    },
    { ServDeptName: "ULTRASOUND", IsMandatory: true, ExcludedItems: [] },
    {
      ServDeptName: "ULTRASOUND COLOR DOPPLER",
      IsMandatory: true,
      ExcludedItems: [],
    },
    {
      ServDeptName: "NON INVASIVE CARDIO VASCULAR INVESTIGATIONS",
      IsMandatory: true,
      ExcludedItems: [],
    },
    { ServDeptName: "PHYSIOTHERAPY", IsMandatory: true, ExcludedItems: [] },

    {
      ServDeptName: "General Surgery Charges",
      IsMandatory: false,
      ExcludedItems: ["PAC"],
    },
    { ServDeptName: "Lab", IsMandatory: false, ExcludedItems: ["PAP Smear"] },
    {
      ServDeptName: "Ortho Procedures",
      IsMandatory: false,
      ExcludedItems: ["Plaster A (lower Extremity)", "Injection Steroid"],
    },
    {
      ServDeptName: "Biopsy",
      IsMandatory: false,
      ExcludedItems: [
        "B 5-10 blocks",
        "C Single Block Gallbladder,small lumps",
      ],
    },
    {
      ServDeptName: "OBS/GYN Surgery",
      IsMandatory: false,
      ExcludedItems: ["Hydrotobation"],
    },
    {
      ServDeptName: "OT",
      IsMandatory: true,
      ExcludedItems: ["OT Theatre Charge"],
    }, //ot theater charge goes to hospital..
    {
      ServDeptName: "Other",
      IsMandatory: false,
      ExcludedItems: [
        "Dressing Charge (Large)",
        "Dressing Charge (Medium)",
        "Dressing Charge (Small)",
        "Endoscopy",
        "General Round Charge",
        "ICU  Round Charge (New)",
        "ICU Round Charge",
        "Procedure Charge",
        "Suture out",
        "Sututre In (Large)",
        "Sututre In (small)",
        "Colonoscopy",
        "Intubation Charge",
      ],
    },
  ];
  //returns whether doctor is mandatory for current combination of serv-dept and it's item.
  IsDoctorMandatory(serviceDeptName: string, itemName: string): boolean {
    let isDocMandatory = false;
    let dptItmMap = this.srvDeptValidationMap;
    //go inside only when serviceDeptName is provided.
    if (serviceDeptName) {
      //check if provided serviceDeptName is present in our map--default is false.
      let curMap = dptItmMap.find((s) => s.ServDeptName == serviceDeptName);
      if (curMap) {
        //check if serviceDeptName is in mandatory map or non-mandatory map.
        if (curMap.IsMandatory) {
          isDocMandatory = true; //default true for Mandatory srv-depts
          //false when provided item is excluded from mandatory service department
          if (curMap.ExcludedItems.find((itm) => itm == itemName)) {
            isDocMandatory = false;
          }
        } else if (curMap.IsMandatory == false) {
          isDocMandatory = false; //default false for NON-Mandatory srv-depts
          //true when provided item is excluded from non-mandatory service department
          if (curMap.ExcludedItems.find((itm) => itm == itemName)) {
            isDocMandatory = true;
          }
        }
      } else {
        isDocMandatory = false;
      }
    }
    return isDocMandatory;
  }

  CheckItemProviderValidation(index: number) {
    let srvDeptId = this.billingTransaction.BillingTransactionItems[index]
      .ServiceDepartmentId;
    let servDeptName = this.GetServiceDeptNameById(srvDeptId);
    if (
      this.IsDoctorMandatory(
        servDeptName,
        this.billingTransaction.BillingTransactionItems[index].ItemName
      )
    ) {
      this.billingTransaction.BillingTransactionItems[index].UpdateValidator(
        "on",
        "ProviderId",
        "required"
      );
    } else {
      this.billingTransaction.BillingTransactionItems[index].UpdateValidator(
        "off",
        "ProviderId",
        null
      );
    }
  }
  //end: mandatory doctor validations

  //start: list formatters

  ItemsListFormatter(data: any): string {
    let html: string =
      data["ServiceDepartmentShortName"] +
      "-" +
      data["BillItemPriceId"] +
      "&nbsp;&nbsp;" +
      data["ItemName"] +
      "&nbsp;&nbsp;";
    html +=
      "(<i>" +
      data["ServiceDepartmentName"] +
      "</i>)" +
      "&nbsp;&nbsp;" +
      this.coreService.currencyUnit+ " " +
      data["Price"];
    return html;
  }

  DoctorListFormatter(data: any): string {
    return data["FullName"];
  }
  ServiceDeptListFormatter(data: any): string {
    return data["ServiceDepartmentName"];
  }
  patientListFormatter(data: any): string {
    let html = data["ShortName"] + " [ " + data["PatientCode"] + " ]";
    return html;
  }
  //start: list formatters
}
