import { Component, ChangeDetectorRef ,Renderer2} from "@angular/core";
import { Router } from '@angular/router';
import { SecurityService } from '../../security/shared/security.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { PharmacyBLService } from "../shared/pharmacy.bl.service"
import { CommonFunctions } from "../../shared/common.functions";
import { PHRMInvoiceReturnItemsModel } from "../shared/phrm-invoice-return-items.model";
import { PatientService } from "../../patients/shared/patient.service";
import { RouteFromService } from "../../shared/routefrom.service";
import { CallbackService } from '../../shared/callback.service';
import { PharmacyService } from "../shared/pharmacy.service";
import { BillingFiscalYear } from "../../billing/shared/billing-fiscalyear.model";
import { PharmacyReceiptModel } from "../shared/pharmacy-receipt.model";
import { PHRMInvoiceItemsModel } from "../shared/phrm-invoice-items.model";
import { BillingBLService } from '../../../app/billing/shared/billing.bl.service';
import { DanpheHTTPResponse } from "../../shared/common-models";
import { PHRMInvoiceReturnModel } from '../shared/phrm-invoice-return.model '
import * as moment from "moment";
import {CoreService} from '../../core/shared/core.service'

@Component({
    templateUrl: "./phrm-sale-return.html"
})
export class PHRMSaleReturnComponent {
    //constructor of class
    //For counter name
    fisc;
    public currentCounter: number = null;
    public currentCounterName: string = null;
    public allFiscalYrs: Array<BillingFiscalYear> = [];
    public selFiscYrId: number = 3;
    public retQty: any;
    public avlQty: any;
    public IsReturn: boolean;
    public userName: any;
    constructor(
        public BillingBLService: BillingBLService,
        public pharmacyBLService: PharmacyBLService,
        public changeDetectorRef: ChangeDetectorRef,
        public router: Router,
        public securityService: SecurityService,
        public messageboxService: MessageboxService,
        public patientService: PatientService,
        public routeFromService: RouteFromService,
        public pharmacyService: PharmacyService,
        public callBackService: CallbackService,
        public coreService:CoreService,
        private renderer: Renderer2
    ) {

        try {
            this.currentCounter = this.securityService.getPHRMLoggedInCounter().CounterId;
            this.currentCounterName = this.securityService.getPHRMLoggedInCounter().CounterName;
            this.GetAllFiscalYrs();
            this.SetCurrentFiscalYear();
            this.showitemlvldiscount();
            if (this.currentCounter < 1) {
                this.callBackService.CallbackRoute = '/Pharmacy/Sale/New'
                this.router.navigate(['/Pharmacy/ActivateCounter']);
            }

        } catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
    //variable for temporary loop- delete this variable after complete this func
    public loopvar: Array<number> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    //variable for show TotalReturn amount details
    public returnAmount: number = 0;
    //select or deselect all Items variable 
    public selectDeselectAll: boolean = false;
    //Variable declaration is here for sale      
    public loading: boolean = false;
    //variable for show hide Return Invoice page show whwen matching records findout
    public showReturnInvoicePage: boolean = false;
    //variable for bind with search textbox for invoice id
    public invoiceId: number = null;
    public showSaleItemsPopup: boolean = false;
    public pharmacyReceipt: PharmacyReceiptModel = new PharmacyReceiptModel();
    public patient: any;
    //only show text message
    public textMessage: string = null;
    public IsitemlevlDis:boolean;
    public invoiceHeader = new InvoiceHederModel();
    // Array<{
    //     InvoiceId: number, InvoiceDate: string, PatientName: string,
    //     PatientType: string, CreditAmount: string, InvoiceBillStatus: string, InvoiceTotalMoney: string,IsReturn: boolean}>();
    //for binding with  ui
    public saleReturnModelList: Array<PHRMInvoiceReturnItemsModel> = new Array<PHRMInvoiceReturnItemsModel>();
    public saleReturnModelListPost: Array<PHRMInvoiceReturnItemsModel> = new Array<PHRMInvoiceReturnItemsModel>();
    public salesReturn: PHRMInvoiceReturnModel = new PHRMInvoiceReturnModel();
    public saleReturn: PHRMInvoiceReturnItemsModel = new PHRMInvoiceReturnItemsModel();
    public Qty:any;
    f =false;
    isItem: boolean = false;
  checkAllItems: boolean = false;
  ngOnInit(){
      this.click();
  }
  click() {
    this.renderer.selectRootElement('#invoiceId').focus();
  }

  ngAfterViewInit() {
    setTimeout(() => {

      var elem = this.renderer.selectRootElement('#invoiceId');

      this.renderer.listen(elem, "focus", () => { console.log('focus') });

      this.renderer.listen(elem, "blur", () => { console.log('blur') });
  
      elem.focus();

    }, 1000);
  }
    GetAllFiscalYrs() {
        this.pharmacyBLService.GetAllFiscalYears()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.allFiscalYrs = res.Results;
                }
            });
    }
    //show or hide item level discount
    showitemlvldiscount() {
        this.IsitemlevlDis = true;
        let itmdis = this.coreService.Parameters.find(
          (p) =>
            p.ParameterName == "PharmacyItemlvlDiscount" &&
            p.ParameterGroupName == "Pharmacy"
        ).ParameterValue;
        if (itmdis == "true") {
          this.IsitemlevlDis = true;
        } else {
          this.IsitemlevlDis = false;
        }
      }
    //Search and get Invoice Details from server by InvoiceId
    //Get Invoide Items details by Invoice Id for return items from customer
    SearchInvoice(fiscYrId) {
        try {
            if (this.invoiceId && fiscYrId) {
                //Gets Invoice Items by Invoice Id 
                //passing Invoice Id and getting InvoiceReturnItemsModel
                //this for return from customer to pharmacy
                this.pharmacyBLService.GetReturnFromCustomerModelDataByInvoiceId(this.invoiceId, fiscYrId)
                    .subscribe(res => {
                        if (res.Status == "OK") {
                            this.saleReturnModelList = new Array<PHRMInvoiceReturnItemsModel>();
                            //this.salesReturn.InvoiceReturnValidator.controls['Remark'].disable();
                            this.pharmacyReceipt.InvoiceItems = [];//sanjit/rajib: reset the invoice header to prevent duplication of item.
                            this.returnAmount = 0;//sud: 15Mar'19--Reset returnamount -- bugId: #155 Pharmacy

                            //Note: Below assigning server result not working in array
                            //its skips some properties of client side
                            //this.saleReturnModelList = res.Results.invoiceItems;
                            //Need to solve this problem use below method assign object and push items
                            var salesretModel = res.Results;
                            this.invoiceHeader = res.Results.invoiceHeader;
                            res.Results.invoiceItems.forEach(itm => {
                                let itemObj = new PHRMInvoiceReturnItemsModel();
                                this.saleReturnModelList.push(Object.assign(itemObj, itm));//Object.assign match and assign only values                               
                            });
                            this.salesReturn.InvoiceReturnItems = this.saleReturnModelList;
                            if (this.salesReturn.InvoiceReturnItems.length == 0) {
                                this.IsReturn = true;
                                this.messageboxService.showMessage("Info", ["This invoice is already returned"])
                            }
                            else {
                                for (let i = 0; i < this.saleReturnModelList.length; i++) {
                                    this.returnAmount = CommonFunctions.parseAmount(this.returnAmount + this.saleReturnModelList[i].TotalAmount);
                                    var invoiceitems = new PHRMInvoiceItemsModel();
                                    invoiceitems.ItemId = this.saleReturnModelList[i].ItemId;
                                    invoiceitems.BatchNo = this.saleReturnModelList[i].BatchNo;
                                    invoiceitems.ItemName = this.saleReturnModelList[i].ItemName;
                                    //invoiceitems.TotalQty  = this.saleReturnModelList[i].TotalQty;
                                    invoiceitems.Quantity = (this.saleReturnModelList[i].Quantity - this.saleReturnModelList[i].ReturnedQty);
                                    invoiceitems.ExpiryDate = moment(this.saleReturnModelList[i].ExpiryDate).format('ll');
                                    invoiceitems.Price = this.saleReturnModelList[i].Price;
                                    invoiceitems.MRP = this.saleReturnModelList[i].MRP;
                                    invoiceitems.TotalAmount = this.saleReturnModelList[i].TotalAmount;
                                    invoiceitems.SubTotal = this.saleReturnModelList[i].SubTotal;
                                    invoiceitems.DiscountPercentage = this.saleReturnModelList[i].DiscountPercentage;
                                    invoiceitems.ReturnQty = this.saleReturnModelList[i].ReturnedQty;
                                    invoiceitems.CreditNoteId = res.Results.invoiceItems[i].CreditNoteId;
                                    //this.salesReturn.InvoiceReturnItems[i].SaledQty = this.saleReturnModelList[i].Quantity;

                                    //if(res.Results.invoiceItems[i].)
                                    this.retQty = res.Results.invoiceItems[i].ReturnedQty;
                                    if (this.retQty == null) {
                                        this.retQty = 0;
                                    }
                                    // this.salesReturn.InvoiceReturnItems[i].RetQty = this.retQty;
                                    this.salesReturn.InvoiceReturnItems[i].AvailableQty = (res.Results.invoiceItems[i].Quantity - res.Results.invoiceItems[i].ReturnedQty);
                                    this.avlQty = this.salesReturn.InvoiceReturnItems[i].AvailableQty;
                                    this.salesReturn.InvoiceReturnItems[i].Quantity = this.avlQty;
                                    if (this.avlQty == 0) {
                                        this.IsReturn = true;

                                    }
                                    else {
                                        this.salesReturn.InvoiceReturnItems[i].ReturnedQty = 0;
                                    }

                                    this.salesReturn.CounterId = this.currentCounter;
                                    this.salesReturn.PatientId = res.Results.patient.PatientId;
                                    this.salesReturn.InvoiceId = res.Results.invoiceHeader.InvoiceId;
                                    this.salesReturn.Tender = res.Results.invoiceHeader.Tender;
                                    this.salesReturn.SubTotal = res.Results.invoiceHeader.SubTotal;
                                    this.salesReturn.Change = res.Results.invoiceHeader.Change;
                                    this.salesReturn.FiscalYearId = res.Results.invoiceHeader.FiscalYearId;

                                    this.salesReturn.TotalAmount = res.Results.invoiceHeader.TotalAmount;
                                   // this.salesReturn.DiscountAmount = res.Results.invoiceHeader.DiscountAmount;

                                    this.pharmacyReceipt.InvoiceItems.push(invoiceitems);
                                }
                            }
                            //this.salesReturn.InvoiceReturnItems = this.salesReturn.InvoiceReturnItems.filter(a=>a.Quantity >a.ReturnedQty);
                            this.IsReturn = this.saleReturnModelList.some(a => a.Quantity > a.ReturnedQty) == false
                            this.invoiceHeader = res.Results.invoiceHeader;
                            this.invoiceHeader.InvoiceDate = moment(res.Results.invoiceHeader.InvoiceDate).format('ll');
                            this.patient = res.Results.patient;
                            this.showReturnInvoicePage = true;
                            if (this.salesReturn.InvoiceReturnItems.length == 0) {
                                this.showReturnInvoicePage = false;
                            }
                        } else {
                            this.invoiceHeader = new InvoiceHederModel();
                            // Array<{
                            //     InvoiceId: number, InvoiceDate: string, PatientName: string,
                            //     PatientType: string, CreditAmount: string, InvoiceBillStatus: string, InvoiceTotalMoney: string,
                            //     IsReturn: boolean
                            // }>();                            
                            this.saleReturnModelList = null;
                            this.saleReturnModelListPost = null;
                            this.showReturnInvoicePage = false;
                            this.patient = null;
                            this.messageboxService.showMessage("error", ["No sale for entered invoice Id."])
                        }
                    });

            } else {
                //this.IamHere("Please enter invoice id..!");
                this.messageboxService.showMessage("error", ["Please enter invoice Id and Fiscal Year"])
                this.Cancel();
            }
        } catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
    ReturnReceiptItems(returnData) {
        this.pharmacyReceipt.Patient.ShortName = this.invoiceHeader.PatientName;
        this.pharmacyReceipt.Patient.PatientCode = this.patient.PatientCode;
        this.pharmacyReceipt.Patient.Address = this.patient.Address;
        this.pharmacyReceipt.Patient.DateOfBirth = this.patient.DateOfBirth;
        this.pharmacyReceipt.Patient.Gender = this.patient.Gender;
        this.pharmacyReceipt.Patient.PhoneNumber = this.patient.PhoneNumber;
        this.pharmacyReceipt.Patient.PANNumber = this.patient.PANNumber;
        this.pharmacyReceipt.Patient.PatientId = this.patient.PatientId;
        this.pharmacyReceipt.TotalAmount = returnData.TotalAmount;
        this.pharmacyReceipt.PaymentMode = returnData.PaymentMode;
        
        this.pharmacyReceipt.ReceiptDate = this.invoiceHeader.InvoiceDate;
        this.pharmacyReceipt.BillingUser = this.userName;
        this.pharmacyReceipt.Tender = returnData.Tender;
        this.pharmacyReceipt.Change = returnData.Change;
        this.pharmacyReceipt.DiscountAmount = returnData.DiscountAmount;
        this.pharmacyReceipt.SubTotal = returnData.SubTotal;
        this.pharmacyReceipt.CurrentFinYear = (this.invoiceHeader.FiscalYear).toString();
        this.pharmacyReceipt.ReceiptPrintNo = this.invoiceHeader.ReceiptPrintNo;
        this.pharmacyReceipt.Remarks = returnData.Remarks;
        this.pharmacyReceipt.IsReturned = true;
        this.pharmacyReceipt.ReceiptDate = returnData.CreatedOn;
        this.pharmacyReceipt.CRNNo = returnData.CreditNoteId;
        this.pharmacyReceipt.InvoiceItems = returnData.InvoiceReturnItems;
        this.pharmacyReceipt.InvoiceItems = this.pharmacyReceipt.InvoiceItems.filter(a => a.ReturnedQty > 0);
        // this.pharmacyReceipt.CRNNo = ;
    }
    //Return Items from customer Invoice post to  database
    SaveReturnFromCustomer(): void {
        try {
            let check: boolean = true;
            for (var j = 0; j < this.salesReturn.InvoiceReturnItems.length; j++) {
                //return only selected items so validation also check only on selected items
                this.salesReturn.InvoiceReturnItems[j].CounterId = this.currentCounter;
                //this.salesRetu
                this.salesReturn.CounterId = this.currentCounter;
                if(this.salesReturn.InvoiceReturnItems[j].ReturnedQty > this.salesReturn.InvoiceReturnItems[j].Quantity){
                    check = false;
                }
                this.Qty = this.saleReturnModelList.some(a => a.ReturnedQty > 0) == false
                if(this.Qty == true){
                    check = false;
                   // this.messageboxService.showMessage("error",["Please enter the Quantity"])
                }
                if (this.salesReturn.InvoiceReturnItems[j].IsReturn) {
                    for (var i in this.salesReturn.InvoiceReturnItems[j].InvoiceItemsReturnValidator.controls) {
                        this.salesReturn.InvoiceReturnItems[j].InvoiceItemsReturnValidator.controls[i].markAsDirty();
                        this.salesReturn.InvoiceReturnItems[j].InvoiceItemsReturnValidator.controls['Quantity'].disable();
                        this.salesReturn.InvoiceReturnItems[j].InvoiceItemsReturnValidator.controls[i].updateValueAndValidity();
                    }
                    // if (this.salesReturn.InvoiceReturnItems[j].IsValidCheck(undefined, undefined)) {
                    //     check = false;
                    //     break;
                    // }
                    
                }
            }
            if (this.salesReturn.IsValidCheck(undefined, undefined) == false) {
                // for loop is used to show ReturnToSupplierValidator message ..if required  field is not filled
                for (var b in this.salesReturn.InvoiceReturnValidator.controls) {
                    this.salesReturn.InvoiceReturnValidator.controls[b].markAsDirty();
                    this.salesReturn.InvoiceReturnValidator.controls[b].updateValueAndValidity();
                    check = false;
                }
            }
            if (this.saleReturn.IsReturn) {
                for (var i in this.saleReturn.InvoiceItemsReturnValidator.controls) {
                    this.saleReturn.InvoiceItemsReturnValidator.controls[i].markAsDirty();
                    this.saleReturn.InvoiceItemsReturnValidator.controls[i].updateValueAndValidity();
                }
                if (this.saleReturn.IsValidCheck(undefined, undefined)) {
                    check = false;
                }
              
                if (this.salesReturn.Remarks == "") {
                    check = false;
                }
            }
            if(this.invoiceHeader.InvoiceBillStatus == 'unpaid'){
                this.salesReturn.PaymentMode = 'credit'
            }
            else{
                this.salesReturn.PaymentMode = 'cash'
            }
            this.salesReturn.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.userName = this.securityService.GetLoggedInUser().UserName;
            if (check && this.GetSelectedItemCount()) {
                if (this.CheckValidation()) {
                    this.loading = true;
                    this.saleReturnModelListPost = new Array<PHRMInvoiceReturnItemsModel>();
                    if (this.salesReturn.InvoiceReturnItems.length > 0 ) {
                        this.pharmacyBLService.PostReturnFromCustomerData(this.salesReturn)
                            .subscribe(res => {
                                if (res.Status == "OK") {
                                    this.CallBackPostReturnInvoice(res),
                                        this.loading = false;
                                    //this.ReturnReceiptItems();
                                    //this.showSaleItemsPopup = true;
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
                            
                    else {
                        this.messageboxService.showMessage("failed", ["Please select Item for return"]);
                    }

                }
            }
        } catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }

    Close() {
        this.showSaleItemsPopup = false;
    }

    CreateCopyForResale() {
        try {
            if (this.patient) {
                this.patientService.setGlobal(this.patient);
                let returnItems = this.pharmacyService.CreateNewGlobalReturnSaleTransaction();
                returnItems = Object.assign(returnItems, this.saleReturnModelList);
                this.routeFromService.RouteFrom = "returnedBill";
                this.router.navigate(['/Pharmacy/Sale/New']);
                //console.log(this.billingService.getGlobalBillingTransaction());
            } else {
                this.messageboxService.showMessage("notice", ['please select patient or items.']);
            }

        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }
    //call this function after post successfully 
    CallBackPostReturnInvoice(res) {
        try {
            if (res.Status == "OK") {
                this.messageboxService.showMessage("Success", ["Returned successfully."]);
                var returnData = res.Results;
                this.ReturnReceiptItems(returnData);
                this.salesReturn = new PHRMInvoiceReturnModel();
                this.showSaleItemsPopup = true;
                this.Cancel();
                //this.router.navigate(['/Pharmacy/Sale/ReturnList']);
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }

    }
    //All validation check done here
    //this manually validation check for temporary
    CheckValidation(): boolean {
        try {
            this.saleReturnModelList.forEach(itm => {
                let qty = itm.SaledQty - itm.ReturnedQty;
                if (qty > itm.Quantity) {
                    return false;
                }
            });
            return true;
        } catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
    //checked and unchecked Items for return
    CheckedChange(index, data: PHRMInvoiceReturnItemsModel) {
        try {
            if (index != undefined || index != NaN) {
                this.textMessage = null;
                //all items will be return
                if (index == "All") {
                    let flag = (this.selectDeselectAll == true) ? false : true;

                    this.saleReturnModelList.forEach(itm => {
                        if (itm.ReturnedQty < itm.SaledQty) {//check only which item returned qty is less than saled qty
                            itm.IsReturn = flag;
                        }
                    });
                    //this.AllCalculation();
                    this.CalculationForPHRMReturnfromCustomerItem(data, index);
                } else if (data) {
                    this.saleReturnModelList[index].IsReturn = (this.saleReturnModelList[index].IsReturn == true) ? false : true;
                    let selectedItmCount = this.GetSelectedItemCount();
                    if (selectedItmCount == 0) {
                        this.selectDeselectAll = false;
                    }
                    if (selectedItmCount == this.saleReturnModelList.length) {
                        this.selectDeselectAll = true;
                    }
                    this.CalculationForPHRMReturnfromCustomerItem(data, index);
                    // this.AllCalculation()
                }
            }
        } catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }

    //All calculation done here
    // AllCalculation() {
    //     try {
    //         this.returnAmount = 0;
    //         if (this.saleReturnModelList.length > 0) {
    //             for (let i = 0; i < this.saleReturnModelList.length; i++) {

    //                     let temp = (this.saleReturnModelList[i].ReturnedQty) * this.saleReturnModelList[i].MRP;
    //                     let subtotal = temp - (this.saleReturnModelList[i].DiscountPercentage * temp) / 100;
    //                     this.saleReturnModelList[i].SubTotal = CommonFunctions.parseAmount(subtotal);
    //                     this.saleReturnModelList[i].TotalAmount = CommonFunctions.parseAmount(subtotal + (this.saleReturnModelList[i].VATPercentage * this.saleReturnModelList[i].SubTotal) / 100);
    //                     this.returnAmount = CommonFunctions.parseAmount(this.returnAmount + this.saleReturnModelList[i].TotalAmount);
    //                     this.salesReturn.SubTotal = this.saleReturnModelList[i].SubTotal;

    //                     this.salesReturn.TotalAmount = this.saleReturnModelList[i].TotalAmount;

    //             }
    //             this.salesReturn.Adjustment =
    //                     CommonFunctions.parseFinalAmount(
    //                       this.salesReturn.TotalAmount
    //                     ) - this.salesReturn.TotalAmount
    //                     this.salesReturn.TotalAmount = CommonFunctions.parseAmount(this.salesReturn.TotalAmount + this.salesReturn.Adjustment);
    //                     this.salesReturn.PaidAmount = this.salesReturn.TotalAmount;
    //                     this.salesReturn.Tender = this.salesReturn.TotalAmount;
    //                     this.salesReturn.Change  =CommonFunctions.parseAmount( this.salesReturn.Tender - this.salesReturn.TotalAmount);
    //                     this.returnAmount = this.salesReturn.TotalAmount;
    //         }
    //     }
    //     catch (exception) {
    //         this.ShowCatchErrMessage(exception);
    //     }
    // }
    ValueChage(index){
        this.salesReturn.InvoiceReturnItems[index].AvailableQty = this.salesReturn.InvoiceReturnItems[index].Quantity-this.salesReturn.InvoiceReturnItems[index].ReturnedQty;
    }
    CalculationForPHRMReturnfromCustomerItem(row: PHRMInvoiceReturnItemsModel, index) {
        console.log(row);
        if (this.salesReturn.InvoiceReturnItems[index].Price != null && (this.salesReturn.InvoiceReturnItems[index].ReturnedQty <= this.salesReturn.InvoiceReturnItems[index].Quantity) ) {
            //this Disct is the coversion of DiscountPercentage
            let Disct = this.salesReturn.InvoiceReturnItems[index].DiscountPercentage / 100;
            this.salesReturn.InvoiceReturnItems[index].SubTotal = CommonFunctions.parsePhrmAmount((this.salesReturn.InvoiceReturnItems[index].MRP * (row.ReturnedQty)));

            

            this.salesReturn.InvoiceReturnItems[index].DiscountAmount= CommonFunctions.parseAmount(Disct *this.salesReturn.InvoiceReturnItems[index].SubTotal);
            this.salesReturn.InvoiceReturnItems[index].TotalAmount = CommonFunctions.parseAmount(this.salesReturn.InvoiceReturnItems[index].SubTotal - this.salesReturn.InvoiceReturnItems[index].DiscountAmount);
            this.CalculationForPHRMReturnFromCustomer();
        }
    }


    ///Function For Calculation Of all Return from customer Toatl calculation
    CalculationForPHRMReturnFromCustomer() {
        let STotal: number = 0;

        let TAmount: number = 0;
        // let VAmount: number = 0;
        let DAmount: number = 0;
        var DsAmt: number;
        var vattAmt: number;
        var itmdis: any;


        for (var i = 0; i < this.salesReturn.InvoiceReturnItems.length; i++) {
            if (this.salesReturn.InvoiceReturnItems[i].SubTotal != null
                && this.salesReturn.InvoiceReturnItems[i].TotalAmount != null) {

                STotal = STotal + this.salesReturn.InvoiceReturnItems[i].TotalAmount
                // TAmount = TAmount + this.curtRetSuppModel.returnToSupplierItems[i].TotalAmount 
                this.salesReturn.SubTotal = CommonFunctions.parseAmount(STotal);
                //var vatttp = this.curtRetSuppModel.returnToSupplierItems[i].VATPercentage / 100;
               

                this.salesReturn.TotalAmount = CommonFunctions.parseAmount(this.salesReturn.SubTotal);

            }
            
        }
        if (this.salesReturn.DiscountPercentage >= 0) {
            let Disct = this.salesReturn.DiscountPercentage / 100;
            DsAmt = (this.salesReturn.SubTotal * Disct)

        }
        for (var i = 0; i < this.salesReturn.InvoiceReturnItems.length; i++) {
            if (this.salesReturn.InvoiceReturnItems[i].DiscountPercentage >= 0) {

                DsAmt += this.salesReturn.InvoiceReturnItems[i].DiscountAmount;
    
                itmdis = true;
            }
            else {
                DsAmt = 0;
            
        }
        
        }
        DAmount = DAmount + DsAmt;


        this.salesReturn.DiscountAmount = CommonFunctions.parseAmount(DAmount);
        //this.curtRetSuppModel.TotalAmount = CommonFunctions.parseAmount(TAmount);
        if (itmdis == true) {
            this.salesReturn.TotalAmount = this.salesReturn.SubTotal;
        }
        else {
            this.salesReturn.TotalAmount = this.salesReturn.SubTotal - this.salesReturn.DiscountAmount;
        }

        this.salesReturn.Adjustment =
            CommonFunctions.parseFinalAmount(
                this.salesReturn.TotalAmount
            ) - this.salesReturn.TotalAmount;
        this.salesReturn.Adjustment = CommonFunctions.parseAmount(
            this.salesReturn.Adjustment
        );
        this.salesReturn.TotalAmount = CommonFunctions.parseFinalAmount(
            this.salesReturn.TotalAmount
        );
        this.salesReturn.PaidAmount = this.salesReturn.TotalAmount;
        this.salesReturn.Tender = this.salesReturn.TotalAmount;
        this.salesReturn.Change = CommonFunctions.parseAmount(this.salesReturn.Tender - this.salesReturn.TotalAmount);
        this.returnAmount = this.salesReturn.TotalAmount
    }

    //cancel button code is here
    Cancel() {
        try {
            //this.saleReturnModelList = new Array<PHRMInvoiceReturnItemsModel>();
            //this.invoiceHeader = new InvoiceHederModel();
            //  Array<{
            //     InvoiceId: number, InvoiceDate: string, PatientName: string,
            //     PatientType: string, CreditAmount: string, InvoiceBillStatus: string, InvoiceTotalMoney: string, IsReturn: boolean;
            // }>();
            //this.ReturnReceiptItems();
            //this.showSaleItemsPopup = true;
            this.showReturnInvoicePage = false;
            this.selectDeselectAll = false;
            this.textMessage = null;
            //this.saleReturn.Remark = null;
            this.invoiceId = 0;
            this.IsReturn = false;
            this.salesReturn.Remarks = null;
        } catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }

    // CheckAllOptions() {
    //     if (this.salesReturn.InvoiceReturnItems.every(val => val.checked == true)) {
    //         this.salesReturn.InvoiceReturnItems.forEach(val => { val.checked = false });
    //         this.salesReturn.InvoiceReturnItems.forEach(val => { val.ReturnedQty = 0});
    //         this.salesReturn.InvoiceReturnValidator.controls['ReturnedQty'].disable();

    //     }
    //     else {
    //         this.salesReturn.InvoiceReturnItems.forEach(val => { val.checked = true });
    //         this.salesReturn.InvoiceReturnItems.forEach(val => { val.ReturnedQty = val.Quantity});

    //     }
        
        
    // }
    
    
    changelistByItem(event,i) {
        let index  = i;
        if (event.target.name == 'checkItem') {
          this.isItem = true
        }
        if(event.target.checked == true)
        {
            this.salesReturn.InvoiceReturnItems[index].checked = true;
        }
        else{
            this.salesReturn.InvoiceReturnItems[index].checked = false;
        }
        // if (this.isItem && this.checkAllItems) {
        //   event.target.checked = true
        // }
       if(this.salesReturn.InvoiceReturnItems[index].checked == true){
           this.salesReturn.InvoiceReturnItems[index].ReturnedQty = this.salesReturn.InvoiceReturnItems[index].Quantity;
       }
       else{
        this.salesReturn.InvoiceReturnItems[index].ReturnedQty = 0;
        this.salesReturn.InvoiceReturnItems[index].InvoiceItemsReturnValidator.get('ReturnedQty').clearValidators();
        this.salesReturn.InvoiceReturnItems[index].InvoiceItemsReturnValidator.get('ReturnedQty').updateValueAndValidity();
       }
      }
    
      allItems(event) {
        const checked = event.target.checked;
        this.salesReturn.InvoiceReturnItems.forEach(item => item.checked = checked);
        if(checked == true)
        {
            this.salesReturn.InvoiceReturnItems.forEach(item=>{item.ReturnedQty = item.Quantity})   
        }
        else{
            this.salesReturn.InvoiceReturnItems.forEach(item=>{item.ReturnedQty = 0})
        }
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
    //check and get count of selected Items
    GetSelectedItemCount(): number {
        try {
            //Return number of count
            let no = this.saleReturnModelList.filter(itm => itm.IsReturn === true).length;
            this.textMessage = (no <= 0) ? "Select item for return" : "";
            return no;

        } catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }

    //This function only for show catch messages
    ShowCatchErrMessage(exception) {
        try {
            if (exception) {
                let ex: Error = exception;
                console.log("Error Messsage =>  " + ex.message);
                console.log("Stack Details =>   " + ex.stack);
            }
        } catch (exception) {
            let ex: Error = exception;
            console.log("Error Messsage =>  " + ex.message);
            console.log("Stack Details =>   " + ex.stack);
        }
    }

    
}
export class InvoiceHederModel {

    public InvoiceId: number = 0;
    public InvoiceDate: string = "";
    public PatientName: string = "";
    public PatientType: string = "";
    public CreditAmount: string = "";
    public InvoiceBillStatus: string = "";
    public InvoiceTotalMoney: string = "";
    public Tender: number = 0;
    public Change: number = 0;
    public DiscountAmount: number = 0;
    public BillingUser: string = "";
    public IsReturn: boolean = false;
    public SubTotal: number = 0;
    public FiscalYear: number = 0;
    public ReceiptPrintNo: number = 0;
    public Remarks: string = "";
    public CreditNoteId: number;//for view
}
