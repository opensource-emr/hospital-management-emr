import { Component, ChangeDetectorRef, AfterViewInit, ViewEncapsulation } from "@angular/core";
import { NgForm, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms'
import { Router } from '@angular/router';
import { SecurityService } from '../../security/shared/security.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';

import { PharmacyBLService } from "../shared/pharmacy.bl.service"
import { PharmacyService } from "../shared/pharmacy.service";
import { PatientService } from "../../patients/shared/patient.service";
import { PHRMPrescription } from "../shared/phrm-prescription.model";
import { PHRMPrescriptionItem } from "../shared/phrm-prescription-item.model";
import { PHRMItemTypeModel } from "../shared/phrm-item-type.model";
import { PHRMItemMasterModel } from "../shared/phrm-item-master.model"
import { PHRMInvoiceModel } from "../shared/phrm-invoice.model";
import { PHRMInvoiceItemsModel } from "../shared/phrm-invoice-items.model";
import { PHRMPatient } from "../shared/phrm-patient.model";
import { PHRMGoodsReceiptItemsModel } from "../shared/phrm-goods-receipt-items.model";
import { CommonFunctions } from "../../shared/common.functions";
import { RouteFromService } from "../../shared/routefrom.service";
import { PharmacyReceiptModel } from "../shared/pharmacy-receipt.model";
import { PHRMNarcoticRecordModel } from "../shared/phrm-narcotic-record";
import { invalid } from "moment/moment";
import { CallbackService } from '../../shared/callback.service';
import { templateJitUrl } from "@angular/compiler";
import { Patient } from "../../patients/shared/patient.model";

@Component({
    templateUrl: "./phrm-dispatch.html",
    encapsulation: ViewEncapsulation.None
})
export class PHRMDispatchComponent {

    public currentCounterId: number = null;
    public currentCounterName: string = null;
    public searchPatient = '';
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

    ) {
        try {
            //this.inpatientList();
            this.currentCounterId = this.securityService.getPHRMLoggedInCounter().CounterId;
            this.currentCounterName = this.securityService.getPHRMLoggedInCounter().CounterName;

            if (this.currentCounterId < 1) {
                this.callBackService.CallbackRoute = '/Pharmacy/Sale/Dispatch'
                this.router.navigate(['/Pharmacy/ActivateCounter']);
            }
            else {
                this.SetSelectedPatientData(this.patientService.globalPatient, false);
                this.LoadItemTypeList();
            }
        } catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }

    //All variable declaration for Patient Registration
    public currentPatient: PHRMPatient = new PHRMPatient();
    public matchingPatientList: Array<PHRMPatient> = new Array<PHRMPatient>();
    public narcoticsRecord: PHRMNarcoticRecordModel = new PHRMNarcoticRecordModel();
    public loading1: boolean = false;
    public showExstingPatientList: boolean = false;
    public divDisable: boolean = false;
    //public itemTypeId: number = 0;

    //Variable declaration is here for sale   
    public name: string = null;
    public loading: boolean = false;
    public IsWrongProvider: boolean = false;
    public selProvider: any;
    public currSale: PHRMInvoiceModel = new PHRMInvoiceModel();
    public currSaleItems: Array<PHRMInvoiceItemsModel> = new Array<PHRMInvoiceItemsModel>();
    public ItemTypeListWithItems: Array<any> = new Array<any>();
    public ItemListForSale: Array<PHRMGoodsReceiptItemsModel> = new Array<PHRMGoodsReceiptItemsModel>();

    public doctorList: any;
    public patientList: Array<PHRMPatient> = new Array<PHRMPatient>();
    public patientListAutoComplete: Array<PHRMPatient> = new Array<PHRMPatient>();
    patients: Array<Patient> = new Array<Patient>();
    patient: Patient = new Patient();
    
    public itemIdGRItemsMapData = new Array<{ ItemId: number, GRItems: Array<PHRMGoodsReceiptItemsModel> }>();
    public showSupplierAddPage: boolean = false;
    public showInfo: boolean = true;
    public showStockDetails: boolean = false;

    switchTextBox(index) {
        window.setTimeout(function () {
            document.getElementById('qty-box' + index).focus();
        }, 0);
    }
    ngAfterViewChecked()
    {
    this.changeDetectorRef.detectChanges();
    }

    GetRequistionItems() {
        try {
            //this.routeFromService.RouteFrom = null;
            if (this.pharmacyService.RequisitionId > 0) {//check for patientId and providerId
                this.pharmacyBLService.GetPHRMDrugsItemList(this.pharmacyService.RequisitionId)
                    .subscribe(res => this.CallBackGetRequisitionItems(res));
            } else {
                //this.routeFromService.RouteFrom = null;
                this.router.navigate(['/Pharmacy/Prescription/List']);
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
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

    CallBackGetPrescriptionItems(res) {
        try {
            if (res.Status == 'OK') {
                if (res.Results) {
                    let PresItems = new Array<PHRMPrescriptionItem>();
                    PresItems = res.Results;


                    PresItems.forEach(itm => {
                        let tempSaleItem: PHRMInvoiceItemsModel = new PHRMInvoiceItemsModel();
                        tempSaleItem.PrescriptionItemId = itm.PrescriptionItemId;
                        tempSaleItem.ItemId = itm.ItemId;
                        tempSaleItem.RequestedQuantity = itm.Quantity;
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


                        //make it easier to understand.
                        //this.onChangeItemType(tempSaleItem.ItemTypeId, this.currSaleItems.length - 1);
                    });
                }
            }
            else {
                err => {
                    this.messageboxService.showMessage("failed", ['failed to get prescription items.!']);
                }
            }

        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }

    //when GEt prescription method response data from server to local call this method
    CallBackGetRequisitionItems(res) {
        try {
            if (res.Status == 'OK') {
                if (res.Results) {
                    let PresItems = new Array<PHRMPrescriptionItem>();
                    PresItems = res.Results;


                    PresItems.forEach(itm => {
                        let tempSaleItem: PHRMInvoiceItemsModel = new PHRMInvoiceItemsModel();
                        tempSaleItem.PrescriptionItemId = itm.PrescriptionItemId;
                        tempSaleItem.ItemId = itm.ItemId;
                        tempSaleItem.RequestedQuantity = itm.Quantity;
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
                        }
                        let currItm = currItmA;
                        tempSaleItem.ItemTypeId = currItm != null ? currItm.ItemTypeId : 0;
                        tempSaleItem.ItemName = currItm.ItemName;
                        tempSaleItem.Items = this.ItemTypeListWithItems.find(typ => typ.ItemTypeId == tempSaleItem.ItemTypeId).Items;
                        tempSaleItem.selectedItem = currItm;
                        tempSaleItem.PrescriptionItemId = currItm.PrescriptionItemId;
                        tempSaleItem.GenericName = currItm.GenericName;
                        tempSaleItem.CounterId = this.currentCounterId;
                        tempSaleItem.StockId = currItm.StockId;

                        this.currSaleItems.push(tempSaleItem);
                        this.OnPresciptionItemChange(currItm, this.currSaleItems.length - 1, tempSaleItem.Quantity);


                        //make it easier to understand.
                        //this.onChangeItemType(tempSaleItem.ItemTypeId, this.currSaleItems.length - 1);
                    });
                }
            }
            else {
                err => {
                    this.messageboxService.showMessage("failed", ['failed to get prescription items.!']);
                }
            }

        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }

    //to show popup in-case of narcotic drug sales
    AddNarcotics($event, index) {
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
                    this.ItemListForSale = new Array<PHRMGoodsReceiptItemsModel>();
                    this.ItemListForSale = res.Results;
                    this.ItemTypeListWithItems = new Array<PHRMItemTypeModel>();
                    this.ItemTypeListWithItems = res.Results;
                    ///displaying only those ItemTypeList in Dropdown whose Status is Active Now. 
                    this.ItemTypeListWithItems = this.ItemTypeListWithItems.filter(itmtype => itmtype.IsActive == true);
                    this.GetRequistionItems();
                }
            }
            else {
                err => {
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
                    if (itmData) {
                        //this.currSaleItems[i].selectedItem = itmData; 
                        let invItm: PHRMInvoiceItemsModel = new PHRMInvoiceItemsModel();
                        this.currSaleItems.push(invItm);
                        this.currSaleItems[this.currSaleItems.length - 1].selectedItem = itmData;
                        this.currSaleItems[this.currSaleItems.length - 1].Quantity = returnItems[i].Quantity
                        // this.currSaleItems[this.currSaleItems.length - 1].selectedItem.Quantity = invItm.Quantity;
                        this.onChangeItem(itmData, this.currSaleItems.length - 1);
                    } else {

                    }
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
                this.currSaleItems[index].Price = $event.MRP;
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
                this.AddNarcotics($event, index);
            }
            if ($event.ItemId > 0) {
                let itemId = $event.ItemId;
                //below line is just to avoid error check later
                //this.currSaleItems[index].SelectedGRItems = $event;
                this.currSaleItems[index].selectedItem = Object.assign(this.currSaleItems[index].selectedItem, $event);
                this.currSaleItems[index].selectedItem.SellingPrice = $event.MRP;
                this.currSaleItems[index].StockId = $event.StockId;
                this.currSaleItems[index].ItemTypeId = $event.ItemTypeId;
                this.currSaleItems[index].TotalQty = $event.AvailableQuantity;
                this.currSaleItems[index].BatchNo = $event.BatchNo;
                this.currSaleItems[index].MRP = $event.MRP;
                this.currSaleItems[index].Price = $event.MRP;
                this.currSaleItems[index].ExpiryDate = $event.ExpiryDate;
                this.currSaleItems[index].Quantity = $event.Quantity;
                this.currSaleItems[index].GoodReceiptItemId = $event.GoodReceiptItemId;
                this.currSaleItems[index].DiscountPercentage = $event.DiscountPercentage;
                this.currSaleItems[index].PrescriptionItemId = $event.PrescriptionItemId;
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

    ValueChanged(index) {
        try {
            if (this.currSaleItems[index].Quantity > this.currSaleItems[index].TotalQty) {
                // this.currSaleItems[index].Quantity = null;
                this.currSaleItems[index].IsDirty('Quantity');

                //this.currSaleItems[index].InvoiceItemsValidator.controls["Quantity"].setErrors({ 'incorrect': true });
            }
            let temp = (this.currSaleItems[index].Quantity - this.currSaleItems[index].FreeQuantity) * this.currSaleItems[index].MRP;
            let subtotal = temp - (this.currSaleItems[index].DiscountPercentage * temp) / 100;
            this.currSaleItems[index].SubTotal = CommonFunctions.parseAmount(subtotal);
            this.currSaleItems[index].TotalAmount = CommonFunctions.parseAmount(subtotal + (this.currSaleItems[index].VATPercentage * this.currSaleItems[index].SubTotal) / 100);
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
                for (var i = 0; i < this.currSaleItems.length; i++) {
                    this.currSale.SubTotal = CommonFunctions.parseAmount(this.currSale.SubTotal + this.currSaleItems[i].SubTotal);
                    this.currSale.TotalAmount = CommonFunctions.parseAmount(this.currSale.TotalAmount + this.currSaleItems[i].TotalAmount);
                    let temp = (this.currSaleItems[i].Quantity - this.currSaleItems[i].FreeQuantity) * this.currSaleItems[i].MRP;
                    this.currSale.DiscountAmount = CommonFunctions.parseAmount(this.currSale.DiscountAmount + (temp - this.currSaleItems[i].SubTotal));

                }
                this.currSale.VATAmount = CommonFunctions.parseAmount(this.currSale.TotalAmount - this.currSale.SubTotal);

                //for bulk discount calculation and conversion of percentage into amount and vice versa

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
                this.currSale.Tender = CommonFunctions.parseAmount(this.currSale.TotalAmount);
                this.currSale.DiscountAmount = CommonFunctions.parsePhrmAmount(this.currSale.SubTotal * (this.currSale.DiscountPer) / 100);
                this.currSale.TotalAmount = CommonFunctions.parseAmount(this.currSale.SubTotal - this.currSale.DiscountAmount);
                this.currSale.Change = CommonFunctions.parseAmount(this.currSale.Tender - this.currSale.TotalAmount);
                this.currSale.PaidAmount = CommonFunctions.parseFinalAmount(this.currSale.SubTotal - this.currSale.DiscountAmount);
                this.currSale.Adjustment = CommonFunctions.parseAmount(this.currSale.PaidAmount - this.currSale.TotalAmount);
                this.ChangeTenderAmount();
                //else {
                //    this.goodsReceiptVM.goodReceipt.SubTotal = CommonFunctions.parseAmount(STotal);
                //    this.goodsReceiptVM.goodReceipt.TotalAmount = CommonFunctions.parseAmount(TAmount) - this.goodsReceiptVM.goodReceipt.DiscountAmount;
                //    //this.goodsReceiptVM.goodReceipt.DiscountAmount = CommonFunctions.parseAmount(DAmount);
                //    this.goodsReceiptVM.goodReceipt.VATAmount = CommonFunctions.parseAmount(VAmount);
                //}
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }

    }

    ChangeTenderAmount() {
        this.currSale.Change = CommonFunctions.parseAmount(this.currSale.Tender - this.currSale.PaidAmount);
    }

    //validation is remaining
    Save(): void {
        try {
            let check: boolean = true;
            for (var j = 0; j < this.currSaleItems.length; j++) {
                //to check total quantity with available quantity
                if (this.currSaleItems[j].Quantity > this.currSaleItems[j].TotalQty) {
                    this.loading = false;
                    this.messageboxService.showMessage("error", ['There is problem, Qty is greater than Stock!']);
                    check = false;

                    break;
                }
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
            if (check) {
                if (this.CheckValidaiton()) {
                    this.AssignAllValues();
                    this.loading = true;
                    this.currSale.InvoiceItems = this.currSaleItems;
                  let invoicedetails = this.currSale;
                  this.currentPatient = new PHRMPatient();
                    this.pharmacyBLService.postInvoiceData(this.currSale)
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
            }
        } catch (exception) {
            this.ShowCatchErrMessage(exception);
        }

    }

    //credit billing
    SaveCredit(): void {
        try {
            let check: boolean = true;
            for (var j = 0; j < this.currSaleItems.length; j++) {
                //to check total quantity with available quantity
                if (this.currSaleItems[j].Quantity > this.currSaleItems[j].TotalQty) {
                    this.loading = false;
                    this.messageboxService.showMessage("error", ['There is problem, Qty is greater than Stock!']);
                    check = false;
                    break;
                }
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
            if (check) {
                if (this.CheckValidaiton()) {
                    this.AssignAllValues();
                    this.loading = true;
                    this.currSale.InvoiceItems = this.currSaleItems;
                    let invoicedetails = this.currSale;
                    //Revision: Send only items not the invoice. <sud:4Sept'18>
                  this.currentPatient = new PHRMPatient();
                    this.pharmacyBLService.PostCreditItemsDetails(this.currSale, this.pharmacyService.RequisitionId)
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

    //after invoice is succesfully added this function is called.
    CallBackSaveSale(res) {
        try {
            if (res.Status == "OK") {
                let txnReceipt = PharmacyReceiptModel.GetReceiptForTransaction(res.Results);

                // txnReceipt.ReceiptNo = res.InvoiceId;//////Math.floor(Math.random() * 100) + 1;
                //txnReceipt.ReceiptDate = moment().format("YYYY-MM-DD"); 
                txnReceipt.IsValid = true;
                txnReceipt.ReceiptType = "Sale Receipt";
                txnReceipt.BillingUser = this.securityService.GetLoggedInUser().UserName;
                txnReceipt.Patient = this.currSale.selectedPatient;
                this.pharmacyService.globalPharmacyReceipt = txnReceipt;
                this.router.navigate(['/Pharmacy/Sale/ReceiptPrint']);
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
                this.pharmacyService.globalPharmacyReceipt = txnReceipt;
                this.router.navigate(['/Pharmacy/Sale/ReceiptPrint']);
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

    //Add New row into list
    AddRowRequest(index) {
        try {
            var tempSale: PHRMInvoiceItemsModel = new PHRMInvoiceItemsModel();
            var new_index = index + 1;
            this.currSaleItems.push(tempSale);
            if (this.currSaleItems.length == 0) {
                this.currSaleItems.push(tempSale);

            } else {

            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }

    }

    AddRowRequestOnClick(index) {
        try {
            var tempSale: PHRMInvoiceItemsModel = new PHRMInvoiceItemsModel();
            var new_index = index + 1;
            this.currSaleItems.push(tempSale);
            if (this.currSaleItems.length == 0) {
                this.currSaleItems.push(tempSale);

            } else {

            }
            window.setTimeout(function () {
                document.getElementById('item-box' + new_index).focus();
            }, 0);
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }

    }

    //to delete the row
    DeleteRow(index) {
        try {
            this.currSaleItems.splice(index, 1);
            if (index == 0 && this.currSaleItems.length == 0) {
                this.AddRowRequest(0);
                // this.itemTypeId = 0;
            }
            else {
                this.changeDetectorRef.detectChanges();
            }
            this.AllCalculation();
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
            this.currSale.IsOutdoorPat = this.currSale.selectedPatient.IsOutdoorPat;
            this.currSale.PatientId = this.currSale.selectedPatient.PatientId;

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
            }
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
                this.currentPatient = this.currSale.selectedPatient;
                this.divDisable = true;
                this.showInfo = true;
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
            for (var i in this.currentPatient.PHRMPatientValidator.controls) {
                this.currentPatient.PHRMPatientValidator.controls[i].markAsDirty();
                this.currentPatient.PHRMPatientValidator.controls[i].updateValueAndValidity();
            }
            if (this.currentPatient.IsValidCheck(undefined, undefined)) {
                this.loading = true;
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
                this.currentPatient.Age = this.currentPatient.Age + this.currentPatient.AgeUnit;
                this.pharmacyBLService.PostPatientRegister(this.currentPatient)
                    .subscribe(
                        res => {
                            if (res.Status == "OK") {
                                this.messageboxService.showMessage("success", ["Patient Register Successfully"]);
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

    //This method for close Existing Patient popup
    Close() {
        this.matchingPatientList = new Array<PHRMPatient>();
        this.showExstingPatientList = false;
        this.loading = false;
        this.loading1 = false;
        this.showStockDetails = false;
    }

    SaveSaleWithPatient() {
        //check Patient is registered or not
        if (this.currSale.selectedPatient.PatientId) {
            this.Save();
        } else {
            //If patient not registered then first need to register patient then go to sale          
            this.RegisterPatient();
        }
    }

    SaveSaleWithCreditPatient() {
        //check Patient is registered or not
        if (this.currSale.selectedPatient.PatientId) {
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
    myItemListFormatter(data: any): string {
        let html = data["ItemName"] + " |B.No.|" + data["BatchNo"] + " |M.R.P|" + data["MRP"];
        return html;
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
}
