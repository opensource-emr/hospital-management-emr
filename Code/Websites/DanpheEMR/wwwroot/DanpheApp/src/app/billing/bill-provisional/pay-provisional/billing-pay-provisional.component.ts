import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment/moment';
import { CurrentVisitContextVM } from '../../../appointments/shared/current-visit-context.model';
import { CoreService } from '../../../core/shared/core.service';
import { PatientService } from '../../../patients/shared/patient.service';
import { SecurityService } from '../../../security/shared/security.service';
import { CreditOrganization } from '../../../settings-new/shared/creditOrganization.model';
import { CallbackService } from '../../../shared/callback.service';
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { CommonFunctions } from '../../../shared/common.functions';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../../shared/routefrom.service';
import { ENUM_BillPaymentMode, ENUM_BillingStatus, ENUM_BillingType, ENUM_DanpheHTTPResponses, ENUM_InvoiceType, ENUM_MessageBox_Status, ENUM_ServiceBillingContext } from '../../../shared/shared-enums';
import { BillingInvoiceBlService } from '../../shared/billing-invoice.bl.service';
import { BillingTransactionItem } from "../../shared/billing-transaction-item.model";
import { BillingTransaction, EmployeeCashTransaction } from '../../shared/billing-transaction.model';
import { BillingBLService } from '../../shared/billing.bl.service';
import { BillingService } from '../../shared/billing.service';
import { SchemePriceCategory_DTO } from '../../shared/dto/scheme-pricecategory.dto';
//sud:5May'18--BackButtonDisable is not working as expected, correct and implement later
//import { BackButtonDisable } from "../../core/shared/backbutton-disable.service";

@Component({
  templateUrl: "./billing-pay-provisional.component.html"
})
// App Component class
export class BillingPayProvisionalComponent {
  public model: BillingTransaction = new BillingTransaction();
  public BillingTransactionItems: Array<BillingTransactionItem> = null;
  //public currencyUnit: string = null;
  loading: boolean = false;
  public checkDeductfromDeposit: boolean = false; //flag to check checkbox selected

  public creditOrganizationsList: Array<CreditOrganization> = new Array<CreditOrganization>();
  // public CreditOrganizationMandatory: boolean = false;

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

  public showInvoicePrintPage: boolean = false;//sud:16May'21--to print from same page.


  // public membershipSchemeParam = { ShowCommunity: false, IsMandatory: true };
  public MembershipTypeName: string = null;
  public memTypeSchemeId: number = null;
  public currMemDiscountPercent: number = 0;
  public DiscountPercentSchemeValid: boolean = true;
  public BillingRequestDisplaySettings: any = {
    "PriceCategory": false,
    "LabType": false,
    "AssignedToDr": false,
    "ReferredBy": false,
    "AddDeposit": false,
    "CopyEarlierInvoice": false,
    "SelectPackage": false,
    "EditPriceCategory": false,
    "ItemLevelDiscount": false
  };
  PaymentPages: any[];

  TempEmployeeCashTransaction: Array<EmployeeCashTransaction> = new Array<EmployeeCashTransaction>();
  MstPaymentModes: any;
  public EnableDiscountAmountField: boolean = false;
  public ShowItemLevelDiscount: boolean = false;
  public confirmationTitle: string = "Confirm !";
  public confirmationMessage: string = "Are you sure you want to Print Invoice ?";
  public SchemeId: number = null;
  public serviceBillingContext: string = ENUM_ServiceBillingContext.OpBilling;
  public SchemePriCeCategoryFromVisit: SchemePriceCategoryCustomType = { SchemeId: 0, PriceCategoryId: 0 };
  public IsCoPayment: boolean = false;
  public SchemePriceCategory: SchemePriceCategory_DTO = new SchemePriceCategory_DTO();
  public DisablePaymentModeDropDown: boolean = false;
  public DisableItemLevelDiscAmount: boolean = true;
  public DisableItemLevelDiscPercent: boolean = true;
  public ShowItemLevelDiscountAmountField: boolean = false;
  public DisableInvoiceDiscountAmount: boolean = true;
  public DisableInvoiceDiscountPercent: boolean = false;
  public EnableDiscountField: boolean = false; //Krishna, 27th,March'22 , To enable Discount Amount filed on invoice level as well as item level
  public currPatVisitContext: CurrentVisitContextVM = new CurrentVisitContextVM();
  public DischargeStatementId: number = null;
  public PatientId: number = null;
  public PatientVisitId: number = null;
  public ShowDischargeBill: boolean = false;
  public EnableShowOtherCurrency: boolean = false;
  public ShowOtherCurrency: boolean = false;
  public DisplayOtherCurrencyDetail: boolean = false;
  public ShowDischargeSlip: boolean = false;

