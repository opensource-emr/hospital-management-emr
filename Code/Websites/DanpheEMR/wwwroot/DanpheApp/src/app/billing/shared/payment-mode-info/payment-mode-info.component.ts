import { Component, EventEmitter, Input, Output } from "@angular/core";
import * as _ from 'lodash';
import { CoreService } from "../../../core/shared/core.service";
import { DispensaryService } from "../../../dispensary/shared/dispensary.service";
import { PaymentModes } from "../../../settings-new/shared/PaymentMode";
import { CreditOrganization } from "../../../settings-new/shared/creditOrganization.model";
import { CommonFunctions } from "../../../shared/common.functions";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_BillPaymentMode } from "../../../shared/shared-enums";
import { EmployeeCashTransaction } from "../billing-transaction.model";
import { BillingService } from "../billing.service";

@Component({
  selector: "payment-mode-info",
  templateUrl: "./payment-mode-info.html"
})

export class PaymentModeInfoComponent {
  @Input("show-deduct-from-deposit")
  showDeductFromDeposit: boolean = false;

  @Input("deposit-balance")
  public set depositBalance(val: any) {
    let temp = val;
    if (temp != this.DepositBalance) {
      this.DepositBalance = temp;
      this.Close();
    }
  }
  DepositBalance: number = 0;

  @Input("transaction-type")
  public set DepositTypeValue(val: any) {
    let temp = val;
    if (temp.toLocaleLowerCase() != this.TransactionType.toLocaleLowerCase()) {
      this.TransactionType = temp;
      this.Close();
    }
  }
  public TransactionType: any = 'Deposit';

  @Input("total-amount")
  public set totalAmount(val: any) {
    let data = val;
    if (data != this.TotalAmount) {
      this.TotalAmount = data;
      this.Close();
    }
  }
  public TotalAmount: number = 0;

  @Input("actual-total-amount-to-compare-only")
  public set actualTotalAmount(val: number) {
    let data = val;
    if (data != this.ActualTotalAmountToCompareOnly) {
      this.ActualTotalAmountToCompareOnly = data;
      this.Close();
    }
  }
  public ActualTotalAmountToCompareOnly: number = 0;

  @Input('disable-paymentMode-dropdown')
  public disablePaymentModeDropDown: boolean = false;

  @Input("isGovernmentInsurance")
  public set InsuranceStatus(val: any) {
    let data = val;
    this.isGovInsurance = data != null ? data : false;
    if (data == false) {
      this.Close();
    }
    else {
      this.Initialize();
      this.ResetToCredit();
    }
  }
  public isGovInsurance: boolean = false;

  @Input("page-name")
  public PageName: string = 'OPBilling';
  //@Input("page-info")
  public PageInfo = {
    PaymentPageId: 1,
    ModuleName: "Billing",
    PageName: "OPBilling"
  };

  @Input("deduct-deposit-change")
  public set DeductFromDepositChange(val: any) {
    let flag = val;
    if (flag != this.DeductFromDepositChangeEvent) {
      this.Close();
    }
    this.DeductFromDepositChangeEvent = flag;
  }

  @Input("is-coPayment")
  public IsCoPayment: boolean = false;

  @Input("is-allAmountPaidByPatient")
  public IsAllAmountPaidByPatient: boolean = false;

  @Input("default-credit-organization")
  public set SetDefaultCreditOrganization(OrganizationId: number) {
    if (OrganizationId !== this.selectedCreditOrganizationId) {
      this.selectedCreditOrganizationId = OrganizationId;
      this.OnCreditOrganizationChange();
    }
  }
  public defaultCreditOrganization: number = 0;

  @Input("membershipTypeName")
  public membershipTypeName: string;

  @Input("default-payment-mode")
  public set SetDefaultPaymentMode(defaultPaymentMode: string) {
    if (this.PaymentMode !== defaultPaymentMode) {
      this.PaymentMode = defaultPaymentMode;
      this.OnPaymentModeChange();
    }
  }

  @Input("is-credit-only-scheme")
  public isCreditOnlyScheme: boolean = false;
  //public DefaultPaymentMode: string = ENUM_BillPaymentMode.cash;


  @Output("on-paymentMode-change")
  onPaymentModeChange: EventEmitter<object> = new EventEmitter<object>();

  @Output("on-creditOrganization-change")
  onCreditOrganizationChange: EventEmitter<object> = new EventEmitter<object>();

