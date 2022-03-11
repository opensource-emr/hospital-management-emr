import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { WardSupplyBLService } from './shared/wardsupply.bl.service';
import { MessageboxService } from '../shared/messagebox/messagebox.service';
import { WardConsumptionModel } from './shared/ward-consumption.model';
import { WardStockModel } from './shared/ward-stock.model';
import { WardModel } from './shared/ward.model';
import { Array } from 'core-js';
import { SecurityService } from '../security/shared/security.service';
import { CallbackService } from '../shared/callback.service';
import * as moment from 'moment/moment';
import { CommonFunctions } from '../shared/common.functions';
import { CoreService } from "../core/shared/core.service";

@Component({
    templateUrl: "../../app/view/ward-supply-view/Consumption.html" // "/WardSupplyView/Consumption"
})
export class ConsumptionComponent {

    public ItemTypeListWithItems: Array<any>;
    public SelecetdItemList: Array<WardConsumptionModel> = [];
    public WardStockList: Array<WardStockModel> = [];
    public WardList: Array<WardModel> = [];
    public WardId: number = 0;
    public CurrentStoreId: number = 0;
    //public MRP: number = 0;
    public showEditBtn: boolean = true;
    public IsShowConsumption: boolean = false;
    public TotalConsumption: any;
    public PatientList: Array<any> = [];
    public PatientRefinedList: Array<any> = [];
    public SelectedPatient: any;
    public ShowPatientInfo: boolean = false;
    public WardConsumption: WardConsumptionModel = new WardConsumptionModel();
    public loading: boolean = false;
    public showDetail: boolean = false;

    constructor(
        public wardBLService: WardSupplyBLService,
        public messageboxService: MessageboxService,
        public securityService: SecurityService,
        public router: Router,
        public callBackService: CallbackService,
        public coreService: CoreService
    ) {
        //this.GetWardList();
        //this.GetPatientList();
        try {
            this.CurrentStoreId = this.securityService.getActiveStore().StoreId;
            if (!this.CurrentStoreId) {
                this.LoadSubStoreSelectionPage();
            }
            else {
                this.GetPatientList();
                this.GetWardList();
            }
        } catch (exception) {
            this.messageboxService.showMessage("Error", [exception]);
        }
    }

