import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { PatientService } from '../../patients/shared/patient.service';

import { BillingBLService } from '../shared/billing.bl.service';
import { BillingService } from '../shared/billing.service';

import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { BillingTransactionItem } from "../shared/billing-transaction-item.model";
import { EmployeeCashTransaction } from '../shared/billing-transaction.model';
//to add danphe-grid in credit-details page:sudarshan 26Mar'17
import { CoreService } from '../../core/shared/core.service';
import { SecurityService } from '../../security/shared/security.service';
import { CreditOrganization } from '../../settings-new/shared/creditOrganization.model';
import { CallbackService } from '../../shared/callback.service';
import { DanpheHTTPResponse } from "../../shared/common-models";
import { CommonFunctions } from "../../shared/common.functions";
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { RouteFromService } from '../../shared/routefrom.service';
import { ENUM_DanpheHTTPResponses, ENUM_ModuleName } from '../../shared/shared-enums';
import { BillSettlementModel } from "../shared/bill-settlement.model";
import { PatientCreditInvoices_DTO } from '../shared/dto/bill-credit-invoice-details.dto';
import { BillNewSettlement_DTO } from '../shared/dto/bill-new-settlement.dto';
import { BillingPendingSettlement_DTO } from '../shared/dto/bill-pending-settlement.dto';

@Component({
  //selector: 'my-app',
  selector: 'bill-settlement-page',
  templateUrl: "./bill-settlements.html",
  styleUrls: ['./bill-settlements.component.css']
})

// App Component class
export class BillSettlementsComponent {

  public allPendingSettlements = Array<BillingPendingSettlement_DTO>();
  public patCrInvoicDetails = Array<PatientCreditInvoices_DTO>();

  public SettlementGridCols: Array<any> = null;

  public selectAllInvoices: boolean = false;

  @Input('showActionPanel')
  public showActionPanel: boolean = false;

  public selInvoicesTotAmount: number = 0;

  public model: BillSettlementModel = new BillSettlementModel();
  public settlementToDisplay: number = null;// new BillNewSettlement_DTO();

  public showReceipt: boolean = false;//to show hide settlement grid+action panel   OR  SettlementReceipt
  @Input('showGrid')
  public showGrid: boolean = true;
  @Input('FromBillingPage')
  public FromBillingPage: boolean = false;

  @Input('PatientIdForSettlement')
  public PatientIdForSettlement: number = null;
  public PatientDetailForSettlement = new BillingPendingSettlement_DTO();

  //to receive deposit,provisional,patient info from billinginfofor settlement.
  public DepositInfo: any = { "Deposit_In": 0, "Deposit_Out": 0, "Deposit_Balance": 0 };
  public ProvisionalInfo: any = { "ProvisionalTotal": 0 };
  public PatientInfo: any = null;
  public selectAll: boolean = true;
  public isSelected: boolean = true;
  public settelmentProceedEnable: boolean = true;
  public showInvoiceDetail: boolean = false;
  public discountGreaterThanPayable: boolean = false;
  public PayableAmount: number = 0;

  //sud: 13May'18--to display patient bill summary
  public patBillHistory = {
    IsLoaded: false,
    PatientId: null,
    CreditAmount: null,
    ProvisionalAmt: null,
    TotalDue: null,
    DepositBalance: null,
    BalanceAmount: null
  };

  public loading: boolean = false;
  public creditOrganizationsList: Array<CreditOrganization> = new Array<CreditOrganization>();
  public OrganizationId: number = null;
  public OrganizationName: any = "";
  public TempEmpCashTransactions: Array<EmployeeCashTransaction> = new Array<EmployeeCashTransaction>();
  PaymentPages: any[];

  public MstPaymentModes: any = [];
  public confirmationTitle: string = "Confirm !";
  public confirmationMessage: string = "Are you sure you want to proceed for Settlement ?";

