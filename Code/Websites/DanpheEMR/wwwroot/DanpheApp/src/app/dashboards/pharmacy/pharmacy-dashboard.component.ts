import { Component } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { DanpheChartsService } from '../../dashboards/shared/danphe-charts.service';
import { PHRMItemMasterModel } from "../../pharmacy/shared/phrm-item-master.model"
import { PharmacyCounter } from "../../pharmacy/shared/pharmacy-counter.model"
import { DLService } from "../../shared/dl.service";
import * as moment from 'moment/moment';
import { MessageboxService } from "../../shared/messagebox/messagebox.service"
import { PharmacyBLService } from "../../pharmacy/shared/pharmacy.bl.service";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { CommonFunctions } from "../../shared/common.functions";
import { CoreService } from "../../core/shared/core.service";
@Component({
    templateUrl: "./pharmacy-dashboard.html"
})

export class PharmacyDashboardComponent {
    ///SalesPurchase Graph From Date variable
    salePurchaseFromDate: string = null;
    ///SalesPurchase Graph TO Date variable
    salePurchaseToDate: string = null;
    counterDayDate: string = null;
    ///SalesPurchase Graph ItemList Bind variable for Multi-DropDown List
    public ItemList: Array<PHRMItemMasterModel> = new Array<PHRMItemMasterModel>();
    public UserWiseCollection: Array<PharmacyCounter> = new Array<PharmacyCounter>();
    SelectedData:any="";// Array<any> = new Array<any>();
    counterDayCollection: Array<PharmacyCounter> = new Array<PharmacyCounter>();

    overallBills = { TotalProvisional: 0, TotalCredits: 0};

    ///Varibale to check Status i.e Sales Or Purchase
    Status: string = "";
    ///Varibale to pass comma seprated ItemId to DB and Do changes according to that
    IdCommaSeprated: string = "";
    ///Varibale to store all column name coming Through Schema
    dynamicColumns: string = "";
    ///Variable that contain all Selected ItemList 
    SelectedItemData: Array<any> = new Array<any>();
    ///Variable that contain all Selected ItemId in List. After that we can convert this List to string and Pass to DB
    SelectedItemId: Array<any> = new Array<any>();
    ///Variable that contain all Selected ItemName in List. After that we can Pass ItemName List to Grph and get Dyanmaic Axix of Graph 
    SelectedItemName: Array<any> = new Array<any>();
    ////flag to check Item is Selected or NOT
    checkSelectedItem: boolean = false;
    constructor(public pharmacyBLService: PharmacyBLService,
        public danpheCharts: DanpheChartsService,
        public dlService: DLService,
        public msgserv: MessageboxService,
        public messageboxService: MessageboxService,
        public coreService: CoreService) {
        this.salePurchaseFromDate = moment().format("YYYY-MM-DD");
        this.salePurchaseToDate = moment().format("YYYY-MM-DD");
        this.counterDayDate = moment().format("YYYY-MM-DD");
        this.LoadItemTypeList(); ///Load All Item List First
        this.LoadStatus('sales'); ///By Default Pass Status to sales
        this.LoadAllSaleRecord();
        this.checkSelectedItem = false;
        //this.LoadOverallPendingBillStatus();//sud:4Sept'21--This report was showing incorrect data, hence hiding..
    }
    ngOnInit() {
        
        this.LoadDailyStockValue();
        this.danpheCharts.Pharmacy_Bar_Top10ItemsbyPurchase("dvPHRMTop10ItemsByPurchase");
        this.danpheCharts.Pharmacy_Bar_Top10ItemsbySale("dvPHRMTop10ItemsbySale");
        this.danpheCharts.Pharmacy_MultiLine_RedZoneItems("dvPHRMRedZoneItems");
        
    }


    ///Check the status and Assign 
    LoadStatus(status) {
        ///check status == sales
        if (status == "sales") {
            this.Status = "Sales";
        }
        else {
            this.Status = "Purchase";
        }
    }
    
