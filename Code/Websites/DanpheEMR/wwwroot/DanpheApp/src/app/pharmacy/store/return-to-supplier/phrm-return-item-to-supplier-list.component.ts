import { Component, ChangeDetectorRef } from "@angular/core";
import PHRMGridColumns from '../../shared/phrm-grid-columns';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { PHRMReturnToSupplierModel } from "../../shared/phrm-return-to-supplier.model";
import { PHRMReturnToSupplierItemModel } from "../../shared/phrm-return-to-supplier-items.model"
import { PharmacyBLService } from "../../shared/pharmacy.bl.service"
import { MessageboxService } from "../../../shared/messagebox/messagebox.service"
import * as moment from 'moment/moment';
import { PHRMSupplierModel } from "../../shared/phrm-supplier.model";
import { CoreService } from "../../../core/shared/core.service";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { ActivatedRoute } from "@angular/router";
import { PharmacyService } from "../../shared/pharmacy.service";
import { SecurityService } from "../../../security/shared/security.service";

@Component({
    templateUrl: "./phrm-return-item-to-supplier-list.html",
    host: { '(window:keydown)': 'hotkeys($event)' }
})
export class PHRMReturnItemToSupplierListComponent {
    public returnItemToSupplierList: Array<PHRMReturnToSupplierModel> = new Array<PHRMReturnToSupplierModel>();
    public returnToSupplierListGridColumns: Array<any> = null;
    ///variable to show-hide Popup box
    public showRetSuppItemsbyRetSuppID: boolean = false;