  @Output("on-multiple-paymentMode")
  PaymentModeChange: EventEmitter<object> = new EventEmitter<object>();

  public PaymentMode: string = ENUM_BillPaymentMode.cash;
  public PaymentDetails: string = '';
  // public CreditOrganizationMandatory: boolean = false;
  public CreditOrganization = { OrganizationId: 0, OrganizationName: '' };
  public creditOrganizationsList: Array<CreditOrganization> = new Array<CreditOrganization>();

  public deductDeposit: boolean = false;
  public newDepositBalance: number = 0;
  public depositDeductAmount: number = 0;
  public AllPaymentModeList: Array<PaymentModes> = new Array<PaymentModes>();
  public FilteredMajorPaymentMode: Array<PaymentModes> = new Array<PaymentModes>();
  public FilterdSubPaymentMode: Array<PaymentModes> = new Array<PaymentModes>();
  public SubCategoryWisePaymentDetail: Array<EmployeeCashTransaction> = new Array<EmployeeCashTransaction>();
  public PaymentModeSettings: any;
  public MultipaymentPopUp: boolean = false;
  public RemainingAmount: number = 0;
  public loading: boolean = false;
  public PayableAmount: number = 0;
  public DeductFromDepositChangeEvent: boolean = false;
  //public selectAll: boolean = false;
  public DisableDepositCheckbox: boolean = false;

  public selectedCreditOrganizationId: number = null;
  public creditPaymentMode: string = ENUM_BillPaymentMode.credit;

  constructor(public coreService: CoreService,
    public msgBoxServ: MessageboxService,
    public billingService: BillingService,
    public dispensaryService: DispensaryService) {

    // this.CreditOrganizationMandatory = this.coreService.LoadCreditOrganizationMandatory();//pratik: 26feb'20 --Credit Organization compulsory or not while Payment Mode is credit
    // this.creditOrganizationsList = _.cloneDeep(this.billingService.AllCreditOrganizationsList);//sud:2May'20--Code Optimization..
  }
  ngOnChanges() {
    if (this.IsCoPayment && this.PaymentMode.toLowerCase() === ENUM_BillPaymentMode.credit.toLowerCase()) {
      this.FilteredMajorPaymentMode = this.FilteredMajorPaymentMode.filter(a => a.PaymentSubCategoryName.toLowerCase() !== ENUM_BillPaymentMode.credit.toLowerCase());
      this.PaymentMode = "Cash"; //! This is hardcoded here
    } else if (this.isCreditOnlyScheme && !this.IsCoPayment) {
      this.PaymentMode = "Credit"; //! This is hardcoded here
      this.Initialize();
      this.OnPaymentModeChange();
    } else if (this.PaymentMode.toLowerCase() !== ENUM_BillPaymentMode.credit.toLowerCase()) {
      this.Initialize();
    }
  }

  ngOnInit() {
    this.Initialize();
    this.onPaymentModeChange.emit({ PaymentMode: this.PaymentMode.toLowerCase() });
    if (this.isGovInsurance == false) {
      this.ResetPaymentDetailToCash();
    }
    else {
      this.ResetToCredit();
    }
  }

  ngOnDestroy() {
    this.FilterdSubPaymentMode.forEach(a => {
      a.Amount = 0;
      a.IsSelected = false;
    });
  }

