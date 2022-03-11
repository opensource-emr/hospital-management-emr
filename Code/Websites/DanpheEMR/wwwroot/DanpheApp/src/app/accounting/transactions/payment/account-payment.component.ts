import { Component } from "@angular/core";
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { SectionModel } from "../../settings/shared/section.model";
import { AccountingBLService } from "../../shared/accounting.bl.service";
import { AccountingService } from "../../shared/accounting.service";
import { Payment } from "./account-payment.model";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { TransactionModel } from "../shared/transaction.model";
import { TransactionItem } from "../shared/transaction-item.model";
import { SecurityService } from "../../../security/shared/security.service";
import * as moment from "moment";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { LedgerModel } from "../../settings/shared/ledger.model";
import { DanpheCache,MasterType } from "../../../shared/danphe-cache-service-utility/cache-services";

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
  public selectedVendor: any;
  public selectedSupplier: any;
  public GrList: Array<any> = [];
  public showPaymentPopup: boolean = false;
  public payment: Payment = new Payment();
  public transaction: TransactionModel = new TransactionModel();
  public createLedgerFlag: boolean = false;
  public voucherNumber: string = null;
  public fiscalYearId: number = 0;
  public showAddLedgerBox: boolean = false;
  public ledReferenceId: number = 0;
  public ledgerType: string = "";
  public selectedLedger: any = "";
  public allLedgerList: Array<LedgerModel> = [];
  public showPayeeAndCheque: boolean = false;
  public loading: boolean = false;
  public sectionId: number = 1;
  public invSectionFlag: boolean = true;;
  public phrmSectionFlag: boolean = false;
  public SupplierList: any;
  public vendorId: number = 0;
  public supplierId: number = 0;
  public ledgerName: string = "";
  public ledgerId: number = 0;
  public grNumber: string = '';
  public invoiceNumber: string = '';
  public date: string = '';
  public selectedDate: string = '';
  public isDateSelected: boolean = false;
  public otherSectionFlag: boolean = false;
  constructor(public accountingService: AccountingService,
    public accountingBlService: AccountingBLService,
    public securityServ: SecurityService,
    public msgBoxServ: MessageboxService) {
    this.loadCacheList();
    this.getInventoryVendorlist();
    this.payment.PaymentMode = 'NA';
  }
  public loadCacheList() {
    if (!!this.accountingService.accCacheData.Sections && this.accountingService.accCacheData.Sections.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
      this.SectionList = this.accountingService.accCacheData.Sections;//mumbai-team-june2021-danphe-accounting-cache-change
      this.SectionList = this.SectionList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
      this.FilteredSectionList = this.SectionList.filter(a => a.SectionId != 4);
      this.FilteredSectionList = this.FilteredSectionList.filter(a => a.SectionId != 2);
    }
    if (!!this.accountingService.accCacheData.LedgersALL && this.accountingService.accCacheData.LedgersALL.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
      this.allLedgerList = this.accountingService.accCacheData.LedgersALL;//mumbai-team-june2021-danphe-accounting-cache-change
      this.allLedgerList = this.allLedgerList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
    }
  }
  public onSectionChange() {
    try {
      var code = this.FilteredSectionList.find(
        (s) => s.SectionId == this.sectionId
      ).SectionCode;
      this.selectedVendor = "";
      this.selectedSupplier = "";
      this.selectedLedger = "";
      this.GrList = [];
      if (code == 'INV') {
        this.otherSectionFlag=false;
        this.getInventoryVendorlist();
      }
      else if (code == 'PH') {
        this.otherSectionFlag=false;
        this.getPharmacySupplierlist();
      }
      else {
        this.VendorList = [];
        this.SupplierList = [];
        this.otherSectionFlag=true;
      }
    } catch (ex) { }
  }
  public getInventoryVendorlist() {
    this.accountingBlService.GetInvVendorList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.VendorList = res.Results;
          this.SetupInvGridColumns = GridColumnSettings.VendorList;
          this.invSectionFlag = true;
          this.phrmSectionFlag = false;
        }
      });
  }
  public getPharmacySupplierlist() {
    this.accountingBlService.GetPharmacySupplier()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.SupplierList = res.Results;
          this.SetupPhrmGridColumns = GridColumnSettings.SupplierList;
          this.phrmSectionFlag = true;
          this.invSectionFlag = false;;
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
    if (this.invSectionFlag) {
      if (this.selectedVendor) {
        this.onChangeVendor(this.selectedVendor);
      }
      else {
        this.msgBoxServ.showMessage("error", ["Please select vendor"]);
      }
    }
    else if (this.phrmSectionFlag) {
      if (this.selectedSupplier) {
        this.onChangeSupplier(this.selectedSupplier);
      }
      else {
        this.msgBoxServ.showMessage("error", ["Please select supplier"]);
      }
    }
  }
  public onChangeVendor(vendor) {
    if (vendor) {
        this.ledgerId = vendor.LedgerId;
        this.ledgerName = vendor.LedgerName;
        vendor.VendorId = vendor.VendorId ? vendor.VendorId : vendor.SupplierId;
        this.vendorId = vendor.VendorId;
        this.loadInvGrList(vendor.VendorId, this.sectionId, this.grNumber, this.date);
    }
  }
  public loadInvGrList(grId, sectionId, number, date) {
    this.accountingBlService.GetGRList(grId, sectionId, number, date)
      .subscribe(res => {
        if (res.Status == "OK" && res.Results.length) {
          this.GrList = res.Results;
        }
        else {
          this.GrList = [];
          this.msgBoxServ.showMessage("notice-message", ["Good receipt list is not available for selected vendor"]);
        }
      });
  }
  public onChangeSupplier(supplier) {
    if (supplier) {
        this.ledgerId = supplier.LedgerId;
        this.ledgerName = supplier.LedgerName;
        this.supplierId = supplier.SupplierId;
        this.loadPhrmGrList(supplier.SupplierId, this.sectionId, this.invoiceNumber, this.date);
    }
  }
  public loadPhrmGrList(grId, sectionId, number, date) {
    this.accountingBlService.GetGRList(grId, sectionId, number, date)
      .subscribe(res => {
        if (res.Status == "OK" && res.Results.length) {
          this.GrList = res.Results;
        } else {
          this.GrList = [];
          this.msgBoxServ.showMessage("notice-message", ["Good receipt list is not available for selected supplier"]);
        }
      });
  }
  public gRListGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "view": {
        this.payment.GrDate = $event.Data.GRDate;
        this.payment.GrDate = moment(this.payment.GrDate).format('YYYY-MM-DD');
        this.payment.GrNo = $event.Data.GRNo;
        this.payment.TotalAmount = $event.Data.TotalAmount;
        this.payment.PaidAmount = $event.Data.PaidAmount;
        this.payment.DueAmount = $event.Data.DueAmount;
        this.payment.RemainingAmount = $event.Data.RemainingAmount;
        this.payment.GoodReceiptID = $event.Data.GRId;
        this.payment.LedgerName = this.ledgerName;
        this.payment.LedgerId = this.payment.ReceiverLedgerId = this.ledgerId;
        this.payment.InvoiceNo = $event.Data.InvoiceNo;
        this.payment.VoucherAmount =this.payment.DueAmount;
        this.FocusElementById('VoucherAmount');
        this.selectedLedger = "";
        this.showPaymentPopup = true;
        this.loading = false;
        this.showPayeeAndCheque = false;
      }
      default:
        break;
    }
  }
  public close() {
    this.payment = new Payment();
    this.transaction = new TransactionModel();
    this.showPaymentPopup = false;
    this.loading = false;
    this.selectedLedger = "";
    this.payment.PaymentMode = 'NA';
  }
  public makePayment() {
    //for checking validations, marking all the fields as dirty and checking the validity.
    for (var i in this.payment.PaymentValidator.controls) {
      this.payment.PaymentValidator.controls[i].markAsDirty();
      this.payment.PaymentValidator.controls[i].updateValueAndValidity();
    }
    if (this.payment.Narration.trim().length == 0) {
      this.msgBoxServ.showMessage("error", ["Narration is compulsory"]);
      this.loading = false;
      this.FocusElementById('Narration');
      return;
    }
    if (this.showPayeeAndCheque) {
      if (!this.payment.ChequeNo || !this.payment.PayeeName) {
        this.msgBoxServ.showMessage("error", ["Payee Name and Cheque No are mandatory"]);
        this.loading = false;
        return;
      }
    }
    if (this.payment.PaymentMode == 'NA') {
      this.msgBoxServ.showMessage("error", ["Payment mode is mandatory"]);
      this.loading = false;
      this.FocusElementById('PaymentMode');
      return;
    }
    if (!this.payment.LedgerId) {
      this.msgBoxServ.showMessage("error", ["Please create ledger first"]);
      this.loading = false;
      return;
    }
    if (this.payment.IsValidCheck(undefined, undefined)) {
      this.transaction = new TransactionModel();
      this.transaction.TransactionItems = [];
      this.transaction.FiscalYearId = 0// NageshBB- add fiscal YearId at server side //this.fiscalYear.FiscalYearId; 
      this.transaction.VoucherId = 0;
      this.transaction.TransactionType = this.payment.PaymentMode;
      this.transaction.Remarks = (this.payment.Narration && this.payment.Narration.length) ? this.payment.Narration.trim() : '';
      let drTransactionItem: TransactionItem = new TransactionItem();
      let crTransactionItem: TransactionItem = new TransactionItem();
      drTransactionItem.Amount = crTransactionItem.Amount = this.payment.VoucherAmount;
      drTransactionItem.DrCr = true;
      drTransactionItem.LedgerId = this.invSectionFlag ? this.selectedVendor.LedgerId : this.selectedSupplier.LedgerId;

      crTransactionItem.LedgerId = this.selectedLedger.LedgerId;
      crTransactionItem.DrCr = false;

      this.transaction.TransactionItems.push(crTransactionItem);
      this.transaction.TransactionItems.push(drTransactionItem);

      this.transaction.CreatedBy = this.securityServ.loggedInUser.EmployeeId;
      this.transaction.Remarks = this.payment.Remarks = this.payment.Narration.trim();

      if (this.showPayeeAndCheque) {
        this.transaction.PayeeName = this.payment.PayeeName;
        this.transaction.ChequeNumber = this.payment.ChequeNo;
      }
      this.payment.SectionId = this.sectionId;
      this.accountingBlService.PostPayment(this.payment, this.transaction)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.loading = false;
            this.msgBoxServ.showMessage("success", ["Your payment voucher is posted"]);
            this.showPaymentPopup = false;
            if (res.Results) {
              this.fiscalYearId = res.Results.FiscalYearId;
              this.voucherNumber = res.Results.VoucherNumber;
            }
            if (this.invSectionFlag) {
              this.loadInvGrList(this.vendorId, this.payment.SectionId, this.grNumber, this.date);
            } else {
              this.loadPhrmGrList(this.supplierId, this.payment.SectionId, this.invoiceNumber, this.date);
            }
            this.payment = new Payment();
            this.transaction = new TransactionModel();
            this.selectedLedger = "";
            this.payment.PaymentMode = 'NA';
          }
          else {
            this.loading = false;
            this.payment = new Payment();
            this.transaction = new TransactionModel();
            this.selectedLedger = "";
            this.msgBoxServ.showMessage("error", ["Payment failed"]);
            this.payment.PaymentMode = 'NA';
          }
        })
    }
    else {
      this.loading = false;
    }
  }
  public cancel() {
    this.payment = new Payment();
    this.transaction = new TransactionModel();
    this.showPaymentPopup = false;
    this.payment.PaymentMode = 'NA';
  }
  public CreateNewLedger() {
    if(this.invSectionFlag){
      this.ledgerType='inventoryvendor';
      this.ledReferenceId=this.selectedVendor.VendorId;
      this.showAddLedgerBox = true;
    }
    else{
      this.ledgerType='pharmacysupplier';
      this.ledReferenceId=this.selectedSupplier.SupplierId;
      this.showAddLedgerBox = true;
    }
    if(this.showPaymentPopup){
      this.close();
      this.clearGrList()
    }
 
  }
  public OnNewLedgerAdded() {
  this.showAddLedgerBox = false;
  this.UpdateLedgers();
  this.loadCacheList();
  this.selectedLedger="";
  if(this.invSectionFlag){
    this.selectedVendor="";
    this.getInventoryVendorlist();
  }else if(this.phrmSectionFlag){
    this.selectedSupplier="";
    this.getPharmacySupplierlist();
  }
  }
  public paymentModeChange() {
    if (this.payment.PaymentMode == 'cheque') {
      this.showPayeeAndCheque = true;
    }
    else {
      this.showPayeeAndCheque = false;
    }
    this.FocusFromPaymentMode();
  }
  public onSearchByDate() {
    if (this.isDateSelected) {
      this.date = this.selectedDate;
    }
    else {
      this.date = "";
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
    if (this.showPayeeAndCheque) {
      this.FocusElementById('PayeeName');
    } else if (this.payment.PaymentMode == 'NA') {
      this.FocusElementById('PaymentMode');
    } else {
      this.FocusElementById('Narration');
    }

  }
  public hotkeys(event) {
    if (event.keyCode == 27) {
      this.close();
    }
  }
  public amountCalculations() {
    if (this.payment.VoucherAmount <= this.payment.DueAmount) {
      this.payment.RemainingAmount = this.payment.VoucherAmount ? this.payment.DueAmount - this.payment.VoucherAmount : this.payment.DueAmount;
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
  public clearGrList(){
    this.GrList=[];
  }
}