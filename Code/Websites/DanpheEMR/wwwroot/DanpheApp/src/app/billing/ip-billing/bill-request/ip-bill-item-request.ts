import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter } from "@angular/core";

import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { Patient } from "../../../patients/shared/patient.model";
import { BillingTransaction } from "../../../billing/shared/billing-transaction.model";
import { BillingTransactionItem } from "../../../billing/shared/billing-transaction-item.model";
import { CommonFunctions } from '../../../shared/common.functions';
import * as moment from 'moment/moment';
import { SecurityService } from "../../../security/shared/security.service";
import { BillingBLService } from "../../../billing/shared/billing.bl.service";
import { BillingService } from "../../../billing/shared/billing.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { PatientBillingContextVM } from "../../../billing/shared/patient-billing-context-vm";
import { ServiceDepartmentVM } from "../../../shared/common-masters.model";
import { CoreService } from "../../../core/shared/core.service";
import { CurrentVisitContextVM } from '../../../appointments/shared/current-visit-context.model';
import { BillingReceiptModel } from "../../shared/billing-receipt.model";
import { Router } from "@angular/router";
import { ENUM_BillingStatus } from "../../../shared/shared-enums";
import { ENUM_OrderStatus } from "../../../shared/shared-enums";

@Component({
  selector: 'ip-bill-item-request',
  templateUrl: './ip-bill-item-request.html'
})
export class IpBillItemRequest implements OnInit {

  @Input("patientInfo")
  public patientInfo: Patient;

  @Input("patientId")
  public patientId: number;
  @Input("visitId")
  public visitId: number;
  @Output("emit-billItemReq")
  public emitBillItemReq: EventEmitter<Object> = new EventEmitter<Object>();

  @Input("department")
  public department: string = null;

  @Input("past-tests")
  public pastTests: Array<any> = [];

  //master data
  public billItems: Array<any>;
  public billItemsComplete: Array<any>;
  public serviceDeptList: Array<ServiceDepartmentVM>;
  public doctorsList: Array<any> = [];
  public showIpBillRequestSlip: Boolean = false;
  public billingTransaction: BillingTransaction = new BillingTransaction();;
  public IpBillRequestDetails: BillingReceiptModel;
  //seleted items
  public selectedItems = [];
  public selectedServDepts: Array<any> = [];
  public selectedAssignedToDr: Array<any> = [];
  public selectedRequestedByDr: Array<any> = [];

  public visitList: Array<any>;

  public billingType = "inpatient";
  public loading = false;
  public taxDetail = { taxPercent: 0, taxId: 0 };
  public currBillingContext: PatientBillingContextVM = null;
  public groupDiscountPercent: number = 0;
  public selectedPatient;
  public currPatVisitContext: CurrentVisitContextVM;
  public PostSuccessBool: boolean = false;

  public DiscountScheme: any = null;// { MembershipTypeName: "", MembershipTypeId: null };
  public DiscountPercentSchemeValid: boolean = true;
  public memTypeSchemeId: number = null;

  public searchByItemCode: boolean = true; //for items search
  public allRequestedData: any = null;

  public BillingRequestDisplaySettings: any = null;
  public LabTypeName: string = 'op-lab';
  public hasMultipleLabType: boolean;

  constructor(
    public msgBoxServ: MessageboxService,
    public securityService: SecurityService,
    public changeDetectorRef: ChangeDetectorRef,
    public billingBLService: BillingBLService,
    public billingService: BillingService,
    public router: Router,
    public coreService: CoreService) {

    this.searchByItemCode = this.coreService.UseItemCodeItemSearch();
    this.SetBillingItemsNPrices();
    this.BillRequestDoubleEntryWarningTimeHrs = this.coreService.LoadIPBillRequestDoubleEntryWarningTimeHrs();
    //this.BillingRequestDisplaySettings = this.coreService.GetBillingRequestDisplaySettings();
    this.GetBillingRequestDisplaySettings();
    if (this.coreService.labTypes.length > 1) {
      this.hasMultipleLabType = true;
    } else {
      this.hasMultipleLabType = false;
      this.LabTypeName = this.coreService.labTypes[0].LabTypeName;
    }
  }

  ngOnInit() {
    this.ResetVariables();

    //sud:2May'20: moving doctorsList-Set after ResetVariables is called since this function later uses page variable and which should be loaded first.
    this.SetDoctorsList();

    this.serviceDeptList = this.coreService.Masters.ServiceDepartments;
    this.serviceDeptList = this.serviceDeptList.filter(a => a.ServiceDepartmentName != "OPD");

    if (this.patientId) {
      this.GetPatientVisitList(this.patientId);
      this.LoadPatientBillingContext(this.patientId);
      this.GetVisitContext(this.patientId, this.visitId);
    }

    this.ItemsListFormatter = this.ItemsListFormatter.bind(this);//to use global variable in list formatter auto-complete

    this.PastTest(this.pastTests);
    this.SetLabTypeNameInLocalStorage();
  }

  SetLabTypeNameInLocalStorage() {
    let labtypeInStorage = localStorage.getItem('BillingSelectedLabTypeName');
    if (this.coreService.labTypes.length == 1) {
      this.LabTypeName = this.coreService.labTypes[0].LabTypeName;
      localStorage.setItem('BillingSelectedLabTypeName', this.LabTypeName);
    }
    else {
      if (labtypeInStorage) {
        this.LabTypeName = labtypeInStorage;
      }
    }
  }