  Initialize() {
    this.FilterdSubPaymentMode = new Array<PaymentModes>();
    this.FilteredMajorPaymentMode = new Array<PaymentModes>();
    // if (this.PageName == 'NewSale' || this.PageName == 'ProvisionalSale') {   //for pharmacy new sale/provisional sale.
    //   this.creditOrganizationsList = _.cloneDeep(this.dispensaryService.AllCreditOrganizationsList);
    // }
    // else {
    this.creditOrganizationsList = _.cloneDeep(this.billingService.AllCreditOrganizationsList);//sud:2May'20--Code Optimization..
    // }
    this.AllPaymentModeList = _.cloneDeep(this.coreService.masterPaymentModes);
    this.PageInfo = _.cloneDeep(this.coreService.paymentPages.find(a => a.PageName.toLowerCase() === this.PageName.toLowerCase()));
    this.PaymentModeSettings = _.cloneDeep(this.coreService.paymentModeSettings.filter(a => a.PaymentPageId == this.PageInfo.PaymentPageId));
    //this.PaymentModeSettings = _.cloneDeep(this.coreService.paymentModeSettings.find(a => a.PaymentPageId == this.PageInfo.PaymentPageId));
    if (this.TransactionType.toLocaleLowerCase() == 'returndeposit' && this.PageInfo.PageName.toLocaleLowerCase() == "billingdeposit") {
      let obj = this.coreService.paymentPages.find(a => a.ModuleName.toLocaleLowerCase() === 'billing' && a.PageName.toLocaleLowerCase() === 'billingdepositreturn')
      this.PaymentModeSettings = this.coreService.paymentModeSettings.filter(a => a.PaymentPageId == obj.PaymentPageId);
    }
    //var data = JSON.parse(this.PaymentModeSettings.PaymentModeSettingsValue);
    let temp = this.PaymentModeSettings.sort((a, b) => a.DisplaySequence - b.DisplaySequence);

    //We will try to optimize this nested loop later, if possible //Krishna, 8th FEB'22
    for (let i = 0; i < temp.length; i++) {
      for (let j = 0; j < this.AllPaymentModeList.length; j++) {
        if (temp[i].PaymentModeSubCategoryId === this.AllPaymentModeList[j].PaymentSubCategoryId && temp[i].IsActive) {
          this.FilteredMajorPaymentMode.push(this.AllPaymentModeList[j]);
          break;
        }
      }
    }

    this.FilteredMajorPaymentMode.map(a => {
      let obj = temp.find(b => b.PaymentModeSubCategoryId === a.PaymentSubCategoryId)
      a.ShowPaymentDetails = obj.ShowPaymentDetails;
      a.IsRemarksMandatory = obj.IsRemarksMandatory;
    }); //Krishna, 8th FEB'22, Doing this to map ShowPaymentDetails to the array we are emiting to the parent.....
    // if(this.PageInfo.PageName.toLowerCase() === "settlements")
    // this.FilteredMajorPaymentMode =  this.FilteredMajorPaymentMode.filter(a => a.PaymentSubCategoryName.toLocaleLowerCase() == "cash" || a.PaymentSubCategoryName.toLocaleLowerCase()=="others");

    if (((!this.isCreditOnlyScheme && !this.IsCoPayment) && (this.PageInfo.PageName.toLocaleLowerCase() == "ipbilling") || (this.PageInfo.PageName.toLocaleLowerCase() === "settlements")) && (this.DepositBalance >= this.ActualTotalAmountToCompareOnly))
      this.FilteredMajorPaymentMode = this.FilteredMajorPaymentMode.filter(a => a.PaymentSubCategoryName.toLowerCase() === ENUM_BillPaymentMode.cash.toLowerCase());
    this.FilterdSubPaymentMode = this.FilteredMajorPaymentMode;
    this.FilteredMajorPaymentMode = this.FilteredMajorPaymentMode.filter(a => a.PaymentSubCategoryName.toLowerCase() === ENUM_BillPaymentMode.cash.toLowerCase() || a.PaymentSubCategoryName.toLowerCase() === ENUM_BillPaymentMode.credit || a.PaymentSubCategoryName.toLowerCase() === "others");

    if (this.PageInfo.PageName.toLowerCase() === "settlements")
      this.FilteredMajorPaymentMode = this.FilteredMajorPaymentMode.filter(a => a.PaymentSubCategoryName.toLowerCase() === ENUM_BillPaymentMode.cash.toLowerCase() || a.PaymentSubCategoryName.toLocaleLowerCase() == "others");


    if (this.TransactionType == "depositreturn" && this.PageInfo.PageName.toLocaleLowerCase() == "dispensarydeposit") {
      this.FilteredMajorPaymentMode = this.FilteredMajorPaymentMode.filter(a => a.PaymentSubCategoryName.toLowerCase() === ENUM_BillPaymentMode.cash);
    }
    if (this.IsCoPayment) {
      this.FilteredMajorPaymentMode = this.FilteredMajorPaymentMode.filter(a => a.PaymentSubCategoryName.toLowerCase() !== ENUM_BillPaymentMode.credit.toLowerCase());
    }

    this.FilterdSubPaymentMode = this.FilterdSubPaymentMode.filter(a => a.ShowInMultiplePaymentMode === true);
    if (this.PaymentMode.toLowerCase() !== ENUM_BillPaymentMode.credit.toLowerCase() && this.FilteredMajorPaymentMode[0]) {
      this.PaymentMode = this.FilteredMajorPaymentMode[0].PaymentSubCategoryName;
    }
    this.FilterdSubPaymentMode.map(a => a.IsValidAmount = true);
  }

