import { Component, ChangeDetectorRef, Renderer2 } from "@angular/core";
import { Router } from '@angular/router';
import { BillingTransactionItem } from '../shared/billing-transaction-item.model';
import { BillingTransaction } from '../shared/billing-transaction.model';
import { RouteFromService } from '../../shared/routefrom.service';
import { BillingBLService } from '../shared/billing.bl.service';
import { BillingService } from '../shared/billing.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { SecurityService } from '../../security/shared/security.service';
import { CallbackService } from '../../shared/callback.service';
import * as moment from 'moment/moment';
import { BillInvoiceReturnModel } from "../shared/bill-invoice-return.model";
import { BillingFiscalYear } from "../shared/billing-fiscalyear.model";
import { CoreService } from "../../core/shared/core.service";

import { DanpheHTTPResponse } from "../../shared/common-models";
import { BillInvoiceReturnItemsModel } from "../shared/bill-invoice-return-items.model";
import { CRN_CreditNoteAllInfoVM, CRN_InvoiceItemsVM } from "../shared/credit-note-vms";


@Component({
  templateUrl: "./bill-credit-note.html"
})

export class BILL_CreditNoteComponent {

  public selReceiptNo: number = null;
  public crnInfoVM: CRN_CreditNoteAllInfoVM = null;
  public isInvoiceItemsLoaded: boolean = false;

  public allFiscalYrs: Array<BillingFiscalYear> = [];
  public selFiscYrId: number = 2;//remove this hardcode later
  public loading: boolean = false;

  public returnRemarks: string = "";

  public isInsuranceReceipt: boolean = true;
  public ReturnRestrictionRules: any = null;

  public showPrintPage: boolean = false;
  public selCreditNote = null;
  public selectAll: boolean = false;
  public isSettled:boolean = false;
  public NetReturnedAmount:number = 0;
  public enableEnterReturnDiscount:boolean = false;
  public DiscountFromSettlement:number = 0;
  public makeSettlement:boolean = false;
  public discountMorethanReturnAmount:boolean = false;

  constructor(public BillingBLService: BillingBLService,
    public billingService: BillingService,
    public router: Router, public securityService: SecurityService,
    public routeFromService: RouteFromService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public callbackservice: CallbackService,
    public coreService: CoreService,
    public renderer: Renderer2
  ) {

    let counterId = this.securityService.getLoggedInCounter().CounterId;
    if (counterId < 1) {
      this.callbackservice.CallbackRoute = '/Billing/BillReturnRequest'
      this.router.navigate(['/Billing/CounterActivate']);
    }
    else {
      this.GetAllFiscalYrs();
      this.SetCurrentFiscalYear();
      this.ReturnRestrictionRules = this.coreService.GetBillItemsReturnRestrictionRules();
    }
    this.globalListenFunc = this.renderer.listen('document', 'keydown', e => {
      if (e.keyCode == 27) {
        this.ClosePrintPage();
      }
    }); 
  }
  globalListenFunc : Function;  
  ngAfterViewInit() {
    //focus on invoicenumber as soon as page loads..
    this.coreService.FocusInputById("txtInvoiceNumber", 100);
  }

  // ngAfterViewChecked(): void{
  //   if(this.enableEnterReturnDiscount == true){
     
  //     this.ReCalculateReturnAmount();
  //   }
  // }

  public EnterReturnAmountChange(event:any){ 
    if(event){
     if(event.target.checked){
      this.enableEnterReturnDiscount = true;
      this.NetReturnedAmount = 0;
      this.DiscountFromSettlement = 0;
      this.ReCalculateReturnAmount();
     }else{
       this.enableEnterReturnDiscount = false;
       this.NetReturnedAmount = 0;
       this.DiscountFromSettlement = 0;
       this.ReCalculateReturnAmount();
     }
        
      
    }

  }
  public ResetValuesAfterSearching(){
    this.enableEnterReturnDiscount = false;
    this.isSettled = false;
    this.DiscountFromSettlement = 0;
    this.crnInfoVM.InvoiceInfo.CashDiscount = 0;
  }