  ResetVariables() {
    this.selectedItems = [];
    this.selectedAssignedToDr = [];
    this.selectedServDepts = [];
    this.selectedRequestedByDr = [];
    this.visitList = [];
    this.billingTransaction = new BillingTransaction();
    this.AddNewBillTxnItemRow();
    this.taxDetail.taxId = this.billingService.taxId;
    this.taxDetail.taxPercent = this.billingService.taxPercent;
    this.groupDiscountPercent = 0;
  }

  ItemGroupDiscount() {
    this.billingTransaction.BillingTransactionItems.forEach(item => {
      item.DiscountPercent = this.groupDiscountPercent;
    });
    this.Calculationforall();
  }

  //-------------- implementing individual discount from the total discount percentahe----------
  Calculationforall() {
    if (this.billingTransaction.BillingTransactionItems.length) {

      let DP: number = 0; //discountPercent for the model (aggregate total) 
      let Dp: number = 0; // discountPercent for individual item
      let totalTax: number = 0;
      let loopTax: number = 0;
      let SubTotal: number = 0;
      let totalAmount: number = 0;
      let totalAmountAgg: number = 0;
      let totalQuantity: number = 0;
      let subtotal: number = 0;
      let calsubtotal: number = 0;
      let subtotalfordiscountamount: number = 0;
      DP = this.billingTransaction.DiscountPercent;
      let successiveDiscount: number = 0;
      let totalAmountforDiscountAmount: number = 0;
      let DiscountAgg: number = 0;
      //-------------------------------------------------------------------------------------------------------------------------------
      for (var i = 0; i < this.billingTransaction.BillingTransactionItems.length; i++) {
        let curRow = this.billingTransaction.BillingTransactionItems[i];
        Dp = curRow.DiscountPercent;
        curRow.DiscountPercentAgg = Dp;
        curRow.Price = CommonFunctions.parseAmount(curRow.Price);
        subtotal = (curRow.Quantity * curRow.Price); //100
        curRow.SubTotal = CommonFunctions.parseAmount(subtotal);
        let DiscountedAmountItem = (subtotal - (Dp / 100) * subtotal) //Discounted Amount for individual Item 
        let DiscountedAmountTotal = (DiscountedAmountItem - DP * DiscountedAmountItem / 100); // Discounted Amount From the Total Discount

        let tax = (curRow.TaxPercent / 100 * (DiscountedAmountTotal));
        curRow.Tax = CommonFunctions.parseAmount(tax);
        if (DP) {
          successiveDiscount = ((100 - Dp) / 100 * (100 - DP) / 100 * subtotal);
          let successiveDiscountAmount = successiveDiscount + curRow.TaxPercent / 100 * successiveDiscount;

          DiscountAgg = ((subtotal - successiveDiscountAmount) + curRow.Tax) * 100 / subtotal;
          //curRow.DiscountPercentAgg = (Math.round(DiscountAgg * 100) / 100);
          curRow.DiscountAmount = CommonFunctions.parseAmount(curRow.DiscountPercentAgg * subtotal / 100);
          curRow.DiscountPercentAgg = CommonFunctions.parseAmount(DiscountAgg);
        }

        loopTax = (curRow.TaxPercent * (subtotal / 100));
        //calsubtotal = calsubtotal + subtotal + loopTax;
        calsubtotal = calsubtotal + subtotal;
        totalTax = totalTax + loopTax;
        let DiscountedAmountTotalAgg = (DiscountedAmountItem - DP * DiscountedAmountItem / 100);
        totalAmountAgg = DiscountedAmountTotalAgg + curRow.Tax;
        totalAmount = DiscountedAmountTotal + curRow.Tax;
        curRow.TotalAmount = CommonFunctions.parseAmount(totalAmount);
        totalAmountforDiscountAmount = totalAmountforDiscountAmount + curRow.TotalAmount;
        SubTotal = SubTotal + totalAmountAgg;
        let CurQuantity = curRow.Quantity;
        totalQuantity = Number(totalQuantity) + Number(CurQuantity);
        subtotalfordiscountamount = subtotalfordiscountamount + subtotal;
        curRow.DiscountAmount = CommonFunctions.parseAmount(subtotal - DiscountedAmountTotal);
        //if tax not applicable then taxable amount will be zero. else: taxable amount = total-discount. 
        //opposite logic for NonTaxableAmount
        curRow.TaxableAmount = curRow.IsTaxApplicable ? (curRow.SubTotal - curRow.DiscountAmount) : 0;//added: sud: 29May'18
        curRow.NonTaxableAmount = curRow.IsTaxApplicable ? 0 : (curRow.SubTotal - curRow.DiscountAmount);//added: sud: 29May'18
      }
      this.billingTransaction.SubTotal = CommonFunctions.parseAmount(calsubtotal);
      this.billingTransaction.TotalQuantity = CommonFunctions.parseAmount(totalQuantity);
      this.billingTransaction.DiscountAmount = CommonFunctions.parseAmount(DiscountAgg * (this.billingTransaction.SubTotal) / 100);
      //this.model.DiscountAmount = Math.round(((this.model.SubTotal - totalAmountforDiscountAmount) * 100) / 100);
      //this.model.DiscountPercent = this.model.SubTotal != 0 ? Math.round(((this.model.DiscountAmount * 100) / this.model.SubTotal) * 1) / 1 : this.model.DiscountPercent;
      this.billingTransaction.TotalAmount = CommonFunctions.parseAmount(SubTotal);
      this.billingTransaction.TaxTotal = CommonFunctions.parseAmount(totalTax);
    }
    else {
      this.billingTransaction.SubTotal = 0;
      this.billingTransaction.TotalAmount = 0;
      this.billingTransaction.DiscountAmount = 0;
      this.billingTransaction.DiscountPercent = 0;
      this.billingTransaction.TotalQuantity = 0;
    }
  }
  //-------------- implementing individual discount from the total discount percentage----------