    ////variable to Bind All POItemsList
    public PHRMRetSuppItemsList: Array<PHRMReturnToSupplierItemModel> = new Array<PHRMReturnToSupplierItemModel>();
    ///variable to push RetItemList to this variable because we have to minimize server call 
    public localDatalist: Array<PHRMReturnToSupplierItemModel> = new Array<PHRMReturnToSupplierItemModel>();
    ///final stored List to bind by locally stored data to view
    public selectedDatalist: Array<PHRMReturnToSupplierItemModel> = new Array<PHRMReturnToSupplierItemModel>();
    ///Varible to bind Supplier Data to View
    public currentSupplier: PHRMSupplierModel = new PHRMSupplierModel();
    public fileFromDate: string = null;
    public fileToDate: string = null;
    public time: any;
    public returnDate: any;
    public fromDate: string = null;
    public toDate: string = null;
    public dateRange: string = "last1Week";  //by default show last 1 week data.;
    public suppId: any;
    public returnType = [{ id: 1, name: "Breakage" }, { id: 2, name: "Expiry" }, { id: 3, name: "Breakage and Expiry" }];
    public RetType: any;
    public returnsuppList: Array<any> = [];
    public userName: any;
    refNo: any;
    retSuppId: any;
    public goodReceiptPrintId: any;
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
    showPrint: boolean;
    printDetaiils: any;
    showFreeQty: boolean;
    showCCCharge: boolean;
    constructor(public coreService: CoreService,
        public pharmacyBLService: PharmacyBLService,
        public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService, public securityService: SecurityService, public route: ActivatedRoute, public pharmacyService: PharmacyService) {
        /////Grid Coloumn Variable
        this.returnToSupplierListGridColumns = PHRMGridColumns.PHRMReturnItemToSupplierList;
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('ReturnDate', false));
        if (this.suppId != null) {
            this.ShowRetSuppItemsDetailsByRetSuppId(this.suppId);
        }
        else {
            this.getReturnItemsToSupplierList();
            this.GetPharmacyBillingHeaderParameter();
        }
        this.checkReturnCustomization();

    }
    public getReturnItemsToSupplierList() {
        this.pharmacyBLService.GetReturnItemsToSupplierList(this.fromDate, this.toDate)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.returnItemToSupplierList = res.Results;
                    this.returnsuppList = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("error", ["Failed to get Return Item To Supplier. " + res.ErrorMessage]);
                }
            },
                err => {
                    this.msgBoxServ.showMessage("error", ["Failed to get Return Item To Supplier111. " + err.ErrorMessage]);
                });
    }

    ReturnToSupplierGridAction($event: GridEmitModel) {
        switch ($event.Action) {
            case "view": {
                this.currentSupplier = Object.assign({}, $event.Data);
                this.currentSupplier["Remarks"] = $event.Data.Remarks;
                for (let i = 0; i < this.returnType.length; i++) {
                    if ($event.Data.ReturnStatus == this.returnType[i].id) {
                        this.RetType = this.returnType[i].name;
                    }

                }
                this.goodReceiptPrintId = $event.Data.GoodReceiptPrintId;
                this.returnDate = moment($event.Data.ReturnDate).format("YYYY-DD-MM");
                this.userName = $event.Data.UserName;
                this.time = $event.Data.CreatedOn;
                this.ShowRetSuppItemsDetailsByRetSuppId($event.Data.ReturnToSupplierId);
                break;
            }
            default:
                break;
        }
    }

    onGridDateChange($event) {
        this.fromDate = $event.fromDate;
        this.toDate = $event.toDate;
        if (this.fromDate != null && this.toDate != null) {
            if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
                this.getReturnItemsToSupplierList();
            } else {
                this.msgBoxServ.showMessage('failed', ['Please enter valid From date and To date']);
            }

        }

    }
    ///this function is for when enduser Clicks on View in POList 
    ShowRetSuppItemsDetailsByRetSuppId(returnToSupplierId) {
        this.showRetSuppItemsbyRetSuppID = false;
        this.changeDetector.detectChanges();
        ///After ChangeDetection We r changing showRetSuppItemsbyRetSuppID=true because we have to display ModelPopupBox Based on this Flag
        this.showRetSuppItemsbyRetSuppID = true;
        //////Here is Logic To Minimize the Server Call on Each request : Umed-21/12/2017
        /////Every New Request We go to Server 
        ////After that we can store Result data to some varible and Once again if same request is come  then we can display data from locally store varible (without making new Server call)
        //localDatalist is Array of POItems in this variable we are storing Response Data 


        //len is local varibale deceleration
        var len = this.localDatalist.length;
        ///lopping Each Locally store data and if perticular data is found on selected returnToSupplierId , then we can push selected data to selectedDatalist array 
        for (var i = 0; i < len; i++) {
            let selectedDataset = this.localDatalist[i];
            if (selectedDataset.ReturnToSupplierId == returnToSupplierId) {
                this.selectedDatalist.push(selectedDataset);
            }



        }

        ///if we have some selectedDatalist then we can display that on View 
        if (this.selectedDatalist[0] && returnToSupplierId) {
            ///storing selectedDatalist to PHRMRetSuppItemsList to Display in View
            this.PHRMRetSuppItemsList = this.selectedDatalist;
            ///after passing data to View - we have to make sure that selectedDatalist should be Empty
            this.selectedDatalist = new Array<PHRMReturnToSupplierItemModel>();
            this.SetFocusOnButton("printButton");

        }
        else {
            (   /////making new server call through BL and DL service By Passing returnToSupplierId
                this.pharmacyBLService.GetReturnToSupplierItemsByRetSuppId(returnToSupplierId)
                    .subscribe(res => {
                        if (res.Status == "OK") {
                            ////this is the final data and we have stored in PHRMRetSuppItemsList because we have to display data in View
                            this.PHRMRetSuppItemsList = res.Results;
                            // this.userName =res.Results[0].UserName;
                            // this.time = res.Results[0].CreatedOn;
                            this.PHRMRetSuppItemsList.forEach(supItm => {
                                supItm.ExpiryDate = moment(supItm.ExpiryDate).format("YYYY-MM-DD");
                                supItm.DiscountedAmount = (supItm.DiscountPercentage * supItm.SubTotal) / 100;

                            });

                            this.currentSupplier['DiscountAmouhn']
                            ///After that we are passing same Results To localDatalist to minimize the server call and once same request is come, then display data in view by using that
                            ///insted of making server call we can fatch data from Local 
                            this.PHRMRetSuppItemsList.forEach(itm => { this.localDatalist.push(itm); });
                            this.SetFocusOnButton("printButton");


                        } else {
                            this.msgBoxServ.showMessage("failed", ['Failed to get OrderList.' + res.ErrorMessage]);
                        }
                    },
                        err => {
                            this.msgBoxServ.showMessage("error", ['Failed to get OrderList.' + err.ErrorMessage]);
                        }
                    )
            )
        }
    }

    /////For Closing ModelBox Popup
    Close() {
        this.showRetSuppItemsbyRetSuppID = false;
    }

    public headerDetail: { hospitalName, address, email, PANno, tel, DDA };

    //Get Pharmacy Billing Header Parameter from Core Service (Database) assign to local variable
    GetPharmacyBillingHeaderParameter() {
        var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Pharmacy Receipt Header').ParameterValue;
        if (paramValue)
            this.headerDetail = JSON.parse(paramValue);
        else
            this.msgBoxServ.showMessage("error", ["Please enter parameter values for BillingHeader"]);
    }
    SetFocusOnButton(idToSelect: string) {
        if (document.getElementById(idToSelect)) {
            let btn = <HTMLInputElement>document.getElementById(idToSelect);
            btn.focus();
        }
    }
    printCreditNote() {
        this.showPrint = false;
        this.printDetaiils = null;
        this.printDetaiils = document.getElementById("print-credit-note");
        this.changeDetector.detectChanges();
        this.showPrint = true;
    }
    public hotkeys(event) {
        //For ESC key => close the pop up
        if (event.keyCode == 27) {
            this.Close();
        }
    }
    checkReturnCustomization() {
        let GRParameterStr = this.coreService.Parameters.find(p => p.ParameterName == "GRFormCustomization" && p.ParameterGroupName == "Pharmacy");
        if (GRParameterStr != null) {
            let GRParameter = JSON.parse(GRParameterStr.ParameterValue);
            if (GRParameter.showFreeQuantity == true) {
                this.showFreeQty = true;
            }
            if (GRParameter.showCCCharge == true) {
                this.showCCCharge = true;
            }
        }
    }
}

