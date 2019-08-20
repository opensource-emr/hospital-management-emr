import { Component, ChangeDetectorRef } from "@angular/core";
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
@Component({
    templateUrl: "../../view/pharmacy-view/Sale/PHRMSaleReturn.html" //  "/PharmacyView/PHRMSaleReturn"
})
export class PHRMSaleReturnComponent {
    //constructor of class
    //For counter name
    public currentCounter: number = null;
    public currentCounterName: string = null;
    public allFiscalYrs: Array<BillingFiscalYear> = [];
    public selFiscYrId: number = 0;
    constructor(
        public pharmacyBLService: PharmacyBLService,
        public changeDetectorRef: ChangeDetectorRef,
        public router: Router,
        public securityService: SecurityService,
        public messageboxService: MessageboxService,
        public patientService: PatientService,
        public routeFromService: RouteFromService,
        public pharmacyService: PharmacyService,
        public callBackService: CallbackService,
    ) {
        try {
            this.currentCounter = this.securityService.getPHRMLoggedInCounter().CounterId;
            this.currentCounterName = this.securityService.getPHRMLoggedInCounter().CounterName;
            this.GetAllFiscalYrs();
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
    public patient: any;
    //only show text message
    public textMessage: string = null;
     public invoiceHeader = new InvoiceHederModel();
    // Array<{
    //     InvoiceId: number, InvoiceDate: string, PatientName: string,
    //     PatientType: string, CreditAmount: string, InvoiceBillStatus: string, InvoiceTotalMoney: string,IsReturn: boolean}>();
    //for binding with  ui
    public saleReturnModelList: Array<PHRMInvoiceReturnItemsModel> = new Array<PHRMInvoiceReturnItemsModel>();
    public saleReturnModelListPost: Array<PHRMInvoiceReturnItemsModel> = new Array<PHRMInvoiceReturnItemsModel>();
    public saleReturn: PHRMInvoiceReturnItemsModel = new PHRMInvoiceReturnItemsModel();
 
    GetAllFiscalYrs() {
            this.pharmacyBLService.GetAllFiscalYears()
            .subscribe(res => {
            if (res.Status == "OK") {
                this.allFiscalYrs = res.Results;
            }
            });
    }
    //Search and get Invoice Details from server by InvoiceId
    //Get Invoide Items details by Invoice Id for return items from customer
    SearchInvoice(fiscYrId) {
        try {
            if (this.invoiceId && fiscYrId) {
                //Gets Invoice Items by Invoice Id 
                //passing Invoice Id and getting InvoiceReturnItemsModel
                //this for return from customer to pharmacy
                this.pharmacyBLService.GetReturnFromCustomerModelDataByInvoiceId(this.invoiceId,fiscYrId)
                    .subscribe(res => {
                        if (res.Status == "OK") {
                            this.saleReturnModelList = new Array<PHRMInvoiceReturnItemsModel>();
                            this.returnAmount = 0;//sud: 15Mar'19--Reset returnamount -- bugId: #155 Pharmacy
                            //Note: Below assigning server result not working in array
                            //its skips some properties of client side
                            //this.saleReturnModelList = res.Results.invoiceItems;
                            //Need to solve this problem use below method assign object and push items
                            res.Results.invoiceItems.forEach(itm => {
                                let itemObj = new PHRMInvoiceReturnItemsModel();
                                this.saleReturnModelList.push(Object.assign(itemObj, itm));//Object.assign match and assign only values                               
                            });
                            for (let i = 0; i < this.saleReturnModelList.length; i++) {
                                this.returnAmount = CommonFunctions.parseAmount(this.returnAmount + this.saleReturnModelList[i].TotalAmount);
                            }
                            this.invoiceHeader = res.Results.invoiceHeader;
                            this.patient = res.Results.patient;
                            this.showReturnInvoicePage = true;
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

    //Return Items from customer Invoice post to  database
    SaveReturnFromCustomer(): void {
        try {
            let check: boolean = true;
            for (var j = 0; j < this.saleReturnModelList.length; j++) {
                //return only selected items so validation also check only on selected items
                this.saleReturnModelList[j].CounterId = this.currentCounter;
                if (this.saleReturnModelList[j].IsReturn) {
                        for (var i in this.saleReturnModelList[j].InvoiceItemsReturnValidator.controls) {
                            this.saleReturnModelList[j].InvoiceItemsReturnValidator.controls[i].markAsDirty();
                            this.saleReturnModelList[j].InvoiceItemsReturnValidator.controls[i].updateValueAndValidity();
                        }
                        if (this.saleReturnModelList[j].IsValidCheck(undefined, undefined)) {
                            check = false;
                            break;
                        }
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
                    if (this.saleReturn.Remark == "") {
                        check = false;
                    }
                }
             
            if (check && this.GetSelectedItemCount()) {
                if (this.CheckValidation()) {
                    this.loading = true;
                    this.saleReturnModelListPost = new Array<PHRMInvoiceReturnItemsModel>();
                    this.saleReturnModelList.forEach(itm => {
                        if (itm.IsReturn == true) {
                            itm.Remark = this.saleReturn.Remark;
                            this.saleReturnModelListPost.push(itm);
                        }
                    });
                    if (this.saleReturnModelListPost.length > 0) {
                        this.pharmacyBLService.PostReturnFromCustomerData(this.saleReturnModelListPost)
                            .subscribe(res => {
                                if (res.Status == "OK") {
                                    this.CallBackPostReturnInvoice(res),
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

                    } else {
                        this.messageboxService.showMessage("failed", ["Please select Item for return"]);
                    }

                }
            }
        } catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
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
                this.messageboxService.showMessage("notice",['please select patient or items.']);
            }
           
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }
    //call this function after post successfully 
    CallBackPostReturnInvoice(res) {
        try {
            if (res.Status == "OK") {
                this.messageboxService.showMessage("success", ["Returned successfully saved."]);
                this.Cancel();
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
                    this.AllCalculation();
                } else if (data) {
                    this.saleReturnModelList[index].IsReturn = (this.saleReturnModelList[index].IsReturn == true) ? false : true;
                    let selectedItmCount = this.GetSelectedItemCount();
                    if (selectedItmCount == 0) {
                        this.selectDeselectAll = false;
                    }
                    if (selectedItmCount == this.saleReturnModelList.length) {
                        this.selectDeselectAll = true;
                    }
                    this.AllCalculation();
                }
            }
        } catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }

    //All calculation done here
    AllCalculation() {
        try {
            this.returnAmount = 0;
            if (this.saleReturnModelList.length > 0) {
                for (let i = 0; i < this.saleReturnModelList.length; i++) {
                    if (this.saleReturnModelList[i].IsReturn == true) {
                        let temp = (this.saleReturnModelList[i].Quantity) * this.saleReturnModelList[i].Price;
                        let subtotal = temp - (this.saleReturnModelList[i].DiscountPercentage * temp) / 100;
                        this.saleReturnModelList[i].SubTotal = CommonFunctions.parseAmount(subtotal);
                        this.saleReturnModelList[i].TotalAmount = CommonFunctions.parseAmount(subtotal + (this.saleReturnModelList[i].VATPercentage * this.saleReturnModelList[i].SubTotal) / 100);
                        this.returnAmount = CommonFunctions.parseAmount(this.returnAmount + this.saleReturnModelList[i].TotalAmount);
                    }
                }
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
    //cancel button code is here
    Cancel() {
        try {
            this.saleReturnModelList = new Array<PHRMInvoiceReturnItemsModel>();
            this.invoiceHeader = new InvoiceHederModel();
            //  Array<{
            //     InvoiceId: number, InvoiceDate: string, PatientName: string,
            //     PatientType: string, CreditAmount: string, InvoiceBillStatus: string, InvoiceTotalMoney: string, IsReturn: boolean;
            // }>();
            this.showReturnInvoicePage = false;
            this.selectDeselectAll = false;
            this.textMessage = null;
        } catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
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

    //Testing purpose message shows common method
    IamHere(MyAddress: string) {
        try {
            if (MyAddress) {
                this.messageboxService.showMessage("success", [MyAddress]);
            }
        } catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
}
export class InvoiceHederModel{

  public  InvoiceId: number=0;
  public  InvoiceDate: string=""; 
  public PatientName: string="";
  public PatientType: string="";
  public  CreditAmount: string="";
  public  InvoiceBillStatus: string="" ;
  public  InvoiceTotalMoney: string="";
  public  IsReturn: boolean=false;
}
