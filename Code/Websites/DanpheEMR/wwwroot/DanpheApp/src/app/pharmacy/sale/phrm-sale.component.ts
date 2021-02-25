import { Component, ChangeDetectorRef, ViewEncapsulation, Renderer2 } from "@angular/core";
import { Router } from '@angular/router';
import { SecurityService } from '../../security/shared/security.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { PharmacyBLService } from "../shared/pharmacy.bl.service"
import { PharmacyService } from "../shared/pharmacy.service";
import { PatientService } from "../../patients/shared/patient.service";
import { PHRMPrescriptionItem } from "../shared/phrm-prescription-item.model";
import { PHRMItemTypeModel } from "../shared/phrm-item-type.model";
import { PHRMInvoiceModel } from "../shared/phrm-invoice.model";
import { PHRMInvoiceItemsModel } from "../shared/phrm-invoice-items.model";
import { PHRMPatient } from "../shared/phrm-patient.model";
import { PHRMGoodsReceiptItemsModel } from "../shared/phrm-goods-receipt-items.model";
import { CommonFunctions } from "../../shared/common.functions";
import { RouteFromService } from "../../shared/routefrom.service";
import { PHRMNarcoticRecordModel } from "../shared/phrm-narcotic-record";
import { CallbackService } from '../../shared/callback.service';
import { Patient } from "../../patients/shared/patient.model";
import { BillingFiscalYear } from "../../billing/shared/billing-fiscalyear.model";
import { CoreService } from "../../core/shared/core.service";
import { CreditOrganization } from "../shared/pharmacy-credit-organizations.model";
import * as moment from 'moment/moment';
import { PharmacyReceiptModel } from "../shared/pharmacy-receipt.model";
import { PharmacyOpPatientVM } from "./op-patient-add/phrm-op-patient.model";

@Component({
    templateUrl: "./phrm-sale.html",
    encapsulation: ViewEncapsulation.None,
    host: { '(window:keydown)': 'hotkeys($event)' }
})
export class PHRMSaleComponent {

    public currencyUnit: string = null;
    public currentCounterId: number = null;
    public currentCounterName: string = null;
    public searchPatient: any;
    public RackNo: string = null;
    public creditOrganizationsList: Array<CreditOrganization> = new Array<CreditOrganization>();
    //public provider: ProviderModel = new ProviderModel();
    //public providerList: Array<any> = [];
    public visitType: any;
    public deductDeposit: boolean = false;
    public checkDeductfromDeposit: boolean = false;
    public allFiscalYrs: Array<BillingFiscalYear> = new Array<BillingFiscalYear>();
    //for show and hide item level discount features
    IsitemlevlDis: boolean = false;
    //start: Pratik: 22Sept'20
    public defaultExtRef: boolean = false;
    public showAddNewOpPopUp: boolean = false;
    public selectedRefId: number = null;
    public isReferrerLoaded: boolean = false;
    public ExtRefSettings = { EnableExternal: true, DefaultExternal: false };
    public ESCAPE_KEYCODE = 27;//to close the window on click of ESCape.
    globalListenFunc: Function;
    public patSummary = {
        IsLoaded: false,
        PatientId: null,
        CreditAmount: null,
        ProvisionalAmt: null,
        TotalDue: null,
        DepositBalance: null,
        BalanceAmount: null
    };
    //for invoice display purpose
    public showInvoicePrintPopUp: boolean;
    public invoiceIdToBePrinted: number;
    //constructor of class
    constructor(
        public pharmacyBLService: PharmacyBLService,
        public pharmacyService: PharmacyService,
        public changeDetectorRef: ChangeDetectorRef,
        public router: Router,
        public patientService: PatientService,
        public securityService: SecurityService,
        public routeFromService: RouteFromService,
        public messageboxService: MessageboxService,
        public callBackService: CallbackService,
        public coreService: CoreService,
        public renderer2: Renderer2

    ) {
        try {
            this.visitType = "outpatient";
            //this.inpatientList();
            this.currentCounterId = this.securityService.getPHRMLoggedInCounter().CounterId;
            this.currentCounterName = this.securityService.getPHRMLoggedInCounter().CounterName;

            if (this.currentCounterId < 1) {
                this.callBackService.CallbackRoute = '/Pharmacy/Sale/New'
                this.router.navigate(['/Pharmacy/ActivateCounter']);
            }
            else {

                //this.GetDoctorList();

                this.LoadGlobalPatient(this.patientService.getGlobal());
                this.LoadItemTypeList();
                this.getPharmaPatientList();
                this.GetAllFiscalYrs();
                this.GetCreditOrganizations();
                //this.LoadPatientInvoiceSummary(this.patientService.getGlobal().PatientId);
                this.LoadReferrerSettings();
                this.showitemlvldiscount();
            }

        } catch (exception) {
            this.ShowCatchErrMessage(exception);
        }


    }

    ngOnDestroy() {
        this.patientService.CreateNewGlobal();
    }

    ngOnInit() {
        this.isReferrerLoaded = true;

    }

    //All variable declaration for Patient Registration
    public currentPatient: PHRMPatient = new PHRMPatient();
    public newOutPatient: PHRMPatient = new PHRMPatient();
    //public newOpatient: PharmacyOpPatientVM = new PharmacyOpPatientVM();
    public matchingPatientList: Array<PHRMPatient> = new Array<PHRMPatient>();
    public narcoticsRecord: PHRMNarcoticRecordModel = new PHRMNarcoticRecordModel();
    public loading1: boolean = false;
    public showExstingPatientList: boolean = false;
    public divDisable: boolean = false;
    //public itemTypeId: number = 0;

    //Variable declaration is here for sale   
    public name: string = null;
    public loading: boolean = false;
    public isReturn: boolean = false;
    public IsWrongProvider: boolean = false;
    public selProvider: any;
    public currSale: PHRMInvoiceModel = new PHRMInvoiceModel();
    public currSaleItems: Array<PHRMInvoiceItemsModel> = new Array<PHRMInvoiceItemsModel>();
    public ItemTypeListWithItems: Array<any> = new Array<any>();
    public ItemListForSale: Array<any> = new Array<any>();
    public ItemListWithRack: Array<any> = new Array<any>();
    public doctorList: any;
    public patientList: Array<PHRMPatient> = new Array<PHRMPatient>();
    public patientListAutoComplete: Array<PHRMPatient> = new Array<PHRMPatient>();
    patients: Array<Patient> = new Array<Patient>();
    patient: Patient = new Patient();


