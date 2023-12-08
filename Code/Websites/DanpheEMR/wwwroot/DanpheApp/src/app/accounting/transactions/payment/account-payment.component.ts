import { Component } from "@angular/core";
import * as moment from "moment";
import { CoreService } from "../../../core/shared/core.service";
import { SecurityService } from "../../../security/shared/security.service";
import { DanpheCache, MasterType } from "../../../shared/danphe-cache-service-utility/cache-services";
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_ACC_ADDLedgerLedgerType, ENUM_ACC_PaymentMode, ENUM_DanpheHTTPResponseText, ENUM_Data_Type, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { LedgerModel } from "../../settings/shared/ledger.model";
import { SectionModel } from "../../settings/shared/section.model";
import { SubLedgerTransactionModel } from "../../settings/shared/sub-ledger.model";
import { AccountingBLService } from "../../shared/accounting.bl.service";
import { AccountingService } from "../../shared/accounting.service";
import { MakePayment_DTO } from "../shared/DTOs/make-payment-dto";
import { SubLedger_DTO } from "../shared/DTOs/subledger-dto";
import { TransactionItem } from "../shared/transaction-item.model";
import { TransactionModel } from "../shared/transaction.model";
import { Payment } from "./account-payment.model";


@Component({
  templateUrl: "./account-payment.component.html",
  host: { '(window:keyup)': 'hotkeys($event)' }
})
export class PaymentComponent {
  public SetupInvGridColumns: Array<any> = [];
  public SetupPhrmGridColumns: Array<any> = [];
  public SectionList: Array<SectionModel> = [];
  public FilteredSectionList: Array<SectionModel> = [];
  public VendorList: any;
  public SelectedVendor: any;
  public SelectedSupplier: any;
  public GrList: Array<any> = [];
  public ShowPaymentPopup: boolean = false;
  public Payment: Payment = new Payment();
  public Transaction: TransactionModel = new TransactionModel();
  public MakePayment: MakePayment_DTO = new MakePayment_DTO();
  public CreateLedgerFlag: boolean = false;
  public VoucherNumber: string = null;
  public FiscalYearId: number = 0;
  public ShowAddLedgerBox: boolean = false;
  public LedReferenceId: number = 0;
  public LedgerType: string = "";
  public SelectedLedger: any = "";
  public SelectedSubLedger: SubLedger_DTO = new SubLedger_DTO();
  public AllLedgerList: Array<LedgerModel> = [];
  public FilteredLedgerList: Array<LedgerModel> = [];
  public ShowPayeeAndCheque: boolean = false;
  public Loading: boolean = false;
  public SectionId: number = 1;
  public InvSectionFlag: boolean = true;;
  public PhrmSectionFlag: boolean = false;
  public SubLedgerEnable: boolean = false;
  public SupplierList: any;
  public VendorId: number = 0;
  public SupplierId: number = 0;
  public LedgerName: string = "";
  public LedgerId: number = 0;
  public GRNumber: string = '';
  public InvoiceNumber: string = '';
  public Date: string = '';
  public SelectedDate: string = '';
  public IsDateSelected: boolean = false;
  public OtherSectionFlag: boolean = false;
  public LedgerForSubLedger: LedgerModel = new LedgerModel();
  public SubLedgerAndCostCenterSetting = {
    "EnableSubLedger": false,
    "EnableCostCenter": false
  };
  public ShowAddPage: boolean = false;

  public InventoryVendorLedgerParam = {
    LedgerName: ""
  }
  public PharmacySupplierLedgerParam = {
    LedgerName: ""
  }
  public LedgerTypeParamter: any;
  public SubLedgerMaster: Array<SubLedger_DTO> = new Array<SubLedger_DTO>();
  public SubLedgerList: Array<SubLedger_DTO> = new Array<SubLedger_DTO>();



  constructor(public accountingService: AccountingService,
    public accountingBlService: AccountingBLService,
    public securityServ: SecurityService,
    public msgBoxServ: MessageboxService,

    public coreService: CoreService) {
    this.Getledgers();
    this.loadCacheList();
    this.getInventoryVendorlist();
    this.Payment.PaymentMode = ENUM_ACC_PaymentMode.NA;
    this.Payment.PaymentValidator.controls["PaymentFrom"].disable();
  }


