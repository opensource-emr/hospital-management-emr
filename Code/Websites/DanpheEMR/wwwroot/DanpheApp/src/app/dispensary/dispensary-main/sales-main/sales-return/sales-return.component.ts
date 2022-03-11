import { ChangeDetectorRef, Component, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { BillingFiscalYear } from '../../../../billing/shared/billing-fiscalyear.model';
import { BillingBLService } from '../../../../billing/shared/billing.bl.service';
import { CoreService } from '../../../../core/shared/core.service';
import { PatientService } from '../../../../patients/shared/patient.service';
import { PharmacyReceiptModel } from '../../../../pharmacy/shared/pharmacy-receipt.model';
import { PharmacyBLService } from '../../../../pharmacy/shared/pharmacy.bl.service';
import { PharmacyService } from '../../../../pharmacy/shared/pharmacy.service';
import { PHRMInvoiceItemsModel } from '../../../../pharmacy/shared/phrm-invoice-items.model';
import { PHRMInvoiceReturnItemsModel } from '../../../../pharmacy/shared/phrm-invoice-return-items.model';
import { PHRMInvoiceReturnModel } from '../../../../pharmacy/shared/phrm-invoice-return.model ';
import { PHRMStoreModel } from '../../../../pharmacy/shared/phrm-store.model';
import { SecurityService } from '../../../../security/shared/security.service';
import { NepaliCalendarService } from '../../../../shared/calendar/np/nepali-calendar.service';
import { CallbackService } from '../../../../shared/callback.service';
import { DanpheHTTPResponse } from '../../../../shared/common-models';
import { CommonFunctions } from '../../../../shared/common.functions';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../../../shared/routefrom.service';
import { VaccinationMainComponent } from '../../../../vaccination/vaccination-main.component';
import { DispensaryService } from '../../../shared/dispensary.service';

@Component({
  selector: 'app-sales-return',
  templateUrl: './sales-return.component.html',
  styleUrls: ['./sales-return.component.css'],
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class SalesReturnComponent implements OnInit {

  //constructor of class
  //For counter name
  public currentCounter: number = null;
  public currentCounterName: string = null;
  public allFiscalYrs: Array<BillingFiscalYear> = [];
  public selFiscYrId: number = 3;
  public retQty: any;
  public avlQty: any;
  public IsReturn: boolean;
  public userName: any;
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
  public IsitemlevlDis: boolean;
  public isMainDiscountAvailable: boolean;
  public isItemLevelVATApplicable: boolean;
  public isMainVATApplicable: boolean;
  public invoiceHeader = new InvoiceHederModel();
  public saleReturnModelList: Array<PHRMInvoiceReturnItemsModel> = new Array<PHRMInvoiceReturnItemsModel>();
  public saleReturnModelListPost: Array<PHRMInvoiceReturnItemsModel> = new Array<PHRMInvoiceReturnItemsModel>();
  public salesReturn: PHRMInvoiceReturnModel = new PHRMInvoiceReturnModel();
  public saleReturn: PHRMInvoiceReturnItemsModel = new PHRMInvoiceReturnItemsModel();
  IsCurrentDispensaryInsurace: boolean;
  selectedDispensary: PHRMStoreModel;
  storeId: number;
  public nepaliDate: NepaliCalendarService
  public disableSearchBtn: boolean = false;
  public isSettled: boolean = false;
  enableEnterReturnDiscount: boolean = false;
  NetReturnedAmount: number = 0;
  DiscountReturnAmount: number = 0;
  totalReturnAmt: number;
  discountMorethanReturnAmount: boolean = false;
  invoiceItems: any[] = [];
  showNetAmount: boolean = false;

  constructor(private _dispensaryService: DispensaryService, public nepaliCalendarServ: NepaliCalendarService,
    public billingBLService: BillingBLService,
    public pharmacyBLService: PharmacyBLService,
    public changeDetectorRef: ChangeDetectorRef,
    public router: Router,
    public securityService: SecurityService,
    public messageboxService: MessageboxService,
    public patientService: PatientService,
    public routeFromService: RouteFromService,
    public pharmacyService: PharmacyService,
    public callBackService: CallbackService,
    public coreService: CoreService,
    private renderer: Renderer2
  ) {

    try {
      this.currentCounter = this.securityService.getPHRMLoggedInCounter().CounterId;
      this.currentCounterName = this.securityService.getPHRMLoggedInCounter().CounterName;
      this.IsCurrentDispensaryInsurace = this._dispensaryService.isInsuranceDispensarySelected;
      this.selectedDispensary = this._dispensaryService.activeDispensary;
      this.GetAllFiscalYrs();
      this.SetCurrentFiscalYear();
      this.checkSalesCustomization();
      if (this.currentCounter < 1) {
        this.callBackService.CallbackRoute = '/Dispensary/Sale/New'
        this.router.navigate(['/Dispensary/ActivateCounter']);
      }

    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  ngOnInit() {
    this.click();
    this.storeId = this.selectedDispensary.StoreId;
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
  //check the Sales Page Customization ie enable or disable Vat and Discount;
  checkSalesCustomization() {
    let salesParameterString = this.coreService.Parameters.find(p => p.ParameterName == "SalesFormCustomization" && p.ParameterGroupName == "Pharmacy");
    if (salesParameterString != null) {
      let SalesParameter = JSON.parse(salesParameterString.ParameterValue);
      this.isItemLevelVATApplicable = (SalesParameter.EnableItemLevelVAT == true);
      this.isMainVATApplicable = (SalesParameter.EnableMainVAT == true);
      this.IsitemlevlDis = (SalesParameter.EnableItemLevelDiscount == true);
      this.isMainDiscountAvailable = (SalesParameter.EnableMainDiscount == true);

    }
  }
  //Search and get Invoice Details from server by InvoiceId
  //Get Invoide Items details by Invoice Id for return items from customer
  SearchInvoice(fiscYrId) {
    try {
      this.disableSearchBtn = true;
      if (this.invoiceId && fiscYrId) {
        //Gets Invoice Items by Invoice Id 
        //passing Invoice Id and getting InvoiceReturnItemsModel
        //this for return from customer to pharmacy
        this.pharmacyBLService.GetReturnFromCustomerModelDataByInvoiceId(this.invoiceId, fiscYrId, this.storeId)
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
              this.invoiceHeader = res.Results.invoiceHeader;
              if (this.invoiceHeader && this.invoiceHeader.SettlementId && this.invoiceHeader.CashDiscount) {
                this.isSettled = true;
              }
              this.CheckIfReturnValid();
              res.Results.invoiceItems.forEach(itm => {
                let itemObj = new PHRMInvoiceReturnItemsModel();
                this.saleReturnModelList.push(Object.assign(itemObj, itm));//Object.assign match and assign only values                               
              });
              this.salesReturn.InvoiceReturnItems = this.saleReturnModelList;
              if (this.salesReturn.InvoiceReturnItems.length == 0) {
                this.IsReturn = true;
                this.messageboxService.showMessage("Info", ["This invoice is already returned"]);
              }
              else {
                for (let i = 0; i < this.saleReturnModelList.length; i++) {
                  this.returnAmount = CommonFunctions.parseAmount(this.returnAmount + this.saleReturnModelList[i].TotalAmount);
                  var invoiceitems = new PHRMInvoiceItemsModel();
                  invoiceitems.ItemId = this.saleReturnModelList[i].ItemId;
                  invoiceitems.BatchNo = this.saleReturnModelList[i].BatchNo;
                  invoiceitems.ItemName = this.saleReturnModelList[i].ItemName;
                  invoiceitems.Quantity = (this.saleReturnModelList[i].Quantity - this.saleReturnModelList[i].ReturnedQty);
                  invoiceitems.ExpiryDate = moment(this.saleReturnModelList[i].ExpiryDate).format('ll');
                  invoiceitems.Price = this.saleReturnModelList[i].Price;
                  invoiceitems.MRP = this.saleReturnModelList[i].MRP;
                  invoiceitems.TotalAmount = this.saleReturnModelList[i].TotalAmount;
                  invoiceitems.SubTotal = this.saleReturnModelList[i].SubTotal;
                  invoiceitems.DiscountPercentage = this.saleReturnModelList[i].DiscountPercentage;
                  invoiceitems.DiscountAmount = this.saleReturnModelList[i].DiscountAmount;
                  invoiceitems.ReturnQty = this.saleReturnModelList[i].ReturnedQty;
                  invoiceitems.CreditNoteId = res.Results.invoiceItems[i].CreditNoteId;
                  this.retQty = res.Results.invoiceItems[i].ReturnedQty;
                  if (this.retQty == null) {
                    this.retQty = 0;
                  }
                  this.salesReturn.InvoiceReturnItems[i].AvailableQty = (res.Results.invoiceItems[i].Quantity - res.Results.invoiceItems[i].ReturnedQty);
                  this.avlQty = this.salesReturn.InvoiceReturnItems[i].AvailableQty;
                  this.salesReturn.InvoiceReturnItems[i].Quantity = this.avlQty;
                  this.salesReturn.InvoiceReturnItems[i].PreviouslyReturnedQty = this.saleReturnModelList[i].ReturnedQty || 0;
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
                  this.salesReturn.DiscountPercentage = res.Results.invoiceHeader.DiscountPercentage;

                  this.salesReturn.TotalAmount = res.Results.invoiceHeader.TotalAmount;
                  if(res.Results.invoiceHeader.SettlementId != null){
                    this.salesReturn.SettlementId = this.invoiceHeader.SettlementId;
                  }

                  this.pharmacyReceipt.InvoiceItems.push(invoiceitems);
                }
              }
              this.IsReturn = this.saleReturnModelList.some(a => a.Quantity > a.ReturnedQty) == false
              this.invoiceHeader = res.Results.invoiceHeader;
              this.invoiceHeader.InvoiceDate = moment(res.Results.invoiceHeader.InvoiceDate).format('ll');
              this.patient = res.Results.patient;
              this.showReturnInvoicePage = true;
              this.showManualReturnForm = false;
              this.SetFocusById(`ReturnedQty0`);
              if (this.salesReturn.InvoiceReturnItems.length == 0) {
                this.showReturnInvoicePage = false;
              }
            } else {
              this.invoiceHeader = new InvoiceHederModel();
              this.saleReturnModelList = null;
              this.saleReturnModelListPost = null;
              this.showReturnInvoicePage = false;
              this.patient = null;
              this.messageboxService.showMessage("error", ["No sale for entered Invoice Id in selected Dispensary."]);
            }
            this.disableSearchBtn = false;
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
  public EnterReturnAmountChange(event: any) {
    if (event) {
      if (event.target.checked) {
        this.enableEnterReturnDiscount = true;
        this.NetReturnedAmount = 0;
        this.DiscountReturnAmount = 0;
        this.CalculationForPHRMReturnFromCustomer();
      } else {
        this.enableEnterReturnDiscount = false;
        this.NetReturnedAmount = 0;
        this.DiscountReturnAmount = 0;
        this.CalculationForPHRMReturnFromCustomer();
      }


    }

  }
  
  private CheckIfReturnValid() {
    try {
      if (this.IsCurrentDispensaryInsurace && !this.invoiceHeader.ClaimCode) {
        throw new Error("Cannot return it from this dispensary.");
      }
    }
    catch (ex) { this.ShowCatchErrMessage(ex); }
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
    this.pharmacyReceipt.Patient.CountrySubDivisionName = this.patient.CountrySubDivisionName;
    this.pharmacyReceipt.PaymentMode = returnData.PaymentMode;
    this.pharmacyReceipt.ReceiptDate = this.invoiceHeader.InvoiceDate;
    this.pharmacyReceipt.localReceiptdate = this.nepaliCalendarServ.ConvertEngToNepDateString(this.pharmacyReceipt.ReceiptDate);
    this.pharmacyReceipt.BillingUser = this.userName;
    this.pharmacyReceipt.Tender = returnData.Tender;
    this.pharmacyReceipt.Change = returnData.Change;
    this.pharmacyReceipt.DiscountAmount = returnData.DiscountAmount;
    this.pharmacyReceipt.VATAmount = returnData.VATAmount;
    this.pharmacyReceipt.VATPercentage = returnData.VATPercentage;
    this.pharmacyReceipt.TaxableAmount = returnData.TaxableAmount;
    this.pharmacyReceipt.NonTaxableAmount = returnData.NonTaxableAmount;
    this.pharmacyReceipt.SubTotal = returnData.SubTotal;
    this.pharmacyReceipt.CurrentFinYear = (this.invoiceHeader.FiscalYear).toString();
    this.pharmacyReceipt.ReceiptPrintNo = this.invoiceHeader.ReceiptPrintNo;
    this.pharmacyReceipt.Remarks = returnData.Remarks;
    this.pharmacyReceipt.IsReturned = true;
    this.pharmacyReceipt.ReceiptDate = returnData.CreatedOn;
    this.pharmacyReceipt.CRNNo = returnData.CreditNoteId;
    this.pharmacyReceipt.InvoiceItems = returnData.InvoiceReturnItems;
    this.pharmacyReceipt.InvoiceItems = this.pharmacyReceipt.InvoiceItems.filter(a => a.ReturnedQty > 0);
    this.pharmacyReceipt.ClaimCode = this.invoiceHeader.ClaimCode;
    this.pharmacyReceipt.Patient.NSHINumber = this.invoiceHeader.NSHINo;
    this.pharmacyReceipt.PrintCount = 0;
    this.pharmacyReceipt.StoreId = returnData.StoreId
    // this.pharmacyReceipt.CRNNo = ;
  }
  //Return Items from customer Invoice post to  database
  SaveReturnFromCustomer(): void {
    try {
      let formValidity: boolean = true;
      let errorMessages: string[] = [];
      this.salesReturn.CounterId = this.currentCounter;
      this.salesReturn.StoreId = this._dispensaryService.activeDispensary.StoreId;
      this.salesReturn.ClaimCode = this.invoiceHeader.ClaimCode;
      for (var j = 0; j < this.salesReturn.InvoiceReturnItems.length; j++) {
        //return only selected items so validation also check only on selected items
        this.salesReturn.InvoiceReturnItems[j].CounterId = this.currentCounter;
        this.salesReturn.InvoiceReturnItems[j].StoreId = this._dispensaryService.activeDispensary.StoreId;
        if (this.salesReturn.InvoiceReturnItems[j].ReturnedQty > this.salesReturn.InvoiceReturnItems[j].Quantity) {
          formValidity = false;
          errorMessages.push(`Returned Quantity is greater than Sold Quantity for Item ${this.salesReturn.InvoiceReturnItems[j].ItemName}.`)
        }
        let isReturnedItemListEmpty = this.saleReturnModelList.some(a => a.ReturnedQty > 0) == false
        if (isReturnedItemListEmpty == true) {
          errorMessages.push("No items to return.");
          formValidity = false;
        }
        if (this.salesReturn.InvoiceReturnItems[j].IsReturn && this.salesReturn.InvoiceReturnItems[j].checked) {
          for (var i in this.salesReturn.InvoiceReturnItems[j].InvoiceItemsReturnValidator.controls) {
            this.salesReturn.InvoiceReturnItems[j].InvoiceItemsReturnValidator.controls[i].markAsDirty();
            this.salesReturn.InvoiceReturnItems[j].InvoiceItemsReturnValidator.controls['Quantity'].disable();
            this.salesReturn.InvoiceReturnItems[j].InvoiceItemsReturnValidator.controls[i].updateValueAndValidity();
          }
        }
      }
      if (this.saleReturn.IsReturn) {
        for (var i in this.saleReturn.InvoiceItemsReturnValidator.controls) {
          this.saleReturn.InvoiceItemsReturnValidator.controls[i].markAsDirty();
          this.saleReturn.InvoiceItemsReturnValidator.controls[i].updateValueAndValidity();
        }
        if (this.saleReturn.IsValidCheck(undefined, undefined)) {
          formValidity = false;
        }

        if (this.salesReturn.Remarks.trim() == "") {
          formValidity = false;
          errorMessages.push("Remarks is mandatory.");
          this.SetFocusById('Remark');
        }
      }
      if (this.invoiceHeader.InvoiceBillStatus == 'unpaid') {
        this.salesReturn.PaymentMode = 'credit'
      }
      else {
        this.salesReturn.PaymentMode = 'cash'
      }
      this.salesReturn.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.userName = this.securityService.GetLoggedInUser().UserName;
      if (formValidity) {
        this.loading = true;
        this.saleReturnModelListPost = new Array<PHRMInvoiceReturnItemsModel>();
        //filter out all uncheked items and items with returned qty less than 1 into a new obj and send it to the server.
        var saleReturnObjForServer: PHRMInvoiceReturnModel = new PHRMInvoiceReturnModel();
        Object.assign(saleReturnObjForServer, this.salesReturn);
        saleReturnObjForServer.InvoiceReturnItems = saleReturnObjForServer.InvoiceReturnItems.filter(a => a.ReturnedQty > 0);
        saleReturnObjForServer.CashDiscount = this.DiscountReturnAmount? this.DiscountReturnAmount : 0;
        this.pharmacyBLService.PostReturnFromCustomerData(saleReturnObjForServer)
          .finally(() => this.loading = false)
          .subscribe(res => {
            if (res.Status == "OK") {
              this.CallBackPostReturnInvoice(res);
            }
            else if (res.Status == "Failed") {
              this.messageboxService.showMessage("error", ['There is problem, please try again']);
            }
          },
            err => {
              this.messageboxService.showMessage("error", [err.ErrorMessage]);
            });
      }
      else {
        if (errorMessages.length > 0)
          this.messageboxService.showMessage("Failed", errorMessages);
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
        this.router.navigate(['/Dispensary/Sale/New']);
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
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }
  //checked and unchecked Items for return
  // CheckedChange(index, data: PHRMInvoiceReturnItemsModel) {
  //   try {
  //     if (index != undefined || index != NaN) {
  //       this.textMessage = null;
  //       //all items will be return
  //       if (index == "All") {
  //         let flag = (this.selectDeselectAll == true) ? false : true;

  //         this.saleReturnModelList.forEach(itm => {
  //           if (itm.ReturnedQty < itm.SaledQty) {//check only which item returned qty is less than saled qty
  //             itm.IsReturn = flag;
  //           }
  //         });
  //         this.CalculationForPHRMReturnfromCustomerItem(data, index);
  //       } else if (data) {
  //         this.saleReturnModelList[index].IsReturn = (this.saleReturnModelList[index].IsReturn == true) ? false : true;
  //         let selectedItmCount = this.GetSelectedItemCount();
  //         if (selectedItmCount == 0) {
  //           this.selectDeselectAll = false;
  //         }
  //         if (selectedItmCount == this.saleReturnModelList.length) {
  //           this.selectDeselectAll = true;
  //         }
  //         this.CalculationForPHRMReturnfromCustomerItem(data, index);
  //         // this.AllCalculation()
  //       }
  //     }
  //   } catch (exception) {
  //     this.ShowCatchErrMessage(exception);
  //   }
  // }

  ValueChage(index) {
    if (this.salesReturn.InvoiceReturnItems[index].ReturnedQty == 0) {
      this.salesReturn.InvoiceReturnItems[index].checked = false;
      this.changelistByItem(index);
    }
    this.salesReturn.InvoiceReturnItems[index].AvailableQty = this.salesReturn.InvoiceReturnItems[index].Quantity - this.salesReturn.InvoiceReturnItems[index].ReturnedQty;
  }
  CalculationForPHRMReturnfromCustomerItem(row: PHRMInvoiceReturnItemsModel, index) {
    if (this.salesReturn.InvoiceReturnItems[index].Price != null && (this.salesReturn.InvoiceReturnItems[index].ReturnedQty <= this.salesReturn.InvoiceReturnItems[index].Quantity)) {
      //this Disct is the coversion of DiscountPercentage
      let Disct = this.salesReturn.InvoiceReturnItems[index].DiscountPercentage / 100;
      let VATAmount = this.salesReturn.InvoiceReturnItems[index].VATPercentage / 100;
      this.salesReturn.InvoiceReturnItems[index].SubTotal = CommonFunctions.parsePhrmAmount((this.salesReturn.InvoiceReturnItems[index].MRP * (row.ReturnedQty)));
      //let vatAmount = this.salesReturn.InvoiceReturnItems[index].VATAmount; 

      this.salesReturn.InvoiceReturnItems[index].DiscountAmount = CommonFunctions.parseAmount(Disct * this.salesReturn.InvoiceReturnItems[index].SubTotal);
      this.salesReturn.InvoiceReturnItems[index].TotalAmount = CommonFunctions.parseAmount(this.salesReturn.InvoiceReturnItems[index].SubTotal - this.salesReturn.InvoiceReturnItems[index].DiscountAmount); 
      this.CalculationForPHRMReturnFromCustomer();
      //this.SetFocusById(`Remark`);
    }

  }


  ///Function For Calculation Of all Return from customer Toatl calculation
  CalculationForPHRMReturnFromCustomer() {
    let STotal: number = 0;

    let TAmount: number = 0;
    let VATAmount: number = 0;
    var DiscountAmount: number;
    var itmdis: any;
    this.NetReturnedAmount = 0;


    for (var i = 0; i < this.salesReturn.InvoiceReturnItems.length; i++) {
      if (this.salesReturn.InvoiceReturnItems[i].SubTotal != null && this.salesReturn.InvoiceReturnItems[i].TotalAmount != null) {
        STotal = STotal + this.salesReturn.InvoiceReturnItems[i].SubTotal;
        this.salesReturn.SubTotal = CommonFunctions.parseAmount(STotal);
        this.salesReturn.TotalAmount = CommonFunctions.parseAmount(this.salesReturn.SubTotal);
        if (this.salesReturn.DiscountPercentage >= 0) {
          let discountAmount = this.salesReturn.DiscountPercentage / 100;
          DiscountAmount = (this.salesReturn.SubTotal * discountAmount)

        }
        if (this.salesReturn.InvoiceReturnItems[i].VATPercentage > 0) {
          let vatAmount = this.salesReturn.InvoiceReturnItems[i].VATPercentage / 100;
          VATAmount = (this.salesReturn.SubTotal * vatAmount);
          this.salesReturn.TaxableAmount = this.salesReturn.InvoiceReturnItems[i].SubTotal - this.salesReturn.InvoiceReturnItems[i].DiscountAmount;
        }
        else {
          this.salesReturn.NonTaxableAmount = this.salesReturn.InvoiceReturnItems[i].SubTotal - this.salesReturn.InvoiceReturnItems[i].DiscountAmount;
        }
      }

      if(this.salesReturn.InvoiceReturnItems[i].ReturnedQty > 0){
        if (this.invoiceHeader && this.invoiceHeader.SettlementId) {
        if (this.invoiceHeader.CashDiscount >= this.DiscountReturnAmount && this.returnAmount > this.DiscountReturnAmount) {
          this.NetReturnedAmount = Number((this.returnAmount - this.DiscountReturnAmount).toFixed(4));
          this.discountMorethanReturnAmount = false;
        } else {
          this.discountMorethanReturnAmount = true;
          this.NetReturnedAmount = 0;
        }
      }
      }

    }
    this.salesReturn.DiscountAmount = CommonFunctions.parseAmount(DiscountAmount);
    this.salesReturn.VATAmount = CommonFunctions.parseAmount(VATAmount);
    this.salesReturn.VATPercentage = (this.salesReturn.VATAmount) == 0 ? 0 : (this.salesReturn.VATAmount * 100) / (this.salesReturn.SubTotal - this.salesReturn.DiscountAmount),
      //this.salesReturn.TaxableAmount = this.salesReturn.VATAmount > 0 ? (this.salesReturn.SubTotal - this.salesReturn.DiscountAmount) : 0,
      //this.salesReturn.NonTaxableAmount = this.salesReturn.VATAmount <= 0 ? (this.salesReturn.SubTotal - this.salesReturn.DiscountAmount) : 0,
      this.salesReturn.TotalAmount = this.salesReturn.SubTotal - this.salesReturn.DiscountAmount + VATAmount;
    //ramesh: Adjustment removed as LPH requirement. And it is causing mismatch in Report Sales Return Amount part.
    // this.salesReturn.Adjustment =CommonFunctions.parseFinalAmount(this.salesReturn.TotalAmount) - this.salesReturn.TotalAmount;
    // this.salesReturn.Adjustment = CommonFunctions.parseAmount(this.salesReturn.Adjustment);
    this.salesReturn.TotalAmount = CommonFunctions.parseAmount(this.salesReturn.TotalAmount);
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
  ShowNetAmount() {
    this.showNetAmount = true;
  }


  changelistByItem(i) {
    let index = i;
    if (this.salesReturn.InvoiceReturnItems[index].checked == true) {
      this.salesReturn.InvoiceReturnItems[index].ReturnedQty = this.salesReturn.InvoiceReturnItems[index].Quantity;
    }
    else {
      this.salesReturn.InvoiceReturnItems[index].ReturnedQty = 0;
      this.salesReturn.InvoiceReturnItems[index].InvoiceItemsReturnValidator.get('ReturnedQty').clearValidators();
      this.salesReturn.InvoiceReturnItems[index].InvoiceItemsReturnValidator.get('ReturnedQty').updateValueAndValidity();
    }
  }

  allItems(event) {
    const checked = event.target.checked;
    this.salesReturn.InvoiceReturnItems.forEach(item => item.checked = checked);
    if (checked == true) {
      this.salesReturn.InvoiceReturnItems.forEach(item => { item.ReturnedQty = item.Quantity })
    }
    else {
      this.salesReturn.InvoiceReturnItems.forEach(item => { item.ReturnedQty = 0 })
    }
  }
  SetCurrentFiscalYear() {
    //We may do this in client side itself since we already have list of all fiscal years with us. [Part of optimization.]

    this.billingBLService.GetCurrentFiscalYear()
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

  SetFocusById(id: string) {
    var Timer = setTimeout(() => {
      if (document.getElementById(id)) {
        let nextEl = <HTMLInputElement>document.getElementById(id);
        nextEl.focus();
        clearTimeout(Timer);
      }
    }, 100)
  }
  FindNextFocusElementByIndex(index) {
    let indx = index + 1;
    if (this.saleReturnModelList.length <= indx) {
      window.setTimeout(function () {
        document.getElementById('Remark').focus();
      }, 0);
    }
    else {
      window.setTimeout(function () {
        document.getElementById('ReturnedQty' + indx).focus();
      }, 0);
    }
  }
  //this function is hotkeys when pressed by user
  public hotkeys(event) {
    if (this.showManualReturnForm == false) {//For ESC key => close the pop up
      if (event.keyCode == 27) {
        this.Close();
      }
      if (event.altKey) {
        switch (event.keyCode) {
          case 80: {// => ALT+P comes here
            this.SaveReturnFromCustomer();
            break;
          }
          default:
            break;
        }
      }
    }
  }

  // Manual Return Functionalities
  showManualReturnForm: boolean = false;
  performManualReturn() {
    this.showReturnInvoicePage = false;
    this.showManualReturnForm = true;
  }
  closeManualReturn() {
    this.showManualReturnForm = false;
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
  public ClaimCode: number;//sud:1-oct'21: Changed datatype from String to Number in all places
  public NSHINo: string;

  public SettlementId: number = 0;
  public CashDiscount: number = 0;
}
