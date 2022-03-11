import { Component, Input, OnInit, Type } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { BillingFiscalYear } from '../../../../billing/shared/billing-fiscalyear.model';
import { BillingTransactionItem } from '../../../../billing/shared/billing-transaction-item.model';
import { PatientBillingContextVM } from '../../../../billing/shared/patient-billing-context-vm';
import { CoreService } from '../../../../core/shared/core.service';
import { PatientService } from '../../../../patients/shared/patient.service';
import { PharmacyReceiptModel } from '../../../../pharmacy/shared/pharmacy-receipt.model';
import { PharmacyBLService } from '../../../../pharmacy/shared/pharmacy.bl.service';
import { PharmacyService } from '../../../../pharmacy/shared/pharmacy.service';
import { PHRMInvoiceItemsModel } from '../../../../pharmacy/shared/phrm-invoice-items.model';
import { PHRMInvoiceModel } from '../../../../pharmacy/shared/phrm-invoice.model';
import { PHRMPatient } from '../../../../pharmacy/shared/phrm-patient.model';
import { PHRMStoreModel } from '../../../../pharmacy/shared/phrm-store.model';
import { SecurityService } from '../../../../security/shared/security.service';
import { CallbackService } from '../../../../shared/callback.service';
import { DanpheHTTPResponse } from '../../../../shared/common-models';
import { CommonFunctions } from '../../../../shared/common.functions';
import GridColumnSettings from '../../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from '../../../../shared/danphe-grid/grid-emit.model';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../../../shared/routefrom.service';
import { DispensaryService } from '../../../shared/dispensary.service';

@Component({
  selector: 'app-credit-bills',
  templateUrl: './credit-bills.component.html',
  styleUrls: ['./credit-bills.component.css']
})
export class CreditBillsComponent implements OnInit {
  BillMode: "FinalizeInvoice" | "UpdateInvoice" = "FinalizeInvoice";
  @Input("patientId") patientId: number;
  @Input("provisionalFromSettlement") provisionalFromSettlement = false;
  public counterId: number = 0;
  public allCreditItems: Array<PHRMInvoiceItemsModel> = new Array<PHRMInvoiceItemsModel>();
  public provisionalBillsSummary: Array<any> = [];
  public showAllPatient: boolean = true;  // to show the form required to show the credit details

  public creditBillGridColumns: Array<any> = null;
  //declare boolean loading variable for disable the double click event of button
  loading: boolean = false;
  //added: sud:12May'18
  public selectAllItems: boolean = false;
  public currentPatient: PHRMPatient = new PHRMPatient();
  public showActionPanel: boolean = false;
  public selectedItemsTotAmount: number = 0;
  public remarks: string = null;
  public showCancelSummaryPanel: boolean = false;
  public checkDeductfromDeposit: boolean = false;
  public deductDeposit: boolean = false;
  public cancelledItems: Array<BillingTransactionItem> = [];
  public highlightRemark: boolean = false;
  public currBillingContext: PatientBillingContextVM;
  public admissionDetail;
  public selectedSaleCreditData: PHRMPatient = new PHRMPatient();
  //sud: 31May'18--to display patient bill summary
  public showPatBillHistory: boolean = false;
  public userName: any;
  public isPrint: boolean = false;
  public showSaleItemsPopup: boolean = false;
  //for show and hide item level discount features
  IsitemlevlDis: boolean = false;
  public allFiscalYrs: Array<BillingFiscalYear> = new Array<BillingFiscalYear>();
  public pharmacyReceipt: PharmacyReceiptModel = new PharmacyReceiptModel();
  public patBillHistory = {
    IsLoaded: false,
    PatientId: null,
    CreditAmount: null,
    ProvisionalAmt: null,
    TotalDue: null,
    DepositBalance: null,
    BalanceAmount: null
  };

  public currentCounter: number = null;
  public total: number = 0;
  public today = new Date();
  public isSubStoreCall: boolean = false;
  public currentActiveDispensary: PHRMStoreModel;
  public fromDate: string = null;
  public toDate: string = null;
  public dateRange: string = "last1Week";
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public isItemLevelVATApplicable: boolean;
  public isMainVATApplicable: boolean;
  public isMainDiscountAvailable: boolean;
  selectedPatientId: number;

