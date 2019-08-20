import { Component, ChangeDetectorRef } from "@angular/core";
import { Router, RouterOutlet, RouterModule } from '@angular/router'
import PHRMGridColumns from "../shared/phrm-grid-columns";
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { PharmacyService } from "../shared/pharmacy.service";
import { PharmacyBLService } from "../shared/pharmacy.bl.service"
import { MessageboxService } from "../../shared/messagebox/messagebox.service"
import { PHRMGoodsReceiptItemsModel } from "../shared/phrm-goods-receipt-items.model"
import { SecurityService } from "../../security/shared/security.service";
import * as moment from 'moment/moment';
@Component({
    templateUrl:'../../view/pharmacy-view/Stock/PHRMStockManage.html'// "/PharmacyView/PHRMStockManage"
})
export class PHRMStockManageComponent {
    public itemId: number = null;
    public itemName: string = null;

    public currQuantity: number = 0;  ///variable to check sum of All curt qty
    public moddQuantity: number = 0;   ///variable to check sum of All Physical qty or Modified qty
    ///flag to show msg if modified qty is greater then received qty
    public CheckValidQty: boolean = null;
    /// public chkSameQty: boolean = null;
    ///public check: boolean = false;
    ///variable to store all stock detail with available qty is greater than Zero
    public stockDetails: Array<any> = null;
    ///variable to store all stock detail with available qty is Equal to Zero
    public zeroStockDetails: Array<any> = null;
    ////adding new to to this list
    public tempList: Array<any> = [];
    ///// curt GR Item Model property to zero and Add as a new Rows
    public curtGRItmModel: PHRMGoodsReceiptItemsModel = new PHRMGoodsReceiptItemsModel();
    ////final variable to merge stockDetails and tempList to one and Pass this to server call
    public StkManageUpdate: Array<PHRMGoodsReceiptItemsModel> = new Array<PHRMGoodsReceiptItemsModel>();
    //declare boolean loading variable for disable the double click event of button
    loading: boolean = false;
    constructor(
        public securityService: SecurityService, public router: Router,
        public pharmacyService: PharmacyService,
        public pharmacyBLService: PharmacyBLService,
        public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService) {
        this.loadStockDetails(this.pharmacyService.Id);
    }