  OnPaymentModeChange() {
    //* Krishna, 16thMarch'23, We are reassigning the Payment Mode to the variable again as it cannot be reflected only changing the variables value initially, we need to prefer to the object from which it is being displayed in the UI.
    if (this.PaymentMode) {
      const paymentModeObj = this.FilteredMajorPaymentMode.find(a => a.PaymentSubCategoryName.toLowerCase() === this.PaymentMode.toLowerCase());
      if (paymentModeObj) {
        this.PaymentMode = paymentModeObj.PaymentSubCategoryName;
      }
    }
    this.CalculateRemaining();
    this.FilterdSubPaymentMode.forEach(a => {
      a.Amount = 0;
      a.IsSelected = false;
      a.PaymentDetail = null;
    });
    this.SubCategoryWisePaymentDetail = [];
    this.PaymentDetails = "";
    // if ($event) {
    //   this.PaymentMode = $event.target.value;
    //this.PaymentMode.toLocaleLowerCase() === "others" ? this.MultipaymentPopUp = true : this.MultipaymentPopUp = false;
    if (this.PaymentMode.toLocaleLowerCase() === "others") {
      this.MultipaymentPopUp = true;
      this.InitialFocus();
    } else {
      this.MultipaymentPopUp = false;
    }
    if (((this.PageInfo.ModuleName.toLowerCase() === 'billing' && this.PageInfo.PageName.toLowerCase() === 'ipbilling') || (this.PageInfo.ModuleName.toLowerCase() === 'billing' && this.PageInfo.PageName.toLowerCase() === 'settlements')) && this.DepositBalance && this.PaymentMode.toLocaleLowerCase() != 'credit') {
      this.DisableDepositCheckbox = true;
      this.FilterdSubPaymentMode.map(a => {
        if (a.PaymentSubCategoryName.toLowerCase() === 'deposit') {
          a.IsSelected = true;
          if (this.DepositBalance >= this.TotalAmount) {
            a.Amount = this.TotalAmount;
          } else {
            a.Amount = this.DepositBalance;
          }

        }
      });
      this.CalculateRemaining();
      let index = this.FilterdSubPaymentMode.findIndex(a => a.PaymentSubCategoryName.toLocaleLowerCase() === 'deposit');
      this.AddToEmpCashTransaction(index);
    }
    let obj = this.FilteredMajorPaymentMode.find(a => a.PaymentSubCategoryName.toLocaleLowerCase() === this.PaymentMode.toLocaleLowerCase());
    if (obj) {
      this.onPaymentModeChange.emit({ PaymentMode: this.PaymentMode, PaymentDetails: this.PaymentDetails, IsRemarksMandatory: obj.IsRemarksMandatory });
    }
    if (this.DepositBalance <= 0 || this.DepositBalance == null) {
      this.FilterdSubPaymentMode = this.FilterdSubPaymentMode.filter(a => a.PaymentSubCategoryName.toLocaleLowerCase() != 'deposit');
    }
    if (this.PaymentMode.toLocaleLowerCase() != "others" && this.PaymentMode.toLocaleLowerCase() != "credit") {
      let temp = this.FilterdSubPaymentMode.filter(a => a.PaymentSubCategoryName.toLocaleLowerCase() === this.PaymentMode.toLocaleLowerCase());
      let empCashTxn = new EmployeeCashTransaction();
      empCashTxn.InAmount = this.PayableAmount;
      empCashTxn.PaymentModeSubCategoryId = temp[0].PaymentSubCategoryId
      empCashTxn.ModuleName = this.PageInfo.ModuleName;
      empCashTxn.PaymentSubCategoryName = temp[0].PaymentSubCategoryName;
      this.SubCategoryWisePaymentDetail.push(empCashTxn);
      // this.PaymentDetails = (this.SubCategoryWisePaymentDetail[0].PaymentSubCategoryName ? this.SubCategoryWisePaymentDetail[0].PaymentSubCategoryName +":": "") +(this.SubCategoryWisePaymentDetail[0].InAmount > 0 ? this.SubCategoryWisePaymentDetail[0].InAmount : "");
      this.FilterPaymentSubCategory();
      this.PaymentModeChange.emit({ "MultiPaymentDetail": this.SubCategoryWisePaymentDetail, "PaymentDetail": this.PaymentDetails });
    }
    // }

  }

