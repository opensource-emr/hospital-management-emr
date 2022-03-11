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
import { ENUM_BillingStatus, ENUM_VisitType, ENUM_OrderStatus } from "../../shared/shared-enums";

@Component({
  selector: "nursing-ip-request",
  templateUrl: "./nursing-ip-request.html",
})
export class NursingIPRequestComponent {
  //master data
  @Input("billItems")
  public billItems: Array<any> = [];

  @Input("patientId")
  public patientId: number;
  @Input("visitId")
  public visitId: number;
  @Input("counterId")
  public counterId: number;
  @Input("visitType")
  public visitType: string;
  @Input("billingType")
  public billingType: string;

  public pastTests: Array<any> = [];

  @Input("past-tests")
  set SetPastTests(value: Array<any>) {
    this.PastTest(value);
  }
  public currentTest: Array<any> = [];

  @Output("emit-billItemReq")
  public emitBillItemReq: EventEmitter<Object> = new EventEmitter<Object>();

  public showIpBillRequest: boolean = true;

  @Input("department")
  public department: string = null;

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

  public loading = false;
  public taxDetail = { taxPercent: 0, taxId: 0 };
  public currBillingContext: PatientBillingContextVM = null;

  public selectedPatient;
  public currPatVisitContext: CurrentVisitContextVM = null;
  public searchByItemCode: boolean = true;

  public BillRequestDoubleEntryWarningTimeHrs: number = 0;
  public PastTestList: any = [];
  public PastTestList_ForDuplicate: any = [];
  public isRequestedByDrMandatory: boolean = true;
  public LabTypeName: string = "op-lab";
  public ShowHidePrice:boolean = false;
  public totalAmount:number = 0;

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
    this.searchByItemCode = this.coreService.UseItemCodeItemSearch();

    //instead of Using in OnInit Component is initiated from inside  this function by calling InitiateComponent function
    this.GetDoctorsList();

    this.BillRequestDoubleEntryWarningTimeHrs =
      this.coreService.LoadIPBillRequestDoubleEntryWarningTimeHrs();
    let param = this.coreService.Parameters.find(
      (p) =>
        p.ParameterGroupName == "Common" &&
        p.ParameterName == "RequestedByDrSettings"
    ).ParameterValue;
    if (param) {
      let paramValue = JSON.parse(param);
      this.isRequestedByDrMandatory = paramValue.NursingWardRequest.IsMandatory;
    }