    //load stock details for manage
    loadStockDetails(id: number) {
        try {
            if (id != null) {
                this.itemId = id;
                this.itemName = this.pharmacyService.Name;
                this.pharmacyBLService.GetStockManageByItemId(this.itemId)
                    .subscribe(res => {
                        if (res.Status == "OK") {
                            ////Store All Data whose Available Qty is > then Zero  to stockDetails
                            this.stockDetails = res.Results.stockDetails;
                            ////Make modQty to Available Qty - 1;
                            this.stockDetails.forEach(
                                itm => {
                                    itm.modQuantity = (itm.modQuantity - 1);
                                    /////itm.ExpiryDate = moment(itm.ExpiryDate).format('DD-MM-YYYY');

                                }
                            );
                            ////Store All Data whose Available Qty is = to Zero  to zeroStockDetails
                            this.zeroStockDetails = res.Results.zeroStockDetails;
                            //this.zeroStockDetails.forEach(
                            //    itm => {
                            //        itm.ExpiryDate = moment(itm.ExpiryDate).format('DD-MM-YYYY');
                            //    }
                            //);
                            this.CalculationAll();
                        }
                        else {
                            this.msgBoxServ.showMessage("error", ["Failed to get details for selected Item. " + res.ErrorMessage]);
                            //// this.routetoStockList();
                        }
                    },
                    err => {
                        this.msgBoxServ.showMessage("error", ["Failed to get details for selected Item. " + err.ErrorMessage]);
                    });
            }
            else {
                this.msgBoxServ.showMessage("notice-message", ['Please, Select Stock-Item for manage.']);
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }

    }

   
    DeleteRow(index) {
        try {
            //this will remove the data from array
            this.zeroStockDetails.splice(index, 1);
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
    DeleteRowUpper(index) {
        try {
            //this will remove the data from array
            this.stockDetails.splice(index, 1);
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
    //used to format display item in ng-autocomplete
    myListFormatter(data: any): string {
        let html = data["BatchNo"];
        return html;
    }

    


    //Calculating total stock quantities for view
    CalculationAll() {

        try {
            let curQty = 0;
            let modQty = 0;
            //adding to total from stockDetails list
            for (var i = 0; i < this.stockDetails.length; i++) {
                curQty = curQty + this.stockDetails[i].curtQuantity;
                modQty = modQty + this.stockDetails[i].modQuantity;
            }
            //adding to total from tempList 
            for (var j = 0; j < this.zeroStockDetails.length; j++) {
                curQty = curQty + this.zeroStockDetails[j].curtQuantity;
                modQty = modQty + this.zeroStockDetails[j].modQuantity;
            }
            this.currQuantity = curQty;
            this.moddQuantity = modQty;
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }

    }

    /*
    this function will perform following operation on  both list
    1st: it will check that Modified Quantity should not be greater than Received Quantity.
    2nd: it will check if current quantity and modified quantity are same then it will remove that data from list.
    */
    ChecknSpliceList() {

        try {
            this.CheckValidQty = true;
            //// this.chkSameQty = true;
            for (var i = 0; i < this.stockDetails.length; i++) {
                //checking if modified quantity is greater than received quantity 
                if (this.stockDetails[i].modQuantity > this.stockDetails[i].ReceivedQuantity) {
                    this.CheckValidQty = false;
                }

                /// removing stock item which has no-change between current Qty and modified Qty
                ///  keep this if loop at bottom of for loop coz it will splice the list and decrease i by 1
                if (this.stockDetails[i].curtQuantity == this.stockDetails[i].modQuantity) {
                    this.stockDetails.splice(i, 1);
                    i--;
                }
            }
            for (var i = 0; i < this.zeroStockDetails.length; i++) {
                //checking if modified quantity is greater than received quantity 
                if (this.zeroStockDetails[i].modQuantity > this.zeroStockDetails[i].ReceivedQuantity) {
                    this.CheckValidQty = false;
                }
                if (this.zeroStockDetails[i].modQuantity > this.zeroStockDetails[i].curtQuantity) {
                    ////Calculating Actual diff of Item count added
                    /////to check how much Qty is Added in Stock Table
                    this.zeroStockDetails[i].QtyDiffCount = (this.zeroStockDetails[i].modQuantity - this.zeroStockDetails[i].curtQuantity);
                    ///falg(adjustment-in) to check in server side that Qty is Added
                    this.zeroStockDetails[i].StkManageInOut = "adjustment-in";
                }
                //removing stock item which has no-change between current Qty and modified Qty
                //keep this if loop at bottom of for loop coz it will splice the list and decrease i by 1
                if (this.zeroStockDetails[i].curtQuantity == this.zeroStockDetails[i].modQuantity) {
                    this.zeroStockDetails.splice(i, 1);
                    i--;
                }
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }


    }
    //merging two list to one for passing in udpate function
    MergeList() {
        try {
            this.StkManageUpdate = [];
            var index = 0;
            for (var j = 0; j < this.stockDetails.length; j++) {
                this.StkManageUpdate[index] = new PHRMGoodsReceiptItemsModel();
                ////set all Property to StkManageUpdate beacuse we require during Update in Db Call
                this.StkManageUpdate[index].GoodReceiptItemId = this.stockDetails[j].GoodReceiptItemId;
                this.StkManageUpdate[index].BatchNo = this.stockDetails[j].BatchNo;
                this.StkManageUpdate[index].ItemId = this.stockDetails[j].ItemId;
                this.StkManageUpdate[index].ItemName = this.stockDetails[j].ItemName;
                this.StkManageUpdate[index].GRItemPrice = this.stockDetails[j].GRItemPrice;
                this.StkManageUpdate[index].ReceivedQuantity = this.stockDetails[j].ReceivedQuantity;
                this.StkManageUpdate[index].AvailableQuantity = this.stockDetails[j].modQuantity;
                this.StkManageUpdate[index].modQuantity = this.stockDetails[j].modQuantity;
                this.StkManageUpdate[index].curtQuantity = this.stockDetails[j].curtQuantity;
                this.StkManageUpdate[index].QtyDiffCount = this.stockDetails[j].QtyDiffCount;
                this.StkManageUpdate[index].StkManageInOut = this.stockDetails[j].StkManageInOut;
                this.StkManageUpdate[index].ExpiryDate = this.stockDetails[j].ExpiryDate;
                //this.StkManageUpdate[index].ManufactureDate = this.stockDetails[j].ManufactureDate;
                index++;
            }
            for (var j = 0; j < this.zeroStockDetails.length; j++) {
                this.StkManageUpdate[index] = new PHRMGoodsReceiptItemsModel();
                ////set all Property to StkManageUpdate beacuse we require during Update in Db Call
                this.StkManageUpdate[index].GoodReceiptItemId = this.zeroStockDetails[j].GoodReceiptItemId;
                this.StkManageUpdate[index].ItemId = this.zeroStockDetails[j].ItemId;
                this.StkManageUpdate[index].ItemName = this.zeroStockDetails[j].ItemName;
                this.StkManageUpdate[index].GRItemPrice = this.zeroStockDetails[j].GRItemPrice;
                this.StkManageUpdate[index].ReceivedQuantity = this.zeroStockDetails[j].ReceivedQuantity;
                this.StkManageUpdate[index].BatchNo = this.zeroStockDetails[j].BatchNo;
                this.StkManageUpdate[index].AvailableQuantity = this.zeroStockDetails[j].modQuantity;
                this.StkManageUpdate[index].modQuantity = this.zeroStockDetails[j].modQuantity;
                this.StkManageUpdate[index].curtQuantity = this.zeroStockDetails[j].curtQuantity;
                this.StkManageUpdate[index].QtyDiffCount = this.zeroStockDetails[j].QtyDiffCount;
                this.StkManageUpdate[index].StkManageInOut = this.zeroStockDetails[j].StkManageInOut;
                this.StkManageUpdate[index].ExpiryDate = this.zeroStockDetails[j].ExpiryDate;
               // this.StkManageUpdate[index].ManufactureDate = this.zeroStockDetails[j].ManufactureDate;
                index++;
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }



    UpdateStock() {
        /// var CheckIsValid = true;
        try {
            this.ChecknSpliceList();
            this.MergeList();

            for (var a = 0; a < this.StkManageUpdate.length; a++) {


                if (this.StkManageUpdate[a].modQuantity > this.StkManageUpdate[a].curtQuantity) {
                    ////Calculating Actual diff of Item count added
                    /////to check how much Qty is Added in Stock Table
                    this.StkManageUpdate[a].QtyDiffCount = (this.StkManageUpdate[a].modQuantity - this.StkManageUpdate[a].curtQuantity);
                    ///falg(adjustment-in) to check in server side that Qty is Added
                    this.StkManageUpdate[a].StkManageInOut = "adjustment-in";
                }
                else {
                    ////Calculating Actual diff of Item count Removed
                    /////to check how much Qty is Removed in Stock Table
                    this.StkManageUpdate[a].QtyDiffCount = (this.StkManageUpdate[a].curtQuantity - this.StkManageUpdate[a].modQuantity);
                    ///falg(adjustment-out) to check in server side that Qty is Removed
                    this.StkManageUpdate[a].StkManageInOut = "adjustment-out";
                }
            }

            ////if CheckValidQty = truw and StkManageUpdate list have data
            if (this.CheckValidQty == true && this.StkManageUpdate.length > 0) {
                ///seting Created by 
                //for (var m = 0; m < this.StkManageUpdate.length; m++) {
                //    this.StkManageUpdate[m].CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                //}
                this.loading = true;
                this.pharmacyBLService.UpdateStock(this.StkManageUpdate)
                    .subscribe(
                    res => {
                        if (res.Status == "OK") {
                            this.msgBoxServ.showMessage("success", ["Stock Update Successful."]);
                            this.loading = false;
                            this.NavigateToRoute();
                        }
                        else {
                            this.msgBoxServ.showMessage("failed", ["unable to update stock"]);
                        }
                    },
                    err => {
                        console.log(err);
                    });

            }
            else if (this.CheckValidQty == false) {
                this.msgBoxServ.showMessage("failed", ["Modified Stock Quantity is greater than Received Quantity!!"]);
            }
            else {
                this.msgBoxServ.showMessage("failed", ["Please Change Stock Quantity to Update."]);
                /// this.routetoStockList();
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }


    NavigateToRoute() {
        this.router.navigate(['/Pharmacy/Stock/StockDetails']);
    }

    Cancel() {
        this.loading = true;
        try {
           ///// this.zeroStockDetails = [];
            for (var q = 0; q < this.stockDetails.length; q++) {
                this.stockDetails[q].modQuantity = (this.stockDetails[q].curtQuantity - 1);
            }
            for (var q = 0; q < this.zeroStockDetails.length; q++) {
                this.zeroStockDetails[q].modQuantity = 0;
            }
            this.loading = false;
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }

    ////This function only for show catch messages in console 
    ShowCatchErrMessage(exception) {
        if (exception) {
            let ex: Error = exception;
            console.log("Error Messsage =>  " + ex.message);
            console.log("Stack Details =>   " + ex.stack);
        }
    }
}