    public itemIdGRItemsMapData = new Array<{ ItemId: number, GRItems: Array<PHRMGoodsReceiptItemsModel> }>();
    public showSupplierAddPage: boolean = false;
    public showInfo: boolean = true;
    public showStockDetails: boolean = false;
    public showNewPatRegistration: boolean = false;
    public QuantityDefaultValue: number = 0;
    getPharmaPatientList() {
        this.pharmacyBLService.GetPatientsListForSaleItems()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.patientListAutoComplete = res.Results.filter(a => !(a.IsOutdoorPatient == true));
                }
            });
    }

    switchTextBox(index) {
        window.setTimeout(function () {
            document.getElementById('qty-box' + index).focus();
        }, 0);
    }

     /**
    * @method setFocusById
    * @param {targetId} Id to be focused
    * @param {waitingTimeinMS} waititng time for the focus to be delayed
    * Set Focus to the id provided
  */
  setFocusById(targetId: string, waitingTimeinMS: number = 10) {
    var timer = window.setTimeout(function () {
      let itmNameBox = document.getElementById(targetId);
      if (itmNameBox) {
        itmNameBox.focus();
      }
      clearTimeout(timer);
    }, waitingTimeinMS);
  }

    ///Get prescription Items list by => PatientId and ProviderId
    //when request from prescription to sale
    GetPrescriptionItems() {
        try {
            //this.routeFromService.RouteFrom = null;
            if (this.pharmacyService.PatientId > 0 && this.pharmacyService.ProviderId > 0) {//check for patientId and providerId
                this.pharmacyBLService.GetPrescriptionItems(this.pharmacyService.PatientId, this.pharmacyService.ProviderId)
                    .subscribe(res => this.CallBackGetPrescriptionItems(res));
            } else {
                //this.routeFromService.RouteFrom = null;
                this.router.navigate(['/Pharmacy/Prescription/List']);
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
    //when GEt prescription method response data from server to local call this method
    CallBackGetPrescriptionItems(res) {
        try {
            if (res.Status == 'OK') {
                if (res.Results) {
                    let PresItems = new Array<PHRMPrescriptionItem>();
                    PresItems = res.Results;


                    PresItems.forEach(itm => {
                        if (itm.IsAvailable) {

                            let tempSaleItem: PHRMInvoiceItemsModel = new PHRMInvoiceItemsModel();
                            tempSaleItem.PrescriptionItemId = itm.PrescriptionItemId;
                            tempSaleItem.ItemId = itm.ItemId;
                            tempSaleItem.Quantity = itm.Quantity;
                            tempSaleItem.Dosage = itm.Dosage;
                            tempSaleItem.Duration = itm.HowManyDays;
                            tempSaleItem.Frequency = itm.Frequency;
                            tempSaleItem.GenericId = itm.GenericId;
                            tempSaleItem.enableItmSearch = true;
                            let currItmA;
                            if (itm.ItemId != 0) {
                                currItmA = this.ItemTypeListWithItems.find(itm => itm.ItemId == tempSaleItem.ItemId); // this.allPhrmItems.find(p => p.ItemId == itm.ItemId);
                            }
                            else {
                                //get default value of item from generic Id in this case first one

                                currItmA = this.ItemTypeListWithItems.find(itm => itm.GenericId == tempSaleItem.GenericId);
                                // currItmA = currItmA[0]
                            }
                            let currItm = currItmA;
                            tempSaleItem.ItemTypeId = currItm != null ? currItm.ItemTypeId : 0;
                            tempSaleItem.ItemName = currItm.ItemName;
                            tempSaleItem.Items = this.ItemTypeListWithItems.find(typ => typ.ItemTypeId == tempSaleItem.ItemTypeId).Items;
                            tempSaleItem.selectedItem = currItm;
                            tempSaleItem.PrescriptionItemId = currItm.PrescriptionItemId;
                            tempSaleItem.GenericName = currItm.GenericName;
                            tempSaleItem.CounterId = this.currentCounterId;

                            this.currSaleItems.push(tempSaleItem);
                            this.OnPresciptionItemChange(currItm, this.currSaleItems.length - 1, tempSaleItem.Quantity);

                            //this.provider = this.providerList.find(a => a.Key == itm.ProviderId);
                            this.changeDetectorRef.detectChanges();

                            //make it easier to understand.
                            //this.onChangeItemType(tempSaleItem.ItemTypeId, this.currSaleItems.length - 1);
                        }
                        else {
                            this.messageboxService.showMessage("Notice", [itm.ItemName, " is unavailable."]);
                            this.currSale.Remark += itm.ItemName + "is unavailable. \n";
                        }
                    });
                }
            }
            else {
                this.messageboxService.showMessage("failed", ['failed to get prescription items.!']);
            }

        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }

    private LoadGlobalPatient(Patient: Patient) {
        if (Patient.PatientId > 0) {
            this.currentPatient.PatientCode = Patient.PatientCode;
            this.currentPatient.ShortName = Patient.ShortName;
            this.searchPatient = Patient.ShortName;
            this.currentPatient.Address = Patient.Address;
            this.currentPatient.Age = Patient.Age;
            this.currentPatient.Gender = Patient.Gender;
            this.currentPatient.PhoneNumber = Patient.PhoneNumber;
            this.currentPatient.PatientId = Patient.PatientId;
            this.LoadPatientInvoiceSummary(Patient.PatientId);
            this.onClickPatient(this.patientService.getGlobal());
        }
    }
    //to show popup in-case of narcotic drug sales
    AddNarcotics(index) {
        this.showSupplierAddPage = false;
        this.narcoticsRecord.NarcoticRecordId = index;
        // this.currSaleItems[index].NarcoticsRecord.PatientName = this.narcoticsRecord.PatientName;
        this.showSupplierAddPage = true;
    }
    // to save narcotics record in currentitems array 
    SaveNarcotics() {
        let index = this.narcoticsRecord.NarcoticRecordId;
        //for (var i in this.narcoticsRecord.NarcoticsValidator.controls) {
        //    this.narcoticsRecord.NarcoticsValidator.controls[i].markAsDirty();
        //    this.narcoticsRecord.NarcoticsValidator.controls[i].updateValueAndValidity();

        //}
        if (this.narcoticsRecord.BuyerName == null || this.narcoticsRecord.DoctorName == null || this.narcoticsRecord.NMCNumber == null) {
            this.messageboxService.showMessage("error", ["Please Fill the required information."]);
        }
        else {
            //this.narcoticsRecord.NarcoticsValidator.markAsDirty();
            //this.narcoticsRecord.NarcoticsValidator.updateValueAndValidity();
            this.currSaleItems[index].NarcoticsRecord.BuyerName = this.narcoticsRecord.BuyerName;
            this.currSaleItems[index].NarcoticsRecord.DoctorName = this.narcoticsRecord.DoctorName;
            this.currSaleItems[index].NarcoticsRecord.EmployeId = this.narcoticsRecord.EmployeId;
            this.currSaleItems[index].NarcoticsRecord.Refill = this.narcoticsRecord.Refill;
            this.currSaleItems[index].NarcoticsRecord.NMCNumber = this.narcoticsRecord.NMCNumber;
            this.showSupplierAddPage = false;
            this.narcoticsRecord.BuyerName = null;
            this.narcoticsRecord.DoctorName = null;
            this.narcoticsRecord.EmployeId = null;
            this.narcoticsRecord.Refill = null;
            this.narcoticsRecord.NMCNumber = null;
        }

    }
    ///this.narcoticsRecord.NMCNumber;/GET: to load the itemType in the start
    LoadItemTypeList(): void {
        try {
            this.pharmacyBLService.GetItemTypeListWithItems()
                .subscribe(res => this.CallBackGetItemTypeList(res));
        }

        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }

    CallBackGetItemTypeList(res) {
        try {
            if (res.Status == 'OK') {
                if (res.Results) {
                    this.ItemListForSale = [];
                    this.ItemListForSale = res.Results;
                    let newDefItem = {
                        "StockId": 0,
                        "ItemId": null,
                        "BatchNo": null,
                        "ExpiryDate": "2021-05-01T00:00:00",
                        "ItemName": "--select item--",
                        "AvailableQuantity": 0,
                        "MRP": 0,
                        "Price": 0,
                        "IsActive": true,
                        "DiscountPercentage": 0,
                        "GenericName": null,
                        "GenericId": 0
                    };

                    this.ItemTypeListWithItems = new Array<PHRMItemTypeModel>();
                    this.ItemTypeListWithItems = res.Results;
                    this.ItemListForSale.unshift(newDefItem);
                    ///displaying only those ItemTypeList in Dropdown whose Status is Active Now. 
                    this.ItemTypeListWithItems = this.ItemTypeListWithItems.filter(itmtype => itmtype.IsActive == true);

                    if (this.routeFromService.RouteFrom == "prescription") {
                        this.routeFromService.RouteFrom = null;
                        //this.enableItmSearch = false;
                        this.GetPrescriptionItems();
                    }
                    else if (this.routeFromService.RouteFrom == "returnedBill") {
                        this.routeFromService.RouteFrom = null;
                        this.isReturn = true;
                        this.MapReturnedBillForSale();
                    }
                    else {
                        this.AddRowRequestOnClick(-1);
                    }

                }
            }
            else {
                () => {
                    this.messageboxService.showMessage("failed", ['failed to get ItemTypeList..']);
                }
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
    MapReturnedBillForSale() {
        try {

            let returnItems = this.pharmacyService.getGlobalReturnSaleTransaction();
            if (returnItems.length > 0) {
                let record = null;
                for (let i = 0; i < returnItems.length; i++) {

                    let itmData = this.ItemListForSale.find(s => s.ItemId == returnItems[i].ItemId &&
                        s.BatchNo == returnItems[i].BatchNo && s.ExpiryDate == returnItems[i].ExpiryDate);
                    record = itmData;
                    if (itmData) {
                        //this.currSaleItems[i].selectedItem = itmData; 
                        let invItm: PHRMInvoiceItemsModel = new PHRMInvoiceItemsModel();
                        this.currSaleItems.push(invItm);
                        this.currSaleItems[this.currSaleItems.length - 1].selectedItem = itmData;
                        this.currSaleItems[this.currSaleItems.length - 1].Quantity = returnItems[i].Quantity;
                        this.currSaleItems[this.currSaleItems.length - 1].TotalQty = this.ItemListForSale.find(x => x.ItemId == returnItems[i].ItemId).AvailableQuantity;
                        this.currSaleItems[this.currSaleItems.length - 1].BatchNo = returnItems[i].BatchNo;
                        this.currSaleItems[this.currSaleItems.length - 1].ExpiryDate = returnItems[i].ExpiryDate;
                        this.currSaleItems[this.currSaleItems.length - 1].ItemId = returnItems[i].ItemId;
                        this.currSaleItems[this.currSaleItems.length - 1].ItemName = returnItems[i].ItemName;
                        this.currSaleItems[this.currSaleItems.length - 1].SubTotal = returnItems[i].SubTotal;
                        this.currSaleItems[this.currSaleItems.length - 1].TotalAmount = returnItems[i].TotalAmount;
                        // this.currSaleItems[this.currSaleItems.length - 1].selectedItem.Quantity = invItm.Quantity;
                        this.onChangeItem(itmData, this.currSaleItems.length - 1);
                    } else {

                    }
                }
                if (record == undefined) {
                    this.messageboxService.showMessage("notice", ['Selected Items are not available in stock']);
                    this.AddRowRequest(0);
                }
            } else {
                this.AddRowRequest(0);
            }

        } catch (ex) { this.ShowCatchErrMessage(ex) }
    }

    OnPresciptionItemChange($event, index, qty) {
        try {
            this.currSaleItems.forEach((itm: any) => {
                itm.ItemNameFormatted = itm.ItemName + "-" + itm.MRP;
            });

            if ($event.ItemId > 0) {
                let itemId = $event.ItemId;
                //below line is just to avoid error check later
                //this.currSaleItems[index].SelectedGRItems = $event;
                this.currSaleItems[index].selectedItem = Object.assign(this.currSaleItems[index].selectedItem, $event);
                this.currSaleItems[index].selectedItem.SellingPrice = $event.MRP;
                this.currSaleItems[index].ItemTypeId = $event.ItemTypeId;
                this.currSaleItems[index].TotalQty = $event.AvailableQuantity;
                this.currSaleItems[index].BatchNo = $event.BatchNo;
                this.currSaleItems[index].MRP = $event.MRP;
                this.currSaleItems[index].Price = $event.Price;
                this.currSaleItems[index].ExpiryDate = $event.ExpiryDate;
                this.currSaleItems[index].Quantity = qty;
                this.currSaleItems[index].GoodReceiptItemId = $event.GoodReceiptItemId;
                this.currSaleItems[index].DiscountPercentage = $event.DiscountPercentage;
                this.currSaleItems[index].CounterId = this.currentCounterId;
                //this.currSaleItems[index].selectedItem = $event;
                //first check selected Item and related all grItems locally
                //If doesn't find local then get data from server
                let ItemWiseGRItems = this.itemIdGRItemsMapData.find(a => a.ItemId == itemId);

                if (ItemWiseGRItems && itemId) {
                    //this.currSaleItems[index].SelectedGRItems = [];
                    this.currSaleItems[index].GRItems = ItemWiseGRItems.GRItems;
                }
                else {
                    //Get GrItems details by ItemId only available stock details
                    this.pharmacyBLService.GetGRItemsByItemId(itemId)
                        .subscribe(res => {
                            if (res.Status == "OK") {
                                //this.currSaleItems[index].SelectedGRItems = [];
                                this.currSaleItems[index].GRItems = res.Results;
                                let itemWiseGRItems = { ItemId: itemId, GRItems: res.Results };
                                this.itemIdGRItemsMapData.push(itemWiseGRItems);
                            }
                            else {
                                this.messageboxService.showMessage("error", ["stock not available."]);
                            }
                        });
                }

            }
            else {
                this.currSaleItems[index].GRItems = [];
            }

        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }


    //This method calls when Item selection changed
    onChangeItem($event, index) {
        try {
            this.currSaleItems.forEach((itm: any) => {
                itm.ItemNameFormatted = itm.ItemName + "-" + itm.MRP;
            });
            if ($event.CategoryName == 'NARCOTIC') {
                this.AddNarcotics(index);
            }
            //if ($event.ItemId > 0 && this.isReturn == true) {
            //    let returnItems = this.pharmacyService.getGlobalReturnSaleTransaction();
            //    if (returnItems.length > 0) {
            //        let record = null;
            //        for (let i = 0; i < returnItems.length; i++) {

            //            let itmData = this.ItemListForSale.find(s => s.ItemId == returnItems[i].ItemId &&
            //                s.BatchNo == returnItems[i].BatchNo && s.ExpiryDate == returnItems[i].ExpiryDate);
            //            if (itmData) {
            //                //this.currSaleItems[i].selectedItem = itmData; 
            //                let invItm: PHRMInvoiceItemsModel = new PHRMInvoiceItemsModel();
            //                this.currSaleItems.push(invItm);
            //                this.currSaleItems[this.currSaleItems.length - 1].selectedItem = itmData;
            //                this.currSaleItems[this.currSaleItems.length - 1].Quantity = returnItems[i].Quantity;
            //                this.currSaleItems[this.currSaleItems.length - 1].TotalQty = returnItems[i].TotalQty;
            //                this.currSaleItems[this.currSaleItems.length - 1].BatchNo = returnItems[i].BatchNo;
            //                this.currSaleItems[this.currSaleItems.length - 1].ExpiryDate = returnItems[i].ExpiryDate;
            //                this.currSaleItems[this.currSaleItems.length - 1].ItemId = returnItems[i].ItemId;
            //                this.currSaleItems[this.currSaleItems.length - 1].ItemName = returnItems[i].ItemName;
            //                this.currSaleItems[this.currSaleItems.length - 1].SubTotal = returnItems[i].SubTotal;
            //                this.currSaleItems[this.currSaleItems.length - 1].TotalAmount = returnItems[i].TotalAmount;
            //                // this.currSaleItems[this.currSaleItems.length - 1].selectedItem.Quantity = invItm.Quantity;
            //                // this.onChangeItem(itmData, this.currSaleItems.length - 1);
            //            } else {

            //            }
            //        }
            //    } else {
            //        this.AddRowRequest(0);
            //    }
            //}

            if ($event.ItemId > 0) {
                let itemId = $event.ItemId;
                //below line is just to avoid error check later
                //this.currSaleItems[index].SelectedGRItems = $event;
                this.currSaleItems[index].selectedItem = Object.assign(this.currSaleItems[index].selectedItem, $event);
                this.currSaleItems[index].selectedItem.SellingPrice = $event.MRP;
                this.currSaleItems[index].ItemTypeId = $event.ItemTypeId;
                this.currSaleItems[index].StockId = $event.StockId;
                this.currSaleItems[index].TotalQty = $event.AvailableQuantity;
                this.currSaleItems[index].StockId = $event.StockId;
                this.currSaleItems[index].BatchNo = $event.BatchNo;
                this.currSaleItems[index].MRP = $event.MRP;
                this.currSaleItems[index].Price = $event.Price;
                this.currSaleItems[index].ExpiryDate = $event.ExpiryDate;
                this.pharmacyBLService.GetRackByItem($event.ItemId)
                    .subscribe(
                        res => {
                            if (res.Status == 'OK') {
                                this.currSaleItems[index].RackNo = res.Results;
                            }
                        });

                this.currSaleItems[index].Quantity = ($event.Quantity == null || $event.Quantity == undefined) ? this.currSaleItems[index].Quantity : 0;
                this.currSaleItems[index].GoodReceiptItemId = $event.GoodReceiptItemId;
                this.currSaleItems[index].DiscountPercentage = $event.DiscountPercentage;
                this.currSaleItems[index].PrescriptionItemId = $event.PrescriptionItemId;
                this.currSaleItems[index].CounterId = this.currentCounterId;
                this.currSaleItems[index].IsDuplicate = false;
                this.currSaleItems[index].ItemId = $event.ItemId;
                //this.currSaleItems[index].selectedItem = $event;
                //first check selected Item and related all grItems locally
                //If doesn't find local then get data from server
                let ItemWiseGRItems = this.itemIdGRItemsMapData.find(a => a.ItemId == itemId);

                if (ItemWiseGRItems && itemId) {
                    //this.currSaleItems[index].SelectedGRItems = [];
                    this.currSaleItems[index].GRItems = ItemWiseGRItems.GRItems;
                    this.checkDuplicateItem();
                }
                else {
                    //Get GrItems details by ItemId only available stock details
                    this.pharmacyBLService.GetGRItemsByItemId(itemId)
                        .subscribe(res => {
                            if (res.Status == "OK") {
                                //this.currSaleItems[index].SelectedGRItems = [];
                                this.currSaleItems[index].GRItems = res.Results;
                                let itemWiseGRItems = { ItemId: itemId, GRItems: res.Results };
                                this.itemIdGRItemsMapData.push(itemWiseGRItems);
                                this.checkDuplicateItem();
                            }
                            else {
                                this.messageboxService.showMessage("error", ["stock not available."]);
                            }
                        });
                }


            }

            else {
                this.currSaleItems[index].GRItems = [];
            }

        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }

    ValueChanged(index, discPer, discAmt) {
        try {
            if (this.currSaleItems[index].Quantity == undefined) {
                this.currSaleItems[index].Quantity = 0;
            }
            if (this.currSaleItems[index].Quantity > this.currSaleItems[index].TotalQty) {
                // this.currSaleItems[index].Quantity = null;
                this.currSaleItems[index].IsDirty('Quantity');

                //this.currSaleItems[index].InvoiceItemsValidator.controls["Quantity"].setErrors({ 'incorrect': true });
            }
            let subtotal = this.currSaleItems[index].Quantity * this.currSaleItems[index].MRP;
            // let subtotal = temp - (this.currSaleItems[index].DiscountPercentage * temp) / 100;
            this.currSaleItems[index].SubTotal = CommonFunctions.parseAmount(subtotal);
            this.currSaleItems[index].TotalAmount = CommonFunctions.parseAmount(subtotal);
            this.CalculateItemlevelDis(index, discPer, discAmt); //calculation of item level discount
            // this.currSaleItems[index].TotalAmount = CommonFunctions.parseAmount(subtotal + (this.currSaleItems[index].VATPercentage * this.currSaleItems[index].SubTotal) / 100);
            //this.currSale.Tender = CommonFunctions.parseAmount(this.currSale.PaidAmount); no point of assigning it here as paid amount has not been changed
            this.AllCalculation();
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }

    //Method for calculate item leve discount
    CalculateItemlevelDis(index, discPer, discAmt) {
        if (discPer == 0 && discAmt > 0) {
            this.currSaleItems[index].TotalAmount = this.currSaleItems[index].SubTotal - discAmt;
            this.currSaleItems[index].TotalDisAmt = discAmt;
            discPer = (discAmt / this.currSaleItems[index].SubTotal) * 100;
            this.currSaleItems[index].DiscountPercentage = CommonFunctions.parsePhrmAmount(discPer);
        }
        if (discPer > 0 && discAmt == 0) {
            discAmt = CommonFunctions.parsePhrmAmount(this.currSaleItems[index].SubTotal * (discPer) / 100)
            this.currSaleItems[index].TotalAmount = this.currSaleItems[index].SubTotal - discAmt;
            this.currSaleItems[index].TotalDisAmt = discAmt;
            this.currSaleItems[index].DiscountPercentage = discPer;
        }
        if (discPer == 0 && discAmt == 0) {
            this.currSaleItems[index].SubTotal = this.currSaleItems[index].SubTotal;
            this.currSaleItems[index].TotalAmount = this.currSaleItems[index].TotalAmount;
            this.currSaleItems[index].TotalDisAmt = discAmt;
            this.currSaleItems[index].DiscountPercentage = discPer;
        }
    }
    //Method for all calculation
    AllCalculation(discPer?, discAmt?) {
        try {
            if (this.currSaleItems.length > 0) {
                this.currSale.SubTotal = 0;
                this.currSale.TotalAmount = 0;
                this.currSale.VATAmount = 0;
                this.currSale.DiscountAmount = 0;

                let TotalitemlevDisAmt: number = 0;
                let Subtotalofitm: number = 0;
                for (var i = 0; i < this.currSaleItems.length; i++) {
                    this.currSale.SubTotal = CommonFunctions.parseAmount(this.currSale.TotalAmount + this.currSaleItems[i].TotalAmount);
                    this.currSale.TotalAmount = CommonFunctions.parseAmount(this.currSale.TotalAmount + this.currSaleItems[i].TotalAmount);
                    let temp = (this.currSaleItems[i].Quantity - this.currSaleItems[i].FreeQuantity) * this.currSaleItems[i].MRP;
                    this.currSale.DiscountAmount = CommonFunctions.parseAmount(this.currSale.DiscountAmount + (temp - this.currSaleItems[i].SubTotal));

                    TotalitemlevDisAmt = TotalitemlevDisAmt + this.currSaleItems[i].TotalDisAmt;           // cal total item level disamt
                    Subtotalofitm = Subtotalofitm + this.currSaleItems[i].SubTotal;           // cal subtotal.

                }
                this.currSale.VATAmount = CommonFunctions.parseAmount(this.currSale.TotalAmount - this.currSale.SubTotal);

                //for bulk discount calculation and conversion of percentage into amount and vice versa
                if (this.IsitemlevlDis == false) {
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
                        //this.goodsReceiptVM.goodReceipt.DiscountAmount = CommonFunctions.parseAmount(DAmount);
                        //this.goodsReceiptVM.goodReceipt.VATAmount = CommonFunctions.parseAmount(VAmount);
                        this.currSale.DiscountAmount = discAmt;
                        this.currSale.DiscountPer = discPer;
                    }
                    this.currSale.DiscountAmount = CommonFunctions.parsePhrmAmount(this.currSale.SubTotal * (this.currSale.DiscountPer) / 100);
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
                    this.currSale.DiscountPer = CommonFunctions.parseAmount(
                        totaldisper
                    );
                }
                this.currSale.PaidAmount = CommonFunctions.parseFinalAmount(this.currSale.SubTotal - this.currSale.DiscountAmount);
                this.currSale.Tender = CommonFunctions.parseAmount(this.currSale.PaidAmount);
                this.currSale.Change = CommonFunctions.parseAmount(this.currSale.Tender - this.currSale.TotalAmount);
                this.currSale.Adjustment = CommonFunctions.parseAmount(this.currSale.PaidAmount - this.currSale.TotalAmount);
                this.currSale.TotalAmount = CommonFunctions.parseFinalAmount(this.currSale.TotalAmount);
                this.ChangeTenderAmount();
                //else {
                //    this.goodsReceiptVM.goodReceipt.SubTotal = CommonFunctions.parseAmount(STotal);
                //    this.goodsReceiptVM.goodReceipt.TotalAmount = CommonFunctions.parseAmount(TAmount) - this.goodsReceiptVM.goodReceipt.DiscountAmount;
                //    //this.goodsReceiptVM.goodReceipt.DiscountAmount = CommonFunctions.parseAmount(DAmount);
                //    this.goodsReceiptVM.goodReceipt.VATAmount = CommonFunctions.parseAmount(VAmount);
                //}
                if (this.checkDeductfromDeposit) {
                    this.CalculateDepositBalance();
                }
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }

    }
    ChangeTenderAmount() {
        if (this.deductDeposit) {
            this.currSale.Change = CommonFunctions.parseAmount(this.currSale.Tender + this.patSummary.DepositBalance - this.currSale.PaidAmount);
        }
        else {
            this.currSale.Change = CommonFunctions.parseAmount(this.currSale.Tender - this.currSale.PaidAmount);
        }
    }

    //validation is remaining
    Save(): void {
        try {
            var errorMessages: Array<string> = [];
            let check: boolean = true;
            for (var j = 0; j < this.currSaleItems.length; j++) {
                if (!this.currSaleItems[j].Quantity) {
                    this.loading = false;
                    errorMessages.push('Qty is required for item ' + (j + 1));
                    check = false;
                }
                else {
                    //to check total quantity with available quantity
                    if (this.currSaleItems[j].Quantity > this.currSaleItems[j].TotalQty) {
                        this.loading = false;
                        errorMessages.push('Qty is greater than Stock for item ' + (j + 1));
                        check = false;
                    }
                }
            }
            if (this.currSale.PaymentMode == "credit" && this.currSale.Remark.length == 0) {
                errorMessages.push('Remark is mandatory when payment mode is credit!');
                check = false;
            }
            //sanjit: 21May'20: this validation has issue, because of return quantity set as a validator. need to fix it.
            for (var j = 0; j < this.currSaleItems.length; j++) {
                for (var i in this.currSaleItems[j].InvoiceItemsValidator.controls) {
                    this.currSaleItems[j].CounterId = this.currentCounterId;
                    this.currSaleItems[j].InvoiceItemsValidator.controls['ReturnQty'].disable();
                    this.currSaleItems[j].InvoiceItemsValidator.controls['Price'].disable();
                    this.currSaleItems[j].InvoiceItemsValidator.controls[i].markAsDirty();
                    this.currSaleItems[j].InvoiceItemsValidator.controls[i].updateValueAndValidity();
                }

                if (!this.currSaleItems[j].IsValidCheck(undefined, undefined)) {
                    check = false;
                    errorMessages.push('Check Quantity and Price for item ' + (j + 1));
                }
            }
            for (var i in this.currSale.InvoiceValidator.controls) {
                this.currSale.InvoiceValidator.controls[i].markAsDirty();
                this.currSale.InvoiceValidator.controls[i].updateValueAndValidity();
            }

            if (!this.currSale.IsValidCheck(undefined, undefined)) {
                check = false;
                errorMessages.push('All * fields are mandatory');
            }
            if (!this.checkDuplicateItem()) {
                check = false;
                this.loading = false;
                errorMessages.push('Duplicate Items are not allowed');

            }
            if (this.currSale.Tender < this.currSale.PaidAmount && this.checkDeductfromDeposit == false) {
                this.loading = false;
                errorMessages.push('Tender Amount can not be less than total amount.');
            }
            if (check) {
                if (this.CheckValidaiton()) {
                    this.AssignAllValues();
                    this.loading = true;
                    this.currSale.InvoiceItems = this.currSaleItems;
                    this.currSale.CounterId = this.currentCounterId;

                    this.currSale.ProviderId = this.selectedRefId;//sud:28Jan'20

                    //if(this.selectedRefId)
                    //if (this.provider.Key) {
                    //  this.currSale.ProviderId = this.provider.Key;
                    //} else if (this.provider.Value == "ANONYMOUS DOCTOR") {
                    //  this.currSale.ProviderId = -1;
                    //}

                    this.currSale.VisitType = this.visitType;
                    this.currentPatient = new PHRMPatient();
                    if ((this.currSale.PaymentMode == "cash" && this.currSale.selectedPatient.FirstName == "Anonymous") || (this.currSale.PaymentMode == 'credit' && this.currSale.selectedPatient.FirstName != "Anonymous") || (this.currSale.PaymentMode == 'cash' && this.currSale.selectedPatient.FirstName != "Anonymous")) {


                        this.pharmacyBLService.postInvoiceData(this.currSale)
                            .subscribe(res => {
                                // if (this.currSale.PaymentMode == "credit" && this.currSale.selectedPatient.FirstName == "Anonymous") {
                                //     this.loading = false;
                                //     this.messageboxService.showMessage("error", ['Please Change PAYMENT MODE !! CREDIT payment mode not is allowed to Anonymous Patient']);
                                // }
                                //sanjit: no point of checking validation in here, as post call is already done.
                                // else if (this.currSale.Tender < this.currSale.PaidAmount) {

                                //     this.loading = false;
                                //     this.messageboxService.showMessage("error", ['Tender must be greater or equal with paid amount']);
                                // }
                                if (res.Status == "OK" && res.Results != null) {
                                    this.CallBackSaveSale(res),
                                        this.loading = false;
                                }
                                else if (res.Status == "Failed") {
                                    this.loading = false;
                                    this.messageboxService.showMessage("error", ['There is problem, please try again', res.ErrorMessage.split('exception')[0]]);

                                }
                            },
                                err => {
                                    this.loading = false;
                                    this.messageboxService.showMessage("error", [err.ErrorMessage]);
                                });
                    }
                    else {
                        this.messageboxService.showMessage("error", ['Please Change PAYMENT MODE !! CREDIT payment mode not is allowed to Anonymous Patient']);
                        //this.grItemList[index].GoodReceiptItemValidator.controls["PackingQuantity"].setValue("N/A");
                        //this.currSale.PaymentMode.set
                        this.currSale.PaymentMode = 'cash';
                        //this.SetAnonymous();
                        //check = true;    
                        this.loading = false;
                    }
                }
            }
            else {
                this.messageboxService.showMessage("Failed", errorMessages);
            }
        } catch (exception) {
            this.ShowCatchErrMessage(exception);
        }

    }
    //credit billing
    SaveCredit(): void {
        try {
            let check: boolean = true;
            this.loading = true;
            for (var j = 0; j < this.currSaleItems.length; j++) {
                //to check total quantity with available quantity
                if (this.currSaleItems[j].Quantity > this.currSaleItems[j].TotalQty) {
                    this.loading = false;
                    this.messageboxService.showMessage("error", ['There is problem, Qty is greater than Stock!']);
                    check = false;

                    break;
                }
            }
            if (this.currSale.PaymentMode == "credit" && this.currSale.Remark.length == 0) {
                this.messageboxService.showMessage("error", ['Remark is mandatory when payment mode is credit!']);
                check = false;
            }
            for (var j = 0; j < this.currSaleItems.length; j++) {
                for (var i in this.currSaleItems[j].InvoiceItemsValidator.controls) {
                    this.currSaleItems[j].CounterId = this.currentCounterId;
                    this.currSaleItems[j].InvoiceItemsValidator.controls[i].markAsDirty();
                    this.currSaleItems[j].InvoiceItemsValidator.controls[i].updateValueAndValidity();
                }
                if (!this.currSaleItems[j].IsValidCheck(undefined, undefined)) {
                    //check = false;
                    break;
                }
            }
            for (var i in this.currSale.InvoiceValidator.controls) {
                this.currSale.InvoiceValidator.controls[i].markAsDirty();
                this.currSale.InvoiceValidator.controls[i].updateValueAndValidity();
            }
            if (!this.currSale.IsValidCheck(undefined, undefined)) {
                check = false;
                this.loading = false;
                this.messageboxService.showMessage("error", ['All * fields are mandatory']);
            }
            if (!this.checkDuplicateItem()) {
                check = false;
                this.messageboxService.showMessage("error", ['Duplicate Items are not allowd']);
            }
            if (check) {
                if (this.CheckValidaiton()) {
                    this.AssignAllValues();
                    this.loading = true;
                    this.currSale.InvoiceItems = this.currSaleItems;

                    this.currSale.ProviderId = this.selectedRefId;//sud:28Jan'20

                    //if (this.provider.Key) {
                    //  this.currSale.ProviderId = this.provider.Key;
                    //} else if (this.provider.Value == "ANONYMOUS DOCTOR") {
                    //  this.currSale.ProviderId = -1;
                    //}

                    this.currSale.VisitType = this.visitType;
                    this.currentPatient = new PHRMPatient();
                    //Revision: Send only items not the invoice. <sud:4Sept'18>
                    this.pharmacyBLService.PostCreditItemsDetails(this.currSale)
                        .subscribe(res => {
                            if (res.Status == "OK" && res.Results != null) {
                                this.CallBackCreditSale(res),
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
            }
        } catch (exception) {
            this.ShowCatchErrMessage(exception);
        }

    }
    GetAllFiscalYrs() {
        this.pharmacyBLService.GetAllFiscalYears()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.allFiscalYrs = res.Results;
                }
            });
    }
    GetCreditOrganizations() {
        this.pharmacyBLService.GetCreditOrganization()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.creditOrganizationsList = res.Results;

                }
            });
    }
    //after invoice is succesfully added this function is called.
    CallBackSaveSale(res) {
        try {
            if (res.Status == "OK" && (this.currSale.Tender >= this.currSale.PaidAmount || this.checkDeductfromDeposit == true || this.currSale.PaymentMode == "credit")) {
                this.ShowInvoicePopUp(res.Results.InvoiceId);
                this.ResetSaleForm();
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
    private ResetSaleForm() {
        this.currSale = new PHRMInvoiceModel();
        this.currSaleItems = new Array<PHRMInvoiceItemsModel>();
        this.patientService.CreateNewGlobal();
        this.currSale.InvoiceValidator.get("VisitType").setValue("outpatient");
        this.patSummary = { IsLoaded: false, PatientId: null, CreditAmount: null, ProvisionalAmt: null, TotalDue: null, DepositBalance: null, BalanceAmount: null };
        this.AddRowRequest(0);
    }

    //after Credit bill is succesfully added this function is called.
    CallBackCreditSale(res) {
        try {
            if (res.Status == "OK") {
                let txnReceipt = PharmacyReceiptModel.GetReceiptForTransaction(res.Results);

                // txnReceipt.ReceiptNo = res.InvoiceId;//////Math.floor(Math.random() * 100) + 1;
                //txnReceipt.ReceiptDate = moment().format("YYYY-MM-DD"); 
                txnReceipt.IsValid = true;
                txnReceipt.ReceiptType = "Credit Receipt";
                txnReceipt.BillingUser = this.securityService.GetLoggedInUser().UserName;
                txnReceipt.Patient = this.currSale.selectedPatient;
                txnReceipt.CurrentFinYear = this.allFiscalYrs.find(f => f.FiscalYearId == res.Results.FiscalYearId).FiscalYearName;
                this.pharmacyService.globalPharmacyReceipt = txnReceipt;
                this.router.navigate(['/Pharmacy/Sale/ReceiptPrint']);
                this.ResetSaleForm();
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
    ShowInvoicePopUp(invoiceId: number) {
        this.invoiceIdToBePrinted = invoiceId;
        this.showInvoicePrintPopUp = true;
    }
    OnInvoicePopUpClose() {
        this.showInvoicePrintPopUp = false;
        return {AddDefaultReferrer: true, DefaultReferrerId: 0, ReferrerName: ''}

    }
    //Add New row into list
    AddRowRequest(index) {
        try {
            var tempSale: PHRMInvoiceItemsModel = new PHRMInvoiceItemsModel();
            //  tempSale.Quantity = 1;                          //comment code=> invoice gererated whene qty =0
            this.currSaleItems.push(tempSale);
            this.selectedRefId = 0;
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }

    }

    AddRowRequestOnClick(index) {
        try {
            if (index != -1) {
                if (this.currSaleItems[index].selectedItem) {
                    if (this.currSaleItems[index].selectedItem.StockId == 0) {
                        window.setTimeout(function () {
                            document.getElementById('discountamount').focus();
                        }, 600);
                        //this.NewRow(index);
                    } else {
                        this.NewRow(index);
                    }
                } else {
                    this.NewRow(index);
                }
            } else {
                this.NewRow(index);
            }

        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }

    }

    NewRow(index) {
        var tempSale: PHRMInvoiceItemsModel = new PHRMInvoiceItemsModel();
        var new_index = index + 1;
        // tempSale.Quantity = 1;                          //comment code=> invoice gererated whene qty =0 
        this.currSaleItems.push(tempSale);
        window.setTimeout(function () {
            document.getElementById('item-box' + new_index).focus();
        }, 600);
    }
    //to delete the row
    DeleteRow(index) {
        try {
            this.currSaleItems.splice(index, 1);
            if (index == 0 && this.currSaleItems.length == 0) {
                this.AddRowRequest(0);
                this.currSale.DiscountPer = 0; //discount percentage must be 0 once all the item is deleted.
                // this.itemTypeId = 0;
            }
            else {
                this.changeDetectorRef.detectChanges();
            }
            this.AllCalculation();
            this.checkDuplicateItem();
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }

    }
    //sanjit: this function is suppose to pass all the values or non of them
    checkDuplicateItem() {
        try {
            let totalqty = 0;
            let flag: boolean = true;
            this.currSaleItems.forEach(item => { item.IsDuplicate = false; })

            for (let i = 0; i < this.currSaleItems.length; i++) {
                for (let j = i; j < this.currSaleItems.length; j++) {
                    if (i != j) {
                        if (this.currSaleItems[i].StockId == null) {
                            this.currSaleItems[i].IsDuplicate = false;
                        } else {
                            if (this.currSaleItems[i].BatchNo == this.currSaleItems[j].BatchNo &&
                                this.currSaleItems[i].ItemId == this.currSaleItems[j].ItemId &&
                                this.currSaleItems[i].ExpiryDate == this.currSaleItems[j].ExpiryDate &&
                                this.currSaleItems[i].MRP == this.currSaleItems[j].MRP) {
                                this.currSaleItems[i].IsDuplicate = this.currSaleItems[j].IsDuplicate = true;
                                totalqty += this.currSaleItems[j].Quantity;
                                if (this.currSaleItems[i].TotalQty < totalqty + this.currSaleItems[i].Quantity) {
                                    flag = false;
                                }
                            }
                        }
                    }
                }
            }
            return flag;
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
            this.currSale.BilStatus = (this.currSale.PaymentMode == "credit") ? "unpaid" : "paid";
            this.currSale.CreditAmount = CommonFunctions.parseAmount(this.currSale.TotalAmount - this.currSale.PaidAmount);
            this.currSale.IsOutdoorPat = this.currSale.selectedPatient.IsOutdoorPat;
            this.currSale.PatientId = this.currSale.selectedPatient.PatientId;
            this.currSale.DepositDeductAmount = this.depositDeductAmount;
            this.currSale.DepositAmount = this.depositDeductAmount;
            this.currSale.DepositBalance = this.newdepositBalance;
            this.currSale.CounterId = this.currentCounterId;

            //Initialize Invoice Items  details for post to database
            //Initialize Invoice IteCheckValidaitonms  details for post to database
            for (var i = 0; i < this.currSaleItems.length; i++) {
                //lots of workaround here--need to revise and update properly--sud:8Feb18
                //assign value from searchTbx selected item only if searchTbx is enabled, else we already have other values assigned to the model.

                if (this.currSaleItems[i].enableItmSearch) {
                    this.currSaleItems[i].CompanyId = this.currSaleItems[i].selectedItem.CompanyId;
                    this.currSaleItems[i].ItemId = this.currSaleItems[i].selectedItem.ItemId;
                    this.currSaleItems[i].ItemName = this.currSaleItems[i].selectedItem.ItemName;
                }
                else {

                    let curItmId = this.currSaleItems[i].ItemId;
                    let curItm = this.ItemTypeListWithItems.find(itm => itm.ItemId == curItmId);
                    //let curItm = this.allPhrmItems.find(itm => itm.ItemId == curItmId);
                    this.currSaleItems[i].CompanyId = curItm.CompanyId;
                }


                //NBB-GRItem Price and MRP for InvoiceItems doubtful
                //Now we are taking MRP and GRItemPrice to invoice from first Selected BatchNo 
                //But when we sale one invoice item from two BatchNo that time In GRItems there are two different record as per batchno
                //and may be MRP, GRItemPrice vary batchNo wise
                //but now we assigning first record details to both of record
                //this.currSaleItems[i].MRP = this.currSaleItems[i].SelectedGRItems[0].MRP;
                //BatchNo assing from server
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
    //For selling medicine to anonymous people
    public SetAnonymous() {
        try {

            this.currSale.selectedPatient.PatientId = -1;
            //this.currSale.selectedPatient.PatientCode = 'MNK1001';
            // this.currSale.selectedPatient.ShortName = patInfo.ShortName;
            // this.currSale.selectedPatient.DateOfBirth = 1990 - 07 - 21 07:22:00.000;
            this.currSale.selectedPatient.Gender = 'N/A';
            this.currSale.selectedPatient.IsOutdoorPat = null;
            this.currSale.selectedPatient.PhoneNumber = 'N/A';
            this.currSale.selectedPatient.FirstName = 'Anonymous';
            this.currSale.selectedPatient.MiddleName = null;
            this.currSale.selectedPatient.LastName = 'Anonymous';
            this.currSale.selectedPatient.Age = 'N/A';
            // this.currSale.selectedPatient.AgeUnit = patInfo.AgeUnit;
            this.currSale.selectedPatient.Address = 'Anonymous';
            // let midName = (patInfo.MiddleName != null) ? patInfo.MiddleName : '';
            this.currSale.selectedPatient.ShortName = 'Anonymous';
            this.currentPatient = this.currSale.selectedPatient;
            this.searchPatient = '';
            this.currSale.selectedPatient.PatientCode = '';
            //to change registered patient to anonymous on the top of the sale page
            var patient = this.patientService.getGlobal();
            patient.ShortName = 'Anonymous';
            patient.PatientCode = '';
            patient.DateOfBirth = '';
            patient.PANNumber = 'N/A';
            patient.Gender = '';
            patient.PhoneNumber = 'N/A';
            //to erase registered patient invoice history
            this.patSummary.CreditAmount = '';
            this.patSummary.ProvisionalAmt = '';

            
            this.patSummary.BalanceAmount = '';
            this.patSummary.DepositBalance = '';
            this.patSummary.TotalDue = '';

            this.divDisable = true;
            this.showInfo = true;
            //Set Default values for Provider and VisitType when Anonymous Patient is choosen.
            //this.provider.Value = "ANONYMOUS DOCTOR";

            this.isReferrerLoaded = false;
            this.selectedRefId = -1;//-1 is value for Anonymous Doctor.
            this.changeDetectorRef.detectChanges();
            //this.defaultRefInfo = { ShowDefault: true, DefaultReferrerId: -1, ReferrerName: 'Anonymous Doctor' };
            this.isReferrerLoaded = true;


            this.visitType = "outpatient";
            this.changeDetectorRef.detectChanges();
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }

    //Start Patient Registraiton related code
    //Method for assign value to patient service
    public SetSelectedPatientData(patInfo, afterRegistration: boolean) {
        try {
            if (this.patientService.globalPatient.PatientId) {
                if (this.patientService.globalPatient.Age) {
                    var localage = this.patientService.globalPatient.Age;
                    patInfo.Age = localage.slice(0, -1);
                    patInfo.AgeUnit = localage.slice(localage.length - 1);
                }
            }
            if (patInfo.PatientId) {
                this.currSale.selectedPatient.PatientId = patInfo.PatientId;
                this.currSale.selectedPatient.PatientCode = patInfo.PatientCode;
                this.currSale.selectedPatient.ShortName = patInfo.ShortName;
                this.currSale.selectedPatient.DateOfBirth = patInfo.DateOfBirth;
                this.currSale.selectedPatient.Gender = patInfo.Gender;
                this.currSale.selectedPatient.IsOutdoorPat = patInfo.IsOutdoorPat;
                this.currSale.selectedPatient.PhoneNumber = patInfo.PhoneNumber;
                this.currSale.selectedPatient.FirstName = patInfo.FirstName;
                this.currSale.selectedPatient.MiddleName = patInfo.MiddleName;
                this.currSale.selectedPatient.LastName = patInfo.LastName;
                this.currSale.selectedPatient.Age = patInfo.Age;
                this.currSale.selectedPatient.AgeUnit = patInfo.AgeUnit;
                this.currSale.selectedPatient.Address = patInfo.Address;
                let midName = (patInfo.MiddleName != null) ? patInfo.MiddleName : '';
                this.currSale.selectedPatient.ShortName = patInfo.FirstName + " " + midName + " " + patInfo.LastName;
                //this.currentPatient = this.currSale.selectedPatient;
                this.currentPatient = Object.assign(this.currentPatient, this.currSale.selectedPatient);
                this.divDisable = true;
                this.showInfo = true;
                //this.onClickPatient(this.currentPatient);
            }
            //check and go for save
            if (afterRegistration) {
                this.Save();
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
    //Add Patient this method check patient is already registered or not
    RegisterPatient() {
        try {
            //this.currentPatient = Object.assign(this.currentPatient,this.currentPatient.new)
            //this.newOpatient = Object.assign(this.newOpatient, this.currentPatient)
            for (var i in this.currentPatient.PHRMPatientValidator.controls) {
                this.currentPatient.PHRMPatientValidator.controls[i].markAsDirty();
                this.currentPatient.PHRMPatientValidator.controls[i].updateValueAndValidity();
            }
            if (this.currentPatient.IsValidCheck(undefined, undefined)) {
                this.loading = true;
                this.currentPatient.IsOutdoorPat = (this.visitType == "outpatient") ? true : false;
                this.pharmacyBLService.GetExistedMatchingPatientList(this.currentPatient.FirstName, this.currentPatient.LastName,
                    this.currentPatient.PhoneNumber)
                    .subscribe(res => {
                        if (res.Status == "OK" && res.Results.length > 0) {
                            this.matchingPatientList = res.Results;
                            this.matchingPatientList.forEach(pat => { pat.DateOfBirth = moment(pat.DateOfBirth).format('DD-MMM-YYYY'); });
                            this.showExstingPatientList = true;
                        } else if (res.Status == "Failed") {
                            this.loading = false;
                            this.messageboxService.showMessage("error", ['There is problem, please try again']);
                        } else {
                            this.PostPatientRegistration();
                        }
                    },
                        err => {
                            this.loading = false;
                            this.messageboxService.showMessage("Please, Try again . Error in Getting Existed Match patient list", [err.ErrorMessage]);
                        });
            } else {
                this.messageboxService.showMessage("notice", ['Please register/select patient first']);
            }
        }

        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
    //Register Patient-Register as Outdoor new patient
    PostPatientRegistration() {
        try {
            for (var i in this.currentPatient.PHRMPatientValidator.controls) {
                this.currentPatient.PHRMPatientValidator.controls[i].markAsDirty();
                this.currentPatient.PHRMPatientValidator.controls[i].updateValueAndValidity();
            }
            if (this.currentPatient.IsValidCheck(undefined, undefined)) {
                this.loading = true;
                this.loading1 = true;
                this.currentPatient.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                this.currentPatient.Age = this.currentPatient.Age.substring(0, 2) + this.currentPatient.AgeUnit;
                //this.currentPatient =
                //this.currentPatient.ProviderId = -1;
                this.pharmacyBLService.PostPatientRegister(this.currentPatient)
                    .subscribe(
                        res => {
                            if (res.Status == "OK") {
                                //this.messageboxService.showMessage("success", ["Patient Register Successfully"]);
                                this.divDisable = true;
                                this.loading = false;
                                this.loading1 = false;
                                this.showExstingPatientList = false;
                                this.SetSelectedPatientData(res.Results, true);
                            }
                            else {
                                this.messageboxService.showMessage("error", ["Patient Registration failed check error.." + res.ErrorMessage]);
                                this.loading = false;
                                this.loading1 = false;
                            }
                        },
                        err => {
                            this.messageboxService.showMessage("error", ["Patient Registration failed check error.." + err.ErrorMessage]);
                            this.loading = false;
                            this.loading1 = false;
                        });
            }
            else {
                this.messageboxService.showMessage("error", ["Please fill all  details"]);
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }

    }
    //calculate DOB from age and ageUnit 
    CalculateDob() {
        try {
            if (this.currentPatient.Age && this.currentPatient.AgeUnit) {
                var age: number = Number(this.currentPatient.Age);
                var ageUnit: string = this.currentPatient.AgeUnit;
                this.currentPatient.DateOfBirth = this.patientService.CalculateDOB(age, ageUnit);
            }

        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
    // show pop up on stock details click
    StockDetails() {
        this.showStockDetails = true;
    }
    // PatRegistrationClick() {
    //     try {
    //         this.showNewPatRegistration = true;
    //         this.currSale.selectedPatient = new PHRMPatient();
    //         this.currSale.selectedPatient.PhoneNumber = '000000000';
    //         if(this.currentPatient.PatientId){
    //             this.currentPatient = Object.assign(this.currentPatient, this.newOutPatient);
    //         }
    //         this.changeDetectorRef.detectChanges();
    //         document.getElementById('newPatFirstName').focus();
    //     } catch (exception) {
    //         this.ShowCatchErrMessage(exception);
    //     }
    // }
    //This method for close Existing Patient popup
    Close() {
        // this.matchingPatientList = new Array<PHRMPatient>();
        // this.showExstingPatientList = false;
        // this.showNewPatRegistration = false;
        // this.loading = false;
        this.loading1 = false;
        this.showStockDetails = false;
    }

    SaveSaleWithPatient() {
        /*if (this.currSale.Tender < this.currSale.PaidAmount && this.currSale.PaymentMode !="credit" ) {
         
          this.messageboxService.showMessage("error", ['Tender must be greater or equal with paid amount']);
          return;
        }*/

        if (this.currSale.Change < 0 && this.currSale.PaymentMode != "credit") {

            this.messageboxService.showMessage("error", ["Tender amount isn't Sufficient"]);
            return;
        }
        // //check Patient is registered or not
        // if (this.currSale.selectedPatient.PatientId) {
        //     var len = this.currSaleItems.length;
        //     if (this.currSaleItems[len - 1].StockId == null) {
        //         this.currSaleItems.pop();
        //         this.Save();
        //     } else {
        //         this.Save();
        //     }
        // } else {
        //     //If patient not registered then first need to register patient then go to sale          
        //     this.RegisterPatient();
        // }
        this.Save();
    }

    SaveSaleWithCreditPatient() {
        if (this.IsitemlevlDis == false) {              //if item level discount is disable then general discount General Total Discount Not carry to Provisional Bill
            if (confirm("General Total Discount Not carry to Provisional Bill")) {
                this.saveCrediContinue();
            }
        }
        else {
            this.saveCrediContinue();
        }
    }

    saveCrediContinue() {
        //check Patient is registered or not
        if (this.currSale.selectedPatient.PatientId) {
            this.loading = true;
            this.SaveCredit();
        } else {
            //If patient not registered then first need to register patient then go to sale          
            this.RegisterPatient();
        }

    }
    //cancel method redirect to sale list page
    Cancel() {
        this.router.navigate(['/Pharmacy/Patient/List'])
    }

    public ShowOpPatAddPopUp() {
        if (this.currentPatient.PatientId == 0) {
            this.showAddNewOpPopUp = true;
        }
        else{
            this.messageboxService.showMessage("Notice-Message",["Cannot edit this patient."])
        }
    }

    // Temporary solution ->
    //check ItemType, Item and batchNo validation manually
    //this manual
    CheckValidaiton(): boolean {
        try {
            let flag: boolean = true;
            for (var i = 0; i < this.currSaleItems.length; i++) {
                //when item search is disabled, selectedItem comes as null, that case just check if ItemName is assigned or not.
                //needs revision: sud-8feb18
                if (!this.currSaleItems[i].selectedItem && !this.currSaleItems[i].ItemName) {
                    this.messageboxService.showMessage("notice", ["Please select Medicine of " + (i + 1).toString() + " rows"]);
                    flag = false;
                    break;
                }
                //if (!this.currSaleItems[i].SelectedGRItems.length) {
                //    this.messageboxService.showMessage("notice", ["Please select  Batch number's of " + (i + 1).toString() + " rows"]);
                //    flag = false;
                //    break;
                //}
            }
            return flag;
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }

    }

    //used to format display of item in ng-autocomplete
    phrmItemListFormatter(data: any): string {
        //if (data[])
        let html = "";
        if (data["ItemId"]) {
            html = data["ItemName"] + " |B.No.|" + data["BatchNo"] + " |M.R.P|" + data["MRP"] + "|Qty|" + data["AvailableQuantity"];
        }
        else {
            html = data["ItemName"];
        }
        return html;
    }

    //used to format display of item in ng-autocomplete
    patientListFormatter(data: any): string {
        let html = data["ShortName"] + ' [ ' + data['PatientCode'] + ' ]';
        return html;
    }
    onClickProvider($event) {
        this.selectedRefId = $event.ReferrerId;
        //default providerid is -1.
    
        if ($event.ReferrerId > 0 || $event.ReferrerId == -1) {
            this.currSale.ProviderId = $event.ReferrerId;
            //this.provider.Key = $event.ReferrerId;
            //this.provider.Value = $event.ReferrerName;

            this.currSale.EnableControl('Provider', false);
        }
        else {
            this.currSale.EnableControl('Provider', true);
        }
    }
    onClickPatient($event) {

        if ($event.PatientId > 0 || $event.PatientId == -1) {
            this.pharmacyBLService.GetPatientByPatId($event.PatientId)
                .subscribe(res => {
                    if (res.Status == "OK") {
                        this.currSale.selectedPatient.PatientId = res.Results.PatientId;
                        this.currSale.selectedPatient.PatientCode = res.Results.PatientCode;
                        this.currSale.selectedPatient.Gender = res.Results.Gender;
                        this.currSale.selectedPatient.IsOutdoorPat = null;
                        this.currSale.selectedPatient.PhoneNumber = res.Results.PhoneNumber;
                        this.currSale.selectedPatient.PANNumber = res.Results.PANNumber;
                        this.currSale.selectedPatient.FirstName = res.Results.FirstNam
                        this.currSale.selectedPatient.MiddleName = res.Results.MiddleName;
                        this.currSale.selectedPatient.LastName = res.Results.LastName;
                        this.currSale.selectedPatient.Age = res.Results.Age;
                        this.currSale.selectedPatient.Address = res.Results.Address;
                        this.currSale.selectedPatient.ShortName = res.Results.FirstName + ((res.Results.MiddleName != null) ? (' ' + res.Results.MiddleName + ' ') : (' ')) + res.Results.LastName;
                        this.currSale.selectedPatient.CountrySubDivisionName = res.Results.CountrySubDivisionName;
                        this.currSale.selectedPatient.DateOfBirth = res.Results.DateOfBirth;
                        this.currSale.selectedPatient.IsAdmitted = res.Results.IsAdmitted;
                        this.currentPatient = this.currSale.selectedPatient;
                        //set patient to global
                        let pat = this.patientService.CreateNewGlobal();
                        pat.ShortName = res.Results.FirstName + ((res.Results.MiddleName != null) ? (' ' + res.Results.MiddleName + ' ') : (' ')) + res.Results.LastName;
                        pat.PatientCode = res.Results.PatientCode;
                        pat.DateOfBirth = res.Results.DateOfBirth;
                        pat.PANNumber = res.Results.PANNumber;
                        pat.Gender = res.Results.Gender;
                        pat.PatientId = res.Results.PatientId;
                        pat.PhoneNumber = res.Results.PhoneNumber;
                        pat.Age = res.Results.Age;

                        this.LoadPatientInvoiceSummary(this.currSale.selectedPatient.PatientId);
                        this.deductDeposit = false;
                        this.checkDeductfromDeposit = false;
                        this.searchPatient = '';
                        //this.divDisable = true;
                        this.showInfo = true;

                        //Prefill VisitType. (default is outpatient)
                        if (res.Results.IsAdmitted) {
                            this.visitType = "inpatient";
                        } else {
                            this.visitType = "outpatient";
                        }

                        //Fill the Provider Details if available.
                        if (res.Results.ProviderId) {
                            this.selectedRefId = res.Results.ProviderId;
                        }
                        else {
                            this.selectedRefId = -1;//if providerid not found for this patient, then use Anonymous.
                        }

                        this.currSale.ProviderId = this.selectedRefId;
                        //needed to re-initiate the referrer dropdown.
                        this.isReferrerLoaded = false;
                        this.changeDetectorRef.detectChanges();
                        this.isReferrerLoaded = true;


                        //let temp = this.providerList.find(a => a.Key == res.Results.ProviderId);
                        //if (temp) {
                        //  this.provider.Key = temp.Key;
                        //  this.provider.Value = temp.Value;
                        //  this.currSale.ProviderId = temp.Key;
                        //} else {
                        //  this.provider = new ProviderModel();
                        //  this.currSale.ProviderId = 0;
                        //}



                    }
                    else {
                        this.messageboxService.showMessage("Select Patient", [res.ErrorMessage]);
                        this.loading = false;
                    }
                });
        }
        // else {
        //     this.messageboxService.showMessage("notice", ['Please select patient']);
        // }

    }

    //This function only for show catch messages
    ShowCatchErrMessage(exception) {
        if (exception) {
            let ex: Error = exception;
            this.routeFromService.RouteFrom = null;
            this.messageboxService.showMessage("error", ["Check error in Console log !"]);
            console.log("Error Messsage =>  " + ex.message);
            console.log("Stack Details =>   " + ex.stack);
            //this.messageboxService.showMessage("error", [ex.message + "     " + ex.stack]);
        }
    }
    //this is a success callback of GenerateDoctorList function.
    //GetDoctorList() {
    //  this.providerList.push({ "Key": -1, "Value": "ANONYMOUS DOCTOR" });
    //  this.pharmacyBLService.GetDoctorList().subscribe(res => {
    //    if (res.Status = "OK") {
    //      if (res.Results) {
    //        //format return list into Key:Value form, since it searches also by the property name of json.
    //        res.Results.forEach(a => {
    //          this.providerList.push({ "Key": a.EmployeeId, "Value": a.FullName });
    //        });


    //      } else {
    //        this.messageboxService.showMessage("Failed ", ["Record Not Found!!"]);
    //      }
    //      //since it needs doctor list first, we put this function here so that provider will be automatically selected.
    //      this.SetSelectedPatientData(this.patientService.globalPatient, false);
    //    }
    //    else {
    //      this.messageboxService.showMessage("Failed ", [res.ErrorMessage]);
    //    }
    //  });
    //}


    //used to format display of doctors name in ng-autocomplete.
    providerListFormatter(data: any): string {
        let html = data["Value"];
        return html;
    }

    LoadPatientInvoiceSummary(patientId: number) {
        if (patientId > 0) {
            this.pharmacyBLService.GetPatientSummary(patientId)
                .subscribe(res => {
                    if (res.Status == "OK") {
                        this.patSummary = res.Results;
                        this.patSummary.CreditAmount = CommonFunctions.parseAmount(this.patSummary.CreditAmount);
                        this.patSummary.ProvisionalAmt = CommonFunctions.parseAmount(this.patSummary.ProvisionalAmt);
                        this.patSummary.BalanceAmount = CommonFunctions.parseAmount(this.patSummary.BalanceAmount);
                        this.patSummary.DepositBalance = CommonFunctions.parseAmount(this.patSummary.DepositBalance);
                        this.patSummary.TotalDue = CommonFunctions.parseAmount(this.patSummary.TotalDue);
                        this.patSummary.IsLoaded = true;
                    }
                    else {
                        this.messageboxService.showMessage("Select Patient", [res.ErrorMessage]);
                        this.loading = false;
                    }
                });
        }
    }


    //Change the Checkbox value and call Calculation logic from here. 
    DepositDeductCheckBoxChanged() {
        this.checkDeductfromDeposit = true;
        this.CalculateDepositBalance();
    }
    public newdepositBalance: number = 0;
    public depositDeductAmount: number = 0;

    CalculateDepositBalance() {
        if (this.deductDeposit) {
            if (this.patSummary.DepositBalance > 0) {
                this.newdepositBalance = this.patSummary.DepositBalance - this.currSale.PaidAmount;
                this.newdepositBalance = CommonFunctions.parseAmount(this.newdepositBalance);
                if (this.newdepositBalance >= 0) {
                    this.depositDeductAmount = this.currSale.PaidAmount;
                    this.currSale.Tender = this.currSale.PaidAmount;
                    this.currSale.Change = 0;
                }
                else {
                    this.currSale.Tender = -(this.newdepositBalance);//Tender is set to positive value of newDepositBalance.
                    this.depositDeductAmount = this.patSummary.DepositBalance;//all deposit has been returned.
                    this.newdepositBalance = 0;//reset newDepositBalance since it's all Used NOW. 
                    this.currSale.Change = 0;//Reset Change since we've reset Tender above.
                }
            }
            else {
                this.messageboxService.showMessage("failed", ["Deposit balance is zero, Please add deposit to use this feature."]);
                this.deductDeposit = !this.deductDeposit;
            }
        }
        else {
            //reset all required properties..
            this.currSale.Tender = this.currSale.TotalAmount;
            this.newdepositBalance = this.patSummary.DepositBalance;
            this.depositDeductAmount = 0;
            this.currSale.Change = 0;
        }
    }

    public LoadReferrerSettings() {
        var currParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Pharmacy" && a.ParameterName == "ExternalReferralSettings");
        if (currParam && currParam.ParameterValue) {
            this.ExtRefSettings = JSON.parse(currParam.ParameterValue);
        }
    }
    //show or hide  item level discount
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

    RegisterNewOutDoorPatient() {
        for (var i in this.currentPatient.PHRMPatientValidator.controls) {
            this.currentPatient.PHRMPatientValidator.controls[i].markAsDirty();
            this.currentPatient.PHRMPatientValidator.controls[i].updateValueAndValidity();
        }
        if (this.currentPatient.IsValidCheck(undefined, undefined)) {
            this.showNewPatRegistration = false;
            this.newOutPatient = Object.assign(this.newOutPatient, this.currentPatient);
            this.newOutPatient.ShortName = this.newOutPatient.FirstName.concat(this.newOutPatient.MiddleName ? " " + this.newOutPatient.MiddleName + " " : " ").concat(this.newOutPatient.LastName);
            this.currSale.selectedPatient = this.newOutPatient;
        }
    }

    GoToNext(nextField: HTMLInputElement) {
        nextField.focus();
        nextField.select();
    }

    GoToNextButton(nextField: HTMLButtonElement) {
        if(nextField.value == 'Print Invoice')
        {
            for (let i = 0; i < this.currSaleItems.length; i++) {
               if(this.currSaleItems[i].selectedItem.ItemName == '--select item--')
               {
                   this.currSaleItems[i].InvoiceItemsValidator.controls['Quantity'].clearValidators;
                   this.currSaleItems.splice(i,1);
               }
                
            }
            this.Save();
        }
        else{
            nextField.focus();
        }
        
    }

    GoToNextSelect(paymentMode) {
        paymentMode.focus();
        var index = paymentMode.selectedIndex;
        if (index == 0) {
            document.getElementById('Tender').focus();
        }
    }

    change() {
        if (this.currSale.PaymentMode == 'credit') {
            let onFieldChange = this.renderer2.selectRootElement('#remarks');
            onFieldChange.focus();
        } else {
            let onFieldChange = document.getElementById('Tender');
            onFieldChange.focus();
        }

    }

    //this function is hotkeys when pressed by user
    public hotkeys(event) {
        if (event.altKey) {
            console.log(event.keyCode);
            switch (event.keyCode) {
                case 65: {//65='A'  => ALT+A comes here
                    this.SetAnonymous();
                    let itmCount = this.currSaleItems.length;
                    if (itmCount > 0) {
                        let lastIndex = itmCount - 1;
                        window.setTimeout(function () {
                            document.getElementById('item-box' + lastIndex).focus();
                        }, 600);
                    }
                    break;
                }
                case 190: { //=> ALT+. (dot) comes here -> For Chrome browser--KEEP THIS--It's WORKING
                    document.getElementById('patient-search').click();
                    break;
                }
                case 46: { //=> ALT+. (dot) comes here -> ASCII table shows  46=(dot), so kept this case as well, remove later if not used
                    document.getElementById('patient-search').click();
                    break;
                }
                case 76: {//=> ALT+L comes here
                    this.StockDetails();
                    break;
                }
                case 78: {// => ALT+N comes here
                    this.ShowOpPatAddPopUp();
                    break;
                }
                case 80: {// => ALT+P comes here
                    this.SaveSaleWithPatient();
                    break;
                }
                default:
                    break;
            }
        }

    }
    OnAddPatientPopUpClose() {
        this.showAddNewOpPopUp = false;
       
    }
    OnNewPatientAdded($event) {
        this.showAddNewOpPopUp = false;
        this.currentPatient = $event.currentPatient;
        this.currSale.selectedPatient  =  this.currentPatient 
        this.setFocusById("Doctor");
    }
}



export class ProviderModel {
    public Key: number = 0;
    public Value: string = null;
}