  constructor(public billingService: BillingService,
    public routeFromService: RouteFromService,
    public router: Router,
    public callbackService: CallbackService,
    public BillingBLService: BillingBLService,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService,
    public patientService: PatientService,
    public changeDetector: ChangeDetectorRef,
    public coreService: CoreService,
    public billingInvoiceBlService: BillingInvoiceBlService) {
    //this.BackButton.DisableBackButton();
    //this.currencyUnit = this.billingService.currencyUnit;
    this.model = this.billingService.getGlobalBillingTransaction();
    this.GetBillingRequestDisplaySettings();
    this.model.CounterId = this.securityService.getLoggedInCounter().CounterId;
    if (!this.model.PatientId) {
      this.router.navigate(['/Billing/SearchPatient']);
    }
    else {
      let patientId = this.model.PatientId;
      this.SchemeId = this.model.BillingTransactionItems[0].DiscountSchemeId;
      this.LoadPatientPastBillSummary(patientId, this.SchemeId);
      // this.CalculationForAll();//check once more if we can use CalculationForAll for this.
      // this.LoadMembershipSettings();

      //assign default values to model and billingItems.
      this.model.PaymentMode = "cash";
      this.model.BillStatus = "paid";
      this.model.BillingTransactionItems.forEach(item => {
        item.BillStatus = ENUM_BillingStatus.paid;// "paid";
        item.DiscountPercentAgg = CommonFunctions.parseAmount(item.DiscountPercentAgg);//sud:12Mar'19--to round off disc. percent for display
      });

      if (!this.model.InvoiceType) {
        this.model.InvoiceType = ENUM_InvoiceType.outpatient;
      }
      this.creditOrganizationsList = this.billingService.AllCreditOrganizationsList;
      this.GetParameterToShowHideOtherCurrencyOption();
      // this.CreditOrganizationMandatory = this.coreService.LoadCreditOrganizationMandatory();//pratik: 26feb'20 --Credit Organization compulsoryor not while Payment Mode is credit
    }
  }

  GetParameterToShowHideOtherCurrencyOption(): void {
    const params = this.coreService.Parameters.find(a => a.ParameterGroupName === "Billing" && a.ParameterName === "ShowOtherCurrency");
    if (params) {
      this.EnableShowOtherCurrency = params.ParameterValue === "true" ? true : false;;
    } else {
      this.EnableShowOtherCurrency = false;
    }
  }

