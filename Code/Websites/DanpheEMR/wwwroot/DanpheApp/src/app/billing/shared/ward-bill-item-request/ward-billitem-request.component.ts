import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";

import * as _ from "lodash";
import * as moment from 'moment/moment';
import { CurrentVisitContextVM } from "../../../appointments/shared/current-visit-context.model";
import { BillingTransactionItem } from "../../../billing/shared/billing-transaction-item.model";
import { BillingTransaction } from "../../../billing/shared/billing-transaction.model";
import { BillingBLService } from "../../../billing/shared/billing.bl.service";
import { PatientBillingContextVM } from "../../../billing/shared/patient-billing-context-vm";
import { CoreService } from "../../../core/shared/core.service";
import { LabsBLService } from "../../../labs/shared/labs.bl.service";
import { SecurityService } from "../../../security/shared/security.service";
import { ServiceDepartmentVM } from "../../../shared/common-masters.model";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_BillingStatus, ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status, ENUM_OrderStatus, ENUM_VisitType } from "../../../shared/shared-enums";


@Component({
  selector: "ward-billitem-request",
  templateUrl: "./ward-billing-Request.html",
})
export class WardBillItemRequestComponent {
  //master data
  @Input("billItems") BillItems: Array<any> = [];
  @Input("patientId") PatientId: number;
  @Input("visitId") VisitId: number;
  @Input("counterId") CounterId: number;
  @Input("visitType") VisitType: string;
  @Input("billingType") BillingType: string;
  @Input("past-tests") PastTests: Array<any> = [];
  @Input("department") Department: string = null;
  @Input("showPriceCategory") ShowPriceCategory: boolean = true;
  @Input("scheme-priceCategory") SchemePriceCategory = { SchemeId: null, PriceCategoryId: null };
  @Input("is-provisional-discharge") IsProvisionalDischarge: boolean = false;
  @Output("emit-billItemReq") EmitBillItemReq = new EventEmitter<Object>();

  public ShowIpBillRequest: boolean = true;
  public ServiceDepartmentList: Array<ServiceDepartmentVM>;
  public DoctorsList: Array<any> = [];
  public BillingTransaction: BillingTransaction;
  //seleted items
  public SelectedItems = [];
  public SelectedServiceDepartment: Array<any> = [];
  public SelectedAssignedToDr: Array<any> = [];
  public SelectedRequestedByDr: Array<any> = [];
  public VisitList: Array<any>;
  public loading = false;
  public TaxDetail = { taxPercent: 0, taxId: 0 };
  public CurrentBillingContext: PatientBillingContextVM = null;
  public CurrentPatientVisitContext: CurrentVisitContextVM = null;
  public IsRequestedByDrMandatory: boolean = true;
  public LabTypeName: string = "op-lab";
  public BillRequestDoubleEntryWarningTimeHrs: number = 0;
  public PastTestList: any = [];
  public PastTestList_ForDuplicate: any = [];

  constructor(
    private _labBLService: LabsBLService,
    private _messageBoxService: MessageboxService,
    private _securityService: SecurityService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _billingBLService: BillingBLService,
    public coreService: CoreService
  ) {
    this.BillingTransaction = new BillingTransaction();
    this.ServiceDepartmentList = this.coreService.Masters.ServiceDepartments;
    this.ServiceDepartmentList = this.ServiceDepartmentList.filter((a) => a.ServiceDepartmentName !== "OPD");
    //instead of Using in OnInit Component is initiated from inside  this function by calling InitiateComponent function
    this.GetDoctorsList();
    this.BillRequestDoubleEntryWarningTimeHrs =
      this.coreService.LoadIPBillRequestDoubleEntryWarningTimeHrs();
    let param = this.coreService.Parameters.find((p) => p.ParameterGroupName === "Common" && p.ParameterName === "RequestedByDrSettings").ParameterValue;
    if (param) {
      let paramValue = JSON.parse(param);
      this.IsRequestedByDrMandatory = paramValue.LabWardRequest.IsMandatory;
    }
    if (this.coreService.labTypes.length === 1) {
      this.LabTypeName = this.coreService.labTypes[0].LabTypeName;
    }
  }