  constructor(private _dispensaryService: DispensaryService,
    public routeFromService: RouteFromService,
    public router: Router,
    public pharmacyService: PharmacyService,
    public patientService: PatientService,
    public securityService: SecurityService,
    public callbackservice: CallbackService,
    public messageboxService: MessageboxService,
    public pharmacyBLService: PharmacyBLService,
    public coreService: CoreService) {
    this.currentCounter = this.securityService.getPHRMLoggedInCounter().CounterId;
    this.currentActiveDispensary = this._dispensaryService.activeDispensary;
    this.fromDate = moment().format('YYYY-MM-DD');
    this.toDate = moment().format('YYYY-MM-DD');
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('LastCreditBillDate', false));
    if (this.currentCounter < 1) {
      if (this.routeFromService.RouteFrom != "") {
        this.currentCounter = 1;
      } else {
        this.callbackservice.CallbackRoute = 'Dispensary/Sale/CreditBills'
        this.router.navigate(['/Dispensary/ActivateCounter']);
      }
    }
    else {
      this.creditBillGridColumns = GridColumnSettings.BillCreditBillSearch;
      // this.GetUnpaidTotalBills();
      this.GetAllFiscalYrs();
      //this.LoadPatientInvoiceSummary(this.patientService.getGlobal().PatientId);
      this.checkProvisionalBillsCustomization();
    }

  }

  ngOnInit() {
    if (this.patientService.getGlobal().PatientId) this.SetFromGlobalPatient();
    this.fromSubStore(); // Calling fromSubStore function When SubStore-Patient Consumption sets global Patient Info.
    if (this.provisionalFromSettlement == true) {
      this.GetPatientProvisionalItems(this.patientId);

    }
  }
  onGridDateChange($event) {

    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.GetUnpaidTotalBills();
      } else {
        this.messageboxService.showMessage('failed', ['Please enter valid From date and To date']);
      }

    }

  }
  SetFromGlobalPatient() {
    var gPatientId = this.patientService.getGlobal().PatientId;
    if (gPatientId) {
      var data = this.patientService.getGlobal();
      this.ShowPatientProvisionalItems(data);
      this.LoadPatientInvoiceSummary(gPatientId);
    }
  }
  fromSubStore() {
    //used to get global patient id sent from substore patient consumption and show the provisional consumption items of respective patient
    if (this.routeFromService.RouteFrom == "/WardSupply/Pharmacy/Consumption") this.isSubStoreCall = true;
  }
  ngOnDestroy() {
    this.patientService.CreateNewGlobal();
    this.showCancelSummaryPanel = false;
    this.showActionPanel = false;
    this.allCreditItems = [];
    this.cancelledItems = [];
    this.showPatBillHistory = false;
  }

  //gets summary of all patients
  GetUnpaidTotalBills() {
    this.pharmacyBLService.GetAllCreditSummary(this.fromDate, this.toDate, this.currentActiveDispensary.StoreId)
      .subscribe((res: DanpheHTTPResponse) => {
        this.patientService
        this.provisionalBillsSummary = res.Results;
      });
  }
  //gets credit items of single patient.
  GetPatientProvisionalItems(patientId: number) {

    this.pharmacyBLService.GetPatientCreditItems(patientId, this.currentActiveDispensary.StoreId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.allCreditItems = res.Results;
          this.currSaleItems = this.allCreditItems;
          if (this.isPrint == true) {
            if (this.allCreditItems) {
              this.AssignAllValues();
              this.AllCalculation();
            }
            this.ProvisionalDataReceipt(res);
          }
        }
        this.allCreditItems.forEach((item) => {
          item.DispatchQty = item.Quantity;
        });
        this.selectAllItems = true;
        this.SelectAllChkOnChange();
      });
  }



  ShowPatientProvisionalItems(row): void {
    this.showAllPatient = false;
    //patient mapping later used in receipt print
    this.currentPatient.ShortName = row.ShortName;
    this.currentPatient.FirstName = row.FirstName;
    this.currentPatient.LastName = row.LastName;
    this.currentPatient.PatientCode = row.PatientCode;
    this.currentPatient.DateOfBirth = row.DateOfBirth;
    this.currentPatient.Gender = row.Gender;
    this.currentPatient.Address = row.Address;
    this.currentPatient.CountrySubDivisionName = row.CountrySubDivisionName
    this.currentPatient.PANNumber = row.PANNumber;
    this.currentPatient.PatientId = row.PatientId;
    this.currentPatient.PhoneNumber = row.PhoneNumber;
    this.currentPatient.CreatedOn = row.LastCreditBillDate;
    this.currentPatient.CreatedOn = row.LastCreditBillDate;
    var patient = this.patientService.CreateNewGlobal();
    patient.ShortName = row.ShortName;
    patient.PatientCode = row.PatientCode;
    patient.DateOfBirth = row.DateOfBirth;
    patient.Age = row.Age;
    patient.Gender = row.Gender;
    patient.PatientId = row.PatientId;
    patient.PhoneNumber = row.PhoneNumber;
    this.currBillingContext = null;
    this.admissionDetail = null;
    this.GetPatientProvisionalItems(patient.PatientId);
  }

  CreditBillGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "showDetails":
        {
          var data = $event.Data;
          this.ShowPatientProvisionalItems(data);
          this.LoadPatientInvoiceSummary(this.patientService.getGlobal().PatientId);
          break;
        }
      case "view": {
        if ($event.Data != null) {
          var CreditData = $event.Data;
          this.remarks = $event.Data.Remarks;
          this.userName = $event.Data.UserName;
          this.isPrint = true;
          this.ShowPatientProvisionalItems(CreditData);
        }
        break;
      }
      default:
        break;
    }
  }

  BackToGrid() {
    if (this.routeFromService.RouteFrom == null || this.routeFromService.RouteFrom != "") {
      this.router.navigate([this.routeFromService.RouteFrom]);
    }
    else {
      this.showAllPatient = true;
      //reset current patient value on back button..
      this.patientService.CreateNewGlobal();
      this.showCancelSummaryPanel = false;
      this.showActionPanel = false;
      this.allCreditItems = [];
      this.cancelledItems = [];
      this.showPatBillHistory = false;
      this.router.navigate(['Dispensary/Sale/CreditBills']);
    }
  }

  SelectAllChkOnChange() {

    if (this.allCreditItems && this.allCreditItems.length) {
      if (this.selectAllItems) {

        this.allCreditItems.forEach((itm, index) => {
          itm.IsSelected = true;
          itm.ReturnQty = 0;
          itm.Quantity = itm.DispatchQty;
        });
        //push all CreditItems to CurrentSaleItems when Select All is clicked.
        this.currSaleItems = this.allCreditItems.map(itm => {
          return itm;
        })
        this.showActionPanel = true;
      }
      else {
        this.allCreditItems.forEach((itm, index) => {
          itm.IsSelected = false;
          itm.ReturnQty = itm.DispatchQty;
          itm.Quantity = itm.DispatchQty - itm.ReturnQty;
          this.ValueChanged(index)
        });
      }
      this.AllCalculation();
    }
  }
  onBillModeChanged() {

    this.currSaleItems.forEach(item => {
      item.Quantity = item.DispatchQty;
      item.ReturnQty = 0;
      let subtotal = (item.Quantity - item.FreeQuantity) * item.MRP;
      item.SubTotal = CommonFunctions.parseAmount(subtotal);
      item.TotalDisAmt = CommonFunctions.parsePhrmAmount(item.SubTotal * (item.DiscountPercentage) / 100)
      item.TotalAmount = CommonFunctions.parseAmount(subtotal + (item.SubTotal * item.VATPercentage) - item.TotalDisAmt);
      this.currSale.Tender = CommonFunctions.parseAmount(this.currSale.TotalAmount);
    });

    this.selectAllItems = true;
    this.SelectAllChkOnChange();
  }
  //Sets the component's check-unchecked properties on click of Component-Level Checkbox.
  SelectItemChkOnChange(item, index) {

    this.selectAllItems = this.allCreditItems.every(item => item.IsSelected == true);
    item.ReturnQty = (item.IsSelected == false) ? item.DispatchQty : 0;
    item.Quantity = item.DispatchQty - item.ReturnQty;
    this.ValueChanged(index)
    this.AllCalculation();
  }



  CancelItems() {
    if (this.remarks && this.remarks != "") {

      var a = window.confirm("are you sure you want to cancel?")
      if (a) {
        let selectedBilItems = this.allCreditItems.filter(b => b.IsSelected);
        let txnItemsToCancel = selectedBilItems.map(bil => {
          bil.CancelRemarks = this.currSale.Remark;//we should use same remarks for both payment and cancellation.
        });

      }
      else {

      }
    }
    else {
      this.messageboxService.showMessage("error", ["Remarks is mandatory for cancellation."]);


    }
  }



  //start: Changes for Pharmacy : sud--4Sept'18
  public currSale: PHRMInvoiceModel = new PHRMInvoiceModel();
  public currSaleItems: Array<PHRMInvoiceItemsModel> = new Array<PHRMInvoiceItemsModel>();
  public currSaleItemsRetOnly: Array<PHRMInvoiceItemsModel> = new Array<PHRMInvoiceItemsModel>();

  //end: Changes for Pharmacy : sud--4Sept'18
  ValueChanged(index) {
    try {
      let item = this.currSaleItems[index];
      if (item.Quantity > item.TotalQty) {
        item.IsDirty('Quantity');
      }
      item.Quantity = item.DispatchQty - item.ReturnQty;
      let subtotal = (item.Quantity - item.FreeQuantity) * item.MRP;
      item.SubTotal = CommonFunctions.parseAmount(subtotal);
      item.TotalDisAmt = CommonFunctions.parsePhrmAmount(item.SubTotal * (item.DiscountPercentage) / 100)
      item.TotalAmount = CommonFunctions.parseAmount(subtotal + (item.SubTotal * item.VATPercentage) - item.TotalDisAmt);
      this.currSale.Tender = CommonFunctions.parseAmount(this.currSale.TotalAmount);
      this.AllCalculation();
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  //Method for all calculation
  AllCalculation(discPer?, discAmt?) {
    try {
      if (this.currSaleItems.length > 0) {
        var subTotal: number = 0;
        this.currSale.SubTotal = 0;
        this.currSale.TotalAmount = 0;
        this.currSale.VATAmount = 0;
        this.currSale.DiscountAmount = 0;
        let TotalitemlevDisAmt: number = 0;
        let Subtotalofitm: number = 0;
        for (let item of this.currSaleItems) {

          // calculate per item  total discount amount
          let itmdisAmt = CommonFunctions.parsePhrmAmount(item.SubTotal * (item.DiscountPercentage) / 100);
          item.TotalDisAmt = CommonFunctions.parsePhrmAmount(itmdisAmt);
          this.currSale.SubTotal = CommonFunctions.parsePhrmAmount(this.currSale.SubTotal + item.SubTotal - (itmdisAmt));
          this.currSale.TotalAmount = CommonFunctions.parsePhrmAmount(this.currSale.TotalAmount + item.TotalAmount);
          let temp = (item.Quantity - item.FreeQuantity) * item.MRP;
          this.currSale.DiscountAmount = CommonFunctions.parsePhrmAmount(this.currSale.DiscountAmount + (temp - item.SubTotal));

          TotalitemlevDisAmt = TotalitemlevDisAmt + item.TotalDisAmt;           // cal total item level disamt
          Subtotalofitm = Subtotalofitm + item.SubTotal;           // cal subtotal.
        }
        this.currSale.VATAmount = CommonFunctions.parsePhrmAmount(this.currSale.TotalAmount - this.currSale.SubTotal);

        //for bulk discount calculation and conversion of percentage into amount and vice versa
        if (this.isMainDiscountAvailable == true) {
          if (discPer == 0 && discAmt > 0) {
            this.currSale.TotalAmount = this.currSale.TotalAmount - discAmt;
            this.currSale.DiscountAmount = discAmt;
            discPer = (discAmt / this.currSale.SubTotal) * 100;
            this.currSale.DiscountPer = CommonFunctions.parsePhrmAmount(discPer);
          }
          if (discPer > 0 && discAmt == 0) {
            discAmt = CommonFunctions.parsePhrmAmount(this.currSale.TotalAmount * (discPer) / 100)
            this.currSale.TotalAmount = this.currSale.SubTotal - discAmt;
            this.currSale.DiscountAmount = discAmt;
            this.currSale.DiscountPer = discPer;
          }
          if (discPer == 0 && discAmt == 0) {
            this.currSale.SubTotal = this.currSale.SubTotal;
            this.currSale.TotalAmount = this.currSale.TotalAmount;
            this.currSale.DiscountAmount = discAmt;
            this.currSale.DiscountPer = discPer;
          }
          this.currSale.TotalAmount = CommonFunctions.parsePhrmAmount(this.currSale.SubTotal - this.currSale.DiscountAmount);


        }
        else {                                      //this cal for total item level discount
          this.currSale.SubTotal = CommonFunctions.parsePhrmAmount(
            Subtotalofitm
          );
          this.currSale.DiscountAmount = CommonFunctions.parsePhrmAmount(
            TotalitemlevDisAmt
          );
          let totaldisper = (this.currSale.DiscountAmount / this.currSale.SubTotal) * 100;
          this.currSale.DiscountPer = CommonFunctions.parsePhrmAmount(
            totaldisper
          );
        }
        //this.currSale.Change = CommonFunctions.parseAmount(this.currSale.Tender - this.currSale.TotalAmount);
        this.currSale.PaidAmount = CommonFunctions.parsePhrmAmount(this.currSale.SubTotal - this.currSale.DiscountAmount);
        //this.currSale.Adjustment = CommonFunctions.parseAmount(this.currSale.PaidAmount - this.currSale.TotalAmount);
        this.currSale.Tender = CommonFunctions.parsePhrmAmount(this.currSale.TotalAmount);
        //this.currSale.PatientId = this.currSale.InvoiceItems[0].
        if (!this.isPrint)
          this.ChangeTenderAmount();
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }

  ChangeTenderAmount() {
    this.currSale.Change = CommonFunctions.parseAmount(this.currSale.Tender - this.currSale.PaidAmount);
  }

  //This function only for show catch messages
  ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      this.routeFromService.RouteFrom = null;
      this.messageboxService.showMessage("error", ["Check error in Console log !"]);
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }
  //after invoice is succesfully added this function is called.
  CallBackSaveSale(res) {
    try {
      if (res.Status == "OK") {
        let txnReceipt = PharmacyReceiptModel.GetReceiptForTransaction(res.Results);
        //must filter the invoice items, so that the returned item won't be seen in the receipt
        txnReceipt.InvoiceItems = txnReceipt.InvoiceItems.filter(item => item.Quantity > 0);
        // txnReceipt.ReceiptNo = res.InvoiceId;//////Math.floor(Math.random() * 100) + 1;
        //txnReceipt.ReceiptDate = moment().format("YYYY-MM-DD");
        txnReceipt.IsValid = true;
        txnReceipt.ReceiptType = "Sale Receipt";
        txnReceipt.BillingUser = this.userName;

        txnReceipt.Patient = this.currentPatient;
        txnReceipt.CurrentFinYear = this.allFiscalYrs.find(f => f.FiscalYearId == res.Results.FiscalYearId).FiscalYearName;
        this.pharmacyService.globalPharmacyReceipt = txnReceipt;
        this.router.navigate(['/Dispensary/Sale/ReceiptPrint']);
        this.currSale = new PHRMInvoiceModel();
        this.currSaleItems = new Array<PHRMInvoiceItemsModel>();
        this.messageboxService.showMessage("success", ["Succesfully. "]);
        this.loading = false;
      }
      else {
        this.messageboxService.showMessage("failed", [res.ErrorMessage]);
        this.loading = false;
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }
  ProvisionalDataReceipt(res) {
    try {
      if (res.Status == "OK") {

        this.loading = true;
        this.currSale.InvoiceItems = this.currSaleItems;
        let invoicedetails = this.currSale;
        let txnReceipt = PharmacyReceiptModel.GetReceiptForTransaction(this.currSale);

        txnReceipt.ReceiptDate = moment().format("YYYY-MM-DD HH:mm");
        txnReceipt.IsValid = true;
        txnReceipt.ReceiptType = "Credit Receipt";
        txnReceipt.BillingUser = this.userName;
        txnReceipt.Patient = this.currentPatient;
        txnReceipt.StoreId = this.currentActiveDispensary.StoreId;
        this.pharmacyService.globalPharmacyReceipt = txnReceipt;
        this.router.navigate(['/Dispensary/Sale/ReceiptPrint']);
        this.currSale = new PHRMInvoiceModel();
        this.currSaleItems = new Array<PHRMInvoiceItemsModel>();
        //this.messageboxService.showMessage("success", ["Succesfully. "]);
        this.loading = false;
      }
      else {
        this.messageboxService.showMessage("failed", [res.ErrorMessage]);
        this.loading = false;
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }
  PrintReceipt(): void {
    try {
      let check: boolean = true;
      if (check) {

        this.loading = true;
        this.currSale.CounterId = this.currentCounter;
        this.currSale.InvoiceItems = this.currSaleItems;
        this.currSale.VisitType = this.currSaleItems[0].VisitType;
        this.currSale.DepositDeductAmount = this.depositDeductAmount;
        this.currSale.DepositBalance = this.newdepositBalance;
        this.currSale.DepositAmount = this.depositDeductAmount;
        this.currSale.StoreId = this.currentActiveDispensary.StoreId;
        this.pharmacyBLService.AddInvoiceForCreditItems(this.currSale)
          .subscribe(res => {
            if (res.Status == "OK" && res.Results != null) {

              this.CallBackSaveSale(res),
                this.loading = false;
            }
            else if (res.Status == "Failed") {
              this.loading = false;
              this.messageboxService.showMessage("error", ['There is problem, please try again']);

            }
          },
            err => {
              this.loading = false;
              this.messageboxService.showMessage("error", [err.ErrorMessage]);
            });
      }
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }
  update(): void {
    try {
      let check: boolean = true;
      if (check) {

        this.loading = true;
        this.currSale.InvoiceItems = this.currSaleItems;
        this.currSale.StoreId = this.currentActiveDispensary.StoreId;
        this.currSaleItems.forEach(a => a.StoreId == this.currentActiveDispensary.StoreId);
        this.pharmacyBLService.updateInvoiceForCreditItems(this.currSaleItems)
          .subscribe(res => {
            if (res.Status == "OK" && res.Results != null) {

              this.currSaleItems = res.Results;
              for (let item of this.currSaleItems) {
                if (item.ReturnQty != 0) {
                  let subtotal = item.ReturnQty * item.MRP; //cal. return item subtotal
                  item.TotalDisAmt = (subtotal * item.DiscountPercentage / 100) //cal. return item dis amt
                  item.TotalAmount = subtotal - item.TotalDisAmt;  //cal. return item total amt
                  this.currSaleItemsRetOnly.push(item);
                }
              }
              this.CallBackupdaeInvoice(res),
                this.loading = false;
            }
            else if (res.Status == "Failed") {
              this.loading = false;
              this.messageboxService.showMessage("error", ['There is problem, please try again']);

            }
          },
            err => {
              this.loading = false;
              this.messageboxService.showMessage("error", [err.ErrorMessage]);
            });

      }
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }
  CallBackupdaeInvoice(res) {
    try {
      if (res.Status == "OK") {
        var newSaleItem = new PHRMInvoiceItemsModel();
        this.currSaleItemsRetOnly.unshift(newSaleItem);
        this.currSaleItemsRetOnly.reduce((previousValue, currentValue) => {
          previousValue.TotalAmount = previousValue.TotalAmount + currentValue.TotalAmount;
          return previousValue;
        });
        this.total = this.currSaleItemsRetOnly[0].TotalAmount;
        this.currSaleItemsRetOnly.shift();
        this.showSaleItemsPopup = true;
      }
      else {
        this.messageboxService.showMessage("failed", [res.ErrorMessage]);
        this.loading = false;
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }


  //This method make all invoice property value initialization
  AssignAllValues() {
    try {
      //Initialize  invoice details for Post to db
      this.currSale.BilStatus = (this.currSale.TotalAmount == this.currSale.PaidAmount) ? "paid" : (this.currSale.PaidAmount > 0) ? "partial" : "unpaid";
      this.currSale.CreditAmount = CommonFunctions.parseAmount(this.currSale.TotalAmount - this.currSale.PaidAmount);

      //Initialize Invoice Items  details for post to database
      //Initialize Invoice IteCheckValidaitonms  details for post to database
      for (var i = 0; i < this.currSaleItems.length; i++) {
        //lots of workaround here--need to revise and update properly--sud:8Feb18
        //assign value from searchTbx selected item only if searchTbx is enabled, else we already have other values assigned to the model.
        this.currSaleItems[i].ItemId = this.currSaleItems[i].ItemId;
        this.currSaleItems[i].ItemName = this.currSaleItems[i].ItemName;
      }


    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  // for cancel the credit bill.
  Cancel() {
    if (confirm("All the Items will be Cancelled and Cannot be Revert Back !!! Are You Sure to Cancel these Provisional items?")) {
      try {
        this.pharmacyBLService.CancelCreditBill(this.allCreditItems)
          .subscribe(res => {
            if (res.Status == "OK" && res.Results != null) {
              this.messageboxService.showMessage("success", ["Succesfully Credit Bill Canceled. "]);
              this.GetUnpaidTotalBills();
              this.BackToGrid();
            }
            else if (res.Status == "Failed") {
              this.messageboxService.showMessage("error", ['There is problem, please try again']);
            }
          },
            err => {
              this.loading = false;
              this.messageboxService.showMessage("error", [err.ErrorMessage]);
            });
      }
      catch (exception) {
        this.ShowCatchErrMessage(exception);
      }
    }
  }
  Close() {
    this.showSaleItemsPopup = false;
    this.currSaleItemsRetOnly = new Array<PHRMInvoiceItemsModel>();
    this.currSale = new PHRMInvoiceModel();
    this.currSaleItems = new Array<PHRMInvoiceItemsModel>();
    this.GetUnpaidTotalBills();
    this.total = 0;
    this.showAllPatient = true;
    this.showActionPanel = false;
  }
  print() {
    let popupWinindow;
    var printContents = document.getElementById("printpage").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=1600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    //popupWinindow.document.write('<html><head><link href="../assets/global/plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css" /><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
    popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');

    popupWinindow.document.close();
    this.showSaleItemsPopup = false;
    this.GetUnpaidTotalBills();
    this.showAllPatient = true;
    this.showActionPanel = false;
  }

  LoadPatientInvoiceSummary(patientId: number) {
    this.pharmacyBLService.GetPatientSummary(patientId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.patBillHistory = res.Results;
          this.patBillHistory.ProvisionalAmt = CommonFunctions.parseAmount(this.patBillHistory.ProvisionalAmt);
          this.patBillHistory.BalanceAmount = CommonFunctions.parseAmount(this.patBillHistory.BalanceAmount);
          this.patBillHistory.DepositBalance = CommonFunctions.parseAmount(this.patBillHistory.DepositBalance);
          this.patBillHistory.TotalDue = CommonFunctions.parseAmount(this.patBillHistory.TotalDue);
          this.patBillHistory.IsLoaded = true;
        }
        else {
          this.messageboxService.showMessage("Select Patient", [res.ErrorMessage]);
          this.loading = false;
        }
      });
  }
  //Change the Checkbox value and call Calculation logic from here.
  DepositDeductCheckBoxChanged() {
    this.checkDeductfromDeposit = true;
    this.CalculateDepositBalance();
  }
  public newdepositBalance: number = 0;
  public depositDeductAmount: number = 0;

  GetAllFiscalYrs() {
    this.pharmacyBLService.GetAllFiscalYears()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.allFiscalYrs = res.Results;
        }
      });
  }

  //show or hide  item level discount
  checkProvisionalBillsCustomization() {
    let provisionalParameterString = this.coreService.Parameters.find(p => p.ParameterName == "SalesFormCustomization" && p.ParameterGroupName == "Pharmacy");
    if (provisionalParameterString != null) {
      let provisionalParameter = JSON.parse(provisionalParameterString.ParameterValue);
      this.isItemLevelVATApplicable = (provisionalParameter.EnableItemLevelVAT == true);
      this.isMainVATApplicable = (provisionalParameter.EnableMainVAT == true);
      this.IsitemlevlDis = (provisionalParameter.EnableItemLevelDiscount == true);
      this.isMainDiscountAvailable = (provisionalParameter.EnableMainDiscount == true);

    }
  }

  CalculateDepositBalance() {
    if (this.deductDeposit) {
      if (this.patBillHistory.DepositBalance > 0) {
        this.newdepositBalance = this.patBillHistory.DepositBalance - this.currSale.PaidAmount;
        this.newdepositBalance = CommonFunctions.parseAmount(this.newdepositBalance);
        if (this.newdepositBalance >= 0) {
          this.depositDeductAmount = this.currSale.PaidAmount;
          this.currSale.Tender = this.currSale.PaidAmount;
          this.currSale.Change = 0;
        }
        else {
          this.currSale.Tender = -(this.newdepositBalance);//Tender is set to positive value of newDepositBalance.
          this.depositDeductAmount = this.patBillHistory.DepositBalance;//all deposit has been returned.
          this.newdepositBalance = 0;//reset newDepositBalance since it's all Used NOW.
          this.currSale.Change = 0;//Reset Change since we've reset Tender above.
        }
      }
      else {
        this.messageboxService.showMessage("Failed", ["Deposit balance is zero, Please add deposit to use this feature."]);
        this.deductDeposit = !this.deductDeposit;
      }
    }
    else {
      //reset all required properties..
      this.currSale.Tender = this.currSale.TotalAmount;
      this.newdepositBalance = this.patBillHistory.DepositBalance;
      this.depositDeductAmount = 0;
      this.currSale.Change = 0;
    }
  }
}