  public Getledgers() {
    try {
      let ledgerMappings = this.coreService.Parameters.filter(p => p.ParameterGroupName === "Accounting" && p.ParameterName === "LedgerGroupMapping");
      if (ledgerMappings.length > 0) {
        this.LedgerTypeParamter = JSON.parse(ledgerMappings[0].ParameterValue);
        this.InventoryVendorLedgerParam = this.LedgerTypeParamter.find(a => a.LedgerType === ENUM_ACC_ADDLedgerLedgerType.InventoryVendor);
        this.PharmacySupplierLedgerParam = this.LedgerTypeParamter.find(a => a.LedgerType === ENUM_ACC_ADDLedgerLedgerType.PharmacySupplier);
      } else {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Ledgers type not found.']);
      }
      let subLedgerParma = this.coreService.Parameters.find(a => a.ParameterGroupName === "Accounting" && a.ParameterName === "SubLedgerAndCostCenter");
      if (subLedgerParma) {
        this.SubLedgerAndCostCenterSetting = JSON.parse(subLedgerParma.ParameterValue);
      }
      this.SubLedgerMaster = this.accountingService.accCacheData.SubLedgerAll ? this.accountingService.accCacheData.SubLedgerAll : [];
      this.SubLedgerList = this.SubLedgerMaster;
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }
  public loadCacheList() {
    if (!!this.accountingService.accCacheData.Sections && this.accountingService.accCacheData.Sections.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
      this.SectionList = this.accountingService.accCacheData.Sections;//mumbai-team-june2021-danphe-accounting-cache-change
      this.SectionList = this.SectionList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
      this.FilteredSectionList = this.SectionList.filter(a => a.SectionId != 4);
      this.FilteredSectionList = this.FilteredSectionList.filter(a => a.SectionId != 2);
    }
    if (!!this.accountingService.accCacheData.LedgersALL && this.accountingService.accCacheData.LedgersALL.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
      this.AllLedgerList = this.accountingService.accCacheData.LedgersALL;//mumbai-team-june2021-danphe-accounting-cache-change
      this.AllLedgerList = this.FilteredLedgerList = this.AllLedgerList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
    }
  }
  public onSectionChange() {
    try {
      let sectionObj = this.FilteredSectionList.find((s) => s.SectionId === this.SectionId);
      let code = "";
      if (sectionObj) {
        code = sectionObj.SectionCode;
      }
      this.SelectedVendor = "";
      this.SelectedSupplier = "";
      this.SelectedLedger = "";
      this.GrList = [];
      if (code === 'INV') {
        this.OtherSectionFlag = false;
        this.getInventoryVendorlist();
      }
      else if (code === 'PH') {
        this.OtherSectionFlag = false;
        this.getPharmacySupplierlist();
      }
      else {
        this.VendorList = [];
        this.SupplierList = [];
        this.OtherSectionFlag = true;
      }
    } catch (ex) { }
  }
  public getInventoryVendorlist() {
    this.OtherSectionFlag = true;
    this.accountingBlService.GetInvVendorList()
      .finally(() => { this.OtherSectionFlag = false })
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.VendorList = res.Results;
          this.SetupInvGridColumns = GridColumnSettings.VendorList;
          this.InvSectionFlag = true;
          this.PhrmSectionFlag = false;
        }
      });
  }
  public getPharmacySupplierlist() {
    this.accountingBlService.GetPharmacySupplier()
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.SupplierList = res.Results;
          this.SetupPhrmGridColumns = GridColumnSettings.SupplierList;
          this.PhrmSectionFlag = true;
          this.InvSectionFlag = false;;
        }
      });
  }
  public vendorOrSupplierListFormatter(data: any): string {
    if (data["VendorName"]) {
      let html: string = data["VendorName"];
      return html;
    }
    else {
      let html: string = data["SupplierName"];
      return html;
    }
  }
  public LedgerListFormatter(data: any): string {
    return data["Code"] + "-" + data["LedgerName"];
  }
  public load() {
    if (this.InvSectionFlag) {
      if (this.SelectedVendor) {
        this.onChangeVendor(this.SelectedVendor);
      }
      else {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Please select vendor"]);
      }
    }
    else if (this.PhrmSectionFlag) {
      if (this.SelectedSupplier) {
        this.onChangeSupplier(this.SelectedSupplier);
      }
      else {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Please select supplier"]);
      }
    }
  }
  public onChangeVendor(vendor) {
    if (vendor) {
      this.LedgerId = vendor.LedgerId;
      this.LedgerName = vendor.LedgerName;
      vendor.VendorId = vendor.VendorId ? vendor.VendorId : vendor.SupplierId;
      this.VendorId = vendor.VendorId;
      this.loadInvGrList(vendor.VendorId, this.SectionId, this.GRNumber, this.Date);
    }
  }
  public loadInvGrList(grId, SectionId, number, Date) {
    this.accountingBlService.GetGRList(grId, SectionId, number, Date)
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK && res.Results.length) {
          this.GrList = res.Results;
        }
        else {
          this.GrList = [];
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ["Good receipt list is not available for selected vendor"]);
        }
      });
  }
  public onChangeSupplier(supplier) {
    if (supplier) {
      this.LedgerId = supplier.LedgerId;
      this.LedgerName = supplier.LedgerName;
      this.SupplierId = supplier.SupplierId;
      this.loadPhrmGrList(supplier.SupplierId, this.SectionId, this.InvoiceNumber, this.Date);
    }
  }
  public loadPhrmGrList(grId, SectionId, number, Date) {
    this.accountingBlService.GetGRList(grId, SectionId, number, Date)
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK && res.Results.length) {
          this.GrList = res.Results;
        } else {
          this.GrList = [];
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ["Good receipt list is not available for selected supplier"]);
        }
      });
  }
  public gRListGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "view": {
        this.Payment.GrDate = $event.Data.GRDate;
        this.Payment.GrDate = moment(this.Payment.GrDate).format('YYYY-MM-DD');
        this.Payment.GrNo = $event.Data.GRNo;
        this.Payment.TotalAmount = $event.Data.TotalAmount;
        this.Payment.PaidAmount = $event.Data.PaidAmount;
        this.Payment.DueAmount = $event.Data.DueAmount;
        this.Payment.RemainingAmount = $event.Data.RemainingAmount;
        this.Payment.GoodReceiptID = $event.Data.GRId;
        this.Payment.LedgerName = this.LedgerName;
        this.Payment.LedgerId = this.Payment.ReceiverLedgerId = this.LedgerId;
        this.Payment.InvoiceNo = $event.Data.InvoiceNo;
        this.Payment.VoucherAmount = this.Payment.DueAmount;
        if (this.SubLedgerAndCostCenterSetting.EnableSubLedger) {
          if (this.InvSectionFlag)
            this.Payment.SubLedgerId = this.SelectedVendor.SubLedgerId;
          else if (this.PhrmSectionFlag)
            this.Payment.SubLedgerId = this.SelectedSupplier.SubLedgerId;
        }
        else
          this.FocusElementById('VoucherAmount');
        this.SelectedLedger = "";
        this.ShowPaymentPopup = true;
        this.Loading = false;
        this.ShowPayeeAndCheque = false;
      }
      default:
        break;
    }
  }
  public close() {
    this.Payment = new Payment();
    this.Transaction = new TransactionModel();
    this.ShowPaymentPopup = false;
    this.Loading = false;
    this.SelectedLedger = "";
    this.Payment.PaymentMode = 'NA';
  }

  public SubLedgerListFormatter(subLedger: SubLedger_DTO): string {
    return `${subLedger["SubLedgerName"]} (${subLedger["LedgerName"]})`;
  }
  AssignSelectedLedger(event) {
    if (event) {
      this.SelectedLedger = event;
      this.SubLedgerList = this.SubLedgerMaster.filter(a => a.LedgerId === this.SelectedLedger.LedgerId);
      this.SelectedSubLedger = this.SubLedgerList.find(a => a.IsDefault === true);
    }

  }

  AssignSelectedSubLedger(event) {
    if (event) {
      this.SelectedSubLedger = event;
      this.SelectedSubLedger.SubLedgerId = event.SubLedgerId;
    }
  }
  public makePayment() {
    //for checking validations, marking all the fields as dirty and checking the validity.
    for (var i in this.Payment.PaymentValidator.controls) {
      this.Payment.PaymentValidator.controls[i].markAsDirty();
      this.Payment.PaymentValidator.controls[i].updateValueAndValidity();
    }
    if (this.Payment.Narration.trim().length == 0) {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Narration is compulsory"]);
      this.Loading = false;
      this.FocusElementById('Narration');
      return;
    }
    if (this.ShowPayeeAndCheque) {
      if (!this.Payment.ChequeNo || !this.Payment.PayeeName) {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Payee Name and Cheque No are mandatory"]);
        this.Loading = false;
        return;
      }
    }
    if (this.Payment.PaymentMode == 'NA') {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Payment mode is mandatory"]);
      this.Loading = false;
      this.FocusElementById('PaymentMode');
      return;
    }
    if (!this.Payment.LedgerId) {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Please create ledger first"]);
      this.Loading = false;
      return;
    }
    if (typeof (this.SelectedLedger) === ENUM_Data_Type.String && this.SelectedLedger.trim() === "") {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Please Select Payment from ledger."]);
      this.Loading = false;
      return;
    }
    if (this.Payment.IsValidCheck(undefined, undefined)) {
      this.Transaction = new TransactionModel();
      this.Transaction.TransactionItems = [];
      this.Transaction.FiscalYearId = 0// NageshBB- add fiscal YearId at server side //this.fiscalYear.FiscalYearId; 
      this.Transaction.VoucherId = 0;
      this.Transaction.TransactionType = this.Payment.PaymentMode;
      this.Transaction.Remarks = (this.Payment.Narration && this.Payment.Narration.length) ? this.Payment.Narration.trim() : '';
      let drTransactionItem: TransactionItem = new TransactionItem();
      let crTransactionItem: TransactionItem = new TransactionItem();
      drTransactionItem.Amount = crTransactionItem.Amount = this.Payment.VoucherAmount;
      drTransactionItem.DrCr = true;
      drTransactionItem.LedgerId = this.InvSectionFlag ? this.SelectedVendor.LedgerId : this.SelectedSupplier.LedgerId;

      crTransactionItem.LedgerId = this.SelectedLedger.LedgerId;
      crTransactionItem.DrCr = false;

      if (this.SubLedgerAndCostCenterSetting.EnableSubLedger) {
        if (this.SelectedSubLedger && this.SelectedSubLedger.SubLedgerId) {
          let drSubLedgerTxn = new SubLedgerTransactionModel();
          if (this.PhrmSectionFlag) {
            drSubLedgerTxn.LedgerId = this.SelectedSupplier.LedgerId;
            drSubLedgerTxn.SubLedgerId = this.SelectedSupplier.SubLedgerId;
          }
          else if (this.InvSectionFlag) {
            drSubLedgerTxn.LedgerId = this.SelectedVendor.LedgerId;
            drSubLedgerTxn.SubLedgerId = this.SelectedVendor.SubLedgerId;
          }
          drTransactionItem.SubLedgers.push(drSubLedgerTxn);


          let crSubLedgerTxn = new SubLedgerTransactionModel();
          if (this.PhrmSectionFlag) {
            crSubLedgerTxn.LedgerId = this.SelectedLedger.LedgerId;
            crSubLedgerTxn.SubLedgerId = this.SelectedSubLedger.SubLedgerId;
          }
          else if (this.InvSectionFlag) {
            crSubLedgerTxn.LedgerId = this.SelectedLedger.LedgerId;
            crSubLedgerTxn.SubLedgerId = this.SelectedSubLedger.SubLedgerId;
          }
          crTransactionItem.SubLedgers.push(crSubLedgerTxn);
        } else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ["Please select sub-ledger or create subledger for the selected ledger"]);
          this.Loading = false;
          return;
        }
      }

      this.Transaction.TransactionItems.push(crTransactionItem);
      this.Transaction.TransactionItems.push(drTransactionItem);

      this.Transaction.CreatedBy = this.securityServ.loggedInUser.EmployeeId;
      this.Transaction.Remarks = this.Payment.Remarks = this.Payment.Narration.trim();

      if (this.ShowPayeeAndCheque) {
        this.Transaction.PayeeName = this.Payment.PayeeName;
        this.Transaction.ChequeNumber = this.Payment.ChequeNo;
      }
      this.Payment.SectionId = this.SectionId;
      this.MakePayment.Payment = this.Payment;
      this.MakePayment.Transaction = this.Transaction;
      this.accountingBlService.PostPayment(this.MakePayment)
        .subscribe(res => {
          if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
            this.Loading = false;
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Your Payment voucher is posted"]);
            this.ShowPaymentPopup = false;
            if (res.Results) {
              this.FiscalYearId = res.Results.FiscalYearId;
              this.VoucherNumber = res.Results.VoucherNumber;
            }
            if (this.InvSectionFlag) {
              this.loadInvGrList(this.VendorId, this.Payment.SectionId, this.GRNumber, this.Date);
            } else {
              this.loadPhrmGrList(this.SupplierId, this.Payment.SectionId, this.InvoiceNumber, this.Date);
            }
            this.Payment = new Payment();
            this.Transaction = new TransactionModel();
            this.SelectedLedger = "";
            this.Payment.PaymentMode = 'NA';
          }
          else {
            this.Loading = false;
            this.Payment = new Payment();
            this.Transaction = new TransactionModel();
            this.SelectedLedger = "";
            this.msgBoxServ.showMessage("error", ["Payment failed"]);
            this.Payment.PaymentMode = 'NA';
          }
        })
    }
    else {
      this.Loading = false;
    }
  }
  public cancel() {
    this.Payment = new Payment();
    this.Transaction = new TransactionModel();
    this.ShowPaymentPopup = false;
    this.Payment.PaymentMode = 'NA';
  }
  public CreateNewLedger() {
    if (this.InvSectionFlag) {
      this.LedgerType = ENUM_ACC_ADDLedgerLedgerType.InventoryVendor;
      this.LedReferenceId = this.SelectedVendor.VendorId;
      this.ShowAddLedgerBox = true;
    }
    else {
      this.LedgerType = ENUM_ACC_ADDLedgerLedgerType.PharmacySupplier;
      this.LedReferenceId = this.SelectedSupplier.SupplierId;
      this.ShowAddLedgerBox = true;
    }
    if (this.ShowPaymentPopup) {
      this.close();
      // this.clearGrList()
    }

  }

  CreateNewSubLedger() {
    if (this.InvSectionFlag) {
      this.LedgerType = ENUM_ACC_ADDLedgerLedgerType.InventoryVendor;
      this.InvSectionFlag = true;
    }
    else if (this.PhrmSectionFlag) {
      this.PhrmSectionFlag = true;
      this.LedgerType = ENUM_ACC_ADDLedgerLedgerType.PharmacySupplier;
    }
    this.ShowAddPage = true;
  }
  public OnNewLedgerAdded() {
    this.ShowAddLedgerBox = false;
    this.UpdateLedgers();
    this.loadCacheList();
    this.SelectedLedger = "";
    if (this.InvSectionFlag) {
      this.SelectedVendor = "";
      this.getInventoryVendorlist();
    } else if (this.PhrmSectionFlag) {
      this.SelectedSupplier = "";
      this.getPharmacySupplierlist();
    }
  }

  OnNewSubLedgerAdded() {
    this.ShowAddPage = false;
    this.GrList = [];
    if (this.InvSectionFlag) {
      this.SelectedVendor = "";
      this.getInventoryVendorlist();
    }
    else if (this.PhrmSectionFlag) {
      this.SelectedSupplier = "";
      this.getPharmacySupplierlist();
    }
  }

  public paymentModeChange() {
    this.SelectedLedger = "";
    this.SelectedSubLedger = null;
    if (this.Payment.PaymentMode === ENUM_ACC_PaymentMode.Bank) {
      let codeDetail = this.accountingService.accCacheData.CodeDetails.find(a => a.Code === '022' && a.Description === 'LedgerGroupName');
      if (codeDetail) {
        let ledgerGroup = this.accountingService.accCacheData.LedgerGroups.find(a => a.Name === codeDetail.Name);
        if (ledgerGroup) {
          this.FilteredLedgerList = this.AllLedgerList.filter(a => a.LedgerGroupId === ledgerGroup.LedgerGroupId);
        }
      }
      //this.FilteredLedgerList = this.AllLedgerList.filter(a=> a.LedgerGroupId === 5); // Dev : 9 Nov'22 We are hardcoding Ledgergroup here need to fix those in database LedgergroupId = 5 -> Bank, LedgerGroupId = 6 -> Cash.
      this.Payment.PaymentValidator.controls["PaymentFrom"].enable();
      this.SubLedgerEnable = true;
      this.ShowPayeeAndCheque = true;
    }
    else if (this.Payment.PaymentMode === ENUM_ACC_PaymentMode.Cash) {
      let codeDetail = this.accountingService.accCacheData.CodeDetails.find(a => a.Code === '021' && a.Description === 'LedgerGroupName');
      if (codeDetail) {
        let ledgerGroup = this.accountingService.accCacheData.LedgerGroups.find(a => a.Name === codeDetail.Name);
        if (ledgerGroup) {
          this.FilteredLedgerList = this.AllLedgerList.filter(a => a.LedgerGroupId === ledgerGroup.LedgerGroupId);
        }
      }
      //this.FilteredLedgerList = this.AllLedgerList.filter(a => a.LedgerGroupId === 6);
      this.Payment.PaymentValidator.controls["PaymentFrom"].enable();
      this.SubLedgerEnable = true;
      this.ShowPayeeAndCheque = false;
    }
    else {
      this.Payment.PaymentValidator.controls["PaymentFrom"].disable();
      this.ShowPayeeAndCheque = false;
    }
    this.FocusFromPaymentMode();
  }
  public onSearchByDate() {
    if (this.IsDateSelected) {
      this.Date = this.SelectedDate;
    }
    else {
      this.Date = "";
    }
  }
  public FocusElementById(id: string) {
    window.setTimeout(function () {
      let itmNameBox = document.getElementById(id);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 600);
  }
  public FocusFromPaymentMode() {
    if (this.Payment.PaymentMode === ENUM_ACC_PaymentMode.NA) {
      this.FocusElementById('PaymentMode');
    }
    else {
      this.FocusElementById('PaymentFrom');
    }
  }
  public hotkeys(event) {
    if (event.keyCode === 27) {
      this.close();
    }
  }
  public amountCalculations() {
    if (this.Payment.VoucherAmount <= this.Payment.DueAmount) {
      this.Payment.RemainingAmount = this.Payment.VoucherAmount ? this.Payment.DueAmount - this.Payment.VoucherAmount : this.Payment.DueAmount;
    }
  }
  public UpdateLedgers() {
    try {
      DanpheCache.clearDanpheCacheByType(MasterType.LedgersAll);
      this.accountingService.RefreshAccCacheData();
    }
    catch (ex) {
      console.log(ex);
    }
  }
  public clearGrList(event) {
    this.GrList = [];
    if (this.SelectedVendor && !this.SelectedVendor.IsMapped && this.SubLedgerAndCostCenterSetting.EnableSubLedger) {
      let ledgerObj = this.AllLedgerList.find(a => a.Name === this.InventoryVendorLedgerParam.LedgerName);
      if (this.SubLedgerAndCostCenterSetting.EnableSubLedger && !ledgerObj) {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, [`Please set default ledger in LedgerGroupMapping parameter for inventory vendor.`]);
      }
      else {
        this.LedgerForSubLedger = ledgerObj;
        this.LedgerForSubLedger.LedgerName = ledgerObj.LedgerName;
        this.InvSectionFlag = true;
      }
    }
    else if (this.SelectedSupplier && !this.SelectedSupplier.IsMapped && this.SubLedgerAndCostCenterSetting.EnableSubLedger) {
      let ledgerObj = this.AllLedgerList.find(a => a.Name === this.PharmacySupplierLedgerParam.LedgerName);
      if (this.SubLedgerAndCostCenterSetting.EnableSubLedger && !ledgerObj) {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, [`Please set default ledger in LedgerGroupMapping parameter for pharmacy Supplier.`]);
      }
      else {
        this.LedgerForSubLedger = ledgerObj;
        this.LedgerForSubLedger.LedgerName = ledgerObj.LedgerName;
        this.PhrmSectionFlag = true;
      }
    }
  }
}