    LoadAllSaleRecord(): void {
        ////use already created GetItemList function through reqType = item
        this.dlService.Read("/api/Pharmacy?reqType=allSaleRecord&currentDate=" + this.counterDayDate)
            .map(res => res)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.SelectedData = res.Results;
                    this.UserWiseCollection = res.Results.UserCollection;
                    this.counterDayCollection = res.Results.CounterCollection;

                }
                else {
                    err => {
                        this.msgserv.showMessage("falied", ['failed to get Data.']);
                    }
                }
            });
    } 
    // get total amount of all pending bills.
    LoadOverallPendingBillStatus() {
        this.dlService.Read("/api/Pharmacy?reqType=phrm-pending-bills")
            .map(res => res)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status == "OK") {
                    this.overallBills = res.Results;
                    this.overallBills.TotalProvisional = CommonFunctions.parseAmount(this.overallBills.TotalProvisional);
                    this.overallBills.TotalCredits = CommonFunctions.parseAmount(this.overallBills.TotalCredits); 
                }
                else {
                    console.log(res.ErrorMessage);
                }
            },
            err => {
                console.log

            });
    }
    ////function call when User Click on Item
    onChange($event) {
        let x = $event;
        ///assign selected data to SelectedItemData list 
        this.SelectedItemData = $event;

    }
  

    /////Function call on Click of Reload Button 
    LoadSalePurchaseGraphData() {
        if (this.SelectedItemData.length == 0) {
            this.checkSelectedItem = true;
            ////if this checkSelectedItem = true than we can not show graph for nothing selected Item
            let dataToParse = [];
            this.SelectedItemName = [];
            this.plotGraph(dataToParse, this.SelectedItemName);
            ////this.danpheCharts.Pharmacy_MultiLine_RedZoneItems_SalesPurchaseGraph("dvSalesPurchase", dataToParse, this.SelectedItemName);

        }
        else {
            this.checkSelectedItem = false;
           
            ////for every request ItemId and ItemName is Empty so proper data is selected
            this.SelectedItemId = [];     
            this.SelectedItemName = [];
             /////Loop Through all Selected Data and remove ID, and Name From that because 
            //////we have to pass Comma seprated ID to Stored Procedure and
            /////ItemName to Graph for dynamic Graph Axix creation
            for (var k = 0; k < this.SelectedItemData.length; k++) {
                this.SelectedItemId[k] = this.SelectedItemData[k].ItemId;
                this.SelectedItemName[k] = this.SelectedItemData[k].ItemName;
            }
            //////Convert ItemId List to comma separted String format and Assign to IdCommaSeprated variable
            this.IdCommaSeprated = this.SelectedItemId.toString();
            ////call server with fromDate, toDate, status and CommaSeprated ItemId 
            this.dlService.Read("/Reporting/SalesPurchaseTrainedCompanion?FromDate=" + this.salePurchaseFromDate + "&ToDate=" + this.salePurchaseToDate + "&Status=" + this.Status + "&ItemIdCommaSeprated=" + this.IdCommaSeprated)
                .map(res => res)
                .subscribe(res => {
                    if (res.Results) {
                        ////assign Schema to Dynamic coloumn variable
                        this.dynamicColumns = JSON.parse(res.Results.Schema)[0].ColumnName.split(',');
                        /////Convert Data to JSON Format and Assign to  dataToParse variable
                        let dataToParse = JSON.parse(res.Results.JsonData);
                        if (dataToParse && dataToParse.length > 0) {
                            ////Loop Througth JSON Data (K,V) and check if V (value ==Null) then replace Null with Zero
                            ///Because we have to display the that item in Graph also
                            for (let i = 0; i < dataToParse.length; i++) {
                                /////Getting each Property of Selected Rows
                                for (var propName in dataToParse[i]) {
                                    /////if Value == Null then Assign Zero to Value 
                                    if (dataToParse[i][propName] === null || undefined) {
                                        dataToParse[i][propName] = 0;
                                    }
                                }
                            }
                            this.plotGraph(dataToParse, this.SelectedItemName);
                           /// this.danpheCharts.Pharmacy_MultiLine_RedZoneItems_SalesPurchaseGraph("dvSalesPurchase", dataToParse, this.SelectedItemName);
                        }
                        else {
                            this.msgserv.showMessage("notice-message", ['Data is Not Available For that Selection..']);
                            this.SelectedItemId = [];
                            this.SelectedItemName = [];
                            this.plotGraph(dataToParse, this.SelectedItemName);
                        }
                    }


                },
                err => {
                    alert(err.ErrorMessage);
                });
        }
    }
    LoadItemTypeList(): void {
        try {
            this.pharmacyBLService.GetItemTypeListWithItems()
                .subscribe(res => this.CallBackGetItemTypeList(res));
        }
        catch (exception) {
        }
    }
    CallBackGetItemTypeList(res) {
        try {
            if (res.Status == 'OK') {
                if (res.Results) {
                    this.ItemList = res.Results;
                
                }
            }
            else {
                err => {
                    this.messageboxService.showMessage("failed", ['failed to get ItemTypeList..']);
                }
            }
        }
        catch (exception) {

        }
    }
    LoadDailyStockValue() {
        this.dlService.Read("/PharmacyReport/PHRM_Daily_StockValue")
            .map(res => res)
            .subscribe(res => {
                let dataToParse = [];
                if (res.Results && res.Results.JsonData) {
                    dataToParse = JSON.parse(res.Results.JsonData);
                }
                
             
                this.danpheCharts.Pharmacy_Line_DailyStockValue("dvPHRMDailyValueTrend", dataToParse);
            },
            err => {
                alert(err.ErrorMessage);

            });

    }
    ////Seprate Function to Plot Graph
    plotGraph(dataToParse, SelectedItemName)
    {
      this.danpheCharts.Pharmacy_MultiLine_RedZoneItems_SalesPurchaseGraph("dvSalesPurchase", dataToParse, this.SelectedItemName);

    }
}