    LoadSubStoreSelectionPage() {
        this.router.navigate(['/WardSupply']);
    }
    //get ward list
    GetWardList() {
        try {
            this.wardBLService.GetWardList(this.CurrentStoreId)
                .subscribe(res => {
                    if (res.Status = 'OK') {
                        this.WardList = [];
                        this.WardList = res.Results;
                    }
                });
        }
        catch (exception) {
            this.messageboxService.showMessage("Error", [exception]);
        }
    }
    //get Patient List
    GetPatientList() {
        try {
            this.wardBLService.GetPatients()
                .subscribe(res => {
                    if (res.Status = 'OK') {
                        this.PatientList = [];
                        this.PatientList = res.Results;
                    }
                });
        }
        catch (exception) {
            this.messageboxService.showMessage("Error", [exception]);
        }
    }
    //used to format display of item in ng-autocomplete
    PatientListFormatter(data: any): string {
        let html = data["ShortName"] + ' [ ' + data['PatientCode'] + ' ]';
        return html;
    }
    onWardChange() {
        //this.LoadItemTypeList();
        this.getAllItemsStockDetailsList();
        this.GetWardStockDetail();
        this.SelecetdItemList = [];
        if (this.PatientRefinedList.length) {
            this.PatientRefinedList = [];
        }
        for (let i = 0; i < this.PatientList.length; i++) {
            if (this.WardId == this.PatientList[i].WardId) {
                this.PatientRefinedList.push(this.PatientList[i]);
            }
        }
        this.AddRow();
        if (this.SelectedPatient) {
            this.IsShowConsumption = true;
        }
    }
    onClickPatient($event) {
        this.ShowPatientInfo = true;
        if (this.WardId) {
            this.IsShowConsumption = true;
        }
    }
    //get wardsupply stock list - sanjit 17feb2019
    public getAllItemsStockDetailsList() {
        try {
            this.wardBLService.GetAllWardItemsStockDetailsList(this.CurrentStoreId)
                .subscribe(res => {
                    if (res.Status == "OK") {
                        if (res.Results.length) {
                            this.ItemTypeListWithItems = [];
                            this.ItemTypeListWithItems = res.Results;
                            
                        }
                        else {
                            this.messageboxService.showMessage("Failed", ["No Any Data Available"]);
                            //console.log(res.Errors);
                        }
                    }
                });

        } catch (exception) {
            this.messageboxService.showMessage("Error", [exception]);
        }
    }
    //get phrm stock list
    LoadItemTypeList(): void {
        try {
            this.wardBLService.GetItemTypeListWithItems()
                .subscribe(res => this.CallBackGetItemTypeList(res));
        }

        catch (exception) {
            this.messageboxService.showMessage("Error", [exception]);
        }
    }
    CallBackGetItemTypeList(res) {
        try {
            if (res.Status == 'OK') {
                if (res.Results) {
                    this.ItemTypeListWithItems = [];
                    this.ItemTypeListWithItems = res.Results;
                    this.ItemTypeListWithItems = this.ItemTypeListWithItems.filter(itmtype => itmtype.IsActive == true);
                }
            }
            else {
                err => {
                    this.messageboxService.showMessage("Failed", ['Failed to get ItemTypeList..']);
                }
            }
        }
        catch (exception) {
            this.messageboxService.showMessage("Error", [exception]);
        }
    }
    //get ward stock list
    GetWardStockDetail() {
        try {
            this.wardBLService.GetWardStockList()
                .subscribe(res => {
                    if (res.Status == 'OK') {
                        this.WardStockList = [];
                        this.WardStockList = res.Results;
                    }
                });
        }
        catch (exception) {
            this.messageboxService.showMessage("Error", [exception]);
        }
    }
    GetAvailableQuantity(itm) {
        try {
            return this.WardStockList.find(a => a.ItemId == itm.ItemId && a.MRP == itm.MRP && a.BatchNo == itm.BatchNo && a.ExpiryDate == itm.ExpiryDate).AvailableQuantity;
        }
        catch (ex) {
            this.messageboxService.showMessage("Error", ['Quantity not available!!']);
            return 0;
        }
    }
    //used to format display of item in ng-autocomplete
    ItemListFormatter(data: any): string {
        let html = "<font color='blue'; size=03 >" + data["ItemName"] + "</font>(" + data["GenericName"] + ") B-<b>" + data["BatchNo"] + "</b>"+this.coreService.currencyUnit+"<b>" + data["MRP"] + "</b> <font color='red'>Qty " + data["AvailableQuantity"] + "</font>";
        return html;
    }
    onChangeItem($event, index) {
        this.SelecetdItemList[index].ItemId = $event.ItemId;
        this.SelecetdItemList[index].ExpiryDate = $event.ExpiryDate;
        this.SelecetdItemList[index].BatchNo = $event.BatchNo;
        this.SelecetdItemList[index].MRP = $event.MRP;
        this.SelecetdItemList[index].AvailableQuantity = $event.AvailableQuantity;
        this.SelecetdItemList[index].ItemName = $event.ItemName;
        this.SelecetdItemList[index].WardId = this.WardId;
        this.SelecetdItemList[index].StockId = $event.StockId;
    }
    DeleteRow(index) {
        try {
            this.SelecetdItemList.splice(index, 1);
            if (this.SelecetdItemList.length == 0) {
                this.AddRow();
            }
            //window.setTimeout(function () {
            //    document.getElementById('item-box' + (index+1)).focus();
            //}, 0);
        }
        catch (exception) {
            this.messageboxService.showMessage("Error", [exception]);
        }
    }
    AddRow() {
        try {
            var tempSale: WardConsumptionModel = new WardConsumptionModel();
            this.SelecetdItemList.push(tempSale);
        }
        catch (exception) {
            this.messageboxService.showMessage("Error", [exception]);
        }
    }
    QuantityChanged(index) {
        if (this.SelecetdItemList[index].Quantity > this.SelecetdItemList[index].AvailableQuantity) {
            this.messageboxService.showMessage("Error", ['Quantity must be less than available quantity']);
        } else {
            this.SelecetdItemList[index].SubTotal = CommonFunctions.parseAmount(this.SelecetdItemList[index].Quantity * this.SelecetdItemList[index].MRP);
        }
        this.TotalConsumption = 0;
        this.SelecetdItemList.forEach(a => this.TotalConsumption += a.SubTotal);
    }
    Save() {
        let check = true;
        for (var j = 0; j < this.SelecetdItemList.length; j++) {
            for (var i in this.SelecetdItemList[j].ConsumptionValidator.controls) {
                this.SelecetdItemList[j].ConsumptionValidator.controls[i].markAsDirty();
                this.SelecetdItemList[j].ConsumptionValidator.controls[i].updateValueAndValidity();
            }
            if (!this.SelecetdItemList[j].IsValid(undefined, undefined)) {
                check = false;
                break;
            }
        }
        if (check) {
            this.loading = true;
            for (var j = 0; j < this.SelecetdItemList.length; j++) {
                this.SelecetdItemList[j].PatientId = this.SelectedPatient.PatientId;
                this.SelecetdItemList[j].Remark = this.WardConsumption.Remark;
                this.SelecetdItemList[j].CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                this.SelecetdItemList[j].StoreId = this.CurrentStoreId;
                //this.SelecetdItemList[j].MRP = this.MRP.toFixed(2);
            }
            this.wardBLService.PostConsumptionData(this.SelecetdItemList)
                .subscribe(res => {
                    if (res.Status == "OK" && res.Results != null) {
                        this.messageboxService.showMessage("Success", ['Consumption completed']);
                        this.loading = false;
                        //this.Cancel();
                        this.showDetail = true;
                        //this.ShowConsumptionPage();
                    }
                    else if (res.Status == "Failed") {
                        this.loading = false;
                        this.messageboxService.showMessage("Error", ['There is problem, please try again']);

                    }
                },
                    err => {
                        this.loading = false;
                        this.messageboxService.showMessage("Error", [err.ErrorMessage]);
                    });
        }
    }
    Cancel() {
        this.IsShowConsumption = false;
        this.ShowPatientInfo = false;
        this.SelectedPatient = null;
        this.WardList = [];
        this.WardId = 0;
        this.SelecetdItemList = [];
        this.WardConsumption = new WardConsumptionModel();
        this.GetWardList();
    }

    ShowConsumptionPage() {
        this.Cancel();
        this.router.navigate(['/WardSupply/Pharmacy/Consumption']);
    }
}