  //----------start: post billing transaction--------------------------------

  SubmitBillingTransaction(): void {
    //this.loading is set to true from the HTML. to handle double-Click.
    //check if there's other better alternative. till then let it be.. --sud:23Jan'18
    if (this.loading) {
      //set loading=true so that the butotn will be disabled to avoid Double-Click 
      ///Its COMPULSORY to disable : DON'T CHANGE THIS -- sud: 21Jan2018
      this.loading = true;
      //to delete row having no item name
      this.billingTransaction.BillingTransactionItems.forEach(txnItm => {
        if (txnItm.ItemName == null && this.billingTransaction.BillingTransactionItems.length > 1) {
          this.billingTransaction.BillingTransactionItems.splice(this.billingTransaction.BillingTransactionItems.indexOf(txnItm), 1);
        }
      });
      this.SetBillingTxnDetails();
      if (this.CheckValidations()) {
        this.PostToDepartmentRequisition();
      }
      else {
        this.loading = false;
      }
    }
  }

  PrintBillRequestSlip() {
    if (this.CheckValidations()) {
      this.SubmitBillingTransaction();
    }
    else {
      this.loading = false;
    }
  }

  SetBillingTxnDetails() {
    let currentVisit = this.visitList.find(visit => visit.PatientVisitId == this.visitId);
    this.billingTransaction.TaxId = this.taxDetail.taxId;

    this.billingTransaction.BillingTransactionItems.forEach(txnItem => {
      txnItem.PatientVisitId = this.visitId;
      //txnItem.RequestedBy = currentVisit ? currentVisit.ProviderId : null;
      //txnItem.BillingTransactionItemValidator.controls['RequestedBy'].setValue(txnItem.RequestedBy);
      txnItem.PatientId = this.patientId;
      if (txnItem.SrvDeptIntegrationName && (txnItem.SrvDeptIntegrationName.toLowerCase() != "lab")) {
        txnItem.LabTypeName = null;
      } else {
        txnItem.LabTypeName = this.LabTypeName;
      }
      txnItem.RequestingDeptId = this.currBillingContext ? this.currBillingContext.RequestingDeptId : null;
      txnItem.BillingType = this.billingService.BillingType;
      txnItem.VisitType = this.billingService.BillingType.toLowerCase();
      txnItem.BillStatus = ENUM_BillingStatus.provisional;// "provisional";

      txnItem.CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");
      txnItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;

      txnItem.CounterId = this.securityService.getLoggedInCounter().CounterId;
      txnItem.CounterDay = moment().format("YYYY-MM-DD");
      txnItem.DiscountSchemeId = this.DiscountSchemaId;
      txnItem.OrderStatus = ENUM_OrderStatus.Active;//'active'

    });
  }
  CheckValidations(): boolean {
    let isFormValid = true;
    if (this.patientId && this.visitId) {
      if (this.CheckSelectionFromAutoComplete() && this.billingTransaction.BillingTransactionItems.length) {
        for (var i = 0; i < this.billingTransaction.BillingTransactionItems.length; i++) {
          let currTxnItm = this.billingTransaction.BillingTransactionItems[i];
          //for IsZeroPriceAlowed case...
          var item = currTxnItm.ItemList.find(a => a.ItemId == currTxnItm.ItemId && a.ServiceDepartmentId == currTxnItm.ServiceDepartmentId);
          if (item && item.IsZeroPriceAllowed) {
            currTxnItm.UpdateValidator("off", "Price", "positiveNumberValdiator");
          }

          for (var valCtrls in currTxnItm.BillingTransactionItemValidator.controls) {

            currTxnItm.BillingTransactionItemValidator.controls[valCtrls].markAsDirty();
            currTxnItm.BillingTransactionItemValidator.controls[valCtrls].updateValueAndValidity();
          }
        }

        for (var i = 0; i < this.billingTransaction.BillingTransactionItems.length; i++) {
          let currTxnItm_1 = this.billingTransaction.BillingTransactionItems[i];
          //break loop if even a single txn item is invalid.
          if (!currTxnItm_1.IsValidCheck(undefined, undefined)) {
            isFormValid = false;
            break;
          }

        }
        if (!this.DiscountPercentSchemeValid) {
          this.msgBoxServ.showMessage("failed", ["Check Discount Schema (%)."]);
          isFormValid = false;
        }
      }
      else {
        isFormValid = false;
      }
    }
    else {
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
  PostToDepartmentRequisition() {
    //orderstatus="active" and billingStatus="provisional" when sent from billingpage.
    this.billingBLService.PostDepartmentOrders(this.billingTransaction.BillingTransactionItems, "active", "provisional", false, this.currPatVisitContext)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.PostToBillingTransaction();
        }
        else {
          this.loading = false;
          this.msgBoxServ.showMessage("failed", ["Unable to do lab request.Please try again later"]);
          console.log(res.ErrorMessage);
        }
      });
  }

  public provReceiptInputs = { PatientId: 0, ProvFiscalYrId: 0, ProvReceiptNo: 0, visitType: null };
  PostToBillingTransaction() {
    this.billingTransaction.BillingTransactionItems.forEach(a => a.PatientVisitId = this.visitId);
    this.billingBLService.PostBillingTransactionItems(this.billingTransaction.BillingTransactionItems)
      .subscribe(
        res => {
          if (res.Status == "OK") {

            this.allRequestedData = res.Results;
            this.loading = false;
            this.msgBoxServ.showMessage("success", ["Item added successfully"]);
            console.log(this.PostSuccessBool);
            if (this.PostSuccessBool) {
              this.provReceiptInputs.PatientId = this.patientId;
              this.provReceiptInputs.ProvFiscalYrId = this.allRequestedData[0].ProvisionalFiscalYearId;
              this.provReceiptInputs.ProvReceiptNo = this.allRequestedData[0].ProvisionalReceiptNo;
              this.provReceiptInputs.visitType = null;//sending null from here for now.. Check this later.. 
              this.showIpBillRequestSlip = true;
            } else {
              this.emitBillItemReq.emit({ newItems: this.allRequestedData });
            }

          }
          else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
            this.loading = false;
          }
        });
  }

  //----------end: post billing transaction-----------------------------------



  //start: get: master and patient data
  LoadPatientBillingContext(patientId) {
    this.billingBLService.GetPatientBillingContext(patientId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.currBillingContext = res.Results;
          this.billingService.BillingType = this.currBillingContext.BillingType;
          this.billingType = this.currBillingContext.BillingType;

        }
      });
  }

  public SetBillingItemsNPrices() {
    this.billItemsComplete = this.billingService.allBillItemsPriceList;
    this.billItems = this.billItemsComplete.filter(item => item.ServiceDepartmentName != "OPD");
    if (this.billingTransaction.BillingTransactionItems && this.billingTransaction.BillingTransactionItems.length > 0
      && (!this.billingTransaction.BillingTransactionItems[0].ItemList)) {
      this.billingTransaction.BillingTransactionItems[0].ItemList = this.billItems;
    }

  }


  public GetPatientVisitList(patientId) {
    this.billingBLService.GetPatientVisitsProviderWise(patientId)
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.visitList = res.Results;
            this.AssignDoctorsToFirstBillItem();
            this.GetVisitContext(this.patientId, this.visitList[0].PatientVisitId);
          }
          else {
            console.log(res.ErrorMessage);
          }
        }
      },
        err => {
          this.msgBoxServ.showMessage('Failed', ["unable to get PatientVisit list.. check log for more details."]);
          console.log(err.ErrorMessage);

        });
  }


  public AssignDoctorsToFirstBillItem() {
    if (this.doctorsList && this.doctorsList.length > 0 && this.visitList && this.visitList.length > 0) {
      let doc = this.doctorsList.find(a => a.EmployeeId == this.visitList[0].ProviderId);
      if (doc) {
        this.selectedRequestedByDr[0] = doc.FullName;
        this.AssignRequestedByDoctor(0);
      }
    }

  }

  GetVisitContext(patientId: number, visitId: number) {
    if (patientId && visitId) {
      this.billingBLService.GetDataOfInPatient(patientId, visitId)
        .subscribe(res => {
          if (res.Status == "OK" && res.Results.Current_WardBed) {
            this.currPatVisitContext = res.Results;
          }
          else {
            console.log("failed", ["Problem! Cannot get the Current Visit Context ! "])
          }
        },
          err => { console.log(err.ErrorMessage); });

    }

  }

  public SetDoctorsList() {
    //reuse the doctor's list coming from billing service to avoid server calls.//sud:2May'20
    this.doctorsList = this.billingService.GetDoctorsListForBilling();

    let Obj = new Object();
    Obj["EmployeeId"] = null; //change by Yub -- 23rd Aug '18
    Obj["FullName"] = "SELF";
    this.doctorsList.push(Obj);


    if (this.billingTransaction && this.billingTransaction.BillingTransactionItems && this.billingTransaction.BillingTransactionItems.length > 0) {
      this.billingTransaction.BillingTransactionItems[0].AssignedDoctorList = this.doctorsList;
      this.AssignDoctorsToFirstBillItem();
    }


  }

  GetServiceDeptNameById(servDeptId: number): string {
    if (this.serviceDeptList) {
      let srvDept = this.serviceDeptList.find(a => a.ServiceDepartmentId == servDeptId);
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
      if (typeof (this.selectedItems[index]) == 'string' && this.billingTransaction.BillingTransactionItems[index].ItemList.length) {
        item = this.billingTransaction.BillingTransactionItems[index].ItemList.find(a => a.ItemName.toLowerCase() == this.selectedItems[index].toLowerCase());
      }
      else if (typeof (this.selectedItems[index]) == 'object')
        item = this.selectedItems[index];
      if (item) {
        let discountApplicable = item.DiscountApplicable;

        if (this.billingType.toLowerCase() != "inpatient") {
          let extItem = this.billingTransaction.BillingTransactionItems.find(a => a.ItemId == item.ItemId && a.ServiceDepartmentId == item.ServiceDepartmentId);
          let extItemIndex = this.billingTransaction.BillingTransactionItems.findIndex(a => a.ItemId == item.ItemId && a.ServiceDepartmentId == item.ServiceDepartmentId);
          if (extItem && index != extItemIndex) {
            this.msgBoxServ.showMessage("failed", [item.ItemName + " is already entered."]);
            this.changeDetectorRef.detectChanges();
            this.billingTransaction.BillingTransactionItems[index].IsDuplicateItem = true;
          }
          else
            this.billingTransaction.BillingTransactionItems[index].IsDuplicateItem = false;
        }
        this.billingTransaction.BillingTransactionItems[index].ItemId = item.ItemId;
        this.billingTransaction.BillingTransactionItems[index].ItemName = item.ItemName;
        this.billingTransaction.BillingTransactionItems[index].TaxPercent = item.TaxApplicable ? this.taxDetail.taxPercent : 0;
        this.billingTransaction.BillingTransactionItems[index].IsTaxApplicable = item.TaxApplicable;
        //this.billingTransaction.BillingTransactionItems[index].TaxableAmount = item.TaxApplicable ? item.Price : 0;
        this.billingTransaction.BillingTransactionItems[index].Price = item.Price;

        if (!discountApplicable) {
          //Yubraj 29th July -- Disable discount TextBox in case of DiscountApplicable is false
          //If item is not DiscountApplicable, Discunt percentshould be '0' (zero) and textBox is disable
          this.billingTransaction.BillingTransactionItems[index].EnableControl("DiscountPercent", false);
          this.billingTransaction.BillingTransactionItems[index].DiscountPercent = 0;
        }
        else {
          this.billingTransaction.BillingTransactionItems[index].DiscountPercent = this.currMemDiscountPercent;
          //If GroupDiscount is given.. assign Discount percent of individual item as of Group discount
        }
        //this.billingTransaction.BillingTransactionItems[index].DiscountPercent = this.groupDiscountPercent;


        this.billingTransaction.BillingTransactionItems[index].ProcedureCode = item.ProcedureCode;
        //add also the servicedepartmentname property of the item; needed since most of the filtering happens on this value

        this.billingTransaction.BillingTransactionItems[index].ServiceDepartmentName = this.GetServiceDeptNameById(item.ServiceDepartmentId);
        this.billingTransaction.BillingTransactionItems[index].ServiceDepartmentId = item.ServiceDepartmentId;
        this.selectedServDepts[index] = this.billingTransaction.BillingTransactionItems[index].ServiceDepartmentName;
        this.billingTransaction.BillingTransactionItems[index].IsValidSelDepartment = true;
        this.billingTransaction.BillingTransactionItems[index].IsValidSelItemName = true;

        this.FilterBillItems(index);
        this.CheckItemProviderValidation(index);
        this.Calculationforall();
        this.ResetDoctorListOnItemChange(item, index);
      }
      else
        this.billingTransaction.BillingTransactionItems[index].IsValidSelItemName = false;
      if (!item && !this.selectedServDepts[index]) {
        this.billingTransaction.BillingTransactionItems[index].ItemList = this.billItems;
        if (this.LabTypeName == 'er-lab') {
          this.billingTransaction.BillingTransactionItems[index].ItemList = this.billItems.filter(a => a.SrvDeptIntegrationName != "OPD" && (a.IsErLabApplicable == true || a.SrvDeptIntegrationName != 'LAB'));
        }
      }
      this.CheckForDoubleEntry();
    } else {
      this.billingTransaction.BillingTransactionItems[index].IsDoubleEntry_Past = false;
      this.billingTransaction.BillingTransactionItems[index].IsDoubleEntry_Now = false;
    }
  }

  public AssignSelectedDoctor(index) {
    let doctor = null;
    // check if user has given proper input string for item name
    //or has selected object properly from the dropdown list.
    if (this.selectedAssignedToDr[index]) {
      if (typeof (this.selectedAssignedToDr[index]) == 'string' && this.doctorsList.length) {
        doctor = this.doctorsList.find(a => a.FullName.toLowerCase() == this.selectedAssignedToDr[index].toLowerCase());
      }
      else if (typeof (this.selectedAssignedToDr[index]) == 'object')
        doctor = this.selectedAssignedToDr[index];
      if (doctor) {
        this.billingTransaction.BillingTransactionItems[index].ProviderId = doctor.EmployeeId;
        this.billingTransaction.BillingTransactionItems[index].ProviderName = doctor.FullName;


        this.billingTransaction.BillingTransactionItems[index].IsValidSelAssignedToDr = true;


      }
      else
        this.billingTransaction.BillingTransactionItems[index].IsValidSelAssignedToDr = false;
    }
    else
      this.billingTransaction.BillingTransactionItems[index].IsValidSelAssignedToDr = true;
  }

  public AssignRequestedByDoctor(index) {
    let doctor = null;
    // check if user has given proper input string for item name
    //or has selected object properly from the dropdown list.
    if (this.selectedRequestedByDr[index]) {
      if (typeof (this.selectedRequestedByDr[index]) == 'string' && this.doctorsList.length) {
        doctor = this.doctorsList.find(a => a.FullName.toLowerCase() == this.selectedRequestedByDr[index].toLowerCase());
      }
      else if (typeof (this.selectedRequestedByDr[index]) == 'object')
        doctor = this.selectedRequestedByDr[index];
      if (doctor) {
        this.billingTransaction.BillingTransactionItems[index].RequestedBy = doctor.EmployeeId;
        this.billingTransaction.BillingTransactionItems[index].RequestedByName = doctor.FullName;
        this.billingTransaction.BillingTransactionItems[index].IsValidSelRequestedByDr = true;
      }
      else
        this.billingTransaction.BillingTransactionItems[index].IsValidSelRequestedByDr = false;
    }
    else
      this.billingTransaction.BillingTransactionItems[index].IsValidSelRequestedByDr = true;
  }



  //assigns service department id and filters item list
  ServiceDeptOnChange(index) {
    let srvDeptObj = null;
    // check if user has given proper input string for department name 
    //or has selected object properly from the dropdown list.
    if (typeof (this.selectedServDepts[index]) == 'string') {
      if (this.serviceDeptList.length && this.selectedServDepts[index])
        srvDeptObj = this.serviceDeptList.find(a => a.ServiceDepartmentName.toLowerCase() == this.selectedServDepts[index].toLowerCase());
    }
    else if (typeof (this.selectedServDepts[index]) == 'object')
      srvDeptObj = this.selectedServDepts[index];
    //if selection of department from string or selecting object from the list is true
    //then assign proper department name
    if (srvDeptObj) {
      if (srvDeptObj.ServiceDepartmentId != this.billingTransaction.BillingTransactionItems[index].ServiceDepartmentId) {
        this.ResetSelectedRow(index);
        this.billingTransaction.BillingTransactionItems[index].ServiceDepartmentId = srvDeptObj.ServiceDepartmentId;
      }
      this.FilterBillItems(index);
      this.billingTransaction.BillingTransactionItems[index].IsValidSelDepartment = true;
    }
    //else raise an invalid flag
    else {
      this.billingTransaction.BillingTransactionItems[index].ItemList = this.billItems;
      if (this.LabTypeName == 'er-lab') {
        this.billingTransaction.BillingTransactionItems[index].ItemList = this.billItems.filter(a => a.SrvDeptIntegrationName != "OPD" && (a.IsErLabApplicable == true || a.SrvDeptIntegrationName != 'LAB'));
      }
      this.billingTransaction.BillingTransactionItems[index].IsValidSelDepartment = false;
    }
  }
  public FilterBillItems(index) {
    //ramavtar:13may18: at start if no default service department is set .. we need to skip the filtering of item list.
    if (this.billingTransaction.BillingTransactionItems[index].ServiceDepartmentId) {
      if (this.billingTransaction.BillingTransactionItems.length && this.billItems.length) {
        let srvDeptId = this.billingTransaction.BillingTransactionItems[index].ServiceDepartmentId;
        //initalAssign: FilterBillItems was called after assinging all the values(used in ngModelChange in SelectDepartment)
        // and was assigning ItemId=null.So avoiding assignment null value to ItemId during inital assign.
        if (this.billingTransaction.BillingTransactionItems[index].ItemId == null)
          this.ResetSelectedRow(index);
        this.billingTransaction.BillingTransactionItems[index].ItemList = this.billItems.filter(a => a.ServiceDepartmentId == srvDeptId);
        if (this.LabTypeName == 'er-lab') {
          this.billingTransaction.BillingTransactionItems[index].ItemList = this.billItems.filter(a => a.SrvDeptIntegrationName != "OPD" && (a.IsErLabApplicable == true || a.SrvDeptIntegrationName != 'LAB'));
        }

        //let servDeptName = this.GetServiceDeptNameById(srvDeptId);
        //if (this.IsDoctorMandatory(servDeptName, null)) {
        //    this.billingTransaction.BillingTransactionItems[index].UpdateValidator("on", "ProviderId", "required");
        //}

        //// checking directly from list of database yubraj-- 24th Oct 2018
        if (this.selectedItems[index] && this.selectedItems[index].IsDoctorMandatory) {
          this.billingTransaction.BillingTransactionItems[index].UpdateValidator("on", "ProviderId", "required");
        }
        else {
          //this.billingTransaction.BillingTransactionItems[index].UpdateValidator("off", "ProviderId", null);
        }
        // this.billingTransaction.BillingTransactionItems[index].UpdateValidator("off", "ProviderId", null);//pratik: 1March,21--- for LPH
        this.billingTransaction.BillingTransactionItems[index].UpdateValidator("off", "RequestedBy", null);//pratik: 1March,21--- for LPH
      }
    }
    else {
      let billItems = this.billItems.filter(a => a.ServiceDepartmentName != "OPD");
      this.billingTransaction.BillingTransactionItems[index].ItemList = billItems;
      if (this.LabTypeName == 'er-lab') {
        this.billingTransaction.BillingTransactionItems[index].ItemList = this.billItems.filter(a => a.SrvDeptIntegrationName != "OPD" && (a.IsErLabApplicable == true || a.SrvDeptIntegrationName != 'LAB'));
      }
    }
  }



  //end: autocomplete assign functions  and item filter logic


  CloseThisPage() {
    this.emitBillItemReq.emit({ action: "close", newItems: this.allRequestedData });
  }

  //----start: add/delete rows-----
  ResetSelectedRow(index) {
    this.selectedItems[index] = null;
    this.selectedAssignedToDr[index] = null;
    this.billingTransaction.BillingTransactionItems[index] = this.NewBillingTransactionItem();
    this.Calculationforall();
  }

  AddNewBillTxnItemRow(index = null) {    //method to add the row
    let billItem = this.NewBillingTransactionItem();
    this.billingTransaction.BillingTransactionItems.push(billItem);
    billItem.AssignedDoctorList = this.doctorsList;
    //if (index != null) {
    //let new_index = this.billingTransaction.BillingTransactionItems.length - 1;
    //this.selectedRequestedByDr[new_index] = this.selectedRequestedByDr[index];
    //this.AssignRequestedByDoctor(new_index);
    //window.setTimeout(function () {
    //  document.getElementById('items-box' + new_index).focus();
    //}, 0);
    let new_index;
    if (index == null) {
      new_index = this.billingTransaction.BillingTransactionItems.length - 1;
    }
    else {
      new_index = index + 1
    }
    this.selectedRequestedByDr[new_index] = this.selectedRequestedByDr[index];
    this.AssignRequestedByDoctor(new_index);
    window.setTimeout(function () {
      let itmNameBox = document.getElementById('items-box' + new_index);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 0);
  }
  NewBillingTransactionItem(index = null): BillingTransactionItem {
    let billItem = new BillingTransactionItem();
    billItem.Quantity = 1;
    billItem.ItemList = this.billItems;

    return billItem;
  }
  deleteRow(index: number) {
    this.billingTransaction.BillingTransactionItems.splice(index, 1);
    this.selectedItems.splice(index, 1);
    this.selectedAssignedToDr.splice(index, 1);
    this.selectedServDepts.splice(index, 1);
    if (index == 0 && this.billingTransaction.BillingTransactionItems.length == 0) {
      this.AddNewBillTxnItemRow();
      this.changeDetectorRef.detectChanges();
    }
    this.Calculationforall();

    this.CheckForDoubleEntry();
  }
  //----end: add/delete rows-----


  CheckItemProviderValidation(index: number) {
    //let srvDeptId = this.billingTransaction.BillingTransactionItems[index].ServiceDepartmentId;
    //let servDeptName = this.GetServiceDeptNameById(srvDeptId);
    //if (this.IsDoctorMandatory(servDeptName, this.billingTransaction.BillingTransactionItems[index].ItemName)) {
    //    this.billingTransaction.BillingTransactionItems[index].UpdateValidator("on", "ProviderId", "required");
    //}

    if (this.selectedItems[index] && this.selectedItems[index].IsDoctorMandatory) {
      this.billingTransaction.BillingTransactionItems[index].UpdateValidator("on", "ProviderId", "required");
    }
    else {
      //this.billingTransaction.BillingTransactionItems[index].UpdateValidator("off", "ProviderId", null);
    }
    let currItm = this.billingTransaction.BillingTransactionItems[index];
    if (!this.BillingRequestDisplaySettings.AssignedToDr) {
      currItm.UpdateValidator("off", "ProviderId", null);
    }
    // this.billingTransaction.BillingTransactionItems[index].UpdateValidator("off", "ProviderId", null);//pratik: 1March,21--- for LPH
    this.billingTransaction.BillingTransactionItems[index].UpdateValidator("off", "RequestedBy", null);//pratik: 1March,21--- for LPH
  }
  //end: mandatory doctor validations

  //start: list formatters
  ItemsListFormatter(data: any): string {
    let html: string = "";
    if (data.SrvDeptIntegrationName != "OPD") {
      if (this.searchByItemCode) {
        html = data["ServiceDepartmentShortName"] + "-" + data["ItemCode"] + "&nbsp;&nbsp;" + "<font color='blue'; size=03 >" + data["ItemName"].toUpperCase() + "</font>" + "&nbsp;&nbsp;";
      }
      else {
        html = data["ServiceDepartmentShortName"] + "-" + data["BillItemPriceId"] + "&nbsp;&nbsp;" + "<font color='blue'; size=03 >" + data["ItemName"].toUpperCase() + "</font>" + "&nbsp;&nbsp;";
      }
      html += "(<i>" + data["ServiceDepartmentName"] + "</i>)" + "&nbsp;&nbsp;" + this.coreService.currencyUnit + "<b>" + data["Price"] + "</b>";
    }
    else {
      let docName = data.Doctor ? data.Doctor.DoctorName : "";
      html = data["ServiceDepartmentShortName"] + "-" + data["BillItemPriceId"] + "&nbsp;&nbsp;" + data["ItemName"].toUpperCase() + "&nbsp;&nbsp;";
      html += "(<i>" + docName + "</i>)" + "&nbsp;&nbsp;" + this.coreService.currencyUnit + " " + data["Price"];
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
    let html = data["ShortName"] + ' [ ' + data['PatientCode'] + ' ]';
    return html;
  }

  CloseIpBillRequestSlip($event) {
    this.showIpBillRequestSlip = false;
    this.loading = false;
    this.CloseThisPage();
  }

  public DiscountSchemaId: number = null;
  public currMemDiscountPercent: number = 0;
  public discountApplicable: boolean = true;




  OnPriceCategoryChange($event) {
    let billingPropertyName = $event.propertyName;
    let billingCategoryName = $event.categoryName;

    if (this.billItems != null && this.billItems.length > 0) {
      this.billItems.forEach(itm => {
        itm.Price = itm[billingPropertyName] ? itm[billingPropertyName] : 0;
        itm.PriceCategory = billingCategoryName;
      });
    }

    if (this.billingTransaction.BillingTransactionItems && this.billingTransaction.BillingTransactionItems.length > 0) {
      this.billingTransaction.BillingTransactionItems.forEach(txnItm => {
        let currBillItem = this.billItems.find(billItem => billItem.ItemId == txnItm.ItemId && billItem.ServiceDepartmentId == txnItm.ServiceDepartmentId);
        if (currBillItem) {
          txnItm.Price = currBillItem[billingPropertyName] ? currBillItem[billingPropertyName] : 0;
          txnItm.PriceCategory = billingCategoryName;
        }
      });
    }
  }

  ResetDoctorListOnItemChange(item, index) {
    if (item) {
      let docArray = null;
      let currItemPriceCFG = this.billItemsComplete.find(a => a.ItemId == item.ItemId && a.ServiceDepartmentId == item.ServiceDepartmentId);
      if (currItemPriceCFG) {
        let docJsonStr = currItemPriceCFG.DefaultDoctorList;
        if (docJsonStr) {
          docArray = JSON.parse(docJsonStr);
        }
      }

      if (docArray && docArray.length > 1) {
        this.billingTransaction.BillingTransactionItems[index].AssignedDoctorList = [];
        this.selectedAssignedToDr[index] = null;
        docArray.forEach(docId => {
          let currDoc = this.doctorsList.find(d => d.EmployeeId == docId);
          if (currDoc) {
            this.billingTransaction.BillingTransactionItems[index].AssignedDoctorList.push(currDoc);
          }
        });
      }
      else if (docArray && docArray.length == 1) {

        let currDoc = this.doctorsList.find(d => d.EmployeeId == docArray[0]);
        if (currDoc) {
          this.selectedAssignedToDr[index] = currDoc.FullName;
          this.AssignSelectedDoctor(index);
        }
      }
      else {
        this.selectedAssignedToDr[index] = null;
        this.billingTransaction.BillingTransactionItems[index].AssignedDoctorList = this.doctorsList;
      }
    }
  }

  public BillRequestDoubleEntryWarningTimeHrs: number = 0;
  public PastTestList: any = [];
  public PastTestList_ForDuplicate: any = [];

  PastTest($event) {
    this.PastTestList = $event;
  }

  HasDoubleEntryInPast() {
    if (this.PastTestList && this.PastTestList.length > 0) {
      var currDate = moment().format("YYYY-MM-DD HH:mm:ss");
      if (this.BillRequestDoubleEntryWarningTimeHrs && this.BillRequestDoubleEntryWarningTimeHrs != 0) {
        this.PastTestList.forEach(a => {
          //var diff = moment.duration(a.CreatedOn.diff(currDate));
          if (this.DateDifference(currDate, a.CreatedOn) < this.BillRequestDoubleEntryWarningTimeHrs) {
            this.PastTestList_ForDuplicate.push(a);
          }
        });
      }


    }
  }

  CheckForDoubleEntry() {
    this.billingTransaction.BillingTransactionItems.forEach(itm => {

      if (this.billingTransaction.BillingTransactionItems.filter(a => a.ServiceDepartmentId == itm.ServiceDepartmentId && a.ItemId == itm.ItemId).length > 1) {
        itm.IsDoubleEntry_Now = true;
        //this.msgBoxServ.showMessage('warning', ["This item is already entered"]);
      }
      else {
        itm.IsDoubleEntry_Now = false;
      }
      this.HasDoubleEntryInPast();
      if (this.PastTestList_ForDuplicate && this.PastTestList_ForDuplicate.find(a => a.ServiceDepartmentId == itm.ServiceDepartmentId && a.ItemId == itm.ItemId)) {
        itm.IsDoubleEntry_Past = true;
        //this.msgBoxServ.showMessage('warning', ["This item is already entered"]);
      }
      else {
        itm.IsDoubleEntry_Past = false;
      }
    });

  }

  public DateDifference(currDate, startDate): number {
    var diffHrs = moment(currDate, "YYYY/MM/DD HH:mm:ss").diff(moment(startDate, "YYYY/MM/DD HH:mm:ss"), 'hours');
    return diffHrs;
  }

  public AddTxnItemRowOnClick(index) {
    if (index != -1) {
      if (this.billingTransaction.BillingTransactionItems[index].ItemId == 0) {
        this.setFocusById('billRequest');
      } else {
        this.AddNewBillTxnItemRow(index);
      }
    } else {
      this.AddNewBillTxnItemRow(index);
    }
  }
  //common function to set focus on  given Element. 
  setFocusById(targetId: string, waitingTimeinMS: number = 10) {
    var timer = window.setTimeout(function () {
      let htmlObject = document.getElementById(targetId);
      if (htmlObject) {
        htmlObject.focus();
      }
      clearTimeout(timer);
    }, waitingTimeinMS);
  }

  public GetBillingRequestDisplaySettings() {
    var StrParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Billing" && a.ParameterName == "IPBillingRequestDisplaySettings");
    if (StrParam && StrParam.ParameterValue) {
      let currParam = JSON.parse(StrParam.ParameterValue);
      this.BillingRequestDisplaySettings = currParam;
    }
  }

  public OnLabTypeChange() {
    this.billingTransaction.LabTypeName = this.LabTypeName;
    this.FilterBillItems(0);

    if (this.LabTypeName) {
      if (localStorage.getItem('BillingSelectedLabTypeName')) {
        localStorage.removeItem('BillingSelectedLabTypeName');
      }
      localStorage.setItem('BillingSelectedLabTypeName', this.LabTypeName);
    } else {
      this.msgBoxServ.showMessage('error', ["Please select Lab Type Name."]);
    }
  }
}