  constructor(public billingService: BillingService,
    public router: Router,
    public routeFromService: RouteFromService,
    public billingBLService: BillingBLService,
    public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef,
    public callbackService: CallbackService,
    public patientService: PatientService,
    public messageBoxService: MessageboxService,
    public coreService: CoreService) {

    let counterId: number = this.securityService.getLoggedInCounter().CounterId;
    if (!counterId || counterId < 1) {
      this.callbackService.CallbackRoute = '/Billing/Settlements/BillSettlements';
    }
    else {
      this.SettlementGridCols = GridColumnSettings.BillSettlementBillSearch;
      this.creditOrganizationsList = this.billingService.AllCreditOrganizationsList && this.billingService.AllCreditOrganizationsList.filter(a => !a.IsClaimManagementApplicable);
      let orgObj = this.creditOrganizationsList.find(a => a.IsDefault == true);
      if (orgObj) {
        this.OrganizationId = orgObj.OrganizationId;
        this.OrganizationName = orgObj.OrganizationName;
      }
      this.OrganizationId && this.GetBillsForSettlement(this.OrganizationId);
      this.showGrid = true;
    }

  }

  ngOnInit() {
    if (this.routeFromService._routefrom == "/Billing/InpatBilling" || this.routeFromService._routefrom == "/Billing/BillingTransaction") {
      if (this.routeFromService.routeData.Action == "ShowSettlement") {
        this.PatientIdForSettlement = this.routeFromService.routeData.PatientId;
        this.FromBillingPage = true;
        this.OrganizationId && this.GetBillsForSettlement(this.OrganizationId);
      }
    }
    this.MstPaymentModes = this.coreService.masterPaymentModes;
    this.PaymentPages = this.coreService.paymentPages;
  }
  OrganizationBasedBillsForSettlement($event: any) {
    if ($event && $event.target.value) {
      this.OrganizationId = $event.target.value;
      let orgObj = this.creditOrganizationsList.find(a => a.OrganizationId == this.OrganizationId);
      this.OrganizationName = orgObj.OrganizationName;
      this.GetBillsForSettlement(this.OrganizationId);
    }
  }