  OnCreditOrganizationChange() {
    //Rohit, 9Jun'22 If creditOrganizationList is empty we have to load Credit Organization here.
    if (!this.creditOrganizationsList.length) {
      this.creditOrganizationsList = _.cloneDeep(this.billingService.AllCreditOrganizationsList);
    }
    //* Krishna, 16thMarch'23 We are reassigning the CreditOrganization after searching from the list as it cannot be reflected directly from the change of the variable, we need to prefer to the object from which it is being displayed in the UI.
    if (this.selectedCreditOrganizationId) {
      this.CreditOrganization = this.creditOrganizationsList.find(a => a.OrganizationId == this.selectedCreditOrganizationId)
      // this.CreditOrganization = this.creditOrganizationsList.find(a => a.OrganizationId == this.CreditOrganization.OrganizationId)
      if (this.CreditOrganization) {
        this.selectedCreditOrganizationId = this.CreditOrganization.OrganizationId;
        this.onCreditOrganizationChange.emit(this.CreditOrganization);
      } else {
        this.onCreditOrganizationChange.emit({ OrganizationId: 0, OrganizationName: '' })
      }
    }
  }

  //Change the Checkbox value and call Calculation logic from here.
  DepositDeductCheckBoxChanged() {
    //toggle Checked-Unchecked of 'Deduct From Deposit Checkbox'
    this.deductDeposit = !this.deductDeposit;
    //this.CalculateDepositBalance();
  }

  //CalculateDepositBalance() {

  //}

  Close() {
    this.Initialize();
    this.MultipaymentPopUp = false;
    this.FilterdSubPaymentMode.forEach(a => {
      a.Amount = 0;
      a.IsSelected = false;
      a.PaymentDetail = null;
    });
    this.RemainingAmount = 0;
    if (this.isGovInsurance == false) {
      this.ResetPaymentDetailToCash();
    }
    else {
      this.ResetToCredit();
    }
  }

  ResetPaymentDetailToCash() {
    this.PaymentDetails = '';
    this.CalculateRemaining();
    this.SubCategoryWisePaymentDetail = [];
    let empCashTxn = new EmployeeCashTransaction();
    empCashTxn.InAmount = this.PayableAmount;
    let paymentModeObj = this.FilterdSubPaymentMode.find(a => a.PaymentSubCategoryName.toLocaleLowerCase() === "cash");
    if (paymentModeObj) {
      empCashTxn.PaymentModeSubCategoryId = paymentModeObj.PaymentSubCategoryId;
    }
    empCashTxn.ModuleName = this.PageInfo.ModuleName;
    this.SubCategoryWisePaymentDetail.push(empCashTxn);
    this.FilterPaymentSubCategory();
    let obj = this.FilteredMajorPaymentMode.find(a => a.PaymentSubCategoryName.toLocaleLowerCase() === this.PaymentMode.toLocaleLowerCase());
    this.onPaymentModeChange.emit({ PaymentMode: this.PaymentMode, PaymentDetails: this.PaymentDetails, IsRemarksMandatory: obj.IsRemarksMandatory });
    this.PaymentModeChange.emit({ "MultiPaymentDetail": this.SubCategoryWisePaymentDetail });
  }

  ResetToCredit() {
    this.PaymentDetails = '';
    this.CalculateRemaining();
    this.SubCategoryWisePaymentDetail = [];
    let creditObj = this.FilteredMajorPaymentMode.find(a => a.PaymentSubCategoryName.toLocaleLowerCase() === "credit");
    let defaultPayMode = this.FilterdSubPaymentMode.find(a => a.PaymentSubCategoryName.toLocaleLowerCase() === "cash");
    let empCashTxn = new EmployeeCashTransaction();
    empCashTxn.InAmount = this.PayableAmount;
    empCashTxn.PaymentModeSubCategoryId = creditObj ? creditObj.PaymentSubCategoryId : defaultPayMode.PaymentSubCategoryId;
    empCashTxn.ModuleName = this.PageInfo.ModuleName;
    this.SubCategoryWisePaymentDetail.push(empCashTxn);
    this.FilterPaymentSubCategory();
    this.PaymentMode = creditObj ? creditObj.PaymentSubCategoryName : defaultPayMode.PaymentSubCategoryName;
    let obj = this.FilteredMajorPaymentMode.find(a => a.PaymentSubCategoryName.toLocaleLowerCase() === this.PaymentMode.toLocaleLowerCase());
    this.onPaymentModeChange.emit({ PaymentMode: this.PaymentMode, PaymentDetails: this.PaymentDetails, IsRemarksMandatory: obj.IsRemarksMandatory });
    this.PaymentModeChange.emit({ "MultiPaymentDetail": this.SubCategoryWisePaymentDetail });
  }