    if (this.coreService.labTypes.length == 1) {
      this.LabTypeName = this.coreService.labTypes[0].LabTypeName;
      console.log(this.LabTypeName);
    }
    this.GetParametersToShowHidePriceCol();
  }

  ngOnInit() {
    this.ItemsListFormatter = this.ItemsListFormatter.bind(this);
    //Asynchronous (incase if user )
    if (this.patientId && this.visitId) {
      this.billingBLService
        .GetDataOfInPatient(this.patientId, this.visitId)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status == "OK") {
            this.currPatVisitContext = res.Results;
          } else {
            this.msgBoxServ.showMessage(
              "failed",
              ["Problem! Cannot get the Current Visit Context ! "],
              res.ErrorMessage
            );
          }
        });

      this.SetLabTypeNameInLocalStorage();
    }

    this.ResetServiceDepartmentList();
    // this.PastTest(this.pastTests);
    window.setTimeout(function () {
      document.getElementById("items-box0").focus();
    }, 1000);

    this.InitiateComponent();
  }

  GetParametersToShowHidePriceCol(){
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
      this.ShowHidePrice = data ? data.ShowPrice : this.ShowHidePrice;
    }
  }

  PastTest($event) {
    this.PastTestList = $event;
  }

  //sud:11Nov'19--Don't show service department if there's no item in it..
  public ResetServiceDepartmentList() {
    if (this.coreService.Masters.ServiceDepartments && this.billItems) {
      this.serviceDeptList = [];
      this.coreService.Masters.ServiceDepartments.forEach((srv) => {
        if (
          this.billItems.find(
            (itm) => itm.ServiceDepartmentId == srv.ServiceDepartmentId
          )
        ) {
          this.serviceDeptList.push(srv);
        }
      });
      //exclude opd items..
      this.serviceDeptList = this.serviceDeptList.filter(
        (a) => a.IntegrationName != "OPD"
      );
    }
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
    let module = "nursing";
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
      txnItem.CounterId = this.counterId;

      txnItem.RequestingDeptId = this.currBillingContext
        ? this.currBillingContext.RequestingDeptId
        : null;

      txnItem.BillingType = this.billingType;
      txnItem.VisitType = this.visitType; //If we use this for OutPatient Then We must modify it dynamically

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
      txnItem.OrderStatus = ENUM_OrderStatus.Active;

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

      //anjana/7-oct-2020: EMR:2695
      let currItmMaster = this.billItems.find(
        (itm) =>
          itm.ServiceDepartmentId == txnItem.ServiceDepartmentId &&
          itm.ItemId == txnItem.ItemId
      );
      if (currItmMaster) {
        txnItem.IsTaxApplicable = currItmMaster.TaxApplicable;
      }
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
    //for inpatient visitid is compulsory, for other it's not.  (sud:12Nov'19--needs revision.)
    let isVisitIdValid =
      this.visitType.toLowerCase() != ENUM_VisitType.inpatient ||
      (this.visitType.toLowerCase() == ENUM_VisitType.inpatient &&
        this.visitId);

    if (this.patientId && isVisitIdValid) {
      if (
        this.CheckSelectionFromAutoComplete() &&
        this.billingTransaction.BillingTransactionItems.length
      ) {
        for (
          var i = 0;
          i < this.billingTransaction.BillingTransactionItems.length;
          i++
        ) {
          if (this.billingTransaction.BillingTransactionItems[i].Price < 0) {
            this.msgBoxServ.showMessage("error", [
              "The price of some items is less than zero ",
            ]);
            this.loading = false;
            isFormValid = false;
            break;
          }

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

          if (this.isRequestedByDrMandatory == false) {
            currTxnItm.UpdateValidator("off", "RequestedBy", "required");
          } else {
            currTxnItm.UpdateValidator("on", "RequestedBy", "required");
          }
        }

        for (
          var i = 0;
          i < this.billingTransaction.BillingTransactionItems.length;
          i++
        ) {
          let currTxnItm_1 = this.billingTransaction.BillingTransactionItems[i];
          currTxnItm_1.BillingTransactionItemValidator.controls[
            "Price"
          ].disable();
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
    this.billingTransaction.BillingTransactionItems.forEach((item) => {
      item.LabTypeName = this.LabTypeName;
    });

    this.billingBLService
      .PostDepartmentOrders(
        this.billingTransaction.BillingTransactionItems,
        "active",
        "provisional",
        false,
        this.currPatVisitContext
      )
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
          this.ResetAllRowData();
          this.loading = false;
          this.msgBoxServ.showMessage("success", ["Items Requested"]);
          //check if we can send back the response data so that page below don't have to do server call again.
          this.emitBillItemReq.emit({ action: "save", data: null });
        } else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
          this.loading = false;
        }
      });
      this.totalAmount = 0;
  }

  //----------end: post billing transaction-----------------------------------

  //start: get: master and patient data
  public LoadPatientBillingContext(patientId) {
    this.billingBLService
      .GetPatientBillingContext(patientId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.currBillingContext = res.Results;

          if (!this.billingType || this.billingType.trim() == "") {
            //this.billingService.BillingType = "inpatient";
            this.billingType = "inpatient";
          }
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

            this.billingTransaction.BillingTransactionItems[0].AssignedDoctorList =
              this.doctorsList;
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
            a.ItemName != null &&
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
          let extItemIndex =
            this.billingTransaction.BillingTransactionItems.findIndex(
              (a) =>
                a.ItemId == item.ItemId &&
                a.ServiceDepartmentId == item.ServiceDepartmentId
            );
          // if (extItem && index != extItemIndex) {
          //   this.msgBoxServ.showMessage("failed", [
          //     item.ItemName + " is already entered.",
          //   ]);
          //   this.changeDetectorRef.detectChanges();
          //   this.billingTransaction.BillingTransactionItems[
          //     index
          //   ].IsDuplicateItem = true;
          // } else
          //   this.billingTransaction.BillingTransactionItems[
          //     index
          //   ].IsDuplicateItem = false;
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
        this.selectedServDepts[index] =
          this.billingTransaction.BillingTransactionItems[
            index
          ].ServiceDepartmentName;
        this.billingTransaction.BillingTransactionItems[
          index
        ].IsValidSelDepartment = true;
        this.billingTransaction.BillingTransactionItems[
          index
        ].IsValidSelItemName = true;

        this.billingTransaction.BillingTransactionItems[
          index
        ].IsDoctorMandatory = item.IsDoctorMandatory; //sud:6Feb'19--need to verify once.

        this.FilterBillItems(index);
        this.CheckItemProviderValidation(index);

        this.ResetDoctorListOnItemChange(item, index);
      } else
        this.billingTransaction.BillingTransactionItems[
          index
        ].IsValidSelItemName = false;
      if (!item && !this.selectedServDepts[index]) {
        this.billingTransaction.BillingTransactionItems[index].ItemList =
          this.billItems;
      }
      this.CheckForDoubleEntry();
    } else {
      this.billingTransaction.BillingTransactionItems[index].IsDoubleEntry_Now =
        false;
      this.billingTransaction.BillingTransactionItems[
        index
      ].IsDoubleEntry_Past = false;
    }
    this.calculateTotalAmount();
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
      } else if (typeof this.selectedRequestedByDr[index] == "object") {
        doctor = this.selectedRequestedByDr[index];
      }

      if (doctor) {
        this.billingTransaction.BillingTransactionItems[index].RequestedBy =
          doctor.EmployeeId;
        this.billingTransaction.BillingTransactionItems[index].RequestedByName =
          doctor.FullName;
        this.billingTransaction.BillingTransactionItems[
          index
        ].IsValidSelRequestedByDr = true;
      } else {
        this.billingTransaction.BillingTransactionItems[
          index
        ].IsValidSelRequestedByDr = false;
      }
    } else {
      this.billingTransaction.BillingTransactionItems[
        index
      ].IsValidSelRequestedByDr = true;
    }
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
      this.billingTransaction.BillingTransactionItems[index].ItemList =
        this.billItems;
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
        let srvDeptId =
          this.billingTransaction.BillingTransactionItems[index]
            .ServiceDepartmentId;
        //initalAssign: FilterBillItems was called after assinging all the values(used in ngModelChange in SelectDepartment)
        // and was assigning ItemId=null.So avoiding assignment null value to ItemId during inital assign.
        if (
          this.billingTransaction.BillingTransactionItems[index].ItemId == null
        )
          this.ResetSelectedRow(index);
        this.billingTransaction.BillingTransactionItems[index].ItemList =
          this.billItems.filter((a) => a.ServiceDepartmentId == srvDeptId);

        let servDeptName = this.GetServiceDeptNameById(srvDeptId);
        //sud:6Feb'19--we have Use doctormandatory field of database item, not from code.
        //if (this.IsDoctorMandatory(servDeptName, null)) {
        if (
          this.billingTransaction.BillingTransactionItems[index] &&
          this.billingTransaction.BillingTransactionItems[index]
            .IsDoctorMandatory
        ) {
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
      this.billingTransaction.BillingTransactionItems[index].ItemList =
        billItems;
    }
  }

  //end: autocomplete assign functions  and item filter logic

  ResetAllRowData() {
    //this.showIpBillRequest = false;
    this.selectedItems = [];
    this.selectedAssignedToDr = [];
    this.selectedServDepts = [];
    //this.selectedRequestedByDr = [];
    this.visitList = [];
    this.billingTransaction = new BillingTransaction();
    this.AddNewBillTxnItemRow();
    this.AssignRequestedByDoctor(0);
  }

  //----start: add/delete rows-----
  ResetSelectedRow(index) {
    this.selectedItems[index] = null;
    this.selectedAssignedToDr[index] = null;
    this.billingTransaction.BillingTransactionItems[index] =
      this.NewBillingTransactionItem();
  }

  AddNewBillTxnItemRow(index = null) {
    //method to add the row
    let billItem = this.NewBillingTransactionItem();
    billItem.EnableControl("Price", false);
    this.billingTransaction.BillingTransactionItems.push(billItem);
    this.pastTests.push(billItem);
    if (index != null) {
      let new_index =
        this.billingTransaction.BillingTransactionItems.length - 1;
      this.selectedRequestedByDr[new_index] = this.selectedRequestedByDr[index];
      this.AssignRequestedByDoctor(new_index);
      window.setTimeout(function () {
        document.getElementById("items-box" + new_index).focus();
      }, 200);
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

    this.CheckForDoubleEntry();
    this.calculateTotalAmount();
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

  //CheckItemProviderValidation(index: number) {
  //  let srvDeptId = this.billingTransaction.BillingTransactionItems[index]
  //    .ServiceDepartmentId;
  //  let servDeptName = this.GetServiceDeptNameById(srvDeptId);
  //  //sud:6Feb'19--we have Use doctormandatory field of database item, not from code.
  //  if (
  //    this.billingTransaction.BillingTransactionItems[index] &&
  //    this.billingTransaction.BillingTransactionItems[index].IsDoctorMandatory
  //  ) {
  //    //if (this.IsDoctorMandatory(servDeptName, this.billingTransaction.BillingTransactionItems[index].ItemName)) {
  //    this.billingTransaction.BillingTransactionItems[index].UpdateValidator(
  //      "on",
  //      "ProviderId",
  //      "required"
  //    );
  //  } else {
  //    this.billingTransaction.BillingTransactionItems[index].UpdateValidator(
  //      "off",
  //      "ProviderId",
  //      null
  //    );
  //  }
  //}
  //end: mandatory doctor validations

  CheckItemProviderValidation(index: number) {
    this.billingTransaction.BillingTransactionItems[index].UpdateValidator(
      "off",
      "ProviderId",
      null
    );
  }

  //start: list formatters

  ItemsListFormatter(data: any): string {
    let html: string = "";
    if (this.searchByItemCode) {
      html =
        data["ServiceDepartmentShortName"] +
        "-" +
        data["ItemCode"] +
        "&nbsp;&nbsp;" +
        data["ItemName"] +
        "&nbsp;&nbsp;";
      html += "(<i>" + data["ServiceDepartmentName"] + "</i>)";
      //  "&nbsp;&nbsp;" +
      //  "RS." +
      //  data["Price"];
    } else {
      html =
        data["ServiceDepartmentShortName"] +
        "-" +
        data["BillItemPriceId"] +
        "&nbsp;&nbsp;" +
        data["ItemName"] +
        "&nbsp;&nbsp;";
      html += "(<i>" + data["ServiceDepartmentName"] + "</i>)";
      //"&nbsp;&nbsp;" +
      //"RS." +
      //data["Price"];
    }

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

  Cancel() {
    this.emitBillItemReq.emit({ action: "close", data: null });
  }

  OnPriceCategoryChange($event) {
    let billingPropertyName = $event.propertyName;
    let billingCategoryName = $event.categoryName;

    if (this.billItems != null && this.billItems.length > 0) {
      this.billItems.forEach((itm) => {
        itm.Price = itm[billingPropertyName] ? itm[billingPropertyName] : 0;
        itm.PriceCategory = billingCategoryName;
      });
    }

    if (
      this.billingTransaction.BillingTransactionItems &&
      this.billingTransaction.BillingTransactionItems.length > 0
    ) {
      this.billingTransaction.BillingTransactionItems.forEach((txnItm) => {
        let currBillItem = this.billItems.find(
          (billItem) =>
            billItem.ItemId == txnItm.ItemId &&
            billItem.ServiceDepartmentId == txnItm.ServiceDepartmentId
        );
        if (currBillItem) {
          txnItm.Price = currBillItem[billingPropertyName]
            ? currBillItem[billingPropertyName]
            : 0;
          txnItm.PriceCategory = billingCategoryName;
        }
      });
    }
  }

  ResetDoctorListOnItemChange(item, index) {
    if (item) {
      let docArray = null;
      let currItemPriceCFG = this.billItems.find(
        (a) =>
          a.ItemId == item.ItemId &&
          a.ServiceDepartmentId == item.ServiceDepartmentId
      );
      if (currItemPriceCFG) {
        let docJsonStr = currItemPriceCFG.DefaultDoctorList;
        if (docJsonStr) {
          docArray = JSON.parse(docJsonStr);
        }
      }
      if (docArray && docArray.length > 1) {
        this.billingTransaction.BillingTransactionItems[
          index
        ].AssignedDoctorList = [];

        docArray.forEach((docId) => {
          let currDoc = this.doctorsList.find((d) => d.EmployeeId == docId);
          if (currDoc) {
            this.selectedAssignedToDr[index] = null;
            this.billingTransaction.BillingTransactionItems[
              index
            ].AssignedDoctorList.push(currDoc);
          }
        });
      } else if (docArray && docArray.length == 1) {
        let currDoc = this.doctorsList.find((d) => d.EmployeeId == docArray[0]);
        if (currDoc) {
          this.selectedAssignedToDr[index] = currDoc.FullName;
          this.AssignSelectedDoctor(index);
        }
      } else {
        this.selectedAssignedToDr[index] = null;
        this.billingTransaction.BillingTransactionItems[
          index
        ].AssignedDoctorList = this.doctorsList;
      }
    }
  }

  assignDocterlist(row, i) {
    if (row.ItemId == 0) {
      this.billingTransaction.BillingTransactionItems[i].AssignedDoctorList =
        this.doctorsList;
    }
  }

  HasDoubleEntryInPast() {
    if (this.PastTestList && this.PastTestList.length > 0) {
      var currDate = moment().format("YYYY-MM-DD HH:mm:ss");
      if (
        this.BillRequestDoubleEntryWarningTimeHrs &&
        this.BillRequestDoubleEntryWarningTimeHrs != 0
      ) {
        this.PastTestList.forEach((a) => {
          //var diff = moment.duration(a.CreatedOn.diff(currDate));
          if (
            this.DateDifference(currDate, a.CreatedOn) <
            this.BillRequestDoubleEntryWarningTimeHrs
          ) {
            this.PastTestList_ForDuplicate.push(a);
          }
        });
      }
    }
  }

  CheckForDoubleEntry() {
    this.billingTransaction.BillingTransactionItems.forEach((itm) => {
      if (
        this.billingTransaction.BillingTransactionItems.filter(
          (a) =>
            a.ServiceDepartmentId == itm.ServiceDepartmentId &&
            a.ItemId == itm.ItemId
        ).length > 1
      ) {
        itm.IsDoubleEntry_Now = true;
        //this.msgBoxServ.showMessage('warning', ["This item is already entered"]);
      } else {
        itm.IsDoubleEntry_Now = false;
      }
      this.HasDoubleEntryInPast();
      if (
        this.PastTestList_ForDuplicate &&
        this.PastTestList_ForDuplicate.find(
          (a) =>
            a.ServiceDepartmentId == itm.ServiceDepartmentId &&
            a.ItemId == itm.ItemId
        )
      ) {
        itm.IsDoubleEntry_Past = true;
        //this.msgBoxServ.showMessage('warning', ["This item is already entered"]);
      } else {
        itm.IsDoubleEntry_Past = false;
      }
    });
  }

  public DateDifference(currDate, startDate): number {
    //const diffInMs = Date.parse(currDate) - Date.parse(startDate);
    //const diffInHours = diffInMs / 1000 / 60 / 60;

    //return diffInHours;

    var diffHrs = moment(currDate, "YYYY/MM/DD HH:mm:ss").diff(
      moment(startDate, "YYYY/MM/DD HH:mm:ss"),
      "hours"
    );
    return diffHrs;
  }

  public OnLabTypeChange() {
    this.billingTransaction.BillingTransactionItems.forEach((item) => {
      item.LabTypeName = this.LabTypeName;
    });
    this.FilterBillItems(0);

    if (this.LabTypeName) {
      if (localStorage.getItem("NursingSelectedLabTypeName")) {
        localStorage.removeItem("NursingSelectedLabTypeName");
      }
      localStorage.setItem("NursingSelectedLabTypeName", this.LabTypeName);
      let ptr = this.coreService.labTypes.find(
        (p) => p.DisplayName == this.LabTypeName
      );
    } else {
      this.msgBoxServ.showMessage("error", ["Please select Lab Type Name."]);
    }
  }

  SetLabTypeNameInLocalStorage() {
    let labtypeInStorage = localStorage.getItem("NursingSelectedLabTypeName");
    if (this.coreService.labTypes.length == 1){
      localStorage.setItem("NursingSelectedLabTypeName", this.coreService.labTypes[0].LabTypeName);
      return;
    }else if(this.coreService.labTypes.length == 0){
      localStorage.setItem("NursingSelectedLabTypeName", 'op-lab');
      return;
    }
      if (labtypeInStorage) {
          let selectedLabType = this.coreService.labTypes.find(
            (val) => val.LabTypeName == labtypeInStorage
          );
          if (selectedLabType) {
            this.LabTypeName = labtypeInStorage;
          } else {
            localStorage.removeItem("NursingSelectedLabTypeName");
            let defaultLabType = this.coreService.labTypes.find(
              (type) => type.IsDefault == true
            );
            if (!defaultLabType) {
              this.LabTypeName = this.coreService.labTypes[0].LabTypeName;
            } else {
              this.LabTypeName = defaultLabType.LabTypeName;
            }
            localStorage.setItem(
              "NursingSelectedLabTypeName",
              this.LabTypeName
            );
          }
      } else {
        let defaultLabType = this.coreService.labTypes.find(
          (type) => type.IsDefault == true
        );
        if (!defaultLabType) {
          this.LabTypeName = this.coreService.labTypes[0].LabTypeName;
        } else {
          this.LabTypeName = defaultLabType.LabTypeName;
        }
      }
  }

  calculateTotalAmount(){
   this.totalAmount = this.billingTransaction.BillingTransactionItems.reduce(function (acc, obj) { return acc + ((obj.Price * obj.Quantity)); }, 0); 

  }
}
