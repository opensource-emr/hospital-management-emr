import { Component, ChangeDetectorRef } from "@angular/core";
import { Router } from '@angular/router';
import { PharmacyBLService } from "../../shared/pharmacy.bl.service"
import PHRMGridColumns from '../../shared/phrm-grid-columns';
import { MessageboxService } from "../../../shared/messagebox/messagebox.service"
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { PHRMPurchaseOrderItems } from "../../shared/phrm-purchase-order-items.model"
import { PHRMSupplierModel } from "../../shared/phrm-supplier.model"
import { PharmacyService } from "../../shared/pharmacy.service"
import { PHRMPurchaseOrder } from "../../shared/phrm-purchase-order.model";
import { CoreService } from "../../../core/shared/core.service";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import * as moment from "moment";
import { PharmacyPOService } from "../pharmacy-po.service";
@Component({
    templateUrl: "./phrm-purchase-order-list.html",
    host: { '(window:keydown)': 'hotkeys($event)' }
})
export class PHRMPurchaseOrderListComponent {
    ////variable to store All PoList
    public PHRMPurchaseOrderList: any;
    ////variable to Bind All POItemsList
    public PHRMPOItemsList: Array<PHRMPurchaseOrderItems> = new Array<PHRMPurchaseOrderItems>();
    ///variable to show-hide Popup box
    public showPHRMPOItemsbyPOId: boolean = false;
    /////variable to store Grid column of POList
    public PHRMpurchaseOrdersGridColumns: Array<any> = null;
    ///Varible to bind Supplier Data to View
    public currentSupplier: PHRMSupplierModel = new PHRMSupplierModel();
    ///variable to push PoItemsList to this variable because we have to minimize server call 
    public localDatalist: Array<PHRMPurchaseOrderItems> = new Array<PHRMPurchaseOrderItems>();
    ///final stored List to bind by locally stored data to view
    public selectedDatalist: Array<PHRMPurchaseOrderItems> = new Array<PHRMPurchaseOrderItems>();
    showPopUp: boolean;
    public IsNepali: boolean;
    public currentPO: PHRMPurchaseOrder = new PHRMPurchaseOrder();
    public fromDate: string;
    public toDate: string;
    public dateRange: string = null;
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
    printDetaiils: HTMLElement;
    showPrint: boolean;
    constructor(public pharmacyBLService: PharmacyBLService,
        public pharmacyService: PharmacyService,
        public pharmacyPOService: PharmacyPOService,
        public msgserv: MessageboxService,
        public changeDetector: ChangeDetectorRef,
        public router: Router,
        public coreService: CoreService) {
        this.PHRMpurchaseOrdersGridColumns = PHRMGridColumns.PHRMPOList;
        this.dateRange = 'last1Week';
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('PODate', false));