  GetBillsForSettlement(organizationId: number) {
    this.allPendingSettlements = [];
    this.billingBLService.GetPendingBillsForSettlement(organizationId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.allPendingSettlements = res.Results;
          if (this.FromBillingPage && this.allPendingSettlements) {
            this.PatientDetailForSettlement = this.allPendingSettlements.find(a => a.PatientId == this.PatientIdForSettlement);
            if (this.PatientDetailForSettlement) {
              this.GetPatientCreditInvoices(this.PatientDetailForSettlement);
            }
          }
        }
      });
  }


  SettlementGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "showDetails":
        {
          var data = $event.Data;
          this.GetPatientCreditInvoices(data);
          //this.LoadPatientPastBillSummary(data.PatientId);
        }
        break;
      default:
        break;
    }
  }

  GetPatientCreditInvoices(row): void {
    this.loading = true;
    this.showGrid = false;
    this.showActionPanel = true;
    this.showReceipt = false;
    //patient mapping later used in receipt print
    let patient = this.patientService.CreateNewGlobal();
    patient.ShortName = row.PatientName;
    patient.PatientCode = row.PatientCode;
    patient.DateOfBirth = row.DateOfBirth;
    patient.Gender = row.Gender;
    patient.PatientId = row.PatientId;
    patient.PhoneNumber = row.PhoneNumber;

    this.billingBLService.GetBillingInfoOfPatientForSettlement(patient.PatientId, this.OrganizationId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.patCrInvoicDetails = res.Results.CreditInvoiceInfo;
          this.PatientInfo = res.Results.PatientInfo;
          this.DepositInfo = res.Results.DepositInfo;
          this.ProvisionalInfo = res.Results.ProvisionalInfo;
          if (this.ProvisionalInfo.ProvisionalTotal > 0) {
            this.settelmentProceedEnable = false;
            this.messageBoxService.showMessage("warning", ["There are few items in provisional list, please generate their invoices and proceed for settlement"]);
          } else {
            this.settelmentProceedEnable = true;
          }

          this.patCrInvoicDetails.forEach(a => {
            a.isSelected = true;
          })
          this.SelectAll();

          // this.patientService.globalPatient = res.Results.Patient;
          // this.patCrInvoicDetails.forEach(function (inv) {
          //   inv.Patient = res.Results.Patient;
          //   inv.CreatedOn = moment(inv.CreatedOn).format("YYYY-MM-DD HH:mm");
          //   //adding new field to manage checked/unchecked invoice.
          //   inv.IsSelected = false;
          // });
          this.patientService.globalPatient.ShortName = this.PatientInfo.PatientName;

          //by default selecting all items.
          this.selectAllInvoices = true;
          this.SelectAllChkOnChange();
          //this.CalculatePaidAmount();
          //this.LoadPatientPastBillSummary(this.patientService.globalPatient.PatientId, res.Results.IsPatientAdmitted);
          this.loading = false;
        }
        else {
          this.messageBoxService.showMessage("error", ["Couldn't fetch patient's credit details. Please try again later"], res.ErrorMessage);

        }
      });
  }

  public OnCheckboxChanged(indx) {
    let currentItem = this.patCrInvoicDetails[indx];
    if (currentItem) {
      this.CalculateTotalCredit(indx);
    }
    let selectedInvoices = this.patCrInvoicDetails.filter(a => a.isSelected == true);
    if (selectedInvoices.length > 0 && this.ProvisionalInfo.ProvisionalTotal <= 0) {
      this.settelmentProceedEnable = true;
    } else {
      this.settelmentProceedEnable = false;
    }

    if (this.patCrInvoicDetails.every(b => b.isSelected == true)) {
      this.selectAll = true;
    } else {
      this.selectAll = false;
    }

  }
  public CalculateTotalCredit(indx) {
    if (this.patCrInvoicDetails[indx].isSelected) {
      this.model.CollectionFromReceivable += this.patCrInvoicDetails[indx].NetAmount;
      this.CalculatePaidAmount();
    }
    else {
      this.model.CollectionFromReceivable -= this.patCrInvoicDetails[indx].NetAmount;
      this.CalculatePaidAmount();
    }
  }

  public SelectAll() {
    this.patCrInvoicDetails.forEach(a => {
      a.isSelected = true;
    })
    if (this.selectAll) {
      //this.settelmentProceedEnable = true;
      this.model.CollectionFromReceivable = this.patCrInvoicDetails.reduce(function (acc, itm) { return acc + itm.NetAmount; }, 0);
      this.CalculatePaidAmount();
    } else {
      this.patCrInvoicDetails.forEach(a => {
        a.isSelected = false;
      })
      // this.settelmentProceedEnable = false;
      this.model.CollectionFromReceivable = 0;
      this.CalculatePaidAmount();
    }
  }

  public CalculatePaidAmount() {

    //this.model.PaidAmount = this.model.CollectionFromReceivable - this.model.DiscountAmount - this.DepositInfo.Deposit_Balance;
    if (this.model.DiscountAmount < 0 || this.model.DiscountAmount > this.model.CollectionFromReceivable) {
      this.discountGreaterThanPayable = true;
      this.settelmentProceedEnable = false;
    } else {
      this.discountGreaterThanPayable = false;
      if (this.ProvisionalInfo.ProvisionalTotal <= 0) {
        if (this.patCrInvoicDetails.some(a => a.isSelected == true) || this.selectAll) {
          this.settelmentProceedEnable = true;
        } else {
          this.settelmentProceedEnable = false;
        }
      } else {
        this.settelmentProceedEnable = false;
      }
      this.model.PayableAmount = this.model.CollectionFromReceivable - this.model.DiscountAmount;
    }
    // this.model.PayableAmount = this.model.CollectionFromReceivable - this.model.DiscountAmount;
    if (this.model.PayableAmount >= this.DepositInfo.Deposit_Balance) {
      this.model.PaidAmount = this.model.PayableAmount - this.DepositInfo.Deposit_Balance;
      this.model.DepositDeducted = this.DepositInfo.Deposit_Balance ? this.DepositInfo.Deposit_Balance : 0;
      this.model.RefundableAmount = 0;
    } else {

      this.model.DepositDeducted = this.model.PayableAmount ? this.model.PayableAmount : 0;
      this.model.RefundableAmount = this.DepositInfo.Deposit_Balance - this.model.PayableAmount;
      this.model.PaidAmount = 0;
    }


  }
  public singleInvoiceBillingTransactionId: number = 0;
  public invoiceOf: string = "";
  public ShowInvoiceDetail(invoiceId: number): void {
    this.showInvoiceDetail = true;
    let singleInvoice = this.patCrInvoicDetails.find(a => a.TransactionId === invoiceId);
    this.invoiceOf = singleInvoice ? singleInvoice.InvoiceOf : "";
    this.singleInvoiceBillingTransactionId = singleInvoice.TransactionId;
  }

  public InvoiceDetailCallBack(event: any) {
    if (event) {
      if (event.close) {
        this.showInvoiceDetail = false;
      }
    }
  }

  BackToGrid() {
    this.showGrid = true;
    this.showActionPanel = false;
    this.showReceipt = false;
    if (this.FromBillingPage) {
      this.FromBillingPage = false;
      this.routeFromService._routefrom = "";
      this.routeFromService.routeData = "";
      this.router.navigate(['/Billing/SearchPatient']);
    }
    this.settlementToDisplay = null; //new BillNewSettlement_DTO()
    //reset current patient value on back button..
    this.patientService.CreateNewGlobal();
    this.patCrInvoicDetails = [];
    this.model = new BillSettlementModel();
    this.GetBillsForSettlement(this.OrganizationId);
    //this.TotalCredit = 0;
    this.selectAll = true;
  }


  SelectAllChkOnChange() {
    if (this.patCrInvoicDetails && this.patCrInvoicDetails.length) {
      if (this.selectAllInvoices) {
        this.patCrInvoicDetails.forEach(itm => {
          itm.isSelected = true;
        });
        this.showActionPanel = true;
      }
      else {
        this.patCrInvoicDetails.forEach(itm => {
          itm.isSelected = false;
        });
        this.showActionPanel = false;

      }

      //this.CalculateTotalAmt();
    }
  }

  //Sets the component's check-unchecked properties on click of Component-Level Checkbox.
  SelectItemChkOnChange(item: BillingTransactionItem) {

    //show action panel if any one of item is checked.
    if (this.patCrInvoicDetails.find(itm => itm.isSelected)) {
      this.showActionPanel = true;
    }
    else {
      this.showActionPanel = false;
    }

    if ((this.patCrInvoicDetails.every(a => a.isSelected === true))) {
      this.selectAllInvoices = true;
    }
    else {
      this.selectAllInvoices = false;
    }

    //this.CalculateTotalAmt();
  }

  // CalculateTotalAmt() {
  //   this.selInvoicesTotAmount = 0;
  //   this.patCrInvoicDetails.forEach(inv => {
  //     if (inv.isSelected) {
  //       this.selInvoicesTotAmount += inv.TotalAmount;
  //     }
  //   });
  //   this.selInvoicesTotAmount = CommonFunctions.parseAmount(this.selInvoicesTotAmount);
  // }

  PayProvisionalItems() {
    let patId = this.patientService.globalPatient.PatientId;

    this.billingBLService.GetProvisionalItemsByPatientId(patId)
      .subscribe(res => {
        let provItems = res.Results.CreditItems;

        //changed: 4May-anish
        let billingTransaction = this.billingService.CreateNewGlobalBillingTransaction();
        billingTransaction.PatientId = patId;

        provItems.forEach(bil => {
          let curBilTxnItm = BillingTransactionItem.GetClone(bil);
          billingTransaction.BillingTransactionItems.push(curBilTxnItm);

        });
        this.router.navigate(['/Billing/PayProvisional']);

      });
  }
  SettlePatientBills() {
    this.loading = true;
    if (this.CheckIsDiscountApplied()) {
      // this.model.BillingTransactions = this.patCrInvoicDetails;
      let settlementToPost = this.GetSettlementInvoiceFormatted();

      this.billingBLService.PostSettlementInvoice(settlementToPost)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            this.settlementToDisplay = res.Results;
            this.showReceipt = true;
            this.showActionPanel = false;
            this.loading = false;
          }
          else {
            this.messageBoxService.showMessage("failed", [res.ErrorMessage]);
            this.BackToGrid();
          }

        },
          err => {
            this.messageBoxService.showMessage("failed", [err.ErrorMessage]);
          }

        );
    }
    else {
      this.loading = false;
    }
  }

  CheckIsDiscountApplied(): boolean {
    if (this.model.IsDiscounted && !this.model.Remarks) {
      this.messageBoxService.showMessage('failed', ["Remarks is mandatory in case of discount."]);
      return false;
    }
    else
      return true;
  }

  GetSettlementInvoiceFormatted(): BillNewSettlement_DTO {
    let retSettlModel = new BillNewSettlement_DTO();
    retSettlModel.BillingTransactions = this.patCrInvoicDetails.filter(a => a.isSelected === true && a.InvoiceOf !== ENUM_ModuleName.Pharmacy);
    retSettlModel.PHRMInvoiceTransactionModels = this.patCrInvoicDetails.filter(a => a.isSelected === true && a.InvoiceOf === ENUM_ModuleName.Pharmacy);
    retSettlModel.PatientId = this.patientService.globalPatient.PatientId;
    retSettlModel.PayableAmount = this.model.PayableAmount;
    retSettlModel.RefundableAmount = this.model.RefundableAmount;
    retSettlModel.PaidAmount = this.model.PaidAmount;
    retSettlModel.ReturnedAmount = this.model.ReturnedAmount;
    retSettlModel.DepositDeducted = this.model.DepositDeducted;
    retSettlModel.DueAmount = this.model.DueAmount > 0 ? this.model.DueAmount : (-this.model.DueAmount);
    retSettlModel.PaymentMode = this.model.PaymentMode.toLowerCase() == 'others' ? 'cash' : this.model.PaymentMode.toLowerCase();
    retSettlModel.PaymentDetails = this.model.PaymentDetails;
    retSettlModel.CounterId = this.securityService.getLoggedInCounter().CounterId;
    retSettlModel.DiscountAmount = this.model.DiscountAmount;
    retSettlModel.Remarks = this.model.Remarks;
    retSettlModel.CollectionFromReceivable = this.model.CollectionFromReceivable;
    retSettlModel.OrganizationId = this.OrganizationId;

    //This condition is to push CashDiscountGiven into EmpCashTxn Table either it is coming from mutiple payment or default cash....
    if (retSettlModel.DiscountAmount) {
      let empCashTxn = new EmployeeCashTransaction();
      let obj = this.MstPaymentModes.find(a => a.PaymentSubCategoryName.toLowerCase() === "cash");
      empCashTxn.InAmount = retSettlModel.DiscountAmount;
      empCashTxn.ModuleName = "Billing";
      empCashTxn.OutAmount = 0;
      empCashTxn.Remarks = "";
      empCashTxn.PaymentModeSubCategoryId = obj.PaymentSubCategoryId;
      this.TempEmpCashTransactions.push(empCashTxn);
    }

    if (this.DepositInfo.Deposit_Balance) {

      //This condition gets satisfied for Deposit having less than payable and having refundable .. Multiple payment mode is not applicable here...
      if (this.model.PayableAmount <= this.DepositInfo.Deposit_Balance && this.model.RefundableAmount) {
        let empCashTxn = new EmployeeCashTransaction();
        let obj = this.MstPaymentModes.find(a => a.PaymentSubCategoryName.toLowerCase() === "deposit");
        empCashTxn.InAmount = retSettlModel.DepositDeducted;
        empCashTxn.ModuleName = "Billing";
        empCashTxn.OutAmount = 0;
        empCashTxn.Remarks = "paid from deposit";
        empCashTxn.PaymentModeSubCategoryId = obj.PaymentSubCategoryId;
        this.TempEmpCashTransactions.push(empCashTxn);
      }

      //This condition gets satisfied for Deposit having less than payable and having refundable .. Multiple payment mode is not applicable here...
      if (this.model.PayableAmount === this.DepositInfo.Deposit_Balance && this.model.RefundableAmount === 0) {
        let empCashTxn = new EmployeeCashTransaction();
        let obj = this.MstPaymentModes.find(a => a.PaymentSubCategoryName.toLowerCase() === "deposit");
        empCashTxn.InAmount = retSettlModel.DepositDeducted;
        empCashTxn.ModuleName = "Billing";
        empCashTxn.OutAmount = 0;
        empCashTxn.Remarks = "paid from deposit";
        empCashTxn.PaymentModeSubCategoryId = obj.PaymentSubCategoryId;
        this.TempEmpCashTransactions.push(empCashTxn);
      }

      //This condition satisfies when there is disocunt given and clearing credit bill directly from cash not using multiple payment mode option..
      if (retSettlModel.DiscountAmount && this.TempEmpCashTransactions.length == 1) {
        if (this.model.PayableAmount > this.DepositInfo.Deposit_Balance) {
          let empCashTxn = new EmployeeCashTransaction();
          let obj = this.MstPaymentModes.find(a => a.PaymentSubCategoryName.toLowerCase() === "cash");
          empCashTxn.InAmount = retSettlModel.PaidAmount;
          empCashTxn.ModuleName = "Billing";
          empCashTxn.OutAmount = 0;
          empCashTxn.Remarks = "";
          empCashTxn.PaymentModeSubCategoryId = obj.PaymentSubCategoryId;
          this.TempEmpCashTransactions.push(empCashTxn);

          let empCashTxn2 = new EmployeeCashTransaction();
          let obj2 = this.MstPaymentModes.find(a => a.PaymentSubCategoryName.toLowerCase() === "deposit");
          empCashTxn2.InAmount = retSettlModel.DepositDeducted;
          empCashTxn2.ModuleName = "Billing";
          empCashTxn2.OutAmount = 0;
          empCashTxn2.Remarks = "paid from deposit";
          empCashTxn2.PaymentModeSubCategoryId = obj2.PaymentSubCategoryId;
          this.TempEmpCashTransactions.push(empCashTxn2);
        }
      }
      // This condition is satisfied when Deposit is less than payable and directly tries to clear the bill using cash not from multiple payment mode..
      if (this.model.PayableAmount > this.DepositInfo.Deposit_Balance && !this.TempEmpCashTransactions.length) {
        let empCashTxn = new EmployeeCashTransaction();
        let obj = this.MstPaymentModes.find(a => a.PaymentSubCategoryName.toLowerCase() === "cash");
        empCashTxn.InAmount = retSettlModel.PaidAmount;
        empCashTxn.ModuleName = "Billing";
        empCashTxn.OutAmount = 0;
        empCashTxn.Remarks = "";
        empCashTxn.PaymentModeSubCategoryId = obj.PaymentSubCategoryId;
        this.TempEmpCashTransactions.push(empCashTxn);

        let empCashTxn2 = new EmployeeCashTransaction();
        let obj2 = this.MstPaymentModes.find(a => a.PaymentSubCategoryName.toLowerCase() === "deposit");
        empCashTxn2.InAmount = retSettlModel.DepositDeducted;
        empCashTxn2.ModuleName = "Billing";
        empCashTxn2.OutAmount = 0;
        empCashTxn2.Remarks = "paid from deposit";
        empCashTxn2.PaymentModeSubCategoryId = obj2.PaymentSubCategoryId;
        this.TempEmpCashTransactions.push(empCashTxn2);
      }
    }

    // This condition gets satisfied when There is disocunt given but there is no deposit available (not coming from multiple payment mode)
    if (retSettlModel.DiscountAmount && !this.DepositInfo.Deposit_Balance && this.TempEmpCashTransactions.length == 1) {
      let empCashTxn = new EmployeeCashTransaction();
      let obj = this.MstPaymentModes.find(a => a.PaymentSubCategoryName.toLowerCase() === "cash");
      empCashTxn.InAmount = retSettlModel.PaidAmount;
      empCashTxn.ModuleName = "Billing";
      empCashTxn.OutAmount = 0;
      empCashTxn.Remarks = "";
      empCashTxn.PaymentModeSubCategoryId = obj.PaymentSubCategoryId;
      this.TempEmpCashTransactions.push(empCashTxn);
    }

    // This condition is satisfied when there is no discount , deposit(not from multple payment mode..)
    if (!retSettlModel.DiscountAmount && !this.DepositInfo.Deposit_Balance && !this.TempEmpCashTransactions.length) {
      let empCashTxn = new EmployeeCashTransaction();
      let obj = this.MstPaymentModes.find(a => a.PaymentSubCategoryName.toLowerCase() === "cash");
      empCashTxn.InAmount = retSettlModel.PaidAmount;
      empCashTxn.ModuleName = "Billing";
      empCashTxn.OutAmount = 0;
      empCashTxn.Remarks = "";
      empCashTxn.PaymentModeSubCategoryId = obj.PaymentSubCategoryId;
      this.TempEmpCashTransactions.push(empCashTxn);
    }
    retSettlModel.empCashTransactionModel = this.TempEmpCashTransactions;

    //to make list of BillReturnIdsCSV (added by Krishna 22nd,NOV'21)
    this.patCrInvoicDetails.forEach(a => {
      a.ArrayOfBillReturnIds = new Array<number>();
      if (a.isSelected == true && a.BillReturnIdsCSV) {
        if (a.BillReturnIdsCSV.includes(',')) {
          let billReturnIds: any[] = a.BillReturnIdsCSV.toString().split(",");
          billReturnIds.map(a => {
            return parseInt(a);
          });
          a.ArrayOfBillReturnIds = billReturnIds;
        } else {
          a.ArrayOfBillReturnIds.push(+a.BillReturnIdsCSV);
        }
      }
    }
    );
    return retSettlModel;
  }

  OnPaymentModeChange() {

  }
  PaidAmountOnChange() {
    if (this.model.PayableAmount < this.model.PaidAmount) {
      this.model.ReturnedAmount = CommonFunctions.parseAmount(this.model.PaidAmount - this.model.PayableAmount);
      this.model.IsDiscounted = false;
      this.model.DiscountAmount = 0;
    }

    else if (this.model.PayableAmount > this.model.PaidAmount) {
      this.model.DiscountAmount = CommonFunctions.parseAmount(this.model.PayableAmount - this.model.PaidAmount);
      this.model.IsDiscounted = true;
      this.model.ReturnedAmount = 0;
    }
  }
  DiscountAmountOnChange() {
    this.model.PaidAmount = CommonFunctions.parseAmount(this.model.PayableAmount - this.model.DiscountAmount);
  }
  DiscountChkOnChange() {
    if (this.model.IsDiscounted) {
      this.model.DiscountAmount = this.model.DueAmount;
      this.model.DueAmount = 0;
    }
    else {
      this.model.DiscountAmount = 0;
      this.model.DueAmount = CommonFunctions.parseAmount(this.model.PayableAmount - this.model.PaidAmount);
    }
  }

  //this is called after event emmitted from settlement receipt
  OnReceiptClosed($event) {
    //write logic based on $event later on.. for now only close this..
    this.showReceipt = false;
    this.settlementToDisplay = null;// new BillNewSettlement_DTO();
    this.GetBillsForSettlement(this.OrganizationId);
    this.BackToGrid();
    this.changeDetector.detectChanges();

  }

  PaymentModeChanges($event) {
    this.model.PaymentMode = $event.PaymentMode.toLowerCase();
    this.model.PaymentDetails = $event.PaymentDetails;
  }

  MultiplePaymentCallBack($event) {
    if ($event && $event.MultiPaymentDetail && this.model.PaymentMode.toLocaleLowerCase() == 'others') {
      this.TempEmpCashTransactions = new Array<EmployeeCashTransaction>();
      this.TempEmpCashTransactions = $event.MultiPaymentDetail;
    } else {
      this.TempEmpCashTransactions = [];
    }
    this.model.PaymentDetails = $event.PaymentDetail;
  }

  handleConfirm() {
    this.loading = true;
    this.SettlePatientBills();
  }

  handleCancel() {
    this.loading = false;
  }

}