  AddToEmpCashTransaction(index: any) {
    let empCashTxn = new EmployeeCashTransaction();
    let ind = this.SubCategoryWisePaymentDetail.findIndex(a => a.PaymentModeSubCategoryId == this.FilterdSubPaymentMode[index].PaymentSubCategoryId);
    if (ind >= 0)
      this.SubCategoryWisePaymentDetail.splice(ind, 1);
    empCashTxn.InAmount = this.FilterdSubPaymentMode[index].Amount;
    empCashTxn.PaymentModeSubCategoryId = this.FilterdSubPaymentMode[index].PaymentSubCategoryId;
    empCashTxn.ModuleName = this.PageInfo.ModuleName;
    empCashTxn.PaymentSubCategoryName = this.FilterdSubPaymentMode[index].PaymentSubCategoryName;
    empCashTxn.Remarks = null;
    this.SubCategoryWisePaymentDetail.push(empCashTxn);
    if (this.SubCategoryWisePaymentDetail.filter(a => a.PaymentSubCategoryName.toLocaleLowerCase() === "deposit")) {
      this.SubCategoryWisePaymentDetail.filter(a => a.PaymentSubCategoryName.toLocaleLowerCase() === "deposit").map(a => a.Remarks = "paid from deposit");
    }

  }

  CalculateRemaining() {
    //this.PayableAmount = this.DepositUsed >0 ? this.TotalAmount - this.DepositUsed : this.TotalAmount;
    this.PayableAmount = this.TotalAmount;
    var amount = 0;
    this.FilterdSubPaymentMode.forEach(a => {
      if (a.IsSelected && a.Amount != null && a.Amount > 0) {
        amount += a.Amount;
      }
    });
    this.RemainingAmount = CommonFunctions.parseAmount(Number(this.PayableAmount - amount));//Rohit: Show amount up to 2 decimal place.
  }

  HandleCheckUncheck($event, index: any) {
    if ($event.target.checked) {
      this.coreService.FocusInputById("input_amount" + index);
      if (this.FilterdSubPaymentMode[index].PaymentSubCategoryName.toLocaleLowerCase() === "deposit") {
        if (this.DepositBalance > this.PayableAmount) {
          this.FilterdSubPaymentMode[index].Amount = this.PayableAmount;
        } else {
          this.FilterdSubPaymentMode[index].Amount = this.DepositBalance;
        }
        this.AddToEmpCashTransaction(index);
      }
      // if (this.FilterdSubPaymentMode.every(a => a.IsSelected == true)) {
      //   this.selectAll = true;
      // }
    }
    else {
      //this.selectAll = false;
      this.FilterdSubPaymentMode[index].Amount = 0;
      let ind = this.SubCategoryWisePaymentDetail.findIndex(a => a.PaymentModeSubCategoryId == this.FilterdSubPaymentMode[index].PaymentSubCategoryId);
      if (ind >= 0)
        this.SubCategoryWisePaymentDetail.splice(ind, 1);
    }
    this.CalculateRemaining();
  }

  Submit() {
    if (!this.CheckForValidAmount) {
      this.msgBoxServ.showMessage("error", ["Some Amounts are invalid."]);
    } else {
      this.MultipaymentPopUp = false;
      this.FilterPaymentSubCategory();
      this.SubCategoryWisePaymentDetail.forEach(a => {
        this.PaymentDetails += "[ " + a.PaymentSubCategoryName + ":" + a.InAmount + (a.PaymentDetail ? ', Detail:' + a.PaymentDetail : '') + "] , ";
      });
      this.PaymentDetails = this.PaymentDetails.substring(0, this.PaymentDetails.length - 3);
      this.PaymentModeChange.emit({ "MultiPaymentDetail": this.SubCategoryWisePaymentDetail, "PaymentDetail": this.PaymentDetails });
      this.loading = false;
    }

  }