        //load 'pending' at first: This is also default selection in the cshtml.
        //this.LoadPHRMPOListByStatus("pending");
        this.ShowReceiptInNepali();
    }
    ShowReceiptInNepali() {
        let receipt = this.coreService.Parameters.find(lang => lang.ParameterName == 'NepaliReceipt' && lang.ParameterGroupName == 'Common').ParameterValue;
        this.IsNepali = (receipt == "true");
    }

    LoadPHRMPOListByStatus(status) {
        //there is if condition because we have to check diferent and multiple status in one action ....
        //like in pending we have to check the active and partial both...
        var Status = "";
        if (status == "pending") {
            Status = "active,partial";
        }
        else if (status == "complete") {
            Status = "complete";
        }
        else if (status == "all") {
            Status = "active,partial,complete,initiated";
        }
        else {
            Status = "initiated"
        }

        this.pharmacyBLService.GetPHRMPurchaseOrderList(Status, this.fromDate, this.toDate)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.PHRMPurchaseOrderList = res.Results;
                } else {
                    this.msgserv.showMessage("failed", ['Failed to get OrderList.' + res.ErrorMessage]);
                }
            },
                err => {
                    this.msgserv.showMessage("error", ['Failed to get OrderList.' + err.ErrorMessage]);
                }
            );
    }
    onDateChange($event) {
        this.fromDate = $event.fromDate;
        this.toDate = $event.toDate;
        if (this.fromDate != null && this.toDate != null) {
            if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
                this.LoadPHRMPOListByStatus("pending");
            } else {
                this.msgserv.showMessage('failed', ['Please enter valid From date and To date']);
            }
        }
    }

    PHRMPurchaseOrderGridAction($event: GridEmitModel) {
        switch ($event.Action) {
            case "genReceipt":
                {
                    var data = $event.Data;
                    this.ShowGRDetails(data.PurchaseOrderId);
                }
                break;
            case "view":
                {
                    var data = $event.Data;
                    this.currentSupplier = $event.Data;
                    this.currentPO.PurchaseOrderId = $event.Data.PurchaseOrderId;
                    this.ShowPOItemsDetailsByPOId(data.PurchaseOrderId);
                }
                break;
            default:
                break;
        }
    }

    ShowGRDetails(PurchaseOrderId) {
        //Pass the Purchase order Id  to Next page for getting PUrchaserOrderItems using inventoryService
        this.pharmacyService.Id = PurchaseOrderId;
        this.router.navigate(['/Pharmacy/Order/GoodsReceiptItems']);
    }

    ///this function is for when enduser Clicks on View in POList 
    ShowPOItemsDetailsByPOId(purchaseOrderId) {
        this.showPHRMPOItemsbyPOId = false;
        this.showPopUp = false;
        this.changeDetector.detectChanges();
        ///After ChangeDetection We r changing showPHRMPOItemsbyPOId=true because we have to display ModelPopupBox Based on this Flag
        if (this.IsNepali == true) {
            this.showPopUp = true;
        }
        else {
            this.showPHRMPOItemsbyPOId = true;
            this.SetFocusById("printButton");
        }


        //////Here is Logic To Minimize the Server Call on Each request : Umed-03/11/2017
        /////Every New Request We go to Server 
        ////After that we can store Result data to some varible and Once again if same request is come  then we can display data from locally store varible (without making new Server call)
        //localDatalist is Array of POItems in this variable we are storing Response Data 


        //len is local varibale deceleration
        var len = this.localDatalist.length;
        ///lopping Each Locally store data and if perticular data is found on selected purchaseOrderId , then we can push selected data to selectedDatalist array 
        for (var i = 0; i < len; i++) {
            let selectedDataset = this.localDatalist[i];
            if (selectedDataset.PurchaseOrderId == purchaseOrderId) {
                this.selectedDatalist.push(selectedDataset);
            }
        }
        ///if we have some selectedDatalist then we can display that on View 
        if (this.selectedDatalist[0] && purchaseOrderId) {
            ///storing selectedDatalist to PHRMPOItemsList to Display in View 
            this.PHRMPOItemsList = this.selectedDatalist;
            ///this.currentSupplier = this.tempSupplier;
            ///after passing data to View - we have to make sure that selectedDatalist should be Empty
            this.selectedDatalist = new Array<PHRMPurchaseOrderItems>();
            ////// this.tempSupplier = new PHRMSupplierModel();
        }
        else {
            (   /////making new server call through BL and DL service By Passing purchaseOrderId
                this.pharmacyBLService.GetPHRMPOItemsByPOId(purchaseOrderId)
                    .subscribe(res => {
                        if (res.Status == "OK") {
                            ////this is the final data and we have stored in PHRMPOItemsList because we have to display data in View
                            this.PHRMPOItemsList = res.Results;
                            ///After that we are passing same Results To localDatalist to minimize the server call and once same request is come, then display data in view by using that
                            ///insted of making server call we can fatch data from Local 
                            this.PHRMPOItemsList.forEach(itm => { this.localDatalist.push(itm); });

                        } else {
                            this.msgserv.showMessage("failed", ['Failed to get OrderList.' + res.ErrorMessage]);
                        }
                    },
                        err => {
                            this.msgserv.showMessage("error", ['Failed to get OrderList.' + err.ErrorMessage]);
                        }
                    )
            )
        }
    }
    EditPO(){
        this.pharmacyPOService._PurchaseOrderId = this.PHRMPOItemsList[0].PurchaseOrderId;
        this.router.navigate(['/Pharmacy/Order/PurchaseOrderItems']);
    }

    //this is used to print the receipt
    print() {
        this.printDetaiils = document.getElementById("printpage");
        this.showPrint = true;
    }
    callBackPrint() {
        this.printDetaiils = null;
        this.showPrint = false;
    }
    Close() {
        this.showPHRMPOItemsbyPOId = false;
    }
    OnPOViewPopUpClose() {
        this.showPopUp = false;
    }
    hotkeys(event) {
        //ESC Key Handling
        if (event.keyCode == 27) {
            this.Close();
        }
    }
    SetFocusById(IdToBeFocused: string) {
        window.setTimeout(function () {
            let elemToFocus = document.getElementById(IdToBeFocused);
            if (elemToFocus != null && elemToFocus != undefined) {
                elemToFocus.focus();
            }
        }, 20);
    }
}