  GetInvoiceByReceiptNo(receiptNo: number) {
   // this.ResetValuesAfterSearching();
    this.enableEnterReturnDiscount = false;
    this.isSettled = false;
    this.DiscountFromSettlement = 0;
    //this.crnInfoVM.InvoiceInfo.CashDiscount = 0;

    if (receiptNo && receiptNo != 0) {
      let recptNo = parseInt(receiptNo.toString());
      let getVisitInfo = true;
      this.loading = true;
      this.BillingBLService.GetInvoiceDetailsForCreditNote(recptNo, this.selFiscYrId, getVisitInfo, this.isInsuranceReceipt)
        .subscribe(res => {
          if (res.Status == "OK" && res.Results && res.Results.IsInvoiceFound) {
            this.crnInfoVM = res.Results;
            //adding new properties in CRN_InvoiceItemsVM since those are not coming from server side
            this.crnInfoVM.TransactionItems.forEach((itm: CRN_InvoiceItemsVM) => {
              itm["IsSelected"] = false;
              itm["ReturnQuantity"] = 0;
              itm["IsValid"] = true;
              itm["IsReturnRestricted"] = false;
              itm["SrvDeptIntegrationName"] = null;
            });

            if(this.crnInfoVM.InvoiceInfo.SettlementId && this.crnInfoVM.InvoiceInfo.CashDiscount){
                this.isSettled = true;
            }

            this.ApplyReturnRestrictionRules(this.crnInfoVM.TransactionItems);

            this.isInvoiceItemsLoaded = true;
            //focus on 1st element of the item row.

            this.FocusNextItemRow(-1);// index = -1 for first time loading.
          }
          else {
            this.isInvoiceItemsLoaded = false;
            //add messagebox here..
            this.msgBoxServ.showMessage("error", ["Invoice Not Found"]);
            console.log(res.ErrorMessage);
          }

          this.loading = false;
          this.selReceiptNo = null;
        },
          err => {
            //add messagebox here..
            alert("unable to fetch duplicate bill details. Pls try again later..");
            console.log(err);
            this.loading = false;
            this.selReceiptNo = null;
          });
    } else {
      this.msgBoxServ.showMessage('Failed', ["Your Receipt Number is not proper."]);
    }
  }