  ngOnInit() {
    //Asynchronous (incase if user )
    if (this.PatientId && this.VisitId) {
      this._billingBLService
        .GetDataOfInPatient(this.PatientId, this.VisitId)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            this.CurrentPatientVisitContext = res.Results;
          } else {
            this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Problem! Cannot get the Current Visit Context ! "], res.ErrorMessage);
          }
        });
    }
    this.InitiateComponent();
    this.ResetServiceDepartmentList();
    this.PastTest(this.PastTests);
    this.SetLabTypeNameInLocalStorage();
  }

  //sud:11Nov'19--Don't show service department if there's no item in it..
  ResetServiceDepartmentList(): void {
    if (this.coreService.Masters.ServiceDepartments && this.BillItems) {
      this.ServiceDepartmentList = [];
      this.coreService.Masters.ServiceDepartments.forEach((srv) => {
        if (this.BillItems.find((itm) => itm.ServiceDepartmentId === srv.ServiceDepartmentId)) {
          this.ServiceDepartmentList.push(srv);
        }
      });
      //exclude opd items..
      this.ServiceDepartmentList = this.ServiceDepartmentList.filter((a) => a.IntegrationName !== "OPD");
    }
  }

  InitiateComponent(): void {
    this.SelectedItems = [];
    this.SelectedAssignedToDr = [];
    this.SelectedServiceDepartment = [];
    this.SelectedRequestedByDr = [];
    this.VisitList = [];
    this.AddNewBillTxnItemRow();
    this.LoadPatientBillingContext(this.PatientId);
    this.GetPatientVisitList(this.PatientId);
  }

  SubmitBillingTransaction(): void {
    //this.loading is set to true from the HTML. to handle double-Click.
    //check if there's other better alternative. till then let it be.. --sud:23Jan'18
    if (this.loading) {
      //set loading=true so that the butotn will be disabled to avoid Double-Click
      ///Its COMPULSORY to disable : DON'T CHANGE THIS -- sud: 21Jan2018
      this.loading = true;
      this.SetBillingTxnDetails();
      this.AddToPastTest();
      if (this.CheckValidations()) {
        // this.PostToDepartmentRequisition();
        this.PostProvisionalDepartmentRequisition();
      } else {
        this.loading = false;
      }
    }
  }

  SetBillingTxnDetails(): void {
    let currentVisit = this.VisitList.find((visit) => visit.PatientVisitId === this.VisitId);
    this.BillingTransaction.SchemeId = this.SchemePriceCategory.SchemeId;
    this.BillingTransaction.PriceCategoryId = this.SchemePriceCategory.PriceCategoryId;
    this.BillingTransaction.PatientId = this.PatientId;
    this.BillingTransaction.PatientVisitId = this.VisitId;
    this.BillingTransaction.SubTotal = 0;
    this.BillingTransaction.TotalAmount = 0;
    this.BillingTransaction.DiscountPercent = 0;
    this.BillingTransaction.DiscountAmount = 0;
    this.BillingTransaction.PaidAmount = 0;
    this.BillingTransaction.BillingTransactionItems.forEach((txnItem) => {
      txnItem.PatientVisitId = this.VisitId;
      //txnItem.RequestedBy = currentVisit ? currentVisit.ProviderId : null;
      //txnItem.BillingTransactionItemValidator.controls['RequestedBy'].setValue(txnItem.RequestedBy);
      txnItem.PatientId = this.PatientId;
      txnItem.RequestingDeptId = this.CurrentBillingContext ? this.CurrentBillingContext.RequestingDeptId : null;
      txnItem.BillingType = this.BillingType;
      txnItem.VisitType = this.VisitType; //If we use this for OutPatient Then We must modify it dynamically
      txnItem.BillStatus = ENUM_BillingStatus.provisional; // "provisional";
      txnItem.DiscountSchemeId = this.SchemePriceCategory.SchemeId;
      txnItem.PriceCategoryId = this.SchemePriceCategory.PriceCategoryId;
      // txnItem.CounterId = this.securityService.getLoggedInCounter().CounterId;
      txnItem.CounterId = this.CounterId;
      txnItem.IsProvisionalDischarge = this.IsProvisionalDischarge;
      txnItem.CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");
      txnItem.CreatedBy = this._securityService.GetLoggedInUser().EmployeeId;
      txnItem.CounterDay = moment().format("YYYY-MM-DD");
      txnItem.SubTotal = txnItem.Price * txnItem.Quantity;
      txnItem.DiscountAmount = 0;
      txnItem.DiscountPercent = 0;
      txnItem.DiscountPercentAgg = 0;
      txnItem.TotalAmount = txnItem.SubTotal - txnItem.DiscountAmount;
      txnItem.TaxPercent = 0;
      txnItem.OrderStatus = ENUM_OrderStatus.Active;
      let taxInfo1 = this.coreService.Parameters.find((a) => a.ParameterName === "TaxInfo");
      if (taxInfo1) {
        let taxInfoStr = taxInfo1.ParameterValue;
        let taxInfo = JSON.parse(taxInfoStr);
        txnItem.TaxPercent = taxInfo.TaxPercent;
        this.TaxDetail.taxId = taxInfo.TaxId;
        //this.taxName = taxInfo.TaxName;
        //this.taxLabel = taxInfo.TaxLabel;
        //this.taxPercent = taxInfo.TaxPercent;
      }
      this.BillingTransaction.TaxId = this.TaxDetail.taxId;
      //anjana/7-oct-2020: EMR:2695
      // let currItmMaster = this.billItems.find((itm) => itm.ServiceDepartmentId === txnItem.ServiceDepartmentId && itm.ItemId === txnItem.ItemId);
      let currItmMaster = this.BillItems.find((itm) => itm.ServiceDepartmentId === txnItem.ServiceDepartmentId && itm.ServiceItemId === txnItem.ServiceItemId);
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

  CheckValidations(): boolean {
    let isFormValid = true;
    //for inpatient visitid is compulsory, for other it's not.  (sud:12Nov'19--needs revision.)
    let isVisitIdValid = this.VisitType.toLowerCase() !== ENUM_VisitType.inpatient || (this.VisitType.toLowerCase() === ENUM_VisitType.inpatient && this.VisitId);
    if (this.PatientId && isVisitIdValid) {
      if (this.CheckSelectionFromAutoComplete() && this.BillingTransaction.BillingTransactionItems.length) {
        for (let i = 0; i < this.BillingTransaction.BillingTransactionItems.length; i++) {
          if (this.BillingTransaction.BillingTransactionItems[i].Price < 0) {
            this._messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["The price of some items is less than zero ",]);
            this.loading = false;
            isFormValid = false;
            break;
          }
          let currTxnItm = this.BillingTransaction.BillingTransactionItems[i];
          for (let validationControls in currTxnItm.BillingTransactionItemValidator
            .controls) {
            currTxnItm.BillingTransactionItemValidator.controls[validationControls].markAsDirty();
            currTxnItm.BillingTransactionItemValidator.controls[validationControls].updateValueAndValidity();
          }
          if (this.IsRequestedByDrMandatory === false) {
            currTxnItm.UpdateValidator("off", "PrescriberId", "required");
          } else {
            currTxnItm.UpdateValidator("on", "PrescriberId", "required");
          }
        }
        for (let i = 0; i < this.BillingTransaction.BillingTransactionItems.length; i++) {
          let currTxnItm_1 = this.BillingTransaction.BillingTransactionItems[i];
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
      this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Invalid Patient/Visit Id."]);
      isFormValid = false;
    }
    return isFormValid;
  }

  CheckSelectionFromAutoComplete(): boolean {
    if (this.BillingTransaction.BillingTransactionItems.length) {
      for (let itm of this.BillingTransaction.BillingTransactionItems) {
        if (!itm.IsValidSelDepartment) {
          this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Select item from list."]);
          this.loading = false;
          return false;
        }
      }
      return true;
    }
  }


  PostProvisionalDepartmentRequisition(): void {
    const billingTransaction = _.cloneDeep(this.BillingTransaction);
    const billingTransactionItems = _.cloneDeep(this.BillingTransaction.BillingTransactionItems);
    this._billingBLService.ProceedToBillingTransaction(billingTransaction, billingTransactionItems, "active", "provisional", false, this.CurrentPatientVisitContext).subscribe(res => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results) {
        this.ResetAllRowData();
        this.loading = false;
        //check if we can send back the response data so that page below don't have to do server call again.
        this.EmitBillItemReq.emit({ action: "save", data: null });
      }
      else {
        this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Unable to complete transaction."]);
        console.log(res.ErrorMessage)
        this.loading = false;
      }
    });
  }

  //posts to Departments Requisition Table
  PostToDepartmentRequisition(): void {
    //orderstatus="active" and billingStatus="paid" when sent from billingpage.
    // for(var i=0; i<this.billingTransaction.BillingTransactionItems.length; i++){
    //   this.pastTests.push(this.billingTransaction.BillingTransactionItems[i]);
    // }
    //this.pastTests.push(this.billingTransaction.BillingTransactionItems);
    this.BillingTransaction.BillingTransactionItems.forEach((item) => {
      item.LabTypeName = this.LabTypeName;
    });
    this._billingBLService
      .PostDepartmentOrders(this.BillingTransaction.BillingTransactionItems, "active", "provisional", false, this.CurrentPatientVisitContext)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.PostToBillingTransaction();
        } else {
          this.loading = false;
          this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Unable to do lab request.Please try again later",]);
          console.log(res.ErrorMessage);
        }
      });
  }

  PostToBillingTransaction(): void {
    this._billingBLService
      .PostBillingTransactionItems(this.BillingTransaction.BillingTransactionItems)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.ResetAllRowData();
          this.loading = false;
          //check if we can send back the response data so that page below don't have to do server call again.
          this.EmitBillItemReq.emit({ action: "save", data: null });
        } else {
          this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [res.ErrorMessage]);
          this.loading = false;
        }
      });
  }

  //----------end: post billing transaction-----------------------------------

  //start: get: master and patient data
  LoadPatientBillingContext(patientId): void {
    this._billingBLService
      .GetPatientBillingContext(patientId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.CurrentBillingContext = res.Results;

          if (!this.BillingType || this.BillingType.trim() === "") {
            //this.billingService.BillingType = "inpatient";
            this.BillingType = "inpatient";
          }
        }
      });
  }

  GetPatientVisitList(patientId: number): void {
    this._labBLService.GetPatientVisitsProviderWise(patientId).subscribe(
      (res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          if (res.Results.length) {
            this.VisitList = res.Results;
            //assign doctor of latest visit as requestedby by default to the first billing item.
            let doc = this.DoctorsList.find((a) => a.EmployeeId === this.VisitList[0].PerformerId);
            if (doc) {
              this.SelectedRequestedByDr[0] = doc.FullName;
              this.AssignRequestedByDoctor(0);
            }
          } else {
            console.log(res.ErrorMessage);
          }
        }
      },
      (err) => {
        this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["unable to get PatientVisit list.. check log for more details.",]);
        console.log(err.ErrorMessage);
      }
    );
  }

  GetDoctorsList(): void {
    this._billingBLService.GetDoctorsList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          if (res.Results.length) {
            this.DoctorsList = res.Results;
            let Obj = new Object();
            Obj["EmployeeId"] = null; //change by Yub -- 23rd Aug '18
            Obj["FullName"] = "SELF";
            this.DoctorsList.push(Obj);
          } else {
            console.log(res.ErrorMessage);
          }
        }
      },
        (err) => {
          this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Unable to get Doctors list. Check log for more details."]);
          console.log(err.ErrorMessage);
        }
      );
  }

  GetServiceDeptNameById(serviceDepartmentId: number): string {
    if (this.ServiceDepartmentList) {
      let serviceDepartment = this.ServiceDepartmentList.find((a) => a.ServiceDepartmentId === serviceDepartmentId);
      return serviceDepartment ? serviceDepartment.ServiceDepartmentName : null;
    }
  }
  //end: get: master and patient data

  //start: autocomplete assign functions and item filter logic
  AssignSelectedItem(index): void {
    let item = null;
    // check if user has given proper input string for item name
    //or has selected object properly from the dropdown list.
    if (this.SelectedItems[index]) {
      if (typeof this.SelectedItems[index] === "string" && this.BillingTransaction.BillingTransactionItems[index].ItemList.length) {
        item = this.BillingTransaction.BillingTransactionItems[index].ItemList.find((a) => a.ItemName.toLowerCase() === this.SelectedItems[index].toLowerCase());
      } else if (typeof this.SelectedItems[index] === "object")
        item = this.SelectedItems[index];
      if (item) {
        if (this.BillingType.toLowerCase() !== "inpatient") {
          let extItem = this.BillingTransaction.BillingTransactionItems.find((a) => a.ServiceItemId === item.ServiceItemId && a.ServiceDepartmentId === item.ServiceDepartmentId);
          let extItemIndex = this.BillingTransaction.BillingTransactionItems.findIndex((a) => a.ServiceItemId === item.ServiceItemId && a.ServiceDepartmentId === item.ServiceDepartmentId);
          if (extItem && index != extItemIndex) {
            this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [item.ItemName + " is already entered.",]);
            this._changeDetectorRef.detectChanges();
            this.BillingTransaction.BillingTransactionItems[index].IsDuplicateItem = true;
          } else
            this.BillingTransaction.BillingTransactionItems[index].IsDuplicateItem = false;
        }
        this.BillingTransaction.BillingTransactionItems[index].IntegrationItemId = item.IntegrationItemId;
        this.BillingTransaction.BillingTransactionItems[index].ItemId = item.ItemId;
        this.BillingTransaction.BillingTransactionItems[index].ServiceItemId = item.ServiceItemId;
        this.BillingTransaction.BillingTransactionItems[index].ItemName = item.ItemName;
        this.BillingTransaction.BillingTransactionItems[index].ProcedureCode = item.ProcedureCode;
        this.BillingTransaction.BillingTransactionItems[index].Price = item.Price;
        //add also the servicedepartmentname property of the item; needed since most of the filtering happens on this value
        this.BillingTransaction.BillingTransactionItems[index].ServiceDepartmentName = this.GetServiceDeptNameById(item.ServiceDepartmentId);
        this.BillingTransaction.BillingTransactionItems[index].ServiceDepartmentId = item.ServiceDepartmentId;
        this.SelectedServiceDepartment[index] = this.BillingTransaction.BillingTransactionItems[index].ServiceDepartmentName;
        this.BillingTransaction.BillingTransactionItems[index].IsValidSelDepartment = true;
        this.BillingTransaction.BillingTransactionItems[index].IsValidSelItemName = true;
        this.BillingTransaction.BillingTransactionItems[index].IsDoctorMandatory = item.IsDoctorMandatory; //sud:6Feb'19--need to verify once.
        this.FilterBillItems(index);
        this.CheckItemProviderValidation(index);
        this.ResetDoctorListOnItemChange(item, index);
      } else
        this.BillingTransaction.BillingTransactionItems[index].IsValidSelItemName = false;
      if (!item && !this.SelectedServiceDepartment[index]) {
        this.BillingTransaction.BillingTransactionItems[index].ItemList = this.BillItems;
      }
      this.CheckForDoubleEntry();
    } else {
      this.BillingTransaction.BillingTransactionItems[index].IsDoubleEntry_Now = false;
      this.BillingTransaction.BillingTransactionItems[index].IsDoubleEntry_Past = false;
    }
  }

  AssignSelectedDoctor(index): void {
    let doctor = null;
    // check if user has given proper input string for item name
    //or has selected object properly from the dropdown list.
    if (this.SelectedAssignedToDr[index]) {
      if (typeof this.SelectedAssignedToDr[index] === "string" && this.DoctorsList.length) {
        doctor = this.DoctorsList.find((a) => a.FullName.toLowerCase() === this.SelectedAssignedToDr[index].toLowerCase());
      } else if (typeof this.SelectedAssignedToDr[index] === "object")
        doctor = this.SelectedAssignedToDr[index];
      if (doctor) {
        this.BillingTransaction.BillingTransactionItems[index].PerformerId = doctor.EmployeeId;
        this.BillingTransaction.BillingTransactionItems[index].PerformerName = doctor.FullName;
        this.BillingTransaction.BillingTransactionItems[index].IsvalidSelPerformerDr = true;
      } else
        this.BillingTransaction.BillingTransactionItems[index].IsvalidSelPerformerDr = false;
    } else
      this.BillingTransaction.BillingTransactionItems[index].IsvalidSelPerformerDr = true;
  }

  AssignRequestedByDoctor(index): void {
    let doctor = null;
    // check if user has given proper input string for item name
    //or has selected object properly from the dropdown list.
    if (this.SelectedRequestedByDr[index]) {
      if (typeof this.SelectedRequestedByDr[index] === "string" && this.DoctorsList.length) {
        doctor = this.DoctorsList.find((a) => a.FullName.toLowerCase() === this.SelectedRequestedByDr[index].toLowerCase());
      } else if (typeof this.SelectedRequestedByDr[index] === "object") {
        doctor = this.SelectedRequestedByDr[index];
      }
      if (doctor) {
        this.BillingTransaction.BillingTransactionItems[index].PrescriberId = doctor.EmployeeId;
        this.BillingTransaction.BillingTransactionItems[index].PrescriberName = doctor.FullName;
        this.BillingTransaction.BillingTransactionItems[index].IsValidSelPrescriberDr = true;
      } else {
        this.BillingTransaction.BillingTransactionItems[index].IsValidSelPrescriberDr = false;
      }
    } else {
      this.BillingTransaction.BillingTransactionItems[index].IsValidSelPrescriberDr = true;
    }
  }

  //assigns service department id and filters item list
  ServiceDeptOnChange(index): void {
    let srvDeptObj = null;
    // check if user has given proper input string for department name
    //or has selected object properly from the dropdown list.
    if (typeof this.SelectedServiceDepartment[index] === "string") {
      if (this.ServiceDepartmentList.length && this.SelectedServiceDepartment[index])
        srvDeptObj = this.ServiceDepartmentList.find((a) => a.ServiceDepartmentName.toLowerCase() === this.SelectedServiceDepartment[index].toLowerCase());
    } else if (typeof this.SelectedServiceDepartment[index] === "object") {
      srvDeptObj = this.SelectedServiceDepartment[index];
    }
    //if selection of department from string or selecting object from the list is true
    //then assign proper department name
    if (srvDeptObj) {
      if (srvDeptObj.ServiceDepartmentId != this.BillingTransaction.BillingTransactionItems[index].ServiceDepartmentId) {
        this.ResetSelectedRow(index);
        this.BillingTransaction.BillingTransactionItems[index].ServiceDepartmentId = srvDeptObj.ServiceDepartmentId;
      }
      this.FilterBillItems(index);
      this.BillingTransaction.BillingTransactionItems[index].IsValidSelDepartment = true;
    }
    //else raise an invalid flag
    else {
      this.BillingTransaction.BillingTransactionItems[index].ItemList = this.BillItems;
      this.BillingTransaction.BillingTransactionItems[index].IsValidSelDepartment = false;
    }
  }

  FilterBillItems(index): void {
    //ramavtar:13may18: at start if no default service department is set .. we need to skip the filtering of item list.
    if (this.BillingTransaction.BillingTransactionItems[index].ServiceDepartmentId) {
      if (this.BillingTransaction.BillingTransactionItems.length && this.BillItems.length) {
        let srvDeptId = this.BillingTransaction.BillingTransactionItems[index].ServiceDepartmentId;
        //initialAssign: FilterBillItems was called after assigning all the values(used in ngModelChange in SelectDepartment)
        // and was assigning ItemId=null.So avoiding assignment null value to ItemId during initial assign.
        if (this.BillingTransaction.BillingTransactionItems[index].ServiceItemId === null)
          this.ResetSelectedRow(index);
        this.BillingTransaction.BillingTransactionItems[index].ItemList = this.BillItems.filter((a) => a.ServiceDepartmentId === srvDeptId);
        let servDeptName = this.GetServiceDeptNameById(srvDeptId);
        //sud:6Feb'19--we have Use doctormandatory field of database item, not from code.
        //if (this.IsDoctorMandatory(servDeptName, null)) {
        if (this.BillingTransaction.BillingTransactionItems[index] && this.BillingTransaction.BillingTransactionItems[index].IsDoctorMandatory) {
          this.BillingTransaction.BillingTransactionItems[index].UpdateValidator("on", "PerformerId", "required");
        } else {
          this.BillingTransaction.BillingTransactionItems[index].UpdateValidator("off", "PerformerId", null);
        }
      }
    } else {
      let billItems = this.BillItems.filter((a) => a.ServiceDepartmentName !== "OPD");
      this.BillingTransaction.BillingTransactionItems[index].ItemList = billItems;
    }
  }

  //end: autocomplete assign functions  and item filter logic

  ResetAllRowData(): void {
    //this.showIpBillRequest = false;
    this.SelectedItems = [];
    this.SelectedAssignedToDr = [];
    this.SelectedServiceDepartment = [];
    this.SelectedRequestedByDr = [];
    this.VisitList = [];
    this.BillingTransaction = new BillingTransaction();
    this.AddNewBillTxnItemRow();
  }

  //----start: add/delete rows-----
  ResetSelectedRow(index): void {
    this.SelectedItems[index] = null;
    this.SelectedAssignedToDr[index] = null;
    this.BillingTransaction.BillingTransactionItems[index] = this.NewBillingTransactionItem();
  }

  AddNewBillTxnItemRow(index = null): void {
    //method to add the row
    let billItem = this.NewBillingTransactionItem();
    billItem.EnableControl("Price", false);
    this.BillingTransaction.BillingTransactionItems.push(billItem);
    if (index != null) {
      let new_index = this.BillingTransaction.BillingTransactionItems.length - 1;
      this.SelectedRequestedByDr[new_index] = this.SelectedRequestedByDr[index];
      ///this.AssignRequestedByDoctor[new_index];//sud:1May'20-- This is not an array but a function.. corrected below.
      this.AssignRequestedByDoctor(new_index);
      window.setTimeout(function () {
        document.getElementById("items-box" + new_index).focus();
      }, 0);
    }
  }

  NewBillingTransactionItem(index = null): BillingTransactionItem {
    let billItem = new BillingTransactionItem();
    billItem.Quantity = 1;
    billItem.ItemList = this.BillItems;
    return billItem;
  }

  DeleteRow(index: number): void {
    this.BillingTransaction.BillingTransactionItems.splice(index, 1);
    this.BillingTransaction.BillingTransactionItems.slice();
    this.SelectedItems.splice(index, 1);
    this.SelectedItems.slice();
    if (index == 0 && this.BillingTransaction.BillingTransactionItems.length == 0) {
      this.AddNewBillTxnItemRow();
      this._changeDetectorRef.detectChanges();
    }
    this.CheckForDoubleEntry();
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
      let curMap = dptItmMap.find((s) => s.ServDeptName === serviceDeptName);
      if (curMap) {
        //check if serviceDeptName is in mandatory map or non-mandatory map.
        if (curMap.IsMandatory) {
          isDocMandatory = true; //default true for Mandatory srv-depts
          //false when provided item is excluded from mandatory service department
          if (curMap.ExcludedItems.find((itm) => itm === itemName)) {
            isDocMandatory = false;
          }
        } else if (curMap.IsMandatory == false) {
          isDocMandatory = false; //default false for NON-Mandatory srv-depts
          //true when provided item is excluded from non-mandatory service department
          if (curMap.ExcludedItems.find((itm) => itm === itemName)) {
            isDocMandatory = true;
          }
        }
      } else {
        isDocMandatory = false;
      }
    }
    return isDocMandatory;
  }

  CheckItemProviderValidation(index: number): void {
    let srvDeptId = this.BillingTransaction.BillingTransactionItems[index].ServiceDepartmentId;
    let servDeptName = this.GetServiceDeptNameById(srvDeptId);
    //sud:6Feb'19--we have Use doctormandatory field of database item, not from code.
    if (this.BillingTransaction.BillingTransactionItems[index] && this.BillingTransaction.BillingTransactionItems[index].IsDoctorMandatory) {
      //if (this.IsDoctorMandatory(servDeptName, this.billingTransaction.BillingTransactionItems[index].ItemName)) {
      this.BillingTransaction.BillingTransactionItems[index].UpdateValidator("on", "PerformerId", "required");
    } else {
      this.BillingTransaction.BillingTransactionItems[index].UpdateValidator("off", "PerformerId", null);
    }
  }
  //end: mandatory doctor validations

  //start: list formatters

  ItemsListFormatter(data: any): string {
    let html: string = "";
    html = "<font color='blue'; size=03 >" + data["ItemCode"] + "&nbsp;&nbsp;" + ":" + "&nbsp;" + data["ItemName"].toUpperCase() + "</font>" + "&nbsp;&nbsp;";
    html += "(<i>" + data["ServiceDepartmentName"] + "</i>)" + "&nbsp;&nbsp;" + data["Price"] + "</b>";
    return html;
  }

  DoctorListFormatter(data: any): string {
    return data["FullName"];
  }

  ServiceDeptListFormatter(data: any): string {
    return data["ServiceDepartmentName"];
  }

  PatientListFormatter(data: any): string {
    let html = data["ShortName"] + " [ " + data["PatientCode"] + " ]";
    return html;
  }
  //start: list formatters

  Cancel(): void {
    this.EmitBillItemReq.emit({ action: "close", data: null });
  }

  // OnPriceCategoryChange($event) {
  //   let billingPropertyName = $event.propertyName;
  //   let billingCategoryName = $event.categoryName;

  //   if (this.billItems != null && this.billItems.length > 0) {
  //     this.billItems.forEach((itm) => {
  //       itm.Price = itm[billingPropertyName] ? itm[billingPropertyName] : 0;
  //       itm.PriceCategory = billingCategoryName;
  //     });
  //   }

  //   if (
  //     this.billingTransaction.BillingTransactionItems &&
  //     this.billingTransaction.BillingTransactionItems.length > 0
  //   ) {
  //     this.billingTransaction.BillingTransactionItems.forEach((txnItm) => {
  //       let currBillItem = this.billItems.find(
  //         (billItem) =>
  //           billItem.ItemId == txnItm.ItemId &&
  //           billItem.ServiceDepartmentId == txnItm.ServiceDepartmentId
  //       );
  //       if (currBillItem) {
  //         txnItm.Price = currBillItem[billingPropertyName]
  //           ? currBillItem[billingPropertyName]
  //           : 0;
  //         txnItm.PriceCategory = billingCategoryName;
  //       }
  //     });
  //   }
  // }

  ResetDoctorListOnItemChange(item, index): void {
    if (item) {
      let docArray = null;
      let currItemPriceCFG = this.BillItems.find((a) => a.ServiceItemId === item.ServiceItemId && a.ServiceDepartmentId === item.ServiceDepartmentId);
      if (currItemPriceCFG) {
        let docJsonStr = currItemPriceCFG.DefaultDoctorList;
        if (docJsonStr) {
          docArray = JSON.parse(docJsonStr);
        }
      }
      if (docArray && docArray.length > 1) {
        this.BillingTransaction.BillingTransactionItems[index].AssignedDoctorList = [];

        docArray.forEach((docId) => {
          let currDoc = this.DoctorsList.find((d) => d.EmployeeId === docId);
          if (currDoc) {
            this.SelectedAssignedToDr[index] = null;
            this.BillingTransaction.BillingTransactionItems[index].AssignedDoctorList.push(currDoc);
          }
        });
      } else if (docArray && docArray.length === 1) {
        let currDoc = this.DoctorsList.find((d) => d.EmployeeId === docArray[0]);
        if (currDoc) {
          this.SelectedAssignedToDr[index] = currDoc.FullName;
          this.AssignSelectedDoctor(index);
        }
      } else {
        this.SelectedAssignedToDr[index] = null;
        this.BillingTransaction.BillingTransactionItems[index].AssignedDoctorList = this.DoctorsList;
      }
    }
  }

  AssignDoctorList(row, i): void {
    if (row.ItemId === 0) {
      this.BillingTransaction.BillingTransactionItems[i].AssignedDoctorList = this.DoctorsList;
    }
  }

  //check double entry of items
  PastTest($event): void {
    this.PastTestList = $event;
  }

  HasDoubleEntryInPast(): void {
    if (this.PastTestList && this.PastTestList.length > 0) {
      var currDate = moment().format("YYYY-MM-DD HH:mm:ss");
      if (this.BillRequestDoubleEntryWarningTimeHrs && this.BillRequestDoubleEntryWarningTimeHrs !== 0) {
        this.PastTestList.forEach((a) => {
          //var diff = moment.duration(a.CreatedOn.diff(currDate));
          if (this.DateDifference(currDate, a.CreatedOn) < this.BillRequestDoubleEntryWarningTimeHrs) {
            this.PastTestList_ForDuplicate.push(a);
          }
        });
      }
    }
  }

  CheckForDoubleEntry(): void {
    this.BillingTransaction.BillingTransactionItems.forEach((itm) => {
      if (
        this.BillingTransaction.BillingTransactionItems.filter((a) => a.ServiceDepartmentId === itm.ServiceDepartmentId && a.ServiceItemId === itm.ServiceItemId).length > 1
      ) {
        itm.IsDoubleEntry_Now = true;
        //this.msgBoxServ.showMessage('warning', ["This item is already entered"]);
      } else {
        itm.IsDoubleEntry_Now = false;
      }
      this.HasDoubleEntryInPast();
      if (this.PastTestList_ForDuplicate && this.PastTestList_ForDuplicate.find((a) => a.ServiceDepartmentId === itm.ServiceDepartmentId && a.ServiceItemId === itm.ServiceItemId)) {
        itm.IsDoubleEntry_Past = true;
        //this.msgBoxServ.showMessage('warning', ["This item is already entered"]);
      } else {
        itm.IsDoubleEntry_Past = false;
      }
    });
  }

  DateDifference(currDate, startDate): number {
    //const diffInMs = Date.parse(currDate) - Date.parse(startDate);
    //const diffInHours = diffInMs / 1000 / 60 / 60;
    //return diffInHours;
    var diffHrs = moment(currDate, "YYYY/MM/DD HH:mm:ss").diff(
      moment(startDate, "YYYY/MM/DD HH:mm:ss"),
      "hours"
    );
    return diffHrs;
  }

  AddToPastTest(): void {
    this.BillingTransaction.BillingTransactionItems.forEach((val) => {
      if (val.BillingTransactionItemId !== 0) {
        this.PastTests.push(val);
      }
    });
    this.PastTest(this.PastTests);
  }

  OnLabTypeChange(): void {
    this.BillingTransaction.BillingTransactionItems.forEach((item) => {
      item.LabTypeName = this.LabTypeName;
    });
    this.FilterBillItems(0);
    if (this.LabTypeName) {
      if (localStorage.getItem("LabWardBillingSelectedLabTypeName")) {
        localStorage.removeItem("LabWardBillingSelectedLabTypeName");
      }
      localStorage.setItem("LabWardBillingSelectedLabTypeName", this.LabTypeName);
    } else {
      this._messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Please select Lab Type Name."]);
    }
  }

  SetLabTypeNameInLocalStorage(): void {
    let labTypeInStorage = localStorage.getItem("LabWardBillingSelectedLabTypeName");
    if (labTypeInStorage) {
      if (this.coreService.labTypes.length === 1) {
        this.LabTypeName = this.coreService.labTypes[0].LabTypeName;
      } else {
        let selectedLabType = this.coreService.labTypes.find(val => val.LabTypeName === labTypeInStorage);
        if (selectedLabType) {
          this.LabTypeName = labTypeInStorage;
        } else {
          localStorage.removeItem("LabWardBillingSelectedLabTypeName");
          let defaultLabType = this.coreService.labTypes.find((type) => type.IsDefault === true);
          if (!defaultLabType) {
            this.LabTypeName = this.coreService.labTypes[0].LabTypeName;
          } else {
            this.LabTypeName = defaultLabType.LabTypeName;
          }
          localStorage.setItem("LabWardBillingSelectedLabTypeName", this.LabTypeName);
        }
      }
    } else {
      let defaultLabType = this.coreService.labTypes.find(
        (type) => type.IsDefault === true
      );
      if (!defaultLabType && this.coreService.singleLabType) {
        this.LabTypeName = this.coreService.labTypes[0].LabTypeName;
      } else {
        this.LabTypeName = defaultLabType.LabTypeName;
      }
    }
  }
}