  //sud: 13May'18--to display patient's bill history
  LoadPatientPastBillSummary(patientId: number, schemeId: number) {
    this.BillingBLService.GetPatientPastBillSummary(patientId, schemeId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.patBillHistory = res.Results;
          //provisional amount should exclude itmes those are listed for payment in current window.
          this.patBillHistory.ProvisionalAmt = CommonFunctions.parseAmount(this.patBillHistory.ProvisionalAmt - this.model.TotalAmount);
          this.patBillHistory.TotalDue = CommonFunctions.parseAmount(this.patBillHistory.CreditAmount + this.patBillHistory.ProvisionalAmt);
          this.patBillHistory.BalanceAmount = CommonFunctions.parseAmount(this.patBillHistory.DepositBalance - this.patBillHistory.TotalDue);
          this.patBillHistory.IsLoaded = true;
          //this.currentDepositBalance = CommonFunctions.parseAmount(this.patBillHistory.DepositBalance);
          //this.newDepositBalance = CommonFunctions.parseAmount(this.patBillHistory.DepositBalance);
          this.patBillHistory.DepositBalance = CommonFunctions.parseAmount(this.patBillHistory.DepositBalance);
          this.currentDepositBalance = this.patBillHistory.DepositBalance;
          this.newDepositBalance = this.currentDepositBalance;
        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
          this.loading = false;
        }
      });
  }


  //sud:19May'21--needed to print invoice.
  public bil_InvoiceNo: number = 0;
  public bil_FiscalYrId: number = 0;
  public bil_BilTxnId: number = null;

  //updates the billing Transaction only after the amount paid by the patient
  PostBillingTransaction() {
    this.loading = true;

    if (this.model.DiscountPercent < 0 || this.model.DiscountPercent > 100) {
      this.msgBoxServ.showMessage("failed", ["Please enter valid Total Discount Percent."]);
      this.loading = false;
      return;
    }
    //this is to set final discount percent before going to the server,
    //earlier it was in modelchange event, and which was causing it to fire twice and hence wrong calculation. --sud:12Aug'17
    this.model.DiscountPercent = CommonFunctions.parseAmount(this.model.DiscountAmount * 100 / (this.model.SubTotal));

    if (this.CheckBillingValidations()) {
      //ashim: 26Aug2018: Moved to server side.
      //this.model.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      //this.model.CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");

      if (this.model.InvoiceType !== ENUM_InvoiceType.inpatientPartial) {//&& this.model.InvoiceType != ENUM_InvoiceType.inpatientDischarge
        this.model.TransactionType = ENUM_BillingType.outpatient;
      }
      else {
        this.model.TransactionType = ENUM_BillingType.inpatient;
      }

      if (this.model.Change >= 0) {

        this.model.PaidAmount = this.GetPaidAmount();//sud: 4june'18

        if (this.model.BillingTransactionItems.length > 0) {
          //to add taxable amount for current transaction.
          let totTaxableAmt: number = 0, totNonTaxableAmt: number = 0;
          this.model.BillingTransactionItems.forEach(bil => {
            totTaxableAmt += bil.TaxableAmount;
            totNonTaxableAmt += bil.NonTaxableAmount;
          });
          this.model.TaxableAmount = totTaxableAmt;
          this.model.NonTaxableAmount = totNonTaxableAmt;

          this.model.TaxId = this.billingService.taxId;

          this.model.MemberNo = this.currPatVisitContext.MemberNo;
          if (this.SchemePriceCategory.IsCreditApplicable) {
            const creditOrganization = this.billingService.AllCreditOrganizationsList.find(a => a.OrganizationId === this.model.OrganizationId);
            this.model.ClaimCode = (creditOrganization && creditOrganization.IsClaimCodeCompulsory) ? this.currPatVisitContext.ClaimCode : null;
          }

          if (this.model.OrganizationId) {
            let org = this.creditOrganizationsList.find(a => a.OrganizationId == this.model.OrganizationId);
            this.model.OrganizationName = org.OrganizationName
          }
          if (this.SchemePriceCategory.IsCoPayment && this.model.CoPayment_PaymentMode.toLowerCase() === ENUM_BillPaymentMode.credit.toLowerCase()) {
            this.model.PaymentMode = this.model.CoPayment_PaymentMode; //credit
          }
          if (this.model.PaymentMode.toLowerCase() !== ENUM_BillPaymentMode.credit.toLowerCase()) {
            this.model.EmployeeCashTransaction = this.TempEmployeeCashTransaction;
            this.model.PaymentMode = ENUM_BillPaymentMode.cash;
          }
          else {
            this.model.PaymentMode = ENUM_BillPaymentMode.credit;
          }

          if (this.model.IsCoPayment) {
            this.model.EmployeeCashTransaction = this.TempEmployeeCashTransaction;
          }

          this.model.SchemeId = this.SchemePriceCategory.SchemeId;
          if (this.billingService.IsProvisionalDischargeClearance) {
            this.model.TransactionType = ENUM_BillingType.inpatient;
            this.BillingBLService.PayProvisionalForProvisionalDischarge(this.model).subscribe((res: DanpheHTTPResponse) => {
              if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results) {
                console.log(res);
                this.DischargeStatementId = res.Results.DischargeStatementId;
                this.PatientId = res.Results.PatientId;
                this.PatientVisitId = res.Results.PatientVisitId;
                this.ShowDischargeSlip = false;
                this.showInvoicePrintPage = true;
                this.loading = false;
              } else {
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [`Something Went wrong, Cannot Clear Provisional Items!`]);
              }
            }, err => {
              console.error(err);
            });
          } else {
            this.BillingBLService.PayProvisional(this.model)
              .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status == "OK") {

                  this.bil_InvoiceNo = res.Results.InvoiceNo;
                  this.bil_FiscalYrId = res.Results.FiscalYearId;
                  this.bil_BilTxnId = res.Results.BillingTransactionId;
                  this.loading = false;//enables the submit button once all the calls are completed
                  this.showInvoicePrintPage = true;//sud:16May'21--To print from same page..

                  //this.CallBackPostBillTxn(res.Results);
                }
                else if (res.ErrorMessage.match(/Deposit Amount is Invalid/g)) {
                  this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
                  this.router.navigate(['/Billing/ProvisionalClearance']);
                }
                else {
                  this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["couldn't submit the request. please check the log for detail."], res.ErrorMessage);
                  this.loading = false;
                }
              },
                err => {
                  this.loading = false;
                  this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["couldn't submit the request. please check the log for detail."], err);
                });
          }
        }
        else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Sorry..! Unable to process empty receipt."]);
          this.loading = false;//enables the submit button once all the calls are completed
        }
      }
      else {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["The tender amount is less than the payable amount"]);
        this.loading = false;//enables the submit button once all the calls are completed
      }
    } else {
      this.loading = false;
    }
  }
  AfterDischargePrint(data): void {
    if (data.Close == "close") {
      this.showInvoicePrintPage = false;
    }
  }
  CheckBillingValidations(): boolean {
    let isFormValid = true;
    //show "Remarks is mandatory" if discount is filled but remarks is not added..
    if ((this.model.DiscountPercent && this.model.DiscountPercent > 0) && !this.model.Remarks) {
      this.msgBoxServ.showMessage("failed", ["Remarks is mandatory."]);
      this.loading = false;
      isFormValid = false;
    }

    if (this.model.PaymentMode == "credit") {
      if (!this.model.OrganizationId || this.model.OrganizationId == 0) {
        isFormValid = false;
        this.loading = false;
        this.msgBoxServ.showMessage("failed", ["Credit Organization is mandatory for credit bill"]);
      }
      else if (!this.model.Remarks) {
        isFormValid = false;
        this.loading = false;
        this.msgBoxServ.showMessage("failed", ["Remarks is mandatory for credit bill"]);
      }
    }
    if (!this.DiscountPercentSchemeValid) {
      isFormValid = false;
      this.msgBoxServ.showMessage("failed", ["Discount scheme is mandatory. Default is: General(0%)"]);
    }

    // if (this.MembershipTypeName.toLowerCase() == "general" && this.model.DiscountAmount) {
    //   isFormValid = false;
    //   this.msgBoxServ.showMessage("failed", ["To give Discount, Please select Scheme other than General(0%)"]);

    // }

    let validDiscounts = true;
    this.model.BillingTransactionItems.forEach(a => {
      if (a.DiscountAmount > a.SubTotal || a.DiscountAmount < 0) {
        isFormValid = false;
        validDiscounts = false;
      }
      if (a.DiscountPercent > 100) {
        isFormValid = false;
        validDiscounts = false;
      }
    });
    if (!validDiscounts) {
      this.msgBoxServ.showMessage("failed", ["Discount amount or discount percent is not valid"]);

    }

    return isFormValid;
  }


  //--------Calculation of the Form----------

  CalculationForAll() {
    this.model.SubTotal = 0;
    this.model.TotalQuantity = 0;
    let sum = 0;
    let subtotal = 0;
    let loopTax: number = 0;
    let calsubtotal: number = 0;
    let totalamount: number = 0;
    let totalTax: number = 0;
    let totaldiscount: number = 0;
    let coPayCashAmount: number = 0;
    let coPayCreditAmount: number = 0;
    this.model.BillingTransactionItems.forEach(item => {
      this.model.TotalQuantity += item.Quantity;
      subtotal = item.Quantity * item.Price;
      let DiscountedAmountTotal = (subtotal - (item.DiscountPercent / 100) * subtotal);
      loopTax = (item.TaxPercent * (DiscountedAmountTotal / 100));
      item.TotalAmount = CommonFunctions.parseAmount(DiscountedAmountTotal + item.Tax);
      item.TaxableAmount = item.IsTaxApplicable ? CommonFunctions.parseAmount(item.SubTotal - item.DiscountAmount) : 0;
      item.NonTaxableAmount = item.IsTaxApplicable ? 0 : CommonFunctions.parseAmount(item.SubTotal - item.DiscountAmount);
      totalTax = totalTax + loopTax;
      calsubtotal = calsubtotal + subtotal;
      this.model.DiscountPercent = 0;
      sum = sum + (item.Quantity * item.Price);
      totalamount = totalamount + item.TotalAmount;
      totaldiscount = totaldiscount + this.billingInvoiceBlService.CalculateAmountFromPercentage(item.DiscountPercent, subtotal);//totaldiscount + item.DiscountPercent * subtotal / 100;
      item.Price = CommonFunctions.parseAmount(item.Price);
      if (this.SchemePriceCategory.IsCoPayment) {
        coPayCashAmount += item.CoPaymentCashAmount;
        coPayCreditAmount += item.CoPaymentCreditAmount;
      }
    });

    this.model.SubTotal = CommonFunctions.parseAmount(calsubtotal);
    this.model.DiscountAmount = CommonFunctions.parseAmount(totaldiscount);
    this.model.TaxTotal = CommonFunctions.parseAmount(totalTax);
    this.model.TotalAmount = CommonFunctions.parseAmount(totalamount);
    this.model.ReceivedAmount = this.SchemePriceCategory.IsCoPayment ? CommonFunctions.parseAmount(coPayCashAmount) : this.model.TotalAmount;
    this.model.CoPaymentCreditAmount = CommonFunctions.parseAmount(coPayCreditAmount);
    this.model.DiscountPercent = CommonFunctions.parseAmount(this.billingInvoiceBlService.CalculatePercentage(this.model.DiscountAmount, this.model.SubTotal));//CommonFunctions.parseAmount(this.model.DiscountAmount * 100 / (this.model.SubTotal));
    this.model.Tender = this.model.ReceivedAmount;
    this.ChangeTenderAmount();
  }

  ChangeTenderAmount() {
    if (this.deductDeposit) {
      this.model.Change = CommonFunctions.parseAmount(this.model.Tender + this.depositDeductAmount - this.model.TotalAmount, 3);
    }
    else {
      this.model.Change = CommonFunctions.parseAmount(this.model.Tender - (this.model.ReceivedAmount), 3);
    }
  }


  ReCalculateInvoiceAmounts() {
    let overallSubTot = this.model.BillingTransactionItems.reduce(function (acc, itm) { return acc + itm.SubTotal; }, 0);

    this.model.SubTotal = CommonFunctions.parseAmount(overallSubTot);
    this.model.DiscountAmount = CommonFunctions.parseAmount((Number(this.model.SubTotal) * Number(this.model.DiscountPercent)) / 100);
    this.model.TotalAmount = CommonFunctions.parseAmount(overallSubTot - this.model.DiscountAmount);
    if (this.SchemePriceCategory && this.SchemePriceCategory.IsCoPayment) {
      this.model.ReceivedAmount = this.model.BillingTransactionItems.reduce((acc, itm) => { return acc + itm.CoPaymentCashAmount }, 0);
      this.model.CoPaymentCreditAmount = this.model.TotalAmount - this.model.ReceivedAmount;
    } else {
      this.model.ReceivedAmount = this.model.TotalAmount;
      this.model.CoPaymentCreditAmount = 0;
    }
    this.model.Tender = this.model.ReceivedAmount;
    //if(this.model.)

    this.ChangeTenderAmount();
  }

  // * This handles the Calculations after Discount Amount is changed at Invoice Level..
  InvoiceDiscountOnChange() {
    //Need to re-calculate aggregatediscounts of each item and Invoice amounts when Invoice Discount is changed.
    this.model.BillingTransactionItems.forEach(itm => {
      //itm.DiscountPercent = this.model.DiscountPercent ? this.model.DiscountPercent : 0;
      itm.DiscountPercentAgg = this.model.DiscountPercent ? this.model.DiscountPercent : 0;
      itm.DiscountPercent = this.model.DiscountPercent ? this.model.DiscountPercent : 0;
      itm.DiscountAmount = itm.SubTotal * itm.DiscountPercent / 100;
      itm.TotalAmount = itm.SubTotal - itm.DiscountAmount;
      itm.TaxableAmount = itm.IsTaxApplicable ? CommonFunctions.parseAmount(itm.TotalAmount) : 0;
      itm.NonTaxableAmount = itm.IsTaxApplicable ? 0 : CommonFunctions.parseAmount(itm.TotalAmount);
      //this.CalculateAggregateDiscountsOfItems(itm);
    });

    this.ReCalculateInvoiceAmounts();
  }

  //we need to set certain properties acc. to current payment mode.
  OnPaymentModeChange() {
    if (this.model.PaymentMode.toLowerCase() === ENUM_BillPaymentMode.credit.toLowerCase() && !this.model.IsCoPayment) {
      this.model.PaidAmount = 0;
      this.model.BillStatus = ENUM_BillingStatus.unpaid;
      this.model.PaidDate = null;
      this.model.PaidCounterId = null;//sud:29May'18
      this.model.Tender = 0;//tender is zero and is disabled in when credit
      //this.model.ReceivedAmount = 0;//received amount

      if (this.model.BillingTransactionItems) {
        this.model.BillingTransactionItems.forEach(txnItm => {
          txnItm.BillStatus = ENUM_BillingStatus.unpaid;// "unpaid";
          txnItm.PaidDate = null;
        });
      }
    }
    else {
      //this.model.Tender = this.model.TotalAmount;
      // this.model.ReceivedAmount = this.model.TotalAmount;
      this.model.BillStatus = ENUM_BillingStatus.paid;
      this.model.PaidDate = moment().format("YYYY-MM-DD HH:mm:ss");//default paiddate.
      this.model.PaidCounterId = this.securityService.getLoggedInCounter().CounterId;//sud:29May'18
      if (!this.SchemePriceCategory.IsCoPayment && this.model.CoPayment_PaymentMode.toLowerCase() !== ENUM_BillPaymentMode.credit.toLowerCase()) {
        this.model.OrganizationId = null;
        this.model.OrganizationName = null;
      }
      if (this.model.BillingTransactionItems) {
        this.model.BillingTransactionItems.forEach(txnItm => {
          txnItm.BillStatus = ENUM_BillingStatus.paid;// "paid";
          txnItm.PaidDate = moment().format("YYYY-MM-DD HH:mm:ss");
        });
      }

      if (this.TempEmployeeCashTransaction && !this.TempEmployeeCashTransaction.length && !this.deductDeposit) {
        let obj = this.MstPaymentModes.find(a => a.PaymentSubCategoryName.toLowerCase() == this.model.PaymentMode.toLocaleLowerCase());
        let empCashTxnObj = new EmployeeCashTransaction();
        empCashTxnObj.InAmount = this.model.TotalAmount;
        empCashTxnObj.OutAmount = 0;
        empCashTxnObj.PaymentModeSubCategoryId = obj.PaymentSubCategoryId;
        empCashTxnObj.ModuleName = "Billing";
        this.TempEmployeeCashTransaction.push(empCashTxnObj);
      }
      if (this.TempEmployeeCashTransaction && !this.TempEmployeeCashTransaction.length && this.deductDeposit) {
        let obj = this.MstPaymentModes.find(a => a.PaymentSubCategoryName.toLowerCase() == this.model.PaymentMode.toLocaleLowerCase());
        let empCashTxnObj = new EmployeeCashTransaction();
        empCashTxnObj.InAmount = this.model.DepositUsed;
        empCashTxnObj.OutAmount = 0;
        empCashTxnObj.PaymentModeSubCategoryId = obj.PaymentSubCategoryId;
        empCashTxnObj.ModuleName = "Billing";
        this.TempEmployeeCashTransaction.push(empCashTxnObj);

        if ((this.model.TotalAmount - this.model.DepositUsed) > 0) {
          let empCashTxnObj = new EmployeeCashTransaction();
          let obj = this.MstPaymentModes[0];
          empCashTxnObj.InAmount = this.model.TotalAmount - this.model.DepositUsed;
          empCashTxnObj.OutAmount = 0;
          empCashTxnObj.PaymentModeSubCategoryId = obj.PaymentSubCategoryId;
          empCashTxnObj.ModuleName = "Billing";
          this.TempEmployeeCashTransaction.push(empCashTxnObj);
        }
      }
    }
  }


  public deductDeposit: boolean = false;
  public currentDepositBalance: number = 0;
  public newDepositBalance: number = 0;
  public depositDeductAmount: number = 0;


  //Change the Checkbox value and call Calculation logic from here.
  DepositDeductCheckBoxChanged() {
    //toggle Checked-Unchecked of 'Deduct From Deposit Checkbox'
    //this.deductDeposit = !this.deductDeposit;
    this.checkDeductfromDeposit = true;
    this.CalculateDepositBalance();
  }


  CalculateDepositBalance() {
    if (this.deductDeposit) {
      if (this.currentDepositBalance > 0) {
        let patientId = this.model.PatientId;
        this.newDepositBalance = this.currentDepositBalance - this.model.TotalAmount;
        this.newDepositBalance = CommonFunctions.parseAmount(this.newDepositBalance);
        this.model.DepositAvailable = this.currentDepositBalance;
        if (this.newDepositBalance >= 0) {
          // this.depositDeductAmount = this.model.Tender;
          this.depositDeductAmount = this.model.ReceivedAmount; // krishna, 24th,Aug'22, ReceivedAmount is the cash to receive so Total Amount and received amount are same except for copayment.
          this.model.Tender = null;
          this.changeDetector.detectChanges();
          this.model.Tender = 0;
          this.model.Change = 0;
          // this.model.DepositUsed = this.model.TotalAmount;
          this.model.DepositUsed = this.model.ReceivedAmount; // krishna, 24th,Aug'22, ReceivedAmount is the cash to receive so Total Amount and received amount are same except for copayment.
          this.model.DepositBalance = this.newDepositBalance;
        }
        //newDepositBalance will be in negative if it comes to else.
        else {
          this.model.Tender = -(this.newDepositBalance);//Tender is set to positive value of newDepositBalance.
          this.depositDeductAmount = this.currentDepositBalance;//all deposit has been returned.
          this.newDepositBalance = 0;//reset newDepositBalance since it's all Used NOW.
          this.model.Change = 0;//Reset Change since we've reset Tender above.
          this.model.DepositUsed = this.currentDepositBalance;//all current balance is used.
          this.model.DepositBalance = 0;//all balance is already used, so balance will be ZERO.
        }
        //this.routeFromService.RouteFrom = "DepositDeductpart";        //ramavtar: 24Oct'18
      }
      else {
        this.model.DepositReturnAmount = 0
        this.model.DepositUsed = 0;
        this.model.DepositAvailable = 0;
        this.model.DepositBalance = 0;
        this.msgBoxServ.showMessage("failed", ["Deposit balance is zero, Please add deposit to use this feature."]);
        this.deductDeposit = !this.deductDeposit;
      }
    }
    else {
      //reset all required properties..
      if (this.model.InvoiceType != ENUM_InvoiceType.inpatientPartial) {//&& this.model.InvoiceType != ENUM_InvoiceType.inpatientDischarge
        this.model.TransactionType = ENUM_BillingType.outpatient;
      }
      else {
        this.model.TransactionType = ENUM_BillingType.inpatient;
      }
      if (this.SchemePriceCategory && this.SchemePriceCategory.IsCoPayment) {
        this.model.Tender = this.model.ReceivedAmount;
      } else {
        if (this.model.PaymentMode.toLowerCase() === ENUM_BillPaymentMode.credit.toLowerCase()) {
          this.model.Tender = 0;
        } else {
          this.model.Tender = this.model.TotalAmount;//sud:6Feb'20--for CMH
        }
      }
      this.newDepositBalance = 0;
      this.depositDeductAmount = 0;
      this.model.DepositReturnAmount = 0;
      this.model.Change = 0;
      this.routeFromService.RouteFrom = ""; // while clicking the checkbox route from "DepositDeductpart" is assigning which must be initialize again to control the data to inserrt on the deposit table
    }
  }

  //sud: 4June'18-- needed this function since there are lot of ifs and where for this calculation.
  GetPaidAmount(): number {
    let paidAmt = 0;
    if (this.model.PaymentMode === ENUM_BillPaymentMode.credit) {
      paidAmt = 0;
    }
    else {
      paidAmt = this.model.Tender - this.model.Change;
    }
    return paidAmt;
  }

  PaymentModeChanges($event) {
    this.model.PaymentMode = $event.PaymentMode.toLowerCase();
    this.model.PaymentDetails = $event.PaymentDetails;

    this.OnPaymentModeChange();
  }

  CreditOrganizationChanges($event) {
    this.model.OrganizationId = $event.OrganizationId;
    this.model.OrganizationName = $event.OrganizationName;
  }

  //sud:16May'21--Moving Invoice Printing as Popup
  public CloseInvoicePrint() {
    this.showInvoicePrintPage = false;
    this.model = this.billingService.getGlobalBillingTransaction();
    this.router.navigate(["/Billing/SearchPatient"]);
  }

  // public LoadMembershipSettings() {
  //   var currParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Billing" && a.ParameterName == "MembershipSchemeSettings");
  //   if (currParam && currParam.ParameterValue) {
  //     this.membershipSchemeParam = JSON.parse(currParam.ParameterValue);
  //   }
  // }
  ngOnInit() {
    if (this.model.BillingTransactionItems[0].DiscountSchemeId > 0) {
      // this.SchemePriCeCategoryFromVisit.SchemeId = this.model.BillingTransactionItems[0].DiscountSchemeId;
      // this.SchemePriCeCategoryFromVisit.PriceCategoryId = this.model.BillingTransactionItems[0].PriceCategoryId;
      this.IsCoPayment = this.model.BillingTransactionItems.some(a => a.IsCoPayment);
      //this.memTypeSchemeId = this.model.BillingTransactionItems[0].DiscountSchemeId;`
    }
    if (this.model.BillingTransactionItems[0].PatientVisitId) {
      const patientId = this.model.BillingTransactionItems[0].PatientId;
      const patientVisitId = this.model.BillingTransactionItems[0].PatientVisitId;
      this.GetVisitContext(patientId, patientVisitId);
    }
    this.MstPaymentModes = this.coreService.masterPaymentModes;
    this.PaymentPages = this.coreService.paymentPages;

    // this.ReCalculateInvoiceAmounts();
  }

  public GetVisitContext(patientId: number, patientVisitId: number): void {
    if (patientId && patientVisitId) {
      this.BillingBLService.GetPatientVisitContextForProvisionalPayment(patientId, patientVisitId)
        .subscribe(res => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results) {
            this.currPatVisitContext = res.Results;
            this.model.PatientVisitId = this.currPatVisitContext.PatientVisitId;
            this.SchemePriCeCategoryFromVisit.SchemeId = this.currPatVisitContext.SchemeId;
            this.SchemePriCeCategoryFromVisit.PriceCategoryId = this.currPatVisitContext.PriceCategoryId;
          }
          else {
            console.log(ENUM_DanpheHTTPResponses.Failed, ["Problem! Cannot get the Current Visit Context ! "])
          }
        },
          err => { console.log(err.ErrorMessage); });
    }
  }

  // OnMembershipTypeChanged($event: MembershipType) {

  //   if (!$event) {
  //     this.DiscountPercentSchemeValid = false;
  //     this.memTypeSchemeId = null;
  //     this.currMemDiscountPercent = 0;
  //     //   this.model.Remarks = null;
  //     //   //return;
  //   }
  //   else {

  //     this.memTypeSchemeId = $event.MembershipTypeId;
  //     this.DiscountPercentSchemeValid = true;
  //     this.currMemDiscountPercent = $event.DiscountPercent;
  //     this.MembershipTypeName = $event.MembershipTypeName;
  //     //this.model.DiscountPercent = this.currMemDiscountPercent; // ! Commenting this to test the dependency of scheme in invoice level..
  //     //this.ReCalculateInvoiceAmounts();
  //     this.model.BillingTransactionItems.forEach(a => {
  //       a.DiscountSchemeId = this.memTypeSchemeId;
  //       //a.DiscountPercent = this.currMemDiscountPercent;
  //     });
  //   }
  // }
  public GetBillingRequestDisplaySettings() {
    var StrParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Billing" && a.ParameterName == "OPBillingRequestDisplaySettings");
    if (StrParam && StrParam.ParameterValue) {
      let currParam = JSON.parse(StrParam.ParameterValue);
      this.BillingRequestDisplaySettings = currParam;
    }
  }
  public MultiplePaymentCallBack($event: any) {
    if ($event && $event.MultiPaymentDetail) {
      this.TempEmployeeCashTransaction = new Array<EmployeeCashTransaction>();
      this.TempEmployeeCashTransaction = $event.MultiPaymentDetail;
      var isDepositUsed = this.TempEmployeeCashTransaction.find(a => a.PaymentSubCategoryName.toLocaleLowerCase() === 'deposit');
      if (isDepositUsed) {
        this.deductDeposit = true;
        this.CalculateDepositBalance();
      }
      else {
        this.deductDeposit = false;
        this.CalculateDepositBalance();
      }
    }
    this.model.PaymentDetails = $event.PaymentDetail;
  }


  // * This handles the Calculations after Discount Percent is changed at Item Level..
  ItemDiscountPercentChanged(index: number) {
    this.model.BillingTransactionItems[index].DiscountAmount = this.model.BillingTransactionItems[index].SubTotal * this.model.BillingTransactionItems[index].DiscountPercent / 100;
    this.model.BillingTransactionItems[index].TotalAmount = this.model.BillingTransactionItems[index].SubTotal - this.model.BillingTransactionItems[index].DiscountAmount;

    //reduce function usage: acc -> accumulator, initial value=0, itm -> loop variable (BillingTransactionItem in below case).
    let overallSubTot = this.model.BillingTransactionItems.reduce(function (acc, itm) { return acc + itm.SubTotal; }, 0);
    let overallTotal = this.model.BillingTransactionItems.reduce(function (acc, itm) { return acc + itm.TotalAmount; }, 0);
    if (overallSubTot > overallTotal)
      this.model.DiscountPercent = ((overallSubTot - overallTotal) / overallSubTot) * 100;
    this.ReCalculateInvoiceAmounts();
  }

  // * This handles the Calculations after Discount Amount is changed at Item Level..
  ItemDiscountAmountChanged(index: number) {

    this.model.BillingTransactionItems[index].DiscountPercent = Number(((this.model.BillingTransactionItems[index].DiscountAmount / this.model.BillingTransactionItems[index].SubTotal) * 100).toFixed(4));
    this.model.BillingTransactionItems[index].TotalAmount = this.model.BillingTransactionItems[index].SubTotal - this.model.BillingTransactionItems[index].DiscountAmount;

    //reduce function usage: acc -> accumulator, initial value=0, itm -> loop variable (BillingTransactionItem in below case).
    let overallSubTot = this.model.BillingTransactionItems.reduce(function (acc, itm) { return acc + itm.SubTotal; }, 0);
    let overallTotal = this.model.BillingTransactionItems.reduce(function (acc, itm) { return acc + itm.TotalAmount; }, 0);
    if (overallSubTot > overallTotal)
      this.model.DiscountPercent = ((overallSubTot - overallTotal) / overallSubTot) * 100;
    this.ReCalculateInvoiceAmounts();
  }

  // * This handles the Calculations after Discount Amount is changed at Invoice Level..
  InvoiceDiscountAmountChanged() {
    this.model.DiscountPercent = (this.model.DiscountAmount / this.model.SubTotal) * 100;
    //Need to re-calculate aggregatediscounts of each item and Invoice amounts when Invoice Discount is changed.
    this.model.BillingTransactionItems.forEach(itm => {
      itm.DiscountPercentAgg = this.model.DiscountPercent ? this.model.DiscountPercent : 0;
      itm.DiscountPercent = this.model.DiscountPercent ? this.model.DiscountPercent : 0;
      itm.DiscountAmount = itm.SubTotal * itm.DiscountPercent / 100;
      itm.TotalAmount = itm.SubTotal - itm.DiscountAmount;
    });
    this.ReCalculateInvoiceAmounts();
  }

  handleConfirm() {
    this.loading = true;
    this.PostBillingTransaction();
  }

  handleCancel() {
    this.loading = false;
  }

  public ItemLevelDiscountChkBoxOnChange() {
    if (this.SchemePriceCategory.IsDiscountApplicable && this.SchemePriceCategory.IsDiscountEditable) {
      if (this.ShowItemLevelDiscount && this.EnableDiscountField) {
        this.ShowItemLevelDiscountAmountField = true;
        this.DisableItemLevelDiscPercent = true;
        this.DisableItemLevelDiscAmount = false;
        this.DisableInvoiceDiscountAmount = true;
        this.DisableInvoiceDiscountPercent = true;
      } else if (this.ShowItemLevelDiscount) {
        this.ShowItemLevelDiscountAmountField = false;
        this.DisableItemLevelDiscPercent = false;
        this.DisableItemLevelDiscAmount = true;
        this.DisableInvoiceDiscountAmount = true;
        this.DisableInvoiceDiscountPercent = true;
      } else if (this.EnableDiscountField) {
        this.ShowItemLevelDiscountAmountField = false;
        this.DisableItemLevelDiscPercent = true;
        this.DisableItemLevelDiscAmount = true;
        this.DisableInvoiceDiscountAmount = false;
        this.DisableInvoiceDiscountPercent = true;
      } else {
        this.ShowItemLevelDiscountAmountField = false;
        this.DisableItemLevelDiscPercent = true;
        this.DisableItemLevelDiscAmount = true;
        this.DisableInvoiceDiscountAmount = true;
        this.DisableInvoiceDiscountPercent = false;
      }
      this.changeDetector.detectChanges();
    }
  }

  // * This handles the Enable Discount Amount checkbox actions.. Krishna,27th'March'22
  EnableDiscountAmount() {
    if (this.SchemePriceCategory.IsDiscountApplicable && this.SchemePriceCategory.IsDiscountEditable) {
      if (this.EnableDiscountField && this.ShowItemLevelDiscount) {
        this.ShowItemLevelDiscountAmountField = true;
        this.DisableItemLevelDiscPercent = true;
        this.DisableItemLevelDiscAmount = false;
        this.DisableInvoiceDiscountAmount = true;
        this.DisableInvoiceDiscountPercent = true;
      } else if (this.EnableDiscountField) {
        this.ShowItemLevelDiscountAmountField = false;
        this.DisableItemLevelDiscPercent = true;
        this.DisableItemLevelDiscAmount = true;
        this.DisableInvoiceDiscountAmount = false;
        this.DisableInvoiceDiscountPercent = true;
      } else if (this.ShowItemLevelDiscount) {
        this.ShowItemLevelDiscountAmountField = false;
        this.DisableItemLevelDiscPercent = false;
        this.DisableItemLevelDiscAmount = true;
        this.DisableInvoiceDiscountAmount = true;
        this.DisableInvoiceDiscountPercent = true;
      } else {
        this.ShowItemLevelDiscountAmountField = false;
        this.DisableItemLevelDiscPercent = true;
        this.DisableItemLevelDiscAmount = true;
        this.DisableInvoiceDiscountAmount = true;
        this.DisableInvoiceDiscountPercent = false;
      }
    }
    this.changeDetector.detectChanges();
  }

  OnSchemePriceCategoryChanged($event: SchemePriceCategory_DTO): void {
    if ($event.SchemeId && $event.PriceCategoryId) {
      this.SchemePriceCategory = $event;
      if (this.SchemePriceCategory.IsCreditOnlyScheme && !this.SchemePriceCategory.IsCoPayment) {
        this.DisablePaymentModeDropDown = true;
      } else {
        this.DisablePaymentModeDropDown = false;
      }

      this.model.IsCoPayment = this.SchemePriceCategory.IsCoPayment;
      if (this.SchemePriceCategory.IsCoPayment) {
        this.model.PaymentMode = ENUM_BillPaymentMode.credit;
        this.model.CoPayment_PaymentMode = ENUM_BillPaymentMode.credit;
      }
      this.DisableInvoiceDiscountPercent = (this.SchemePriceCategory.IsDiscountApplicable && this.SchemePriceCategory.IsDiscountEditable) ? false : true;
      this.changeDetector.detectChanges();
      this.model.Remarks = this.SchemePriceCategory.SchemeName;
      this.CalculationForAll();
    }
  }

  // OnSchemeChanged($event: BillingScheme_DTO): void {
  //   if($event && $event.SchemeId){

  //   }
  // }


  ShowOtherCurrencyCheckBoxChanged(): void {
    if (this.ShowOtherCurrency) {
      this.DisplayOtherCurrencyDetail = true;
    } else {
      this.DisplayOtherCurrencyDetail = false;
      this.model.OtherCurrencyDetail = null;
    }
  }
  public OtherCurrencyDetail: OtherCurrencyDetail;
  OtherCurrencyCalculationCallback($event): void {
    if ($event && $event.ExchangeRate > 0) {
      this.OtherCurrencyDetail = $event;
    } else {
      this.OtherCurrencyDetail = null;
    }
    this.model.OtherCurrencyDetail = JSON.stringify(this.OtherCurrencyDetail);
  }
}