  CheckForValidAmount() {
    let isValid = false;
    this.FilterdSubPaymentMode.forEach(a => {
      if (a.IsValidAmount === false) {
        isValid = false;
      } else {
        isValid = true;
      }
    });
    return isValid;
  }

  FilterPaymentSubCategory() {
    this.SubCategoryWisePaymentDetail = this.SubCategoryWisePaymentDetail.filter(a => a.InAmount != undefined && a.InAmount > 0 && a.InAmount != null);
  }

  ShowEdit() {
    this.PaymentDetails = '';
    this.MultipaymentPopUp = true;
  }


  InitialFocus() {
    let index = 0;
    let obj = this.FilterdSubPaymentMode[0];
    if (obj.PaymentSubCategoryName.toLowerCase() === "deposit" && this.DepositBalance > 0) {
      index++;
    }

    this.coreService.FocusInputById('input_amount'.concat(index.toString()));

  }

  SetFocusById(index: any) {
    if (this.RemainingAmount > 0 && index <= (this.FilterdSubPaymentMode.length - 1)) {
      //this.FilterdSubPaymentMode[index].IsSelected = true;
    }
    // this.FilterdSubPaymentMode[index].IsSelected = true;
    else {
      let elemToFocus = document.getElementById('Add');
      //coreService.FocusInputById('btn_searchInvoice')
      this.coreService.FocusInputById('Add');
      // if (elemToFocus != null && elemToFocus != undefined) {
      //   elemToFocus.focus();
      // }
      return 0;
    }

    let indx = index - 1;
    let paymentDetailsMandatory = this.FilterdSubPaymentMode[indx].ShowPaymentDetails;
    if (paymentDetailsMandatory) {
      let goToPayDetail = document.getElementById('payment_detail'.concat(indx.toString()));
      if (goToPayDetail != null && goToPayDetail != undefined) {
        this.coreService.FocusInputById('payment_detail'.concat(indx.toString()));
        //goToPayDetail.focus();
      }
    } else {
      this.coreService.FocusInputById('input_amount'.concat(index));

      // window.setTimeout(function () {

      // let elemToFocus = document.getElementById('input_amount'.concat(index));
      // if (elemToFocus != null && elemToFocus != undefined) {
      //   elemToFocus.focus();
      // }
      //}, 100);
    }
  }

  SetFocusBackToAmount(index) {
    if (this.RemainingAmount > 0 && index <= (this.FilterdSubPaymentMode.length - 1)) {
      //this.FilterdSubPaymentMode[index].IsSelected = true;
    }
    // this.FilterdSubPaymentMode[index].IsSelected = true;
    else {
      //let elemToFocus = document.getElementById('Add');
      this.coreService.FocusInputById('Add');
      // if (elemToFocus != null && elemToFocus != undefined) {
      //   elemToFocus.focus();
      // }
      return 0;
    }

    this.coreService.FocusInputById('input_amount'.concat(index));

    //window.setTimeout(function () {


    // let elemToFocus = document.getElementById('input_amount'.concat(index));
    // if (elemToFocus != null && elemToFocus != undefined) {
    //   elemToFocus.focus();
    // }
    // }, 100);

  }

  // SelectAll() {
  //   if (this.selectAll) {
  //     this.FilterdSubPaymentMode.map(a => a.IsSelected = true);
  //   } else {
  //     this.FilterdSubPaymentMode.map(a => a.IsSelected = false);
  //     this.FilterdSubPaymentMode.map(a => a.Amount = 0);
  //   }
  //   this.CalculateRemaining();
  // }

  AmountChanged(index) {
    if (this.FilterdSubPaymentMode[index].Amount > 0) {
      this.FilterdSubPaymentMode[index].IsSelected = true;
    } else {
      this.FilterdSubPaymentMode[index].IsSelected = false;
    }

    if (this.FilterdSubPaymentMode[index].Amount >= 0) {
      this.FilterdSubPaymentMode[index].IsValidAmount = true;
      this.loading = false;
    } else {
      this.FilterdSubPaymentMode[index].IsValidAmount = false;
      this.loading = true;
    }
    this.CalculateRemaining();
  }

  AssignPaymentDetail(index: any) {
    this.SubCategoryWisePaymentDetail.filter(a => a.PaymentModeSubCategoryId == this.FilterdSubPaymentMode[index].PaymentSubCategoryId).map(a => a.PaymentDetail = this.FilterdSubPaymentMode[index].PaymentDetail);
  }

}