  GetAllFiscalYrs() {
    this.BillingBLService.GetAllFiscalYears()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.allFiscalYrs = res.Results;
        }
      });
  }


  SetCurrentFiscalYear() {
    //We may do this in client side itself since we already have list of all fiscal years with us. [Part of optimization.]
    this.BillingBLService.GetCurrentFiscalYear()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          let fiscYr: BillingFiscalYear = res.Results;
          if (fiscYr) {
            this.selFiscYrId = fiscYr.FiscalYearId;
          }
        }
      });
  }

  public totalReturnAmt: number = 0;

  public OnReturnQtyChanged(indx: number) {
    let currentItem = this.crnInfoVM.TransactionItems[indx];

    //if return quantity is zero or empty then just remove the selection. here item is still valid.
    if (!currentItem.ReturnQuantity) {
      currentItem.IsValid = true;
      currentItem.IsSelected = false;
    }
    else if (currentItem.ReturnQuantity < 0 || currentItem.ReturnQuantity > currentItem.RemainingQty) {
      currentItem.IsValid = false;
      currentItem.IsSelected = false;
    }
    else {
      currentItem.IsSelected = true;
      currentItem.IsValid = true;//set true on change and recheck again for validity.
    }

    this.ReCalculateReturnAmount();

  }


  public OnItemCheckboxChanged(indx) {
    let currentItem = this.crnInfoVM.TransactionItems[indx];
    if (!currentItem.IsSelected) {
      currentItem.ReturnQuantity = 0;
      this.OnReturnQtyChanged(indx);
    }
    else{
      this.selectAll=false;
      this.NetReturnedAmount = 0;
    }
  }
  ReCalculateReturnAmount() {
    this.NetReturnedAmount = 0;
    this.totalReturnAmt = 0;
    let selItems: Array<any> = this.crnInfoVM.TransactionItems.filter(a => a.IsSelected);
    if (selItems && selItems.length > 0) {
      selItems.forEach(itm => {
        let itmRetAmt = itm.TotalAmtPerUnit * itm.ReturnQuantity;
        this.totalReturnAmt += (itmRetAmt) ? itmRetAmt : 0;
        if(this.DiscountFromSettlement >= 0 && this.DiscountFromSettlement <= this.totalReturnAmt && this.DiscountFromSettlement <= this.crnInfoVM.InvoiceInfo.CashDiscount){
          this.NetReturnedAmount = this.totalReturnAmt - this.DiscountFromSettlement;
          this.discountMorethanReturnAmount = false;
        }else{
          this.discountMorethanReturnAmount = true;
        }
      });
    }
  }

  SubmitCreditNote() {
    this.loading = true;

    let selItems = this.crnInfoVM.TransactionItems.filter(a => a.IsSelected);
    let validationObj = this.CheckForValidation(selItems);

    if (validationObj.IsValid) {

      let returnItems: Array<BillInvoiceReturnItemsModel> = this.GetReturnItemFromTransactionItem(selItems);

      let totAmtsObj = this.GetTotalAmountsCalculated(returnItems);
      let retInvoiceModel = new BillInvoiceReturnModel();
      retInvoiceModel.BillReturnId = 0;
      retInvoiceModel.CreditNoteNumber = 0;
      retInvoiceModel.FiscalYearId = 0;//get current fiscalyearid here..
      retInvoiceModel.InvoiceCode = this.crnInfoVM.InvoiceInfo.InvoiceCode;
      retInvoiceModel.RefInvoiceNum = this.crnInfoVM.InvoiceInfo.InvoiceNo;
      retInvoiceModel.PatientId = this.crnInfoVM.PatientInfo.PatientId;
      retInvoiceModel.BillingTransactionId = this.crnInfoVM.InvoiceInfo.BillingTransactionId;
      retInvoiceModel.SubTotal = totAmtsObj.SubTotal;
      retInvoiceModel.DiscountAmount = totAmtsObj.DiscountAmount;
      retInvoiceModel.TaxableAmount = 0;//sud:6May'21--Need to Calculate this if required. For not it doesn't seem required.
      retInvoiceModel.TaxTotal = totAmtsObj.TaxAmount;
      retInvoiceModel.TotalAmount = totAmtsObj.TotalAmount;
      retInvoiceModel.PaymentMode = this.crnInfoVM.InvoiceInfo.PaymentMode;
      retInvoiceModel.IsInsuranceBilling = this.crnInfoVM.InvoiceInfo.IsInsuranceBilling;
      retInvoiceModel.InsuranceProviderId = this.crnInfoVM.InvoiceInfo.InsuranceProviderId;
      retInvoiceModel.Remarks = this.returnRemarks;
      retInvoiceModel.CounterId = this.securityService.LoggedInCounter.CounterId;
      retInvoiceModel.IsActive = true;
      retInvoiceModel.TaxId = 0;//this should be corrected, take from parameter.
      retInvoiceModel.Tender = 0;//this is not required, just keeping to complete all properties. 
      retInvoiceModel.CreatedBy = 0;//this will be updated from server side.
      retInvoiceModel.CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");//this will be updated from server side.
      retInvoiceModel.BillStatus = this.crnInfoVM.InvoiceInfo.BillStatus;
      retInvoiceModel.DiscountReturnAmount = this.DiscountFromSettlement;
      if(this.crnInfoVM.InvoiceInfo.CashDiscount){
        retInvoiceModel.DiscountFromSettlement = this.crnInfoVM.InvoiceInfo.CashDiscount;
      }

     // retInvoiceModel.makeSettlement = this.makeSettlement;

      retInvoiceModel.ReturnInvoiceItems = returnItems;

      this.BillingBLService.PostCreditNote(retInvoiceModel)
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.msgBoxServ.showMessage("success", ["Credit note saved successfully."]);
            this.selCreditNote = res.Results;
            this.showPrintPage = true;
            this.ResetValuesAfterSubmit();
            this.loading = false;
          }
          else {
            this.msgBoxServ.showMessage('Failed', ["Unable to save Credit Note. <br/>Please check log for details."]);
            console.log(res.ErrorMessage);
            this.loading = false;
          }
        },
          err => {
            this.msgBoxServ.showMessage('Failed', ["Unable to save Credit Note"]);
            console.log(err.ErrorMessage);
            this.loading = false;
          });
    }
    else {

      this.msgBoxServ.showMessage("Failed", validationObj.Msgs);
      this.loading = false;
    }


  }



  //Needed this function since the Enter Sequence is not fixed but is dynamic based on the available item-indexes.
  public FocusNextItemRow(currIndex: number, waitTimeInMs: number = 100) {

    if (currIndex == -1) {
      //currIndex is minus(1) for First Load, this time, go directly to 0th index
      let itemIndex = this.itemFocusJumpSequencesArray[0];
      this.coreService.FocusInputById('txtRetQty_' + itemIndex, 300);
    }
    else {
      //first find the array index of current item's index. then find out itemIndex.
      let arrayIndex = this.itemFocusJumpSequencesArray.indexOf(currIndex) + 1;
      //continue finding next item's index using and jump. Else jump to Remarks textbox.
      if (this.itemFocusJumpSequencesArray.length > arrayIndex) {
        let nextItemIndex = this.itemFocusJumpSequencesArray[arrayIndex];
        this.coreService.FocusInputById('txtRetQty_' + nextItemIndex);
      }
      else {
        this.coreService.FocusInputById("txtReturnRemarks");
      }
    }
  }



  public GetReturnItemFromTransactionItem(ipTxnItemArr: Array<CRN_InvoiceItemsVM>) {
    let retItems: Array<BillInvoiceReturnItemsModel> = [];
    if (ipTxnItemArr && ipTxnItemArr.length > 0) {
      ipTxnItemArr.forEach(itm => {
        let newRetItmObj = new BillInvoiceReturnItemsModel();
        newRetItmObj.BillReturnItemId = 0;
        newRetItmObj.BillReturnId = 0;
        newRetItmObj.BillingTransactionItemId = itm.BillingTransactionItemId;
        newRetItmObj.BillingTransactionId = itm.BillingTransactionId;
        newRetItmObj.PatientId = itm.PatientId;
        newRetItmObj.ServiceDepartmentId = itm.ServiceDepartmentId;
        newRetItmObj.ItemId = itm.ItemId;
        newRetItmObj.ItemName = itm.ItemName;
        newRetItmObj.Price = itm.Price;
        newRetItmObj.RetQuantity = itm.ReturnQuantity;
        newRetItmObj.RetSubTotal = itm.ReturnQuantity * itm.Price;
        newRetItmObj.RetDiscountAmount = itm.DiscountAmtPerUnit * itm.ReturnQuantity;
        newRetItmObj.RetTaxAmount = itm.TaxAmtPerUnit * itm.ReturnQuantity;
        newRetItmObj.RetTotalAmount = itm.TotalAmtPerUnit * itm.ReturnQuantity;
        newRetItmObj.RetDiscountPercent = itm.DiscountPercent;
        newRetItmObj.ProviderId = itm.ProviderId;
        newRetItmObj.BillStatus = itm.BillStatus;
        newRetItmObj.RequisitionId = itm.RequisitionId;
        newRetItmObj.RequisitionDate = itm.RequisitionDate;
        newRetItmObj.RetCounterId = this.securityService.getLoggedInCounter().CounterId;
        newRetItmObj.RetRemarks = this.returnRemarks;
        newRetItmObj.RequestedBy = itm.RequestedBy;
        newRetItmObj.PatientVisitId = itm.PatientVisitId;
        newRetItmObj.BillingPackageId = itm.BillingPackageId;
        newRetItmObj.CreatedBy = itm.CreatedBy;
        newRetItmObj.CreatedOn = itm.CreatedOn;
        newRetItmObj.BillingType = itm.BillingType;
        newRetItmObj.RequestingDeptId = itm.RequestingDeptId;
        newRetItmObj.VisitType = itm.VisitType;
        newRetItmObj.PriceCategory = itm.PriceCategory;
        newRetItmObj.PatientInsurancePackageId = itm.PatientInsurancePackageId;
        newRetItmObj.IsInsurance = itm.IsInsurance;
        newRetItmObj.DiscountSchemeId = itm.DiscountSchemeId;
        newRetItmObj.IsCashBillSyncToAcc = null;
        newRetItmObj.IsCreditBillSyncToAcc = null;
        newRetItmObj.LabTypeName = itm.LabTypeName;

        retItems.push(newRetItmObj);
      });
    }

    return retItems;
  }


  public GetTotalAmountsCalculated(ipRetItemsArr: Array<BillInvoiceReturnItemsModel>) {

    let retObj = { SubTotal: 0, DiscountAmount: 0, TaxAmount: 0, TotalAmount: 0 };

    if (ipRetItemsArr) {
      ipRetItemsArr.forEach(itm => {
        retObj.SubTotal += itm.RetSubTotal;
        retObj.DiscountAmount += itm.RetDiscountAmount;
        retObj.TaxAmount += itm.RetTaxAmount;
        retObj.TotalAmount += itm.RetTotalAmount;
      });
    }
    return retObj;
  }


  public CheckForValidation(selRetItems: Array<CRN_InvoiceItemsVM>): ({ IsValid: boolean, Msgs: Array<string> }) {
    //send both status and array of error messages after checking for validation.
    let retObj = { IsValid: true, Msgs: [] };

    if(this.discountMorethanReturnAmount){
      retObj.IsValid = false;
      retObj.Msgs.push("Discount cannot exceed Total Return Amount and Cash Discount.");
      return retObj;
    }

    if (!selRetItems || selRetItems.length == 0) {
      retObj.IsValid = false;
      retObj.Msgs.push("Select atleast one item to return");
      return retObj;
    }

    if (!this.returnRemarks) {
      retObj.IsValid = false;
      retObj.Msgs.push("Remarks is mandatory for return");
    }

    selRetItems.forEach(itm => {
      //restricted if: ReturnQty is null/undefined (for blank case),or ReturneQty is more than AvailableQty. or ReturnQty is in negative 
      if (!itm.ReturnQuantity || (itm.ReturnQuantity > itm.RemainingQty) || itm.ReturnQuantity < 0) {
        itm.IsValid = false;
        retObj.IsValid = false;
        retObj.Msgs.push(itm.ItemName + ": Invalid Return Quantity");
      }
    });
    return retObj;
  }

  public ResetValuesAfterSubmit() {
    this.crnInfoVM = new CRN_CreditNoteAllInfoVM();
    this.returnRemarks = null;
    this.isInvoiceItemsLoaded = false;
    this.totalReturnAmt = 0;
    this.NetReturnedAmount = 0;
  }

  //this maintains the jump sequence within the item array.
  //if one or more item is disabled/restricted then we can't focus on that and have to jump to next index.
  public itemFocusJumpSequencesArray = [];

  //For Lab Services, if sample is alredy collected, then returning that item is not allowed.
  //similarly for Radiology items.. These values comes from database & from parameter so we have to check for the same and disable return of those items.
  public ApplyReturnRestrictionRules(txnItems: Array<CRN_InvoiceItemsVM>) {
    this.itemFocusJumpSequencesArray = [];//reset jump sequence array.

    if (this.ReturnRestrictionRules.Enable && txnItems) {

      for (let index = 0; index < txnItems.length; index++) {
        let itm = txnItems[index];
        itm.SrvDeptIntegrationName = this.coreService.GetServiceIntegrationNameById(itm.ServiceDepartmentId);
        // some of the IntegrationName are null in datebase, we have to check only for lab and radiology for now.
        if (itm.SrvDeptIntegrationName) {
          if ((itm.SrvDeptIntegrationName.toLowerCase() == 'lab' && this.ReturnRestrictionRules.LabItems.includes(itm.OrderStatus))) {
            itm.IsReturnRestricted = true;
          }
          else if ((itm.SrvDeptIntegrationName.toLowerCase() == 'radiology' && this.ReturnRestrictionRules.ImagingItems.includes(itm.OrderStatus))) {
            itm.IsReturnRestricted = true;
          }
        }

        //push current item's index into JumpSequence array if it's not restricted.
        if (!itm.IsReturnRestricted) {
          this.itemFocusJumpSequencesArray.push(index);
        }
      }
    }
  }


  ClosePrintPage() {
    this.selCreditNote = null;
    this.showPrintPage = false;
  }

  public SelectAll() {
    if (this.selectAll) {
        this.crnInfoVM.TransactionItems.forEach(itm => {
          if(!itm.IsReturnRestricted)
            itm.IsSelected = true;
        });
    }
    else {
        this.crnInfoVM.TransactionItems.forEach(itm => {
            itm.IsSelected = false;
        });
    }
}
